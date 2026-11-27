// 서비스 계정 공용 도우미 — 키 경로 · 접근 토큰 · REST 호출 (tools/rules-test.js · tools/audit.js)
// 키 경로: --key > 환경 변수 JHBT_SA > 문서/jhbt-app/rules.json 의 key (tools/rules-deploy.js 가 기억한 것) · 키는 저장소 밖에만 둔다
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
const HOME = path.join(os.homedir(), 'Documents', 'jhbt-app'); // 저장소 밖 (설정 · 감시 기준 · 결과)

const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : undefined; };
const flag = k => args.includes('--' + k);

function loadKey() {
  let cfg = {}; try { cfg = JSON.parse(fs.readFileSync(path.join(HOME, 'rules.json'), 'utf8')); } catch (e) {}
  const p = opt('key') || process.env.JHBT_SA || cfg.key;
  if (!p || !fs.existsSync(p)) throw new Error('서비스 계정 키를 찾지 못했어요 · --key <키 JSON 경로> 를 붙여 주세요');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
const b64u = b => Buffer.from(b).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
async function accessToken(sa, scope) { // 서비스 계정 JWT → OAuth 토큰
  const now = Math.floor(Date.now() / 1000), head = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64u(JSON.stringify({ iss: sa.client_email, scope, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const sig = b64u(crypto.createSign('RSA-SHA256').update(head + '.' + claim).sign(sa.private_key));
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${claim}.${sig}` }) });
  const j = await r.json(); if (!j.access_token) throw new Error('토큰 발급 실패: ' + (j.error_description || j.error || r.status)); return j.access_token;
}
async function call(token, method, url, body) {
  const r = await fetch(url, { method, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({})); if (!r.ok) { const e = new Error((j.error && j.error.message) || 'HTTP ' + r.status); e.status = r.status; e.body = j; throw e; } return j;
}
module.exports = { HOME, opt, flag, loadKey, accessToken, call };
