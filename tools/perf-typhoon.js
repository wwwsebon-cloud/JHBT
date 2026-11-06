// 태풍 렉 확인 (R2.24 build 7) — node tools/perf-typhoon.js [주소]
//   벤치 (?bench=30&ids=weather,…) 에서 기상캐스터 날씨를 태풍으로 고정하고 12초 동안 레이아웃 · 스타일 재계산 횟수 · 시간과 벤치 FPS · 최악 프레임을 잰다
//   소리는 끈다 · 바깥 주소 (Firebase 등) 는 막는다
const { spawn } = require('child_process'), path = require('path'), os = require('os');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', PORT = 9412;
const URL = process.argv[2] || 'http://localhost:8771/index.html?bench=30&ids=weather,shield,sword,fire,ice,heal,titanium', sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const ch = spawn(CHROME, ['--headless=new', '--mute-audio', '--no-first-run', '--window-size=430,900', '--remote-debugging-port=' + PORT, '--user-data-dir=' + path.join(os.tmpdir(), 'jhbt-perf-' + Date.now()),
    '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost', 'about:blank'], { stdio: 'ignore' });
  try {
    let tabs; for (let i = 0; i < 40 && !tabs; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); } catch (e) { await sleep(250); } }
    const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
    let id = 0; const pend = {}; ws.onmessage = m => { const d = JSON.parse(m.data); if (pend[d.id]) { pend[d.id](d); delete pend[d.id]; } };
    const send = (method, params) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
    const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); return r.result.exceptionDetails ? 'EXC ' + JSON.stringify(r.result.exceptionDetails).slice(0, 200) : r.result.result.value; };
    await send('Page.enable'); await send('Performance.enable');
    await send('Page.addScriptToEvaluateOnNewDocument', { source: "try { localStorage.setItem('rejhbt-sfx-vol', '0'); localStorage.setItem('rejhbt-bgm-vol', '0'); } catch (e) {}" });
    await send('Page.navigate', { url: URL });
    for (let i = 0; i < 80; i++) { await sleep(500); if (await ev("!!(window.__rejhbt && __rejhbt.S.phase === 'combat' && __rejhbt.S.time > 0.3)")) break; }
    await ev("window.__tf = setInterval(() => __rejhbt.S.units.forEach(u => { if (u.wx && u.wx.k !== '" + (process.env.WX || 'typhoon') + "') u.wx = { k: '" + (process.env.WX || 'typhoon') + "', acc: 0 }; }), 100); true");
    if (process.env.EXTRA_JS) await ev(process.env.EXTRA_JS); // 실험용 (예: 회전 끄기)
    const m0 = Object.fromEntries((await send('Performance.getMetrics')).result.metrics.map(x => [x.name, x.value]));
    await ev('window.__bench && (__bench.hist = []); true'); await sleep(12000);
    const m1 = Object.fromEntries((await send('Performance.getMetrics')).result.metrics.map(x => [x.name, x.value]));
    const b = await ev("(() => { const H = (window.__bench && __bench.hist || []).filter(x => x.alive > 0); return { fps: H.length ? +(H.reduce((s, x) => s + x.fps, 0) / H.length).toFixed(1) : null, worst: H.length ? Math.max(...H.map(x => x.worst)) : null, objs: __rejhbt.S.lines.filter(l => l.el && l.el.className === 'fx-wx-obj').length, units: __rejhbt.S.units.filter(u => u.alive).length, t: +__rejhbt.S.time.toFixed(1) }; })()");
    const d = k => +(m1[k] - m0[k]).toFixed(3);
    console.log(JSON.stringify({ layouts: d('LayoutCount'), layoutSec: d('LayoutDuration'), recalcs: d('RecalcStyleCount'), recalcSec: d('RecalcStyleDuration'), scriptSec: d('ScriptDuration'), ...b }));
    ws.close();
  } finally { ch.kill(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
