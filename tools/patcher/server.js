#!/usr/bin/env node
// 딸깍 패치기 서버 (R3.7) — node tools/patcher/server.js → http://127.0.0.1:8790
//   지후를 골라 숫자 · 설명을 고치면 index.html 에 넣고 → 주석 검사 · 문법 검사 → (build / 버전 올리기 · 패치노트) → main 에 커밋 → (푸시)
//   검사가 실패하면 index.html 을 원래대로 되돌린다 · main 이 아니거나 index.html 에 커밋 안 된 변경이 있으면 적용하지 않는다
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os'), { spawnSync, exec } = require('child_process');
const C = require('./core'), J = require('./jobs');
const PORT = +process.env.PORT || 8790, ROOT = C.ROOT;
const run = (cmd, args, opt = {}) => { const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, ...opt }); return { ok: r.status === 0, out: ((r.stdout || '') + (r.stderr || '')).trim() || (r.error ? String(r.error) : '') }; };
const git = (...a) => run('git', a);

function syntaxCheck(text) { // 가장 큰 <script> 를 뽑아 node --check
  const re = /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g; let m, big = '';
  while ((m = re.exec(text))) if (m[1].length > big.length) big = m[1];
  const f = path.join(os.tmpdir(), 'jhbt-patcher-check.js'); fs.writeFileSync(f, big);
  return run(process.execPath, ['--check', f]);
}
function checks(text) {
  const syn = syntaxCheck(text); if (!syn.ok) return { ok: false, out: '문법 오류\n' + syn.out };
  const cc = run('python', ['tools/comment-check.py']); if (!cc.ok) return { ok: false, out: '주석 · 패치노트 검사 실패\n' + cc.out };
  return { ok: true, out: cc.out };
}

function doApply(req) {
  const log = [];
  const WANT = process.env.JHBT_BRANCH || 'main'; /* 시험할 때만 다른 브랜치 */
  const br = git('branch', '--show-current').out; if (br !== WANT) throw new Error(`지금 브랜치가 ${WANT} 가 아니에요 (${br}) — ${WANT} 에서 실행하세요`);
  if (git('status', '--porcelain', '--', 'index.html').out) throw new Error('index.html 에 커밋 안 된 변경이 있어요 — 먼저 커밋하거나 되돌리세요');
  const before = C.read(), r = C.apply(req);
  fs.writeFileSync(C.FILE, r.text); log.push(`적용: 숫자 ${(req.edits || []).length}개 · 설명 ${(req.texts || []).length}개`);
  const ck = checks(r.text);
  if (!ck.ok) { fs.writeFileSync(C.FILE, before); throw new Error(ck.out + '\n\n→ index.html 을 원래대로 되돌렸어요'); }
  log.push(ck.out.split('\n').slice(-2).join(' · '));
  const name = (C.model().chars.find(x => x.id === req.id) || {}).name || req.id;
  const lines = (req.edits || []).map(e => `- ${e.label || '수치'} ${e.old || '(없음)'} → ${e.new}`).concat((req.texts || []).map(t => `- 설명: ${t.label}`));
  const head = req.mode === 'sub' ? `잠수함: ${name} 수치 조정 (딸깍 패치기)` : req.mode === 'version' ? `${r.meta.version} build 1: ${name} (딸깍 패치기)` : `${r.meta.version} build ${r.meta.build}: ${name} (딸깍 패치기)`;
  const add = git('add', 'index.html', 'tools/pn-count.json'); if (!add.ok) log.push(add.out);
  const cm = git('commit', '-m', head + '\n\n' + lines.join('\n')); if (!cm.ok) throw new Error('커밋 실패\n' + cm.out);
  log.push('커밋: ' + git('log', '--oneline', '-1').out);
  if (req.push) { const p = git('push', 'origin', 'main'); log.push(p.ok ? '푸시 완료' : '푸시 실패\n' + p.out); }
  else log.push('푸시는 하지 않았어요 (올인원 · 푸시 배치로)');
  if (req.mode !== 'sub') log.push(`버전 ${r.meta.version} build ${r.meta.build} — 인포그래픽 · 디스코드 공지는 올인원 배치에서`);
  return { ok: true, log, meta: r.meta };
}

const send = (res, code, body, type = 'application/json; charset=utf-8') => { res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(typeof body === 'string' ? body : JSON.stringify(body)); };
// 도구 코드의 버전 (파일 수정 시각) — 예전 버전 서버가 켜져 있으면 끄고 새로 켠다 (화면이 안 바뀌는 문제)
const STAMP = ['core.js', 'server.js', 'jobs.js', 'ui.html', 'labels.json'].map(f => { try { return fs.statSync(path.join(__dirname, f)).mtimeMs | 0; } catch (e) { return 0; } }).join('.');
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  try {
    if (u.pathname === '/') return send(res, 200, fs.readFileSync(path.join(__dirname, 'ui.html'), 'utf8'), 'text/html; charset=utf-8');
    if (u.pathname === '/api/ver') return send(res, 200, { stamp: STAMP });
    if (u.pathname === '/api/quit' && req.method === 'POST') { send(res, 200, { ok: true }); setTimeout(() => process.exit(0), 100); return; }
    if (u.pathname === '/api/list') { const M = C.model(); return send(res, 200, { meta: M.meta, list: M.chars.map(c => ({ id: c.id, name: c.name, rarity: c.rarity })) }); }
    if (u.pathname === '/api/char') { const r = C.charInfo(u.searchParams.get('id')); return r ? send(res, 200, r) : send(res, 404, { error: '없는 지후' }); }
    if (/^\/infographics\/[\w.\-]+\.png$/.test(u.pathname)) { const f = path.join(ROOT, u.pathname); return fs.existsSync(f) ? (res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' }), res.end(fs.readFileSync(f))) : send(res, 404, { error: 'no' }); } // 미리보기 그림
    if (u.pathname === '/api/tier-est') return send(res, 200, J.tierEstimate(+u.searchParams.get('games') || 1600, +u.searchParams.get('workers') || 2));
    if (u.pathname === '/api/status') return send(res, 200, J.status());
    if (u.pathname === '/api/job' && req.method === 'GET') return send(res, 200, J.poll(+u.searchParams.get('id'), +u.searchParams.get('from') || 0));
    if (u.pathname === '/api/job' && req.method === 'POST') { let b = ''; req.on('data', d => b += d); req.on('end', () => { try { const j = JSON.parse(b); send(res, 200, { id: J.start(j.kind, j.opt) }); } catch (e) { send(res, 400, { error: String(e.message || e) }); } }); return; } // 배포 · 공지 작업 (jobs.js)
    if (u.pathname === '/api/label' && req.method === 'POST') { let b = ''; req.on('data', d => b += d); req.on('end', () => { try { const j = JSON.parse(b); C.setLabel(String(j.lk), String(j.label || '').slice(0, 40)); send(res, 200, { ok: true }); } catch (e) { send(res, 400, { error: String(e.message) }); } }); return; } // 사용자가 붙인 이름 → tools/patcher/labels.json
    if (u.pathname === '/api/apply' && req.method === 'POST') { let b = ''; req.on('data', d => b += d); req.on('end', () => { try { send(res, 200, doApply(JSON.parse(b))); } catch (e) { send(res, 400, { error: String(e.message || e) }); } }); return; }
    send(res, 404, { error: 'not found' });
  } catch (e) { send(res, 500, { error: String(e.stack || e) }); }
});
const openUrl = () => { const url = `http://127.0.0.1:${PORT}/`; if (!process.env.NO_OPEN) exec(process.platform === 'win32' ? `start "" "${url}"` : `xdg-open ${url}`); };
srv.once('listening', () => { console.log(`딸깍 패치기: http://127.0.0.1:${PORT}/  (이 창을 닫으면 꺼져요)`); openUrl(); });
function listen() { srv.listen(PORT, '127.0.0.1'); }
srv.on('error', async e => {
  if (e.code !== 'EADDRINUSE') throw e;
  let same = false; try { same = (await (await fetch(`http://127.0.0.1:${PORT}/api/ver`)).json()).stamp === STAMP; } catch (er) {}
  if (same) { console.log('이미 같은 버전이 켜져 있어요 → 그 화면을 열어요'); openUrl(); return setTimeout(() => process.exit(0), 500); }
  console.log('예전 버전이 켜져 있어요 → 끄고 새로 켭니다');
  try { await fetch(`http://127.0.0.1:${PORT}/api/quit`, { method: 'POST' }); } catch (er) {}
  await new Promise(r => setTimeout(r, 600));
  if (process.platform === 'win32') { /* /api/quit 이 없는 아주 예전 서버: 그 포트를 쓰는 node 만 끈다 */
    const ns = spawnSync('netstat', ['-ano'], { encoding: 'utf8' }).stdout || '', m = new RegExp('127\\.0\\.0\\.1:' + PORT + '\\s+\\S+\\s+LISTENING\\s+(\\d+)').exec(ns);
    if (m && m[1] !== String(process.pid)) { const tl = spawnSync('tasklist', ['/FI', 'PID eq ' + m[1], '/NH'], { encoding: 'utf8' }).stdout || ''; if (/node\.exe/i.test(tl)) spawnSync('taskkill', ['/PID', m[1], '/F']); }
    await new Promise(r => setTimeout(r, 500));
  }
  listen();
});
listen();
