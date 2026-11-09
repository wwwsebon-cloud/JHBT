#!/usr/bin/env node
// RE : 지후배틀 업데이트 알림 보내기 (R2.26) — 사용자 PC 에서 직접 (서버 · 유료 요금제 필요 없음 · 의존성 없음)
//
//   node tools/push-send.js --key <서비스 계정 JSON 경로> [--title "제목"] [--body "내용"] [--url https://jihoobattle.kr/] [--dry]
//
//   제목 · 내용을 빼면 index.html 의 버전 · 맨 위 패치노트 제목으로 만든다 (예: 「R2.26 업데이트!」 · 「밸런스 패치 · 새 아케이드 모드」)
//   --dry : 보내지 않고 받을 기기 수만 센다 · --list : 기기마다 저장 시각 · 홈 화면 앱인지 (보내지 않음)
//
// 서비스 계정 JSON: Firebase 콘솔 → 프로젝트 설정 → 서비스 계정 → 「새 비공개 키 생성」 (저장소에 올리지 말 것 · .gitignore 의 *.private.json 이름 추천)
// 토큰은 게임이 push_tokens/<uid> 에 저장한다 (알림을 허용한 기기) · 만료된 토큰은 보내면서 지운다
const fs = require('fs'), path = require('path'), crypto = require('crypto');

const args = process.argv.slice(2), opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : undefined; }, flag = k => args.includes('--' + k);
const keyPath = opt('key') || process.env.JHBT_SA;
if (!keyPath) { console.error('사용법: node tools/push-send.js --key <서비스 계정 JSON> [--title 제목] [--body 내용] [--url 주소] [--dry]'); process.exit(1); }
const sa = JSON.parse(fs.readFileSync(keyPath, 'utf8')), PID = sa.project_id;

function defaults() { // index.html 에서 버전 · 맨 위 패치노트
  try {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const v = (/<meta name="jihoo-version" content="([^"]+)"/.exec(html) || [])[1] || '';
    const pn = /const PATCH_NOTES = \[\s*\{ v: '([^']+)', date: '[^']*', title: '([^']*)'/.exec(html);
    return { title: `RE : 지후배틀 ${v} 업데이트!`, body: pn ? `${pn[2]} — 지금 확인해 보세요` : '새 업데이트가 나왔어요' };
  } catch (e) { return { title: 'RE : 지후배틀 업데이트!', body: '새 업데이트가 나왔어요' }; }
}
const D = defaults(), TITLE = opt('title') || D.title, BODY = opt('body') || D.body, URL = opt('url') || 'https://jihoobattle.kr/';

const b64u = b => Buffer.from(b).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
async function accessToken() { // 서비스 계정 JWT → OAuth 토큰
  const now = Math.floor(Date.now() / 1000), head = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64u(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const sig = b64u(crypto.createSign('RSA-SHA256').update(head + '.' + claim).sign(sa.private_key));
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${claim}.${sig}` }) });
  const j = await r.json(); if (!j.access_token) throw new Error('토큰 발급 실패: ' + JSON.stringify(j)); return j.access_token;
}
async function listTokens(tk) { // push_tokens 전부 (300개씩)
  const out = []; let page = '';
  do {
    const u = `https://firestore.googleapis.com/v1/projects/${PID}/databases/(default)/documents/push_tokens?pageSize=300${page ? '&pageToken=' + encodeURIComponent(page) : ''}`;
    const j = await (await fetch(u, { headers: { Authorization: 'Bearer ' + tk } })).json();
    if (j.error) throw new Error('토큰 목록 실패: ' + JSON.stringify(j.error));
    (j.documents || []).forEach(d => { const f = d.fields || {}, t = f.token && f.token.stringValue; if (t) out.push({ name: d.name, token: t, at: f.updatedAt && f.updatedAt.timestampValue, app: f.app && +f.app.integerValue }); });
    page = j.nextPageToken || '';
  } while (page);
  return out;
}
async function sendOne(tk, t) {
  const r = await fetch(`https://fcm.googleapis.com/v1/projects/${PID}/messages:send`, { method: 'POST', headers: { Authorization: 'Bearer ' + tk, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: { token: t.token, webpush: { notification: { title: TITLE, body: BODY, icon: 'https://jihoobattle.kr/icons/icon-192.png' }, fcm_options: { link: URL }, headers: { Urgency: 'high', TTL: String(3 * 24 * 3600) } /* high: 아이폰 · 아이패드는 normal 이면 잠자는 동안 늦게 보낼 수 있다 */ }, data: { url: URL, tag: 'rejhbt-update' } } }) });
  if (r.ok) return 'ok';
  const j = await r.json().catch(() => ({})), code = (j.error && (j.error.details || []).map(x => x.errorCode).find(Boolean)) || (j.error && j.error.status) || r.status;
  if (code === 'UNREGISTERED' || code === 'INVALID_ARGUMENT' || r.status === 404) { await fetch(`https://firestore.googleapis.com/v1/${t.name}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + tk } }); return 'gone'; }
  return 'err:' + code;
}
(async () => {
  const tk = await accessToken(), L = await listTokens(tk);
  console.log(`알림: 「${TITLE}」 · ${BODY}\n받을 기기 ${L.length}대`);
  if (flag('list')) L.forEach((t, i) => console.log(` ${i + 1}. 저장 ${t.at ? new Date(t.at).toLocaleString('ko-KR') : '?'} · ${t.app ? '홈 화면 앱' : '브라우저'} · uid ${t.name.split('/').pop().slice(0, 6)}… · 토큰 ${t.token.slice(0, 12)}…`)); // --list: 누가 언제 등록했는지 (보내지 않음)
  if (flag('dry') || flag('list') || !L.length) return;
  const res = { ok: 0, gone: 0, err: 0 }; let i = 0;
  await Promise.all(Array.from({ length: 16 }, async () => { while (i < L.length) { const t = L[i++]; const r = await sendOne(tk, t).catch(e => 'err:' + e.message); if (r === 'ok') res.ok++; else if (r === 'gone') res.gone++; else { res.err++; if (res.err <= 3) console.warn(' 실패', r); } } }));
  console.log(`보냄 ${res.ok} · 만료 토큰 지움 ${res.gone} · 실패 ${res.err}`);
})().catch(e => { console.error(e.message || e); process.exit(1); });
