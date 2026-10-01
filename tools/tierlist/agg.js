const fs = require('fs');
const S = process.argv[2];
const rows = [];
for (const f of fs.readdirSync(S).filter(f => /^t5_\d+\.jsonl$/.test(f) && true)) for (const line of fs.readFileSync(S + '/' + f, 'utf8').split('\n')) if (line) { try { rows.push(JSON.parse(line)); } catch (e) {} }
const st = {}; let errs = 0, timed = 0;
const get = id => st[id] || (st[id] = { w: 0, n: 0, sh: 0 });
for (const r of rows) {
  if (r.r.w === 'err') { errs++; continue; }
  if (r.r.timed) timed++;
  const sc = side => r.r.w === side ? 1 : r.r.w === 'draw' ? 0.5 : 0;
  const tot = { ally: 0, enemy: 0 }; (r.r.rows || []).forEach(x => tot[x.side] += x.dealt);
  for (const [side, ids] of [['ally', r.a], ['enemy', r.e]]) ids.forEach(id => { const s = get(id); s.n++; s.w += sc(side); });
  (r.r.rows || []).forEach(x => { if (st[x.id]) st[x.id].sh += tot[x.side] ? x.dealt / tot[x.side] : 0; });
}
const out = Object.entries(st).map(([id, s]) => ({ id, r5: s.w / s.n, n5: s.n, sh5: s.sh / s.n * 5 })).sort((a, b) => b.r5 - a.r5);
// 티어: 승률 순위 비율로 1~6 (5% · 15% · 21% · 20% · 23% · 나머지)
const cuts = [0.05, 0.20, 0.41, 0.61, 0.84, 1];
out.forEach((x, i) => { const q = (i + 0.5) / out.length; x.tier = String(cuts.findIndex(c => q <= c) + 1); });
console.log(`games=${rows.length} errs=${errs} timed=${timed} chars=${out.length}`);
out.forEach((x, i) => console.log(String(i + 1).padStart(3), x.tier, x.id.padEnd(12), (x.r5 * 100).toFixed(1).padStart(5) + '%', 'n', x.n5, 'sh', x.sh5.toFixed(2)));
fs.writeFileSync(S + '/agg5.json', JSON.stringify(out));
