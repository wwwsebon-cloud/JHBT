// 5:5만 · 빠른 티어 시뮬: node tier5.js <dir> <shard> <N> <games>
const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const [S, shardS, NS, GS] = process.argv.slice(2); const shard = +shardS, N = +NS, GAMES = +GS;
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  let errs = 0; p.on('pageerror', e => { errs++; if (errs <= 3) console.error('PAGEERR', e.message); });
  await p.route(/^https?:/, r => r.abort());
  await p.goto('file://' + S + '/sim.html'); await p.waitForTimeout(5000);
  await p.evaluate(() => { __t.profile.nickname = 'T'; __t.profile.ranks = {}; __simSetup(); });
  const ids = await p.evaluate(() => __ids);
  const r = rng(20261001 + shard * 7919);
  const pick = n => { const bag = ids.slice(), out = []; while (out.length < n) out.push(bag.splice(Math.floor(r() * bag.length), 1)[0]); return out; };
  const out = fs.createWriteStream(S + '/t5_' + shard + '.jsonl');
  const t0 = Date.now(), mine = Math.ceil(GAMES / N);
  for (let g = 0; g < mine; g++) {
    const t = pick(10), job = { a: t.slice(0, 5), e: t.slice(5) };
    let res; try { res = await p.evaluate(([a, e]) => { const x = __fight(a, e); return { w: x.w, t: Math.round(x.t), timed: x.timed, rows: x.rows }; }, [job.a, job.e]); } catch (e) { res = { w: 'err' }; }
    out.write(JSON.stringify({ ...job, r: res }) + '\n');
  }
  out.end(); console.error(`shard ${shard} ${mine} games ${Math.round((Date.now() - t0) / 1000)}s errs=${errs}`);
  await b.close();
})();
