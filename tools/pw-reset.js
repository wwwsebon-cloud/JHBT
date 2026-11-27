#!/usr/bin/env node
// 비밀번호 재설정 (운영자 · 사용자 PC) — 비밀번호를 잊은 계정에 임시 비밀번호를 만든다. 게임 기록은 건드리지 않는다.
//   node tools/pw-reset.js <UID 8자리 또는 닉네임> [--key <서비스 계정 JSON>]
// 계정 이메일이 가짜 주소라 재설정 메일을 보낼 수 없어서 서비스 계정으로 직접 바꾼다.
// ⚠ 다른 사람이 계정 주인인 척할 수 있다 → 화면에 나온 계정 정보를 요청한 사람에게 물어 본인인지 확인한 뒤에만 진행한다.
// 비밀번호를 바꾸면 그 계정의 모든 기기에서 로그인이 풀린다.
const crypto = require('crypto'), readline = require('readline');
const { loadKey, accessToken, call } = require('./sa');

const ABC = 'abcdefghjkmnpqrstuvwxyz23456789'; // 헷갈리는 글자 (i · l · o · 0 · 1) 빼기
const tempPw = (n = 10) => Array.from({ length: n }, () => ABC[crypto.randomInt(ABC.length)]).join('');
const UID_RE = /^(?:[1-9][0-9]{7}|[1-9][0-9]{3})$/;
const str = f => (f && f.stringValue) || '';
const ask = q => new Promise(res => { const rl = readline.createInterface({ input: process.stdin, output: process.stdout }); rl.question(q, a => { rl.close(); res(a.trim()); }); });

(async () => {
  const id = (process.argv[2] || '').trim();
  if (!id || id.startsWith('--')) throw new Error('사용법: node tools/pw-reset.js <UID 또는 닉네임> [--key <서비스 계정 JSON>]');
  if (!process.stdin.isTTY) throw new Error('터미널에서 직접 실행해 주세요 (확인을 받아야 해요)');
  const sa = loadKey(), tk = await accessToken(sa, 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/datastore');
  const fs = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents`, idt = `https://identitytoolkit.googleapis.com/v1/projects/${sa.project_id}`;
  const get = async p => { try { return await call(tk, 'GET', `${fs}/${p}`); } catch (e) { if (e.status === 404) return null; throw e; } };

  let code = id;
  if (!UID_RE.test(code)) {
    if (id.includes('/')) throw new Error('/ 가 든 닉네임은 UID 로 찾아 주세요');
    const d = await get('nicknames/' + encodeURIComponent('n_' + id.toLowerCase())); code = d ? str(d.fields.code) : '';
    if (!UID_RE.test(code)) throw new Error('이 닉네임으로 등록된 계정이 없어요 · UID 로 다시 시도해 주세요');
  }
  const found = await call(tk, 'POST', `${idt}/accounts:lookup`, { email: [`${code}@jihoo-battle.invalid`] }), u = found.users && found.users[0];
  if (!u) throw new Error('UID ' + code + ' 계정이 없어요');

  const when = ms => (Number(ms) ? new Date(Number(ms)).toLocaleString('ko-KR') : '-');
  const google = (u.providerUserInfo || []).find(x => x.providerId === 'google.com');
  console.log(`\nUID ${code}\n  만든 날: ${when(u.createdAt)}\n  마지막 로그인: ${when(u.lastLoginAt)}\n  Google 연결: ${google ? '있음 → 게임의 「Google로 찾기」로도 바꿀 수 있어요' : '없음'}`);
  const b = await get('r2_backups/' + encodeURIComponent(u.localId));
  if (b) { try { const p = JSON.parse(str(b.fields.payload));
    console.log(`  닉네임: ${p.nick}\n  레벨: ${p.level} · ${p.wins | 0}승 ${p.losses | 0}패 · 지후 ${Object.keys(p.owned || {}).length}종 · 뽑기 ${p.pulls | 0}회\n  덱: ${(p.deck || []).join(', ')}\n  마지막 저장: ${when(b.fields.savedAt && b.fields.savedAt.integerValue)}`); } catch (e) { console.log('  (기록을 읽지 못했어요)'); } }
  else console.log('  서버 기록 없음');

  console.log('\n⚠ 요청한 사람에게 위 정보 (덱 · 레벨 · 승패 등) 를 먼저 물어 본인인지 확인하세요.');
  if ((await ask(`확인했으면 UID ${code} 를 그대로 입력하세요 (그만두려면 Enter): `)) !== code) { console.log('그만뒀어요 (바뀐 것 없음)'); return; }
  const pw = tempPw();
  await call(tk, 'POST', `${idt}/accounts:update`, { localId: u.localId, password: pw });
  console.log(`\n✔ 임시 비밀번호: ${pw}\n  본인에게만 전해 주세요. 로그인한 뒤 「JHBT 계정 → 비밀번호 → 바꾸기」로 바꾸도록 안내하세요.`);
})().catch(e => { console.error('✘ ' + (e.status === 403 ? '권한이 없어요 (서비스 계정에 Firebase Authentication 관리자 · Firestore 읽기 역할이 필요해요): ' + e.message : e.message || e)); process.exit(1); });
