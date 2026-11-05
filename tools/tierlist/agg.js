// 티어 시뮬 결과 → 티어 (R2.22.2 · R1 tools/tierlist/agg.js 를 R2 에 맞게 + 안정도 · 지난 티어 비교)
//   node tools/tierlist/agg.js <작업폴더> [부트스트랩 횟수=100]
// 팀 실력 모델 (Bradley-Terry): 지후마다 점수 s · P(아군 승) = σ(Σ아군 s − Σ적 s) 가 모든 판의 「결과 점수」 y = 0.5 + (아군 − 적 남은 체력 비율 평균) / 2 에 가장 잘 맞게 (L2 λ 0.5 · 뉴턴법)
// 표시 승률 = σ(s) (50% = 평균) · 오차 = 헤세 역행렬 대각 · 티어 = 점수가 크게 벌어지는 곳에서 5개 (1차원 최적 k-평균 · 한 티어 최소 2기 · R2 규칙 S ~ D)
// 강화 (R2.22.2): 안정도 = 판을 다시 뽑아 (부트스트랩) 맞췄을 때 같은 티어가 나온 비율 · 지난 티어 = index.html 의 TIER_SC 띠 · 실제 승률 · 피해 비중 · 판 수
const fs = require('fs'), path = require('path');
const W = process.argv[2], BOOT = process.argv[3] != null ? +process.argv[3] : 100, TIERS = 'SABCD';
const recs = [];
for (const f of fs.readdirSync(W).filter(f => /^t5_\d+\.jsonl$/.test(f))) for (const line of fs.readFileSync(path.join(W, f), 'utf8').split('\n')) if (line) { try { recs.push(JSON.parse(line)); } catch (e) {} }
recs.sort((a, b) => a.g - b.g);
const sig = z => 1 / (1 + Math.exp(-z));
function fit(games, lambda = 0.5) { // games: [{ a: [i…], e: [i…], y }] · n 명
  const n = NID, s = new Float64Array(n); let H = null;
  for (let it = 0; it < 30; it++) {
    const g = new Float64Array(n); H = Array.from({ length: n }, () => new Float64Array(n));
    for (let i = 0; i < n; i++) { g[i] = -lambda * s[i]; H[i][i] = lambda; }
    for (const r of games) { let z = 0; for (const i of r.a) z += s[i]; for (const i of r.e) z -= s[i];
      const p = sig(z), w = p * (1 - p), d = r.y - p, xs = r.x;
      for (const [i, xi] of xs) { g[i] += d * xi; const Hi = H[i]; for (const [j, xj] of xs) Hi[j] += w * xi * xj; } }
    const step = solve(H.map(row => Float64Array.from(row)), g); let mx = 0;
    for (let i = 0; i < n; i++) { s[i] += step[i]; mx = Math.max(mx, Math.abs(step[i])); }
    if (mx < 1e-6) break;
  }
  const mean = s.reduce((t, v) => t + v, 0) / n; for (let i = 0; i < n; i++) s[i] -= mean;
  return { s, H };
}
function solve(A, b) { const n = b.length, x = Float64Array.from(b); for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r; [A[c], A[p]] = [A[p], A[c]]; [x[c], x[p]] = [x[p], x[c]]; const d = A[c][c] || 1e-12; for (let r = c + 1; r < n; r++) { const f = A[r][c] / d; if (!f) continue; for (let k = c; k < n; k++) A[r][k] -= f * A[c][k]; x[r] -= f * x[c]; } } for (let r = n - 1; r >= 0; r--) { let t = x[r]; for (let k = r + 1; k < n; k++) t -= A[r][k] * x[k]; x[r] = t / (A[r][r] || 1e-12); } return x; }
function invDiag(H) { const n = H.length, A = H.map((row, i) => { const r = new Float64Array(2 * n); r.set(row); r[n + i] = 1; return r; }); for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r; [A[c], A[p]] = [A[p], A[c]]; const d = A[c][c] || 1e-12; for (let k = c; k < 2 * n; k++) A[c][k] /= d; for (let r = 0; r < n; r++) { if (r === c) continue; const f = A[r][c]; if (!f) continue; for (let k = c; k < 2 * n; k++) A[r][k] -= f * A[c][k]; } } return Float64Array.from({ length: n }, (_, i) => A[i][n + i]); }
function breaks(vals, k = 5, minSize = 2) { // 내림차순 점수 → 티어 번호 (1차원 최적 k-평균)
  const n = vals.length; if (n <= k) return vals.map((_, i) => i);
  const pre = [0], pre2 = [0]; vals.forEach(v => { pre.push(pre[pre.length - 1] + v); pre2.push(pre2[pre2.length - 1] + v * v); });
  const cost = (i, j) => { const m = j - i, t = pre[j] - pre[i]; return pre2[j] - pre2[i] - t * t / m; };
  const D = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(Infinity)), B = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(0)); D[0][0] = 0;
  for (let c = 1; c <= k; c++) for (let j = c * minSize; j <= n; j++) for (let i = (c - 1) * minSize; i <= j - minSize; i++) { const v = D[c - 1][i] + cost(i, j); if (v < D[c][j]) { D[c][j] = v; B[c][j] = i; } }
  const cls = new Array(n); let j = n; for (let c = k; c >= 1; c--) { const i = B[c][j]; for (let t = i; t < j; t++) cls[t] = c - 1; j = i; } return cls;
}
const tierOf = s => { const o = Object.keys(s).sort((a, b) => s[b] - s[a]), c = breaks(o.map(k => s[k])), m = {}; o.forEach((k, i) => { m[k] = TIERS[c[i]]; }); return m; };
// 판 → 모델 입력
const idx = new Map(), ids = [], st = {}; let errs = 0, timed = 0, tsum = 0;
const I = k => { if (!idx.has(k)) { idx.set(k, idx.size); ids.push(k); } return idx.get(k); };
const games = [];
for (const r of recs) {
  if (!r.r || r.r.w === 'err') { errs++; continue; }
  if (r.r.timed) timed++; tsum += r.r.t || 0;
  const a = r.a.map(I), e = r.e.map(I); games.push({ a, e, y: r.r.y, x: [...a.map(i => [i, 1]), ...e.map(i => [i, -1])] });
  const tot = { a: 0, e: 0 }; (r.r.rows || []).forEach(x => { tot[x.side] += x.dealt; });
  for (const [side, L] of [['a', r.a], ['e', r.e]]) for (const id of L) { const q = st[id] || (st[id] = { n: 0, w: 0, sh: 0 }); q.n++; q.w += r.r.w === side ? 1 : r.r.w === 'draw' ? 0.5 : 0; }
  (r.r.rows || []).forEach(x => { if (st[x.id] && tot[x.side]) st[x.id].sh += x.dealt / tot[x.side]; });
}
const NID = ids.length;
const { s, H } = fit(games), inv = invDiag(H), S0 = {}; ids.forEach((k, i) => { S0[k] = s[i]; });
const T0 = tierOf(S0);
// 안정도 (부트스트랩): 판을 같은 수만큼 다시 뽑아 (같은 판 여러 번 가능) 맞추고 티어를 다시 자른다
const same = Object.fromEntries(ids.map(k => [k, 0]));
let bs = 20261105 >>> 0; const rnd = () => { bs = (bs * 1664525 + 1013904223) >>> 0; return bs / 4294967296; };
for (let b = 0; b < BOOT; b++) { const G = games.map(() => games[Math.floor(rnd() * games.length)]), f = fit(G), sb = {}; ids.forEach((k, i) => { sb[k] = f.s[i]; }); const tb = tierOf(sb); ids.forEach(k => { if (tb[k] === T0[k]) same[k]++; }); }
// 지난 티어 (index.html 의 TIER_SC 띠)
const html = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf8'), m = /const TIER_SC = (\{[^}]*\})/.exec(html), prevSc = m ? JSON.parse(m[1]) : {};
const band = v => v >= 80 ? 'S' : v >= 65 ? 'A' : v >= 40 ? 'B' : v >= 20 ? 'C' : 'D';
const out = ids.map((k, i) => ({ id: k, tier: T0[k], s: +S0[k].toFixed(4), se: +Math.sqrt(Math.max(0, inv[i])).toFixed(4), wr: Math.round(sig(S0[k]) * 1000) / 10, raw: Math.round(st[k].w / st[k].n * 1000) / 10, n: st[k].n, sh: Math.round(st[k].sh / st[k].n * 5 * 100) / 100, stab: BOOT ? Math.round(same[k] / BOOT * 100) : null, prev: prevSc[k] != null ? band(prevSc[k]) : null })).sort((a, b) => b.s - a.s);
const meta = { games: games.length, errs, timed, avgT: games.length ? Math.round(tsum / games.length * 10) / 10 : 0, chars: NID, boot: BOOT };
fs.writeFileSync(path.join(W, 'agg.json'), JSON.stringify({ meta, rows: out }, null, 1));
const L = [`판 ${meta.games} · 오류 ${errs} · 60초 판정 ${timed} (${Math.round(timed / Math.max(1, meta.games) * 100)}%) · 평균 전투 ${meta.avgT}초 · 지후 ${NID} · 부트스트랩 ${BOOT}`,
  '순위 티어 (지난) 지후          승률(±)    실제   판수 피해비중 안정도'];
out.forEach((x, i) => L.push(`${String(i + 1).padStart(3)} ${x.tier} (${x.prev || '-'}) ${x.id.padEnd(12)} ${x.wr.toFixed(1).padStart(5)}% ±${(sig(x.s) * (1 - sig(x.s)) * x.se * 164.5).toFixed(1).padStart(4)}  ${x.raw.toFixed(1).padStart(5)}% ${String(x.n).padStart(4)}  ${x.sh.toFixed(2)}  ${x.stab == null ? '-' : x.stab + '%'}`));
fs.writeFileSync(path.join(W, 'result.txt'), L.join('\n') + '\n'); console.log(L.join('\n'));
