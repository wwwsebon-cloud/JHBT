// 티어 시뮬 병렬 일꾼 (R2.22.2 · R1 tools/tierlist/run.js 를 R2 에 맞게) — run.sh 가 병렬로 부른다
//   node tools/tierlist/run.js <작업폴더> <일꾼 번호> <일꾼 수> <판수>
// 판 번호 g: 짝 p = ⌊g/2⌋ 의 10기를 g 가 짝수면 그대로 (앞 5 = 아래 진영), 홀수면 진영을 바꿔 같은 시드로 한 번 더 (진영 · 배치 치우침 상쇄)
// 짝은 「고르게 뽑기」: 지후 목록을 시드로 섞어 주머니에서 순서대로 꺼낸다 (한 판 안 같은 지후 없음 · 지후마다 나오는 판 수가 거의 같다)
// 결과 t5_<일꾼>.jsonl 에 한 줄씩 { g, a, e, seed, r } · 이미 있는 판은 건너뛴다 (판 수를 늘리면 뒤에만 더 돌린다)
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
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
  const b = await chromium.launch({ args: ['--mute-audio'] }), p = await b.newPage(); // 소리 끔 (CLAUDE.md)
  let errs = 0; p.on('pageerror', e => { errs++; if (errs <= 3) console.error('PAGEERR', e.message); });
  await p.route(/gstatic\.com|googleapis\.com|firebaseio\.com|firebaseapp\.com|workers\.dev|jsdelivr\.net/, r => r.abort()); // Firebase 등 바깥 주소는 막는다
  await p.goto(URL); await p.waitForFunction(() => window.__rejhbt && __rejhbt.S && __rejhbt.S.place, null, { timeout: 60000 }); await p.waitForTimeout(2500);
  await p.addScriptTag({ content: fs.readFileSync(path.join(__dirname, 'harness.js'), 'utf8') });
  const ids = await p.evaluate(() => __tl.ids);
  if (shard === 0) fs.writeFileSync(path.join(W, 'info.json'), JSON.stringify(await p.evaluate(() => __tl.info)));
  const pairs = schedule(ids, Math.ceil(GAMES / 2)), out = fs.createWriteStream(file, { flags: 'a' }), t0 = Date.now(); let n = 0;
  for (let g = shard; g < GAMES; g += N) { if (done.has(g)) continue;
    const t = pairs[g >> 1], sw = g & 1, a = sw ? t.slice(5) : t.slice(0, 5), e = sw ? t.slice(0, 5) : t.slice(5), seed = 1000 + (g >> 1);
    let r; try { r = await p.evaluate(([a, e, s]) => __tl.fight(a, e, s), [a, e, seed]); } catch (err) { r = { w: 'err', msg: String(err.message || err).slice(0, 200) }; }
    out.write(JSON.stringify({ g, a, e, seed, r }) + '\n'); n++; }
  await new Promise(res => out.end(res)); console.error(`일꾼 ${shard}: ${n}판 · ${Math.round((Date.now() - t0) / 1000)}초 · 페이지 오류 ${errs}`);
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
