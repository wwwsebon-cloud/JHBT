#!/usr/bin/env node
// RE : 지후배틀 패치 공지 올리기 (R2.36 build 2) — 디스코드 (웹후크) · Threads (공식 API) · 의존성 없음 · 사용자 PC 에서
//
//   node tools/post-patch.js                 맨 위 패치노트 (그날 마지막 build) 를 둘 다 올린다
//   node tools/post-patch.js --dry           올리지 않고 글 · 이미지 · 이미지 주소만 확인
//   node tools/post-patch.js R2.36 --build 2 버전 · build 를 골라서 (--all : 그 버전 항목 전체 · build 1 은 --all)
//   node tools/post-patch.js --day           하루 총정리: 맨 위 버전 항목 전체 (build 칸까지) + infographics/today-<날짜>*.png (없으면 <버전>.png) · 매일 마지막에 한 번
//   인스타그램: node tools/post-patch.js --ig-token <토큰> [--secret <인스타 앱 시크릿>] (프로페셔널 계정 · 토큰이 있으면 기본으로 같이 올린다)
//             그림은 JPEG 4:5 조각 (tools/ig-slices.py → infographics/ig/) 을 GitHub raw 주소로 받는다 → 조각을 커밋 · 푸시한 뒤 올린다
//   옵션: --only discord|threads|instagram · --img a.png,b.png (이미지를 직접) · --everyone (디스코드 @everyone) · --no-ping (역할 핑 빼기) · --force (이미 올린 것도 다시)
//   디스코드 역할 핑: node tools/post-patch.js --discord-role <역할 ID> (서버 설정 → 역할 → 우클릭 → 역할 ID 복사 · 개발자 모드 필요) → 올릴 때마다 그 역할 핑
//
// 처음 한 번 (설정 파일은 저장소 밖: 문서/jhbt-app/post.json · 바꾸려면 --cfg <경로> 또는 환경 변수 JHBT_POST):
//   node tools/post-patch.js --init                                   설정 파일 틀을 만든다
//   디스코드: 서버 설정 → 연동 → 웹후크 → 새 웹후크 (공지 채널) → URL 복사 → post.json 의 discord.webhook 에
//   Threads:  node tools/post-patch.js --threads-token <토큰> [--secret <앱 시크릿>]
//             (짧은 토큰이면 --secret 으로 60일 토큰으로 바꾼다 · 계정 id 도 저장 · 그 뒤 20일마다 알아서 갱신)
//
// 이미지: infographics/<버전>.png · <버전>-2.png … (build 는 <버전>-b<N>.png …) — Threads 는 이미지를 공개 주소로만 받는다
//   → GitHub raw 주소를 쓴다 (인포그래픽은 사이트 배포에서 빠져 있다) → **먼저 git push** 한 뒤 올린다 (--dry 가 주소를 확인해 준다).
// 같은 패치를 두 번 올리지 않게 post.json 의 posted 에 기록한다.
const fs = require('fs'), path = require('path'), os = require('os'), { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2), opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : undefined; }, flag = k => args.includes('--' + k);
const CFG_PATH = opt('cfg') || process.env.JHBT_POST || path.join(os.homedir(), 'Documents', 'jhbt-app', 'post.json');
const TH = process.env.THREADS_API || 'https://graph.threads.net'; // 시험용으로 바꿀 수 있다
const IG = process.env.IG_API || 'https://graph.instagram.com'; // 인스타그램 (Instagram 로그인 API · 프로페셔널 계정)
const SITE = 'https://jihoobattle.kr';
const DRY = flag('dry'), FORCE = flag('force'), ONLY = opt('only');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const die = m => { console.error('❌ ' + m); process.exit(1); };

// ── 설정 파일 ──
const loadCfg = () => { try { return JSON.parse(fs.readFileSync(CFG_PATH, 'utf8')); } catch (e) { return null; } };
const saveCfg = c => { fs.mkdirSync(path.dirname(CFG_PATH), { recursive: true }); fs.writeFileSync(CFG_PATH, JSON.stringify(c, null, 2)); };
const TEMPLATE = { discord: { webhook: '' }, threads: { userId: '', token: '', savedAt: '' }, instagram: { userId: '', token: '', savedAt: '' }, posted: {} };

// ── 패치노트 (index.html 의 PATCH_NOTES 를 그대로 읽는다 · 지후 이름 같은 게임 값은 없어도 되게) ──
function patchNotes() {
  const h = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), a = h.indexOf('const PATCH_NOTES = ['), b = h.indexOf('\n];', a);
  if (a < 0 || b < 0) die('index.html 에서 PATCH_NOTES 를 못 찾았어요');
  const any = new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive || k === 'toString' ? () => '' : any), apply: () => any });
  const sb = new Proxy({}, { has: () => true, get: (t, k) => (k === Symbol.unscopables ? undefined : k in globalThis ? globalThis[k] : any) });
  return new Function('sb', 'with (sb) { return (' + h.slice(a + 'const PATCH_NOTES = '.length, b + 2) + '); }')(sb);
}
const plain = s => String(s || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const TAG = { new: '🆕', buff: '🔺', nerf: '🔻', adjust: '🔄', rework: '♻️', fix: '🔧', system: '⚙️' };

function pick() { // 올릴 항목: { key, ver, build, title, date, sections }
  const P = patchNotes(), ver = args.find(x => /^R\d/.test(x)) || P[0].v, e = P.find(x => x.v === ver);
  if (!e) die(`패치노트에 ${ver} 이 없어요`);
  const bOf = s => +((/^추가 패치 \(build (\d+)\)/.exec(s.title || '') || [])[1] || 0);
  if (flag('day')) { /* 하루 총정리: build 칸까지 모두 · 이미지 today-<날짜> (없으면 <버전>) */
    const day = 'today-' + String(e.date || '').replace(/\./g, '-'), secs = e.sections.map(x => ({ title: plain(x.title).replace(/^추가 패치 \(build \d+\)\s*·?\s*/, '') || plain(e.title), items: x.items }));
    let today = null; try { today = JSON.parse(fs.readFileSync(path.join(ROOT, 'infographics', day + '.json'), 'utf8')); } catch (er) {}
    return { key: `${ver}-day`, img: day, today, ver, build: 0, title: e.title, date: e.date, sections: secs };
  }
  let build = opt('build') ? +opt('build') : flag('all') ? 0 : bOf(e.sections[0]);
  if (build > 1) {
    const sec = e.sections.find(s => bOf(s) === build); if (!sec) die(`${ver} 에 「추가 패치 (build ${build})」 칸이 없어요`);
    const sub = plain(sec.title).replace(/^추가 패치 \(build \d+\)\s*·?\s*/, '');
    return { key: `${ver}-b${build}`, ver, build, title: sub || e.title, date: e.date, sections: [{ title: sub, items: sec.items }] };
  }
  return { key: ver, ver, build: 0, title: e.title, date: e.date, sections: e.sections.filter(s => !bOf(s)) };
}

function images(key) { // infographics/<key>.png · <key>-2.png …
  if (opt('img')) return opt('img').split(',').map(f => path.resolve(f.trim()));
  const dir = path.join(ROOT, 'infographics'), re = new RegExp('^' + key.replace(/\./g, '\\.') + '(?:-(\\d+))?\\.png$');
  return fs.readdirSync(dir).map(f => [f, re.exec(f)]).filter(x => x[1]).sort((x, y) => (+x[1][1] || 1) - (+y[1][1] || 1)).map(x => path.join(dir, x[0]));
}

// ── 글 ──
const head = n => `📢 RE : 지후배틀 ${n.ver}${n.build ? ` build ${n.build}` : ''} 업데이트`;
const line = it => `${it.icon || TAG[it.tag] || '•'} ${plain(it.name)}${it.desc ? ' — ' + plain(it.desc) : ''}`;
function balSum(sec) { // 총정리 밸런스 타일 → 지후별 상향 · 하향 · 조정 이름
  const by = {}; (sec.tiles || []).forEach(t => { if (!by[t.id]) by[t.id] = { name: plain(t.name).replace(/ 지후$/, ''), tag: t.tag }; });
  const L = Object.values(by), of = tag => L.filter(x => x.tag === tag).map(x => x.name);
  return { n: L.length, up: of('buff'), dn: of('nerf'), adj: L.filter(x => x.tag !== 'buff' && x.tag !== 'nerf').map(x => x.name) };
}
const SEC_IC = { new: '🆕', change: '🔄', fix: '🔧', balance: '⚖️' };
function dayLong(n) { // 디스코드 (하루 총정리): 섹션마다 항목 · 밸런스는 지후 이름만
  const out = [];
  for (const sec of n.today.sections) {
    if (sec.kind === 'balance') { const b = balSum(sec); out.push(`\n**⚖️ ${plain(sec.label)} ${b.n}종**`); if (b.up.length) out.push(`🔺 상향: ${b.up.join(' · ')}`); if (b.dn.length) out.push(`🔻 하향: ${b.dn.join(' · ')}`); if (b.adj.length) out.push(`🔄 조정: ${b.adj.join(' · ')}`); continue; }
    out.push(`\n**${SEC_IC[sec.kind] || '•'} ${plain(sec.label)}**`);
    (sec.items || []).forEach(it => out.push(`${it.icon || '✨'} ${plain(it.title)}${(it.lines || []).length ? ' — ' + it.lines.map(plain).join(' · ') : ''}`));
  }
  let t = out.join('\n').trim(); if (t.length > 3900) t = t.slice(0, 3900).replace(/\n[^\n]*$/, '') + '\n…';
  return t;
}
function dayShort(n) { // Threads (하루 총정리 · 500자): 섹션마다 앞 몇 개 이름 · 밸런스는 수만
  const cp = x => [...x].length, top = `${head(n)}\n${plain(n.title)}\n\n`, tail = `\n\n▶ ${SITE.replace('https://', '')}`;
  for (const k of [4, 3, 2, 1, 0]) {
    const L = n.today.sections.map(sec => {
      if (sec.kind === 'balance') { const b = balSum(sec); return `⚖️ ${plain(sec.label)} ${b.n}종 (상향 ${b.up.length} · 하향 ${b.dn.length}${b.adj.length ? ' · 조정 ' + b.adj.length : ''})`; }
      const T = (sec.items || []).map(it => plain(it.title).split(' · ')[0]), more = T.length - k; /* 「얼음 · 한파주의보」 → 얼음 */
      return `${SEC_IC[sec.kind] || '•'} ${plain(sec.label)}` + (k ? ` — ${T.slice(0, k).join(' · ')}${more > 0 ? ` 외 ${more}` : ''}` : ` ${T.length}`);
    });
    const t = top + L.join('\n') + tail; if (cp(t) <= 490) return t;
  }
  return top + n.today.sections.map(sec => plain(sec.label)).join(' · ') + tail;
}
function longText(n) { // 디스코드: 항목 전부 (4000자까지)
  if (n.today) return dayLong(n);
  const out = []; n.sections.forEach(s => { if (n.sections.length > 1 || (s.title && s.title !== n.title)) out.push(`\n**${plain(s.title)}**`); s.items.forEach(it => out.push(line(it))); });
  let t = out.join('\n').trim(); if (t.length > 3900) t = t.slice(0, 3900).replace(/\n[^\n]*$/, '') + '\n…';
  return t;
}
function shortText(n) { // Threads: 500자 → 항목 이름만 · 넘치면 「외 N개」
  if (n.today) return dayShort(n);
  const cp = s => [...s].length, top = `${head(n)}\n${plain(n.title)}\n\n`, tail = `\n\n▶ ${SITE.replace('https://', '')}`, names = [];
  n.sections.forEach(s => s.items.forEach(it => names.push(`${it.icon || TAG[it.tag] || '•'} ${plain(it.name)}`)));
  let body = '', k = 0;
  for (; k < names.length; k++) { const next = body + (body ? '\n' : '') + names[k], more = names.length - k - 1; if (cp(top + next + (more ? `\n… 외 ${more}개` : '') + tail) > 490) break; body = next; }
  if (k < names.length) body += `\n… 외 ${names.length - k}개`;
  return top + body + tail;
}

// ── 이미지 공개 주소 (GitHub raw) ──
function rawBase() {
  if (opt('base-url')) return opt('base-url').replace(/\/$/, '');
  let r = 'wwwsebon-cloud/JHBT'; try { const u = execSync('git remote get-url origin', { cwd: ROOT }).toString().trim(), m = /github\.com[:/](.+?)(?:\.git)?$/.exec(u); if (m) r = m[1]; } catch (e) {}
  return `https://raw.githubusercontent.com/${r}/main`;
}
const pubUrl = f => rawBase() + '/' + path.relative(ROOT, f).split(path.sep).map(encodeURIComponent).join('/');
async function checkUrl(f) { // 푸시됐는지 (크기가 같은지)
  try { const r = await fetch(pubUrl(f), { method: 'HEAD' }); if (!r.ok) return `HTTP ${r.status} (아직 푸시 안 됨?)`; const n = +r.headers.get('content-length'); return n && n !== fs.statSync(f).size ? `크기가 달라요 (푸시 전 · 또는 캐시 · 몇 분 뒤 다시)` : 'ok'; } catch (e) { return '확인 실패 ' + e.message; }
}

// ── 디스코드 ──
async function postDiscord(cfg, n, imgs) {
  const hook = cfg.discord && cfg.discord.webhook; if (!hook) throw new Error('post.json 에 discord.webhook 이 없어요');
  const url = SITE, color = 0x5b6cff, names = imgs.map((f, i) => `p${i}${path.extname(f)}`);
  const embeds = [{ title: head(n).replace('📢 ', '') + ' · ' + plain(n.title), url, color, description: longText(n), footer: { text: n.date || '' }, ...(imgs[0] ? { image: { url: 'attachment://' + names[0] } } : {}) }];
  for (let i = 1; i < Math.min(imgs.length, 4); i++) embeds.push({ url, image: { url: 'attachment://' + names[i] } }); // 같은 url 이면 디스코드가 한 갤러리로 묶는다 (4장까지)
  const ev = flag('everyone'), role = !flag('no-ping') && cfg.discord.role ? String(cfg.discord.role) : ''; /* 역할 핑 (예: @update) · --no-ping 이면 안 함 */
  const payload = { username: '지후배틀', content: [ev ? '@everyone' : '', role ? `<@&${role}>` : ''].filter(Boolean).join(' '), allowed_mentions: { parse: ev ? ['everyone'] : [], roles: role ? [role] : [] }, embeds, attachments: imgs.map((f, i) => ({ id: i, filename: names[i] })) };
  const fd = new FormData(); fd.append('payload_json', JSON.stringify(payload));
  imgs.forEach((f, i) => fd.append(`files[${i}]`, new Blob([fs.readFileSync(f)], { type: 'image/png' }), names[i]));
  const r = await fetch(hook + (hook.includes('?') ? '&' : '?') + 'wait=true', { method: 'POST', body: fd });
  if (!r.ok) throw new Error(`디스코드 ${r.status} ${(await r.text()).slice(0, 300)}`);
  const j = await r.json().catch(() => ({})); return j.id ? `메시지 ${j.id}` : 'ok';
}

// ── Threads ──
async function th(method, p, params) {
  const u = new URL(TH + p); let body;
  if (method === 'GET') Object.entries(params || {}).forEach(([k, v]) => u.searchParams.set(k, v)); else body = new URLSearchParams(params);
  const r = await fetch(u, { method, body }), j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`Threads ${p} ${r.status} ${JSON.stringify(j.error || j).slice(0, 300)}`);
  return j;
}
async function thToken(cfg) { // 20일이 넘은 60일 토큰은 갱신 (만료 전 · 받은 지 하루가 지나야 한다)
  const t = cfg.threads || {}; if (!t.token) throw new Error('Threads 토큰이 없어요 → node tools/post-patch.js --threads-token <토큰> [--secret <앱 시크릿>]');
  const age = Date.now() - (Date.parse(t.savedAt) || 0);
  if (age > 20 * 864e5) {
    try { const j = await th('GET', '/refresh_access_token', { grant_type: 'th_refresh_token', access_token: t.token }); if (!j.access_token) throw new Error(JSON.stringify(j).slice(0, 200)); t.token = j.access_token; t.savedAt = new Date().toISOString(); saveCfg(cfg); console.log('🔑 Threads 토큰 갱신 (60일)'); }
    catch (e) { console.warn('⚠️ Threads 토큰 갱신 실패 (만료됐으면 --threads-token 으로 새로): ' + e.message); }
  }
  return t.token;
}
async function thWait(id, token) { // 이미지 컨테이너가 준비될 때까지 (보통 몇 초 · 최대 2분)
  for (let i = 0; i < 40; i++) { const j = await th('GET', '/v1.0/' + id, { fields: 'status,error_message', access_token: token }); if (j.status === 'FINISHED') return; if (j.status === 'ERROR' || j.status === 'EXPIRED') throw new Error('Threads 컨테이너 ' + j.status + ' ' + (j.error_message || '')); await sleep(3000); }
  throw new Error('Threads 컨테이너가 2분 안에 준비되지 않았어요');
}
async function postThreads(cfg, n, imgs) {
  const token = await thToken(cfg), uid = cfg.threads.userId || 'me', text = shortText(n), urls = imgs.slice(0, 20).map(pubUrl);
  let id;
  if (!urls.length) id = (await th('POST', `/v1.0/${uid}/threads`, { media_type: 'TEXT', text, access_token: token })).id;
  else if (urls.length === 1) id = (await th('POST', `/v1.0/${uid}/threads`, { media_type: 'IMAGE', image_url: urls[0], text, access_token: token })).id;
  else {
    const kids = []; for (const u of urls) { const k = (await th('POST', `/v1.0/${uid}/threads`, { media_type: 'IMAGE', image_url: u, is_carousel_item: 'true', access_token: token })).id; await thWait(k, token); kids.push(k); }
    id = (await th('POST', `/v1.0/${uid}/threads`, { media_type: 'CAROUSEL', children: kids.join(','), text, access_token: token })).id;
  }
  await thWait(id, token);
  const pub = await th('POST', `/v1.0/${uid}/threads_publish`, { creation_id: id, access_token: token });
  try { const j = await th('GET', '/v1.0/' + pub.id, { fields: 'permalink', access_token: token }); return j.permalink || pub.id; } catch (e) { return pub.id; }
}
async function setThreadsToken(cfg) { // --threads-token <토큰> [--secret <앱 시크릿>]
  let token = opt('threads-token'); if (!token) die('--threads-token 뒤에 토큰을 넣어 주세요');
  if (opt('secret')) { try { const j = await th('GET', '/access_token', { grant_type: 'th_exchange_token', client_secret: opt('secret'), access_token: token }); if (!j.access_token) throw new Error(JSON.stringify(j).slice(0, 200)); token = j.access_token; console.log('🔑 60일 토큰으로 바꿨어요'); } catch (e) { console.log('ℹ️ 60일 토큰으로 바꾸지 못해 받은 토큰을 그대로 써요 (토큰 생성기 토큰은 이미 60일짜리예요)'); } }
  const me = await th('GET', '/v1.0/me', { fields: 'id,username', access_token: token }); if (!me.id) throw new Error('계정 id 를 못 받았어요 ' + JSON.stringify(me).slice(0, 200));
  cfg.threads = { userId: me.id, username: me.username, token, savedAt: new Date().toISOString() }; saveCfg(cfg);
  console.log(`✅ Threads @${me.username} (${me.id}) 저장 → ${CFG_PATH}`);
}

// ── 인스타그램 (graph.instagram.com · 게시물 컨테이너 → 상태 FINISHED → media_publish) ──
async function ig(method, p, params) {
  const u = new URL(IG + p); let body;
  if (method === 'GET') Object.entries(params || {}).forEach(([k, v]) => u.searchParams.set(k, v)); else body = new URLSearchParams(params);
  const r = await fetch(u, { method, body }), j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`Instagram ${p} ${r.status} ${JSON.stringify(j.error || j).slice(0, 300)}`);
  return j;
}
function igImages(imgs) { // 인포그래픽 → JPEG 4:5 조각 (infographics/ig/ · 이미 있으면 다시 만든다)
  if (!imgs.length) return [];
  const out = execSync(`python "${path.join(__dirname, 'ig-slices.py')}" "${path.join(ROOT, 'infographics', 'ig')}" ${imgs.map(f => `"${f}"`).join(' ')}`, { encoding: 'utf8' });
  return out.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
}
function igCaption(n) { // 2,200자 · 마크다운 없이 · 해시태그
  const tags = '\n\n#지후배틀 #RE지후배틀 #인디게임 #게임업데이트 #패치노트';
  let t = `${head(n)}\n${plain(n.title)}\n\n${longText(n).replace(/\*\*/g, '')}\n\n▶ jihoobattle.kr`;
  const max = 2200 - tags.length; if ([...t].length > max) t = [...t].slice(0, max - 2).join('').replace(/\n[^\n]*$/, '') + '\n…';
  return t + tags;
}
async function igToken(cfg) {
  const t = cfg.instagram || {}; if (!t.token) throw new Error('인스타그램 토큰이 없어요 → node tools/post-patch.js --ig-token <토큰>');
  if (Date.now() - (Date.parse(t.savedAt) || 0) > 20 * 864e5) {
    try { const j = await ig('GET', '/refresh_access_token', { grant_type: 'ig_refresh_token', access_token: t.token }); if (!j.access_token) throw new Error(JSON.stringify(j).slice(0, 200)); t.token = j.access_token; t.savedAt = new Date().toISOString(); saveCfg(cfg); console.log('🔑 인스타그램 토큰 갱신 (60일)'); }
    catch (e) { console.warn('⚠️ 인스타그램 토큰 갱신 실패 (만료됐으면 --ig-token 으로 새로): ' + e.message); }
  }
  return t.token;
}
async function igWait(id, token) { // 컨테이너가 준비될 때까지 (최대 2분)
  for (let i = 0; i < 40; i++) { const j = await ig('GET', '/v21.0/' + id, { fields: 'status_code', access_token: token }); if (j.status_code === 'FINISHED') return; if (j.status_code === 'ERROR' || j.status_code === 'EXPIRED') throw new Error('Instagram 컨테이너 ' + j.status_code); await sleep(3000); }
  throw new Error('Instagram 컨테이너가 2분 안에 준비되지 않았어요');
}
async function postInstagram(cfg, n, imgs) {
  const jpg = igImages(imgs); if (!jpg.length) throw new Error('인스타그램은 그림이 꼭 있어야 해요 (인포그래픽 없음)');
  for (const f of jpg) { const c = await checkUrl(f); if (c !== 'ok') throw new Error(`인스타그램 조각 주소가 아직 안 돼요: ${pubUrl(f)} — ${c} → infographics/ig 를 커밋 · 푸시한 뒤 다시 (--only instagram)`); }
  const token = await igToken(cfg), uid = cfg.instagram.userId || 'me', caption = igCaption(n), urls = jpg.map(pubUrl);
  let id;
  if (urls.length === 1) id = (await ig('POST', `/v21.0/${uid}/media`, { image_url: urls[0], caption, access_token: token })).id;
  else {
    const kids = []; for (const u of urls) { const k = (await ig('POST', `/v21.0/${uid}/media`, { image_url: u, is_carousel_item: 'true', access_token: token })).id; await igWait(k, token); kids.push(k); }
    id = (await ig('POST', `/v21.0/${uid}/media`, { media_type: 'CAROUSEL', children: kids.join(','), caption, access_token: token })).id;
  }
  await igWait(id, token);
  const pub = await ig('POST', `/v21.0/${uid}/media_publish`, { creation_id: id, access_token: token });
  try { const j = await ig('GET', '/v21.0/' + pub.id, { fields: 'permalink', access_token: token }); return j.permalink || pub.id; } catch (e) { return pub.id; }
}
async function setIgToken(cfg) { // --ig-token <토큰> [--secret <인스타 앱 시크릿>]
  let token = opt('ig-token'); if (!token) die('--ig-token 뒤에 토큰을 넣어 주세요');
  if (opt('secret')) { try { const j = await ig('GET', '/access_token', { grant_type: 'ig_exchange_token', client_secret: opt('secret'), access_token: token }); if (!j.access_token) throw new Error(JSON.stringify(j).slice(0, 200)); token = j.access_token; console.log('🔑 60일 토큰으로 바꿨어요'); } catch (e) { console.log('ℹ️ 60일 토큰으로 바꾸지 못해 받은 토큰을 그대로 써요 (토큰 생성기 토큰은 이미 60일짜리예요)'); } }
  const me = await ig('GET', '/v21.0/me', { fields: 'user_id,username', access_token: token }); const id = me.user_id || me.id; if (!id) throw new Error('계정 id 를 못 받았어요 ' + JSON.stringify(me).slice(0, 200));
  cfg.instagram = { userId: String(id), username: me.username, token, savedAt: new Date().toISOString() }; saveCfg(cfg);
  console.log(`✅ 인스타그램 @${me.username} (${id}) 저장 → ${CFG_PATH}`);
}
(async () => {
  if (flag('init')) { if (loadCfg()) console.log('이미 있어요: ' + CFG_PATH); else { saveCfg(TEMPLATE); console.log('✅ 만들었어요: ' + CFG_PATH + ' (discord.webhook 을 채우고, Threads 는 --threads-token)'); } return; }
  if (opt('threads-token')) return setThreadsToken(loadCfg() || { ...TEMPLATE });
  if (opt('ig-token')) return setIgToken(loadCfg() || { ...TEMPLATE });
  if (opt('discord-role')) { const c = loadCfg() || { ...TEMPLATE }, id = (/\d{15,}/.exec(opt('discord-role')) || [])[0]; if (!id) die('역할 ID (숫자) 를 넣어 주세요'); c.discord = { ...(c.discord || {}), role: id }; saveCfg(c); console.log(`✅ 디스코드 공지마다 역할 <@&${id}> 핑 · 빼려면 --no-ping`); return; }
  const n = pick(), imgs = (n.img && images(n.img).length ? images(n.img) : images(n.key.replace(/-day$/, ''))), want = k => !ONLY || ONLY === k;
  imgs.forEach(f => { if (!fs.existsSync(f)) die('이미지가 없어요: ' + f); });
  console.log(`📝 ${n.key} · ${plain(n.title)} · 항목 ${n.sections.reduce((t, s) => t + s.items.length, 0)}개 · 이미지 ${imgs.length}장`);
  if (DRY) {
    if (want('discord')) { const c0 = loadCfg(); console.log('\n── 디스코드 (임베드 설명)' + (c0 && c0.discord && c0.discord.role && !flag('no-ping') ? ` · 역할 핑 <@&${c0.discord.role}>` : '') + ' ──\n' + longText(n)); }
    if (want('threads')) console.log(`\n── Threads (${[...shortText(n)].length}자) ──\n` + shortText(n));
    if (want('instagram')) { const c0 = loadCfg(); console.log(`\n── 인스타그램 (${[...igCaption(n)].length}자${c0 && c0.instagram && c0.instagram.token ? '' : ' · 토큰 없음 → --ig-token'}) ──\n` + igCaption(n)); if (imgs.length) { const J = igImages(imgs); console.log('\n── 인스타그램 조각 ──'); for (const f of J) console.log(`${path.relative(ROOT, f)}  →  ${pubUrl(f)}  [${await checkUrl(f)}]`); } }
    console.log('\n── 이미지 ──'); for (const f of imgs) console.log(`${path.relative(ROOT, f)}  →  ${pubUrl(f)}  [${await checkUrl(f)}]`);
    console.log('\n(--dry: 올리지 않았어요 · 설정 파일 ' + (loadCfg() ? '있음' : '없음 → --init') + ')'); return;
  }
  const cfg = loadCfg(); if (!cfg) die('설정 파일이 없어요 → node tools/post-patch.js --init (' + CFG_PATH + ')');
  const log = (cfg.posted = cfg.posted || {})[n.key] = cfg.posted[n.key] || {}; let fail = 0;
  if (want('threads') && imgs.length) for (const f of imgs) { const c = await checkUrl(f); if (c !== 'ok') throw new Error(`Threads 용 이미지 주소가 아직 안 돼요: ${pubUrl(f)} — ${c}\n   먼저 git push 하고 몇 분 뒤 다시 (또는 --only discord)`); }
  for (const [k, fn] of [['discord', postDiscord], ['threads', postThreads], ['instagram', postInstagram]]) {
    if (!want(k)) continue;
    if (k === 'instagram' && !ONLY && !(cfg.instagram && cfg.instagram.token)) continue; /* 토큰이 없으면 기본 올리기에서 뺀다 */
    if (log[k] && !FORCE) { console.log(`⏭️  ${k}: 이미 올렸어요 (${log[k].at}) · 다시 올리려면 --force`); continue; }
    try { const r = await fn(cfg, n, imgs); log[k] = { at: new Date().toISOString(), ref: r }; saveCfg(cfg); console.log(`✅ ${k}: ${r}`); }
    catch (e) { fail++; console.error(`❌ ${k}: ${e.message}`); }
  }
  process.exitCode = fail ? 1 : 0; /* process.exit 는 윈도우에서 열린 fetch 와 부딪혀 죽는다 */
})().catch(e => { console.error('❌ ' + e.message); process.exitCode = 1; });
