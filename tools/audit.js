#!/usr/bin/env node
// 계정 감시 (읽기 전용) — 사용자 PC 에서 서비스 계정으로 서버 기록을 읽어 의심스러운 계정 목록을 만든다. 아무것도 고치거나 정지하지 않는다.
//   node tools/audit.js [--key <서비스 계정 JSON>] [--hist] [--backup] [--replays]
//     --hist    : 계정마다 서버 이력 (최대 12칸) 도 읽어 재화가 늘어난 속도를 본다 (읽기 수가 크게 늘어난다)
//     --backup  : 읽은 기록을 문서/jhbt-app/backups/<날짜>/ 에 저장 (누가 데이터를 망쳐도 되돌릴 수 있게)
//     --replays : 공유 리플레이에서 태그가 든 글자를 찾는다
// 감시 기준: 문서/jhbt-app/audit.json — 저장소가 공개라 기준과 결과는 저장소에 두지 않는다. 값이 null 이면 그 검사는 건너뛰고 분포만 보여 준다.
// Firestore 무료 한도 (읽기 하루 5만) 를 쓴다. 읽은 문서 수를 마지막에 알려 준다.
const fs = require('fs'), path = require('path');
const { HOME, flag, loadKey, accessToken, call } = require('./sa');

const CFG = path.join(HOME, 'audit.json');
const DEF = { dia: null, gold: null, diaPerHour: null, goldPerHour: null, ownPerHour: null, cheat: 1, lbGap: null };
function loadCfg() {
  try { return { ...DEF, ...JSON.parse(fs.readFileSync(CFG, 'utf8')) }; }
  catch (e) { if (e.code !== 'ENOENT') throw e; fs.mkdirSync(HOME, { recursive: true }); fs.writeFileSync(CFG, JSON.stringify(DEF, null, 1)); console.log('감시 기준 파일을 만들었어요 (분포를 보고 숫자를 넣어 주세요): ' + CFG); return { ...DEF }; }
}
const val = v => { // Firestore REST 값 → JS
  if (!v) return null; if ('stringValue' in v) return v.stringValue; if ('integerValue' in v) return Number(v.integerValue); if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue; if ('timestampValue' in v) return Date.parse(v.timestampValue);
  if ('mapValue' in v) return fields(v.mapValue.fields); if ('arrayValue' in v) return (v.arrayValue.values || []).map(val); return null;
};
const fields = f => Object.fromEntries(Object.entries(f || {}).map(([k, v]) => [k, val(v)]));
const n = v => Number(v) || 0;
const parse = s => { try { const p = JSON.parse(s); return p && typeof p === 'object' ? p : null; } catch (e) { return null; } };

// ── 검사 (순수 함수) ──
function checkAccount(a, cfg, lb) { // a: { uid, doc, p, hist: [{ at, p }] } → 이유 목록
  const R = [], p = a.p, led = a.doc.led;
  if (!p) return ['기록을 읽을 수 없어요 (JSON 깨짐)'];
  const own = Object.keys(p.owned || {}).length;
  if (led) { // 게임 화면은 둘을 늘 같이 쓴다 → 다르면 직접 고친 것
    for (const [k, v] of [['dia', n(p.dia)], ['gold', n(p.gold)], ['pulls', n(p.pulls)], ['own', own]]) if (n(led[k]) !== Math.max(0, Math.floor(v))) R.push(`[강함] 장부와 기록이 다름 · ${k}: 장부 ${n(led[k])} / 기록 ${v}`);
  }
  if (cfg.dia != null && n(p.dia) > cfg.dia) R.push(`다이아 ${n(p.dia).toLocaleString()}`);
  if (cfg.gold != null && n(p.gold) > cfg.gold) R.push(`골드 ${n(p.gold).toLocaleString()}`);
  const ch = n(p.cheat && p.cheat.n); if (cfg.cheat != null && ch >= cfg.cheat) R.push(`조작 흔적 ${ch}회 (${Object.keys((p.cheat && p.cheat.kinds) || {}).join(', ')})`);
  for (const r of rates(a)) {
    for (const k of ['dia', 'gold', 'own']) { const lim = cfg[k + 'PerHour']; if (lim != null && r[k] > lim) R.push(`${k} 시간당 +${Math.round(r[k]).toLocaleString()} (${r.hours.toFixed(1)}시간 사이)`); }
  }
  if (lb) {
    if (n(lb.wins) > n(p.wins) + (cfg.lbGap ?? 20)) R.push(`순위의 승수 ${lb.wins} 가 기록 ${n(p.wins)} 보다 많음`);
    if (n(lb.level) > n(p.level) + 1) R.push(`순위의 레벨 ${lb.level} 이 기록 ${n(p.level)} 보다 높음`);
  }
  return R;
}
function rates(a) { // 이력 (오래된 것 → 지금) 사이에 늘어난 속도 · 버린 기록 (x 칸) 은 빼고
  const L = (a.hist || []).filter(h => h.p && h.slot[0] === 't').concat(a.p ? [{ at: n(a.doc.savedAt), p: a.p }] : []).sort((x, y) => x.at - y.at), out = [];
  for (let i = 1; i < L.length; i++) {
    const hours = Math.max(1, (L[i].at - L[i - 1].at) / 3600000), g = (x, k) => (k === 'own' ? Object.keys(x.owned || {}).length : n(x[k]));
    out.push({ hours, ...Object.fromEntries(['dia', 'gold', 'own'].map(k => [k, Math.max(0, g(L[i].p, k) - g(L[i - 1].p, k)) / hours])) });
  }
  return out;
}
function duplicates(accounts) { // 같은 닉네임 · 같은 시작 기록을 가진 계정 (중복 생성 · 분열 후보)
  const by = (key, label) => { const M = new Map(); for (const a of accounts) { const k = a.p && key(a.p); if (!k) continue; (M.get(k) || M.set(k, []).get(k)).push(a); } return [...M.entries()].filter(([, L]) => L.length > 1).map(([k, L]) => ({ label, k, L })); };
  return [...by(p => String(p.nick || '').trim().toLowerCase(), '같은 닉네임'), ...by(p => p.imported ? `${p.imported}` : '', '같은 R1 가져오기')];
}
const dist = (L, label) => { if (!L.length) return; const s = [...L].sort((a, b) => a - b), q = x => s[Math.min(s.length - 1, Math.floor(x * s.length))]; console.log(`  ${label}: 중간 ${Math.round(q(0.5)).toLocaleString()} · 상위 10% ${Math.round(q(0.9)).toLocaleString()} · 상위 1% ${Math.round(q(0.99)).toLocaleString()} · 최대 ${Math.round(s[s.length - 1]).toLocaleString()}`); };
module.exports = { checkAccount, rates, duplicates };

async function main() {
  const cfg = loadCfg(), sa = loadKey(), tk = await accessToken(sa, 'https://www.googleapis.com/auth/datastore');
  const base = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents`;
  let reads = 0;
  async function list(col) { const out = []; let page = ''; do { const j = await call(tk, 'GET', `${base}/${col}?pageSize=300${page ? '&pageToken=' + encodeURIComponent(page) : ''}`); for (const d of j.documents || []) out.push({ id: d.name.split('/').pop(), data: fields(d.fields), raw: d }); reads += (j.documents || []).length || 1; page = j.nextPageToken || ''; } while (page); return out; }

  const accounts = (await list('r2_backups')).map(d => ({ uid: d.id, doc: d.data, p: parse(d.data.payload), hist: [] }));
  const lb = new Map((await list('r2lb')).map(d => [d.id, d.data]));
  if (flag('hist')) for (const a of accounts) a.hist = (await list(`r2_backups/${a.uid}/hist`)).map(d => ({ slot: d.id, at: n(d.data.savedAt), p: parse(d.data.payload) }));

  const day = new Date().toISOString().slice(0, 10), out = [], log = s => { console.log(s); out.push(s); };
  log(`감시 ${day} · 계정 ${accounts.length} · 순위 ${lb.size}`);
  console.log('\n분포 (기준을 정할 때 참고)');
  dist(accounts.map(a => n(a.p && a.p.dia)), '다이아'); dist(accounts.map(a => n(a.p && a.p.gold)), '골드');
  if (flag('hist')) { const R = accounts.flatMap(rates); dist(R.map(r => r.dia).filter(x => x > 0), '다이아 시간당 증가'); dist(R.map(r => r.gold).filter(x => x > 0), '골드 시간당 증가'); }

  const bad = accounts.map(a => ({ a, R: checkAccount(a, cfg, lb.get(a.uid)) })).filter(x => x.R.length).sort((x, y) => y.R.filter(r => r.startsWith('[강함]')).length - x.R.filter(r => r.startsWith('[강함]')).length || y.R.length - x.R.length);
  log(`\n의심 계정 ${bad.length}`);
  for (const { a, R } of bad) log(`- ${(a.p && a.p.nick) || '?'} (${a.uid})\n    ${R.join('\n    ')}`);

  const dup = duplicates(accounts);
  log(`\n중복 · 분열 후보 ${dup.length} (확인만 · 자동으로 지우지 않아요)`);
  for (const g of dup) log(`- ${g.label}: ${g.L.map(a => `${a.p.nick || '?'} Lv.${n(a.p.level)} 승 ${n(a.p.wins)} (${a.uid} · ${new Date(n(a.doc.savedAt)).toLocaleDateString('ko-KR')})`).join(' | ')}`);

  if (flag('replays')) {
    const rp = (await list('r2rp')).filter(d => /<[a-z!/]/i.test(String(d.data.d || '') + ['nick', 'pn', 'on', 'b', 'kind'].map(k => d.data[k]).join(' ')));
    log(`\n태그가 든 리플레이 ${rp.length}`); for (const d of rp) log(`- ${d.id} (올린 계정 ${d.data.by})`);
  }
  if (flag('backup')) {
    const dir = path.join(HOME, 'backups', day); fs.mkdirSync(dir, { recursive: true });
    for (const a of accounts) fs.writeFileSync(path.join(dir, a.uid.replace(/[^\w-]/g, '_') + '.json'), JSON.stringify({ doc: a.doc, hist: a.hist }, null, 1));
    log(`\n기록 ${accounts.length}개를 저장했어요: ${dir}`);
  }
  const rep = path.join(HOME, 'audit', day + '.txt'); fs.mkdirSync(path.dirname(rep), { recursive: true }); fs.writeFileSync(rep, out.join('\n'));
  console.log(`\n결과: ${rep}\n읽은 문서 약 ${reads}개`);
}
if (require.main === module) main().catch(e => { console.error('✘ ' + (e.status === 403 ? '권한이 없어요 (서비스 계정에 Firestore 읽기 역할이 필요해요)' : e.message || e)); process.exit(1); });
