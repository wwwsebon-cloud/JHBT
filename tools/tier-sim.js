// RE : 지후배틀 티어 시뮬레이션 (R2.12) — 브라우저 콘솔용
// 사용법: 로컬 서버에서 index.html?bench=2 를 열고 몇 초 뒤 이 파일 내용을 콘솔에 붙여 넣는다.
//         진행: __tier (done · todo · err) · 끝나면 __tierSummary() 가 점수표를 돌려준다.
// 규칙 (CLAUDE.md '밸런스 시뮬레이션 · 티어리스트 규칙'):
//   후보 ×3 + 기준 덱 4종 ×3  vs  같은 기준 덱 + 화염 ×3  (화염 = 50점)
//   기준 덱 2종 · 시드 5개 × 진영 바꿔 2번 (모든 후보가 같은 시드) · Lv1 · 랜덤 이벤트 없음 · 60초가 지나면 승률 판정
//   출격제한 1 은 1기 + 화염 2기 · 점수 = 승률 (무승부 0.5) · 보조 = 남은 체력 차 · 90% 윌슨 오차 범위
(() => {
  const R = window.__rejhbt, S = R.S, C = R.CHARS;
  const HOSTS = [[['shield', 3], ['sword', 3], ['gun', 3], ['heal', 3]], [['cactus', 3], ['levelup', 3], ['combo', 3], ['barrier', 3]]];
  const SEEDS = [11, 23, 37, 41, 59], BASE = 'fire';
  const rowOf = id => { const c = C[id], rg = c.range === 'melee' ? 0 : Number(c.range) || 0; let s = ({ 탱커: 0, 폭발형: 0, 딜러: 0.7, 컨트롤러: 1.2, 하이브리드: 1.3, 소환형: 1.6, 어쌔신: 2, 서포터: 2, 보조형: 2 })[c.role] ?? 1; if (c.range === 'melee') s -= 0.5; else if (rg >= 6) s += 0.8; else if (rg >= 4) s += 0.4; if (c.hp >= 1500) s -= 0.6; else if (c.hp >= 1200) s -= 0.3; else if (c.hp <= 800) s += 0.4; return Math.max(0, Math.min(2, Math.round(s))); };
  const place = deck => { const ids = deck.flatMap(([id, n]) => Array(n).fill(id)).sort((a, b) => rowOf(a) - rowOf(b)), used = new Set(); return ids.map(id => { let t = -1; for (let rr = rowOf(id); rr < 3 && t < 0; rr++) for (let c = 0; c < 5; c++) if (!used.has(rr * 5 + c)) { t = rr * 5 + c; break; } for (let rr = 0; rr < 3 && t < 0; rr++) for (let c = 0; c < 5; c++) if (!used.has(rr * 5 + c)) { t = rr * 5 + c; break; } used.add(t); return [id, t]; }); };
  const fight = (A, E, seed) => { R.setSeed(seed);
    Object.assign(S, { phase: 'combat', time: 0, started: false, lastDmgAt: 0, stallEnded: false, odds: [], timed: [], units: [], shots: [], lines: [], zones: [], barriers: [], fast: true, net: null, evOn: false, ev: { a: [], e: [] }, evc: { a: {}, e: {} }, speed: 1, deaths: 0, place: { a: [], e: [] }, roundStart: null, prop: { a: [], e: [] }, deck: { a: A.map(x => x[0]), e: E.map(x => x[0]) } });
    for (const [side, deck] of [['a', A], ['e', E]]) for (const [id, t] of place(deck)) { const q = R.tileXY(side, t), u = R.makeUnit(side, id, 1, q.x, q.y); u.tile = t; S.place[side][t] = { id, lv: 1 }; S.units.push(u); }
    let win = null;
    for (let i = 0; i < 3610; i++) { const a = S.units.some(u => u.alive && u.side === 'a'), e = S.units.some(u => u.alive && u.side === 'e'); if (!a || !e) { win = a ? 'a' : e ? 'e' : 'draw'; break; } if (S.time >= 59.98) { const p = R.allyOdds(); win = p > 50 ? 'a' : p < 50 ? 'e' : 'draw'; break; } R.stepCombat(1 / 60); if (S.phase !== 'combat') S.phase = 'combat'; }
    const hpf = s => { const L = S.units.filter(u => u.side === s && !u.summoner && !u.small), m = L.reduce((x, u) => x + (u.baseMaxHp || u.maxHp), 0); return L.reduce((x, u) => x + (u.alive ? Math.max(0, u.hp) : 0), 0) / (m || 1); };
    return { win, mA: hpf('a') - hpf('e') }; };
  const one = id => { const res = [], n = C[id].deployLimit === 1 ? 1 : 3;
    for (const host of HOSTS) { if (host.some(h => h[0] === id)) continue; const mine = [...host, [id, n], ...(n < 3 ? [[BASE, 3 - n]] : [])], base = [...host, [BASE, 3]];
      for (const sd of SEEDS) for (const swap of [false, true]) { const r = swap ? fight(base, mine, sd) : fight(mine, base, sd); res.push([r.win === 'draw' ? 0.5 : ((r.win === 'a') !== swap ? 1 : 0), swap ? -r.mA : r.mA]); } }
    return res; };
  const wilson = (p, n, z = 1.645) => { const d = 1 + z * z / n, c = p + z * z / (2 * n), m = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)); return [(c - m) / d, (c + m) / d]; };
  window.__tierSummary = () => Object.entries(window.__tier.done).map(([id, res]) => { if (id === BASE) return { id, sc: 50, lo: 50, hi: 50, m: 0, k: 0 }; const k = res.length, p = res.reduce((s, r) => s + r[0], 0) / k, [lo, hi] = wilson(p, k); return { id, sc: Math.round(p * 100), lo: Math.round(lo * 100), hi: Math.round(hi * 100), m: Math.round(res.reduce((s, r) => s + r[1], 0) / k * 100), k }; });
  window.__tier = { done: {}, err: {}, todo: Object.keys(C), started: Date.now() };
  (function step() { const T = window.__tier, id = T.todo.shift(); if (!id) { T.ended = Date.now(); return; } try { T.done[id] = id === BASE ? [] : one(id); } catch (e) { T.err[id] = String(e); } setTimeout(step, 0); })();
})();
