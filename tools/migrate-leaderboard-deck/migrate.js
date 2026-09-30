// 4.6.5 레벨 리더보드 덱 일괄 변환
// 각 플레이어의 비공개 백업(backups/{uid}.payload)에서 1번 슬롯 덱을 읽어 leaderboard/{uid}.deck 에 쓴다.
// 1번 슬롯이 5기가 아니면 기본 덱(화염 · 얼음 · 힐 · 쉴드 · 독). 게임의 publish() 와 같은 규칙.
//
//   node migrate.js --key 서비스계정키.json            → 미리보기 (아무것도 쓰지 않음)
//   node migrate.js --key 서비스계정키.json --apply    → 실제로 쓴다
//
// 서비스 계정 키: Firebase 콘솔 → 프로젝트 설정 → 서비스 계정 → 새 비공개 키 생성. 절대 저장소에 올리지 말 것.
const fs = require('fs');
const path = require('path');

const DEFAULT_DECK = ['fire', 'ice', 'medic', 'shield', 'poison'];
const ID_RE = /^[a-z_]{1,24}$/;

// 백업 payload(JSON 문자열) → 리더보드에 올릴 덱
function slotDeck(payload) {
  let profile = null;
  try { profile = typeof payload === 'string' ? JSON.parse(payload) : payload; } catch (error) { profile = null; }
  const first = profile && Array.isArray(profile.decks) && Array.isArray(profile.decks[0]) ? profile.decks[0] : [];
  const deck = [...new Set(first.filter(id => typeof id === 'string' && ID_RE.test(id)))].slice(0, 5);
  return deck.length === 5 ? deck : DEFAULT_DECK.slice();
}

function sameDeck(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((id, i) => id === b[i]);
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const keyIndex = args.indexOf('--key');
  const keyPath = keyIndex >= 0 ? args[keyIndex + 1] : process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyPath || !fs.existsSync(keyPath)) {
    console.error('서비스 계정 키 파일이 필요합니다: node migrate.js --key 키파일.json [--apply]');
    process.exit(1);
  }
  const { initializeApp, cert } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');
  const key = JSON.parse(fs.readFileSync(path.resolve(keyPath), 'utf8'));
  initializeApp({ credential: cert(key), projectId: key.project_id || 'jihoobattle' });
  const db = getFirestore();

  const board = await db.collection('leaderboard').get();
  console.log(`리더보드 ${board.size}명 확인 중… (${apply ? '실제 적용' : '미리보기'})`);
  let changed = 0, same = 0, noBackup = 0;
  let batch = db.batch(), pending = 0;
  for (const doc of board.docs) {
    const entry = doc.data();
    const backup = await db.collection('backups').doc(doc.id).get();
    // 백업이 없으면 (오래된 오프라인 계정 등) 1번 슬롯을 알 수 없으니 기본 덱
    const deck = backup.exists ? slotDeck(backup.data().payload) : DEFAULT_DECK.slice();
    if (!backup.exists) noBackup++;
    if (sameDeck(entry.deck, deck)) { same++; continue; }
    changed++;
    console.log(`  ${String(entry.nickname || doc.id).padEnd(12)} ${JSON.stringify(entry.deck || [])} → ${JSON.stringify(deck)}${backup.exists ? '' : ' (백업 없음)'}`);
    if (!apply) continue;
    batch.update(doc.ref, { deck }); // updatedAt 은 건드리지 않는다
    if (++pending === 400) { await batch.commit(); batch = db.batch(); pending = 0; }
  }
  if (apply && pending) await batch.commit();
  console.log(`\n바뀜 ${changed} · 이미 같음 ${same} · 백업 없음 ${noBackup}`);
  if (!apply && changed) console.log('실제로 쓰려면 끝에 --apply 를 붙여 다시 실행하세요.');
}

if (require.main === module) main().catch(error => { console.error(error); process.exit(1); });
module.exports = { slotDeck, DEFAULT_DECK };
