// 티어 시뮬 실행기 (R2.22.2 · 리눅스 클라우드용 · 예전 %TEMP%/ld/bprun.js 대신) — 로컬 서버(python -m http.server 8766)를 켠 뒤:
//   node tools/tier-run.js [판수=1000] [out.json=tools/tier-out.json]
//   헤드리스 크롬(playwright)으로 index.html?bench=2 를 열고 tools/tier-5v5.js 를 넣는다 · Firebase 등 바깥 주소는 막는다 · 끝나면 __t5Summary() 결과 + 판 수 · 걸린 시간을 저장
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const N = +process.argv[2] || 1000, OUT = process.argv[3] || path.join(__dirname, 'tier-out.json'), URL = process.env.URL || 'http://127.0.0.1:8766/index.html?bench=2';
(async () => {
  const b = await chromium.launch(), pg = await b.newPage();
  await pg.route(/gstatic\.com|googleapis\.com|firebaseio\.com|firebaseapp\.com|workers\.dev/, r => r.abort());
  await pg.goto(URL); await pg.waitForFunction(() => window.__rejhbt && __rejhbt.S && __rejhbt.S.place, null, { timeout: 60000 }); await pg.waitForTimeout(2500);
  await pg.evaluate(n => { window.__T5N = n; }, N);
  await pg.addScriptTag({ content: fs.readFileSync(path.join(__dirname, 'tier-5v5.js'), 'utf8') });
  const t0 = Date.now(); let last = -1;
  for (;;) { await pg.waitForTimeout(5000); const st = await pg.evaluate(() => ({ done: __t5.games.length, todo: __t5.todo, err: __t5.err }));
    if (Math.floor(st.done / 100) !== last) { last = Math.floor(st.done / 100); console.log(`${st.done} / ${N} 판 · 오류 ${st.err} · ${Math.round((Date.now() - t0) / 1000)}초`); }
    if (st.todo <= 0) break; }
  const sum = await pg.evaluate(() => ({ rows: __t5Summary(), games: __t5.games.length, err: __t5.err }));
  sum.sec = Math.round((Date.now() - t0) / 1000); fs.writeFileSync(OUT, JSON.stringify(sum, null, 1)); console.log('저장', OUT, sum.games + '판', sum.sec + '초');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
