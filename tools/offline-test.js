// 오프라인 모드 확인 (R2.24 build 4) — node tools/offline-test.js
//   임시 서버(8781)로 한 번 열어 서비스 워커가 파일을 받게 한 뒤 → 서버를 끄고 새로고침 → 로비까지 뜨는지 · 효과 아이콘이 나오는지
//   ① 게스트 (바로 오프라인 모드) ② 계정 기록이 있는 사람 (시작 화면 「오프라인으로 플레이」) · 소리는 끈다 · 바깥 주소는 모두 막는다 (Firebase 계정을 만들지 않는다)
const { spawn } = require('child_process'), fs = require('fs'), path = require('path'), os = require('os');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', PORT = 9411, WEB = 8781, ROOT = path.join(__dirname, '..');
const OUT = process.env.OUT || os.tmpdir(), sleep = ms => new Promise(r => setTimeout(r, ms));
const startServer = () => spawn('python', ['-m', 'http.server', String(WEB), '--bind', '127.0.0.1', '--directory', ROOT], { stdio: 'ignore' });
(async () => {
  let srv = startServer(); await sleep(1200);
  const ch = spawn(CHROME, ['--headless=new', '--mute-audio', '--disable-gpu', '--no-first-run', '--window-size=430,900', '--remote-debugging-port=' + PORT, '--user-data-dir=' + path.join(os.tmpdir(), 'jhbt-off-' + Date.now()),
    '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost', 'about:blank'], { stdio: 'ignore' });
  const res = {};
  try {
    let tabs; for (let i = 0; i < 40 && !tabs; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); } catch (e) { await sleep(250); } }
    const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
    let id = 0; const pend = {}, errs = []; ws.onmessage = m => { const d = JSON.parse(m.data); if (pend[d.id]) { pend[d.id](d); delete pend[d.id]; } if (d.method === 'Runtime.exceptionThrown') errs.push(d.params.exceptionDetails.exception ? d.params.exceptionDetails.exception.description.slice(0, 160) : d.params.exceptionDetails.text); };
    const send = (method, params) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
    const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); return r.result.exceptionDetails ? 'EXC ' + JSON.stringify(r.result.exceptionDetails).slice(0, 200) : r.result.result.value; };
    const shot = async name => { const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(OUT, name), Buffer.from(r.result.data, 'base64')); };
    await send('Runtime.enable'); await send('Page.enable');
    await send('Page.addScriptToEvaluateOnNewDocument', { source: "try { localStorage.setItem('rejhbt-sfx-vol', '0'); localStorage.setItem('rejhbt-bgm-vol', '0'); } catch (e) {}" }); // 소리 끄기
    const URL = `http://localhost:${WEB}/index.html`;
    await send('Page.navigate', { url: URL });
    for (let i = 0; i < 80; i++) { await sleep(500); const n = await ev("caches.open('rejhbt-r2-core-4').then(c => c.keys()).then(k => k.length).catch(() => 0)"); res.cached = n; if (n >= 130) break; }
    res.swCtl = await ev('!!navigator.serviceWorker.controller');
    srv.kill(); await sleep(800); res.serverDown = await ev(`fetch('${URL}?vc=1').then(() => 'up').catch(() => 'down')`);
    // ① 게스트
    await send('Page.reload', {}); await sleep(9000);
    res.guest = await ev(`({ title: document.title, ver: document.querySelector('meta[name="jihoo-version"]') && document.querySelector('meta[name="jihoo-version"]').content, off: document.body.classList.contains('off-mode'), screen: [...document.querySelectorAll('.screen.active')].map(e => e.id).join(','), fxIcon: (() => { const i = new Image(); i.src = 'icons/fx/burn.png'; return new Promise(r => { i.onload = () => r(i.naturalWidth); i.onerror = () => r(-1); }); })() })`);
    await shot('offline-guest.png');
    // ② 계정 기록이 있는 사람: 이 기기 기록에 ownerUid 를 넣고 다시
    res.setOwner = await ev("(() => { const k = 'rejhbt.profile.v1'; const raw = localStorage.getItem(k); if (!raw) return 'no profile'; const p = JSON.parse(raw); p.ownerUid = 'offline-test'; if (!p.nick) p.nick = '오프테스트'; localStorage.setItem(k, JSON.stringify(p)); return 'ok'; })()");
    await send('Page.reload', {}); await sleep(9000);
    res.gate = await ev("({ btn: !!document.getElementById('gtOff'), text: (document.querySelector('#screen-welcome .gt-wait') || {}).textContent || '' })");
    await shot('offline-gate.png');
    res.click = await ev("(() => { const b = document.getElementById('gtOff'); if (!b) return 'no button'; b.click(); return 'clicked'; })()"); await sleep(2500);
    res.account = await ev("({ off: document.body.classList.contains('off-mode'), pill: !!document.getElementById('offPill') && getComputedStyle(document.getElementById('offPill')).display, screen: [...document.querySelectorAll('.screen.active')].map(e => e.id).join(',') })");
    await shot('offline-account.png');
    // ③ 오프라인으로 일반전 시작 (봇전): 로비 → 일반전 버튼 → 전투 화면 · 전투가 흘러가는지
    res.play = await ev("(() => { const b = document.getElementById('btnPlay'); if (!b) return 'no btnPlay'; b.click(); return 'clicked'; })()"); await sleep(12000);
    res.match = await ev("({ phase: window.__rejhbt && __rejhbt.S.phase, round: window.__rejhbt && __rejhbt.S.round, battle: document.getElementById('screen-battle') && document.getElementById('screen-battle').classList.contains('active') })");
    await shot('offline-match.png');
    res.errs = errs; ws.close();
  } finally { ch.kill(); try { srv.kill(); } catch (e) {} }
  console.log(JSON.stringify(res, null, 1)); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
