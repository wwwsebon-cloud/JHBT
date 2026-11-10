// 티어 시뮬 일꾼 · CDP 판 (R2.30 · playwright 가 없는 로컬 윈도우용 · 시스템 크롬 · 소리 끔 · 바깥 주소 차단) — run.js 와 같은 일정 · 같은 결과 파일
//   python -m http.server 8766 를 켠 뒤: node tools/tierlist/run-cdp.js <작업폴더> <일꾼 번호> <일꾼 수> <판수> (일꾼 2개면 1,600판 약 3분) → agg.js · apply.py 는 run.sh 와 같다
const { spawn } = require('child_process'), path = require('path'), os = require('os'), fs = require('fs');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(port, extraArgs = []) {
  const ch = spawn(CHROME, ['--headless=new', '--mute-audio', '--no-first-run', '--window-size=412,915', '--remote-debugging-port=' + port, '--user-data-dir=' + path.join(os.tmpdir(), 'jhbt-audit-' + port + '-' + Date.now()),
    '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1', ...extraArgs, ...(process.env.CHX ? process.env.CHX.split(' ') : []), 'about:blank'], { stdio: 'ignore' });
  let tabs; for (let i = 0; i < 60 && !tabs; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch (e) { await sleep(250); } }
  const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = {}, handlers = []; ws.onclose = e => console.error('WS CLOSED', e.code, e.reason); ws.onerror = e => console.error('WS ERROR', e.message || e);
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) { pend[d.id](d); delete pend[d.id]; } else if (d.method) handlers.forEach(h => h(d)); };
  const send = (method, params) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (!r.result) return 'ERR ' + JSON.stringify(r).slice(0, 300); return r.result.exceptionDetails ? 'EXC ' + JSON.stringify(r.result.exceptionDetails).slice(0, 600) : r.result.result.value; };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', { source: "try { localStorage.setItem('rejhbt-sfx-vol', '0'); localStorage.setItem('rejhbt-bgm-vol', '0'); } catch (e) {}" });
  return { send, ev, on: h => handlers.push(h), close: () => { try { ws.close(); } catch (e) {} ch.kill(); }, sleep };
}
const [W, shardS, NS, GS] = process.argv.slice(2), shard = +shardS, N = +NS, GAMES = +GS;
const URL = process.env.URL || 'http://127.0.0.1:8766/index.html?bench=2';
const lcg = seed => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
function schedule(ids, pairs) { // 고르게 뽑기 (일꾼마다 같은 결과)
  const r = lcg(20261105), bag = [], out = [], refill = () => { const b = ids.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } bag.push(...b); };
  for (let p = 0; p < pairs; p++) { const t = []; let guard = 0; while (t.length < 10 && guard++ < 1000) { if (!bag.length) refill(); const k = bag.findIndex(id => !t.includes(id)); if (k < 0) { refill(); continue; } t.push(bag.splice(k, 1)[0]); } out.push(t); }
  return out;
}
(async () => {
  const file = path.join(W, `t5_${shard}.jsonl`), done = new Set();
  if (fs.existsSync(file)) for (const line of fs.readFileSync(file, 'utf8').split('\n')) if (line) { try { done.add(JSON.parse(line).g); } catch (e) {} }
  const c = await open(9700 + shard); let errs = 0; c.on(d => { if (d.method === 'Runtime.exceptionThrown') { errs++; if (errs <= 3) console.error('PAGEERR', JSON.stringify(d.params.exceptionDetails).slice(0, 300)); } });
  await c.send('Page.navigate', { url: URL }); for (let i = 0; i < 240; i++) { await sleep(500); if (await c.ev('!!(window.__rejhbt && __rejhbt.S && __rejhbt.S.place)') === true) break; } await sleep(2500);
  console.error('harness', await c.ev(fs.readFileSync(path.join(__dirname, 'harness.js'), 'utf8') + '; typeof __tl'));
  const ids = JSON.parse(await c.ev('JSON.stringify(__tl.ids)'));
  if (shard === 0) fs.writeFileSync(path.join(W, 'info.json'), await c.ev('JSON.stringify(__tl.info)'));
  const pairs = schedule(ids, Math.ceil(GAMES / 2)), out = fs.createWriteStream(file, { flags: 'a' }), t0 = Date.now(); let n = 0;
  for (let g = shard; g < GAMES; g += N) { if (done.has(g)) continue;
    const t = pairs[g >> 1], sw = g & 1, a = sw ? t.slice(5) : t.slice(0, 5), e = sw ? t.slice(0, 5) : t.slice(5), seed = 1000 + (g >> 1);
    let r; try { const v = await c.ev(`JSON.stringify(__tl.fight(${JSON.stringify(a)}, ${JSON.stringify(e)}, ${seed}))`); r = typeof v === 'string' && v[0] === '{' ? JSON.parse(v) : { w: 'err', msg: String(v).slice(0, 200) }; } catch (err) { r = { w: 'err', msg: String(err.message || err).slice(0, 200) }; }
    out.write(JSON.stringify({ g, a, e, seed, r }) + '\n'); n++; if (n % 50 === 0) console.error(`일꾼 ${shard}: ${n}판 · ${Math.round((Date.now() - t0) / 1000)}초`); }
  await new Promise(res => out.end(res)); console.error(`일꾼 ${shard}: ${n}판 · ${Math.round((Date.now() - t0) / 1000)}초 · 페이지 오류 ${errs}`);
  c.close(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
