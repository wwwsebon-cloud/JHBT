// 인포그래픽용 게임 데이터 뽑기 (R2.17.2) — 로컬 서버(python -m http.server 8766)를 켠 뒤:  node infographics/extract.js
//   → infographics/_data/patch_notes.json (PATCH_NOTES) · infographics/_data/chars_info.json (지후 이름 · 등급 · 역할군 · 수치 · 설명)
//   설명의 <b>..</b> 는 ⟦..⟧ 로 남긴다 (make.py 가 강조색으로) · 헤드리스 크롬 · Firebase 등 바깥 주소는 막는다
const { spawn } = require('child_process'), fs = require('fs'), path = require('path'), os = require('os');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', PORT = 9399, URL = process.env.URL || 'http://127.0.0.1:8766/index.html?bench=';
const OUT = path.join(__dirname, '_data'), sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const ch = spawn(CHROME, ['--headless=new', '--mute-audio', '--remote-debugging-port=' + PORT, '--user-data-dir=' + path.join(os.tmpdir(), 'jhbt-info-' + Date.now()), '--disable-background-timer-throttling', 'about:blank'], { stdio: 'ignore' });
  try {
    let tabs; for (let i = 0; i < 40 && !tabs; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); } catch (e) { await sleep(250); } }
    const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
    let id = 0; const pend = {}; ws.onmessage = m => { const d = JSON.parse(m.data); if (pend[d.id]) { pend[d.id](d); delete pend[d.id]; } };
    const send = (method, params) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
    const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 300)); return r.result.result.value; };
    await send('Network.enable'); await send('Network.setBlockedURLs', { urls: ['*gstatic.com*', '*googleapis.com*', '*firebaseio.com*', '*workers.dev*'] });
    await send('Page.navigate', { url: URL });
    for (let i = 0; i < 60; i++) { await sleep(500); if (await ev('!!(window.__rejhbt && __rejhbt.CHARS && __rejhbt.PATCH_NOTES)').catch(() => false)) break; }
    fs.mkdirSync(OUT, { recursive: true });
    fs.writeFileSync(path.join(OUT, 'patch_notes.json'), await ev('JSON.stringify(__rejhbt.PATCH_NOTES)'));
    const info = await ev(`(() => { const C = __rejhbt.CHARS, T = h => String(h || '').replace(/<br\\s*\\/?>/g, ' ').replace(/<b>/g, '⟦').replace(/<\\/b>/g, '⟧').replace(/<[^>]+>/g, '').replace(/\\s+/g, ' ').trim(), o = {};
      for (const [id, c] of Object.entries(C)) { let at = ''; try { at = c.atkText ? String(c.atkText()) : ''; } catch (e) {}
        o[id] = { name: c.name, rarity: c.rarity, role: c.role, hp: c.hp, atk: c.atk, atkText: at, atkSpeed: c.atkSpeed, range: c.range, noAttack: !!c.noAttack, community: c.community || '', maxLv: c.maxLv || 0, passive: T(c.passive), skill: c.skill && c.skill.desc ? T(c.skill.desc) : '' }; }
      return JSON.stringify(o); })()`);
    fs.writeFileSync(path.join(OUT, 'chars_info.json'), info);
    console.log('ok', path.join(OUT, 'patch_notes.json'), Object.keys(JSON.parse(info)).length + ' jihoo');
    ws.close();
  } finally { ch.kill(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
