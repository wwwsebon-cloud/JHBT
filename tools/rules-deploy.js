#!/usr/bin/env node
// RE : 지후배틀 firestore.rules 게시 (R3.5) — 사용자 PC 에서 서비스 계정 키로 Firebase 규칙 API 를 직접 부른다 (Firebase CLI · 로그인 · 의존성 없음)
//
//   node tools/rules-deploy.js [--key <서비스 계정 JSON 경로>] [--dry]
//
//   --key   : 처음 한 번 (경로를 저장소 밖 문서/jhbt-app/rules.json 에 기억한다) · 환경 변수 JHBT_SA 도 된다
//   --dry   : 게시하지 않고 서버 규칙과 무엇이 다른지만 보여 준다
//   서버 규칙과 같으면 게시하지 않는다 · 문법 오류는 서버가 거절하고 그 오류를 그대로 보여 준다
//   서비스 계정에 「Firebase 규칙 관리」(Firebase Rules Admin) 역할이 있어야 한다 (Google Cloud 콘솔 → IAM)
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');

const args = process.argv.slice(2), opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : undefined; }, flag = k => args.includes('--' + k);
const CFG = path.join(os.homedir(), 'Documents', 'jhbt-app', 'rules.json');
let cfg = {}; try { cfg = JSON.parse(fs.readFileSync(CFG, 'utf8')); } catch (e) {}
const keyPath = opt('key') || process.env.JHBT_SA || cfg.key;
if (!keyPath) { console.error('처음 한 번: node tools/rules-deploy.js --key <서비스 계정 JSON 경로>'); process.exit(1); }
if (!fs.existsSync(keyPath)) { console.error('✘ 키 파일이 없어요: ' + keyPath + ' · 파일 탐색기에서 키 파일을 우클릭 → 「경로로 복사」 한 뒤 --key 뒤에 붙여 넣어 주세요.'); process.exit(1); }
if (opt('key')) { fs.mkdirSync(path.dirname(CFG), { recursive: true }); fs.writeFileSync(CFG, JSON.stringify({ ...cfg, key: path.resolve(opt('key')) }, null, 1)); console.log('키 경로를 기억했어요: ' + CFG); }
const sa = JSON.parse(fs.readFileSync(keyPath, 'utf8')), PID = sa.project_id;
const RULES = fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8');
const API = `https://firebaserules.googleapis.com/v1/projects/${PID}`, REL = `projects/${PID}/releases/cloud.firestore`;

const b64u = b => Buffer.from(b).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
async function accessToken() { // 서비스 계정 JWT → OAuth 토큰
  const now = Math.floor(Date.now() / 1000), head = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64u(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/firebase https://www.googleapis.com/auth/cloud-platform', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const sig = b64u(crypto.createSign('RSA-SHA256').update(head + '.' + claim).sign(sa.private_key));
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${claim}.${sig}` }) });
  const j = await r.json(); if (!j.access_token) throw new Error('토큰 발급 실패: ' + JSON.stringify(j)); return j.access_token;
}
async function call(tk, method, url, body) {
  const r = await fetch(url, { method, headers: { Authorization: 'Bearer ' + tk, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({})); if (!r.ok) { const e = new Error((j.error && j.error.message) || 'HTTP ' + r.status); e.status = r.status; e.body = j; throw e; } return j;
}
function diff(a, b) { // 줄 단위로 간단히 (바뀐 줄 수 · 처음 몇 줄)
  const A = a.split(/\r?\n/), B = b.split(/\r?\n/), SA = new Set(A), SB = new Set(B), add = B.filter(l => !SA.has(l)), del = A.filter(l => !SB.has(l));
  return { add, del };
}
(async () => {
  const tk = await accessToken();
  let cur = '';
  try { const rel = await call(tk, 'GET', `https://firebaserules.googleapis.com/v1/${REL}`), rs = await call(tk, 'GET', `https://firebaserules.googleapis.com/v1/${rel.rulesetName}`); cur = ((rs.source && rs.source.files) || []).map(f => f.content).join('\n'); }
  catch (e) { if (e.status === 403) { console.error('권한이 없어요. 서비스 계정에 「Firebase 규칙 관리」 역할을 주세요 (' + sa.client_email + ')'); process.exit(1); } if (e.status !== 404) throw e; }
  if (cur.replace(/\r\n/g, '\n').trim() === RULES.replace(/\r\n/g, '\n').trim()) { console.log('✔ 서버 규칙이 이미 최신이에요 (게시 안 함)'); return; }
  const d = diff(cur, RULES); console.log(`바뀐 줄: +${d.add.length} −${d.del.length}`); d.add.slice(0, 12).forEach(l => console.log('  + ' + l.trim().slice(0, 140))); d.del.slice(0, 6).forEach(l => console.log('  − ' + l.trim().slice(0, 140)));
  if (flag('dry')) { console.log('(--dry: 게시하지 않았어요)'); return; }
  let rs; try { rs = await call(tk, 'POST', `${API}/rulesets`, { source: { files: [{ name: 'firestore.rules', content: RULES }] } }); }
  catch (e) { console.error('✘ 규칙 오류로 거절됐어요: ' + e.message); ((e.body && e.body.error && e.body.error.details) || []).forEach(x => (x.issues || []).forEach(i => console.error(`  ${i.sourcePosition ? i.sourcePosition.line + '번째 줄: ' : ''}${i.description}`))); process.exit(1); }
  await call(tk, 'PATCH', `https://firebaserules.googleapis.com/v1/${REL}`, { release: { name: REL, rulesetName: rs.name } });
  console.log('✔ 게시했어요 · ' + rs.name.split('/').pop() + ' · ' + new Date().toLocaleString('ko-KR'));
})().catch(e => { console.error('✘ ' + (e.message || e)); process.exit(1); });
