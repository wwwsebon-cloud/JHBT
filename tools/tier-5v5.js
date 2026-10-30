// RE : 지후배틀 빠른 티어리스트 (R2.12 · 지후배틀(Archive) tools/tierlist 방식) — 브라우저 콘솔용
// 사용법: 로컬 서버에서 index.html?bench=2 를 열고 몇 초 뒤 이 파일 내용을 콘솔에 붙여 넣는다 (판수: window.__T5N · 기본 2,000).
//         진행: __t5 (games · todo) · 끝나면 __t5Summary() 가 점수표를 돌려준다.
// 규칙 (CLAUDE.md '티어리스트 규칙 (Archive 방식)'):
//   판마다 모든 지후 중 무작위 10기 → 5:5 (같은 지후 없음) · Lv1 · 랜덤 이벤트 없음 · 60초가 지나면 승률 판정 · 판마다 전투 시드 고정
//   결과 점수 = 0.5 + (아군 남은 체력 비율 평균 − 적 남은 체력 비율 평균) / 2   (승패 0/1 보다 순위가 안정적)
//   팀 실력 모델 (Bradley-Terry): P(아군 승) = σ(Σ아군 s − Σ적 s) 가 모든 판에 가장 잘 맞는 s (L2 λ 0.5 · 뉴턴법) · 오차 = 헤세 역행렬 대각
//   표시 승률 = σ(s) · 티어는 비율이 아니라 점수가 크게 벌어지는 곳에서 5개로 (1차원 최적 k-평균 · 한 티어 최소 2기)
(() => {
  const R = window.__rejhbt, S = R.S, C = R.CHARS, IDS = Object.keys(C), N = window.__T5N || 2000;
  const rowOf = id => { const c = C[id], rg = c.range === 'melee' ? 0 : Number(c.range) || 0; let s = ({ 탱커: 0, 폭발형: 0, 딜러: 0.7, 컨트롤러: 1.2, 하이브리드: 1.3, 소환형: 1.6, 어쌔신: 2, 서포터: 2, 보조형: 2 })[c.role] ?? 1; if (c.range === 'melee') s -= 0.5; else if (rg >= 6) s += 0.8; else if (rg >= 4) s += 0.4; if (c.hp >= 1500) s -= 0.6; else if (c.hp >= 1200) s -= 0.3; else if (c.hp <= 800) s += 0.4; return Math.max(0, Math.min(2, Math.round(s))); };
  const place = ids => { const used = new Set(); return ids.slice().sort((a, b) => rowOf(a) - rowOf(b)).map(id => { let t = -1; for (let rr = rowOf(id); rr < 3 && t < 0; rr++) for (let c = 0; c < 5; c++) if (!used.has(rr * 5 + c)) { t = rr * 5 + c; break; } used.add(t); return [id, t]; }); };
  const fight = (A, E, seed) => { R.setSeed(seed);
    Object.assign(S, { phase: 'combat', time: 0, started: false, lastDmgAt: 0, stallEnded: false, odds: [], timed: [], units: [], shots: [], lines: [], zones: [], barriers: [], fast: true, net: null, evOn: false, ev: { a: [], e: [] }, evc: { a: {}, e: {} }, speed: 1, deaths: 0, place: { a: [], e: [] }, roundStart: null, prop: { a: [], e: [] }, deck: { a: A.slice(), e: E.slice() } });
    for (const [side, ids] of [['a', A], ['e', E]]) for (const [id, t] of place(ids)) { const q = R.tileXY(side, t), u = R.makeUnit(side, id, 1, q.x, q.y); u.tile = t; S.place[side][t] = { id, lv: 1 }; S.units.push(u); }
    let win = null;
    for (let i = 0; i < 3610; i++) { const a = S.units.some(u => u.alive && u.side === 'a'), e = S.units.some(u => u.alive && u.side === 'e'); if (!a || !e) { win = a ? 'a' : e ? 'e' : 'draw'; break; } if (S.time >= 59.98) { const p = R.allyOdds(); win = p > 50 ? 'a' : p < 50 ? 'e' : 'draw'; break; } R.stepCombat(1 / 60); if (S.phase !== 'combat') S.phase = 'combat'; }
    const rem = s => { const L = S.units.filter(u => u.side === s && !u.summoner && !u.small && u.tile != null); return L.reduce((x, u) => x + (u.alive ? Math.max(0, Math.min(1, u.hp / (u.baseMaxHp || u.maxHp || 1))) : 0), 0) / 5; };
    return { win, y: Math.round(Math.min(1, Math.max(0, 0.5 + 0.5 * (rem('a') - rem('e')))) * 100) / 100 }; };
  let rs = 20261031 >>> 0; const rnd = () => { rs = (rs * 1664525 + 1013904223) >>> 0; return rs / 4294967296; };
  const pick = n => { const bag = IDS.slice(), out = []; while (out.length < n) out.push(bag.splice(Math.floor(rnd() * bag.length), 1)[0]); return out; };
  const sig = z => 1 / (1 + Math.exp(-z));
  function solve(A, b) { const n = b.length, x = Float64Array.from(b); for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r; [A[c], A[p]] = [A[p], A[c]]; [x[c], x[p]] = [x[p], x[c]]; const d = A[c][c] || 1e-12; for (let r = c + 1; r < n; r++) { const f = A[r][c] / d; if (!f) continue; for (let k = c; k < n; k++) A[r][k] -= f * A[c][k]; x[r] -= f * x[c]; } } for (let r = n - 1; r >= 0; r--) { let t = x[r]; for (let k = r + 1; k < n; k++) t -= A[r][k] * x[k]; x[r] = t / (A[r][r] || 1e-12); } return x; }
  function invDiag(H) { const n = H.length, A = H.map((row, i) => { const r = new Float64Array(2 * n); r.set(row); r[n + i] = 1; return r; }); for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r; [A[c], A[p]] = [A[p], A[c]]; const d = A[c][c] || 1e-12; for (let k = c; k < 2 * n; k++) A[c][k] /= d; for (let r = 0; r < n; r++) { if (r === c) continue; const f = A[r][c]; if (!f) continue; for (let k = c; k < 2 * n; k++) A[r][k] -= f * A[c][k]; } } return Float64Array.from({ length: n }, (_, i) => A[i][n + i]); }
  function fit(games, lambda = 0.5) { const idx = new Map(IDS.map((k, i) => [k, i])), n = IDS.length, s = new Float64Array(n); let H = null;
    for (let it = 0; it < 30; it++) { const g = new Float64Array(n); H = Array.from({ length: n }, () => new Float64Array(n)); for (let i = 0; i < n; i++) { g[i] = -lambda * s[i]; H[i][i] = lambda; }
      for (const r of games) { const xs = [...r.a.map(k => [idx.get(k), 1]), ...r.e.map(k => [idx.get(k), -1])]; let z = 0; xs.forEach(([i, x]) => { z += x * s[i]; }); const p = sig(z), w = p * (1 - p), d = r.y - p; for (const [i, xi] of xs) { g[i] += d * xi; for (const [j, xj] of xs) H[i][j] += w * xi * xj; } }
      const st = solve(H.map(row => Float64Array.from(row)), g); let mx = 0; for (let i = 0; i < n; i++) { s[i] += st[i]; mx = Math.max(mx, Math.abs(st[i])); } if (mx < 1e-6) break; }
    const inv = invDiag(H), mean = s.reduce((t, v) => t + v, 0) / n; return IDS.map((k, i) => ({ id: k, s: s[i] - mean, se: Math.sqrt(Math.max(0, inv[i])) })); }
  function breaks(vals, k = 5, minSize = 2) { const n = vals.length, pre = [0], pre2 = [0]; vals.forEach(v => { pre.push(pre[pre.length - 1] + v); pre2.push(pre2[pre2.length - 1] + v * v); }); const cost = (i, j) => { const m = j - i, t = pre[j] - pre[i]; return pre2[j] - pre2[i] - t * t / m; };
    const D = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(Infinity)), B = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(0)); D[0][0] = 0;
    for (let c = 1; c <= k; c++) for (let j = c * minSize; j <= n; j++) for (let i = (c - 1) * minSize; i <= j - minSize; i++) { const v = D[c - 1][i] + cost(i, j); if (v < D[c][j]) { D[c][j] = v; B[c][j] = i; } }
    const cls = new Array(n); let j = n; for (let c = k; c >= 1; c--) { const i = B[c][j]; for (let t = i; t < j; t++) cls[t] = c - 1; j = i; } return cls; }
  window.__t5Summary = () => { const T = window.__t5, F = fit(T.games).sort((a, b) => b.s - a.s), cls = breaks(F.map(x => x.s)), L = 'SABCD', n = {}; T.games.forEach(g => [...g.a, ...g.e].forEach(k => n[k] = (n[k] || 0) + 1));
    return F.map((x, i) => ({ id: x.id, tier: L[cls[i]], s: +x.s.toFixed(3), se: +x.se.toFixed(3), wr: Math.round(sig(x.s) * 1000) / 10, lo: Math.round(sig(x.s - 1.645 * x.se) * 1000) / 10, hi: Math.round(sig(x.s + 1.645 * x.se) * 1000) / 10, n: n[x.id] || 0 })); };
  window.__t5 = { games: [], err: 0, todo: N, started: Date.now() };
  (function step() { const T = window.__t5; const until = performance.now() + 40; while (T.todo > 0 && performance.now() < until) { const t = pick(10), a = t.slice(0, 5), e = t.slice(5); try { const r = fight(a, e, 1000 + T.games.length); T.games.push({ a, e, y: r.y, w: r.win }); } catch (err) { T.err++; } T.todo--; } if (T.todo > 0) setTimeout(step, 0); else T.ended = Date.now(); })();
})();
