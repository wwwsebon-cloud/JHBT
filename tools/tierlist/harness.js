// 티어 시뮬 하네스 (R2.22.2) — run.js 가 index.html?bench=2 에 넣는다 · 계산은 tools/tier-5v5.js 와 같다 (Lv1 · 이벤트 없음 · 60초 판정 · S.fast)
// window.__tl = { ids 지후 목록, info { id: { name, rarity } }, fight(A, E, seed) → { w 'a' | 'e' | 'draw', y 결과 점수, t 전투 시간, timed 60초 판정, rows [{ id, side, hp 남은 비율, dealt }] } }
(() => {
  const R = window.__rejhbt, S = R.S, C = R.CHARS, IDS = Object.keys(C); // 왕자 지후 등 숨은 변신 지후는 Object.keys 에 없다
  const rowOf = id => { const c = C[id], rg = c.range === 'melee' ? 0 : Number(c.range) || 0; let s = ({ 탱커: 0, 폭발형: 0, 딜러: 0.7, 컨트롤러: 1.2, 하이브리드: 1.3, 소환형: 1.6, 어쌔신: 2, 서포터: 2, 보조형: 2 })[c.role] ?? 1; if (c.range === 'melee') s -= 0.5; else if (rg >= 6) s += 0.8; else if (rg >= 4) s += 0.4; if (c.hp >= 1500) s -= 0.6; else if (c.hp >= 1200) s -= 0.3; else if (c.hp <= 800) s += 0.4; return Math.max(0, Math.min(2, Math.round(s))); };
  const CC = R.CFG.COLS, LINES = [[0, 1, 2, 3], [1, 2, 0, 3], [3, 2, 1, 0]]; // R3.0: 3 × 4 판 · 종류 (0 전열 · 1 중열 · 2 후열) 마다 찾는 줄 순서
  const place = ids => { const used = new Set(); return ids.slice().sort((a, b) => rowOf(a) - rowOf(b)).map(id => { let t = -1; for (const rr of LINES[rowOf(id)]) { for (let c = 0; c < CC && t < 0; c++) if (!used.has(rr * CC + c)) t = rr * CC + c; if (t >= 0) break; } used.add(t); return [id, t]; }); };
  const TID = new Map(); // uid → 배치한 지후 (스파이 변장 · 성장 변신 뒤에도 원래 지후로 센다)
  const fight = (A, E, seed) => { R.setSeed(seed); TID.clear();
    { const f = document.getElementById('field'); if (f) for (const el of [...f.children]) if (!el.classList.contains('tile') && !el.classList.contains('rowlab')) el.remove(); } // R2.29: 판 사이에 전장 DOM 을 비운다 (예전엔 쌓여서 120판에 DOM 196 → 16,630개 · 판마다 느려졌다)
    Object.assign(S, { phase: 'combat', time: 0, started: false, lastDmgAt: 0, stallEnded: false, odds: [], timed: [], units: [], shots: [], lines: [], zones: [], barriers: [], fast: true, net: null, rel: null, relLog: [], relAcc: 0, clover: { a: 0, e: 0 }, evOn: false, ev: { a: [], e: [] }, evc: { a: {}, e: {} }, speed: 1, deaths: 0, place: { a: [], e: [] }, roundStart: null, prop: { a: [], e: [] }, deck: { a: A.slice(), e: E.slice() }, enh: null, weak: false }); // 판(arc)은 벤치 샌드박스 그대로 (전적 · 퀘스트에 안 잡힌다)
    for (const [side, ids] of [['a', A], ['e', E]]) for (const [id, t] of place(ids)) { const q = R.tileXY(side, t), u = R.makeUnit(side, id, 1, q.x, q.y); u.tile = t; S.place[side][t] = { id, lv: 1 }; S.units.push(u); TID.set(u.uid, id); }
    let win = null, timed = false;
    for (let i = 0; i < 3610; i++) { const a = S.units.some(u => u.alive && u.side === 'a'), e = S.units.some(u => u.alive && u.side === 'e'); if (!a || !e) { win = a ? 'a' : e ? 'e' : 'draw'; break; } if (S.time >= 59.98) { const p = R.allyOdds(); win = p > 50 ? 'a' : p < 50 ? 'e' : 'draw'; timed = true; break; } R.stepCombat(1 / 60); if (S.phase !== 'combat') S.phase = 'combat'; }
    const base = S.units.filter(u => !u.summoner && !u.small && u.tile != null); // 배치한 지후만 (소환체 · 분열체 제외)
    const rem = s => base.filter(u => u.side === s).reduce((x, u) => x + (u.alive ? Math.max(0, Math.min(1, u.hp / (u.baseMaxHp || u.maxHp || 1))) : 0), 0) / 5;
    const rows = base.map(u => ({ id: TID.get(u.uid) || u.id, side: u.side, hp: u.alive ? Math.round(Math.max(0, Math.min(1, u.hp / (u.baseMaxHp || u.maxHp || 1))) * 100) / 100 : 0, dealt: Math.round(u.dmgDealt || 0) }));
    return { w: win || 'draw', y: Math.round(Math.min(1, Math.max(0, 0.5 + 0.5 * (rem('a') - rem('e')))) * 100) / 100, t: Math.round(S.time * 10) / 10, timed, rows }; };
  const info = {}; IDS.forEach(id => { info[id] = { name: C[id].name, rarity: C[id].rarity }; });
  window.__tl = { ids: IDS, info, fight };
})();
