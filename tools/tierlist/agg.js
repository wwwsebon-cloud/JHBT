// 5:5 시뮬 결과 → 티어. 7.8.2 팀 실력 모델 (index.html 의 tierFit · tierBreaks 와 같은 계산)
// 사용법: node tools/tierlist/agg.js <작업폴더>
const fs = require('fs');
const S = process.argv[2];
const rows = [];
for (const f of fs.readdirSync(S).filter(f => /^t5_\d+\.jsonl$/.test(f))) for (const line of fs.readFileSync(S + '/' + f, 'utf8').split('\n')) if (line) { try { rows.push(JSON.parse(line)); } catch (e) {} }
function tierFit(games, lambda = 0.5) {
  const idx = new Map(), rows = [];
  for (const line of games) {
    const [a, e, y] = String(line).split('|'); if (!a || !e) continue;
    const id = k => { if (!idx.has(k)) idx.set(k, idx.size); return idx.get(k); };
    rows.push({ a: a.split(',').map(id), e: e.split(',').map(id), y: Number(y) });
  }
  const n = idx.size, s = new Float64Array(n);
  const sig = z => 1 / (1 + Math.exp(-z));
  let H = null;
  for (let it = 0; it < 30; it++) {
    const g = new Float64Array(n); H = Array.from({ length: n }, () => new Float64Array(n));
    for (let i = 0; i < n; i++) { g[i] = -lambda * s[i]; H[i][i] = lambda; }
    for (const r of rows) {
      let z = 0; r.a.forEach(i => { z += s[i]; }); r.e.forEach(i => { z -= s[i]; });
      const p = sig(z), w = p * (1 - p), d = r.y - p, xs = [];
      r.a.forEach(i => xs.push([i, 1])); r.e.forEach(i => xs.push([i, -1]));
      for (const [i, xi] of xs) { g[i] += d * xi; for (const [j, xj] of xs) H[i][j] += w * xi * xj; }
    }
    const step = tierSolve(H.map(row => Float64Array.from(row)), g);
    let mx = 0; for (let i = 0; i < n; i++) { s[i] += step[i]; mx = Math.max(mx, Math.abs(step[i])); }
    if (mx < 1e-6) break;
  }
  const inv = tierInvDiag(H), mean = s.reduce((t, v) => t + v, 0) / (n || 1), out = {};
  for (const [k, i] of idx) out[k] = { s: s[i] - mean, se: Math.sqrt(Math.max(0, inv[i])) };
  return out;
}
function tierSolve(A, b) { // 가우스 소거 (A 는 대칭 양정치)
  const n = b.length, x = Float64Array.from(b);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]]; [x[c], x[p]] = [x[p], x[c]];
    const d = A[c][c] || 1e-12;
    for (let r = c + 1; r < n; r++) { const f = A[r][c] / d; if (!f) continue; for (let k = c; k < n; k++) A[r][k] -= f * A[c][k]; x[r] -= f * x[c]; }
  }
  for (let r = n - 1; r >= 0; r--) { let t = x[r]; for (let k = r + 1; k < n; k++) t -= A[r][k] * x[k]; x[r] = t / (A[r][r] || 1e-12); }
  return x;
}
function tierInvDiag(H) { // 점수 오차 = 헤세 역행렬의 대각 (가우스-조르당 한 번)
  const n = H.length, A = H.map((row, i) => { const r = new Float64Array(2 * n); r.set(row); r[n + i] = 1; return r; });
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    const d = A[c][c] || 1e-12; for (let k = c; k < 2 * n; k++) A[c][k] /= d;
    for (let r = 0; r < n; r++) { if (r === c) continue; const f = A[r][c]; if (!f) continue; for (let k = c; k < 2 * n; k++) A[r][k] -= f * A[c][k]; }
  }
  return Float64Array.from({ length: n }, (_, i) => A[i][n + i]);
}
function tierBreaks(vals, k = 6, minSize = 2) { // 점수가 크게 벌어지는 곳에서 자른다 (1차원 최적 k-평균 · 한 티어 최소 2기)
  const n = vals.length; if (n <= k) return vals.map((_, i) => i);
  const pre = [0], pre2 = [0]; vals.forEach(v => { pre.push(pre[pre.length - 1] + v); pre2.push(pre2[pre2.length - 1] + v * v); });
  const cost = (i, j) => { const m = j - i, t = pre[j] - pre[i]; return pre2[j] - pre2[i] - t * t / m; }; // [i, j)
  const D = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(Infinity)), B = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(0));
  D[0][0] = 0;
  for (let c = 1; c <= k; c++) for (let j = c * minSize; j <= n; j++) for (let i = (c - 1) * minSize; i <= j - minSize; i++) { const v = D[c - 1][i] + cost(i, j); if (v < D[c][j]) { D[c][j] = v; B[c][j] = i; } }
  const cls = new Array(n); let j = n;
  for (let c = k; c >= 1; c--) { const i = B[c][j]; for (let t = i; t < j; t++) cls[t] = c - 1; j = i; }
  return cls;
}
function tierMargin(r, fallback) {
  if (!r || !Array.isArray(r.rows) || !r.rows.some(x => x.hp != null)) return fallback;
  const rem = side => r.rows.filter(x => x.side === side).reduce((t, x) => t + (x.hp || 0), 0) / 5;
  return Math.round(Math.min(1, Math.max(0, 0.5 + 0.5 * (rem('ally') - rem('enemy')))) * 100) / 100;
}const st = {}, games = []; let errs = 0, timed = 0;
const get = id => st[id] || (st[id] = { w: 0, n: 0, sh: 0 });
for (const r of rows) {
  if (r.r.w === 'err') { errs++; continue; }
  if (r.r.timed) timed++;
  const sc = side => r.r.w === side ? 1 : r.r.w === 'draw' ? 0.5 : 0;
  const tot = { ally: 0, enemy: 0 }; (r.r.rows || []).forEach(x => tot[x.side] += x.dealt);
  for (const [side, ids] of [['ally', r.a], ['enemy', r.e]]) ids.forEach(id => { const s = get(id); s.n++; s.w += sc(side); });
  (r.r.rows || []).forEach(x => { if (st[x.id]) st[x.id].sh += tot[x.side] ? x.dealt / tot[x.side] : 0; });
  games.push(r.a.join(',') + '|' + r.e.join(',') + '|' + tierMargin(r.r, sc('ally'))); // 결과 점수 = 남은 체력 차이 (없으면 승패)
}
const fit = tierFit(games), sig = z => 1 / (1 + Math.exp(-z));
const out = Object.entries(st).filter(([id]) => fit[id]).map(([id, s]) => ({ id, sc: fit[id].s, se: fit[id].se, r5: sig(fit[id].s), raw: s.w / s.n, n5: s.n, sh5: s.sh / s.n * 5 })).sort((a, b) => b.sc - a.sc);
const cls = tierBreaks(out.map(x => x.sc));
out.forEach((x, i) => { x.tier = String(cls[i] + 1); });
console.log(`games=${games.length} errs=${errs} timed=${timed} chars=${out.length}`);
out.forEach((x, i) => console.log(String(i + 1).padStart(3), x.tier, x.id.padEnd(12), (x.r5 * 100).toFixed(1).padStart(5) + '%', '±' + (x.r5 * (1 - x.r5) * x.se * 100).toFixed(1), 'raw', (x.raw * 100).toFixed(1) + '%', 'n', x.n5, 'sh', x.sh5.toFixed(2)));
fs.writeFileSync(S + '/agg5.json', JSON.stringify(out));
