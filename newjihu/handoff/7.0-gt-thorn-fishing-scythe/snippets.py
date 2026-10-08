# 7.0 신규 지후 4종 (GT · 가시 · 낚시 · 낫) — 인계용 코드 조각.
# 각 항목: (제목, 찾을 앵커 문자열, 'before'|'after'|'replace', 넣을 코드)
# apply.py 가 index.html 에 적용하고, make_doc.py 가 같은 조각으로 인계 문서를 만든다.

PORTRAIT_FILES = [
    ('gt', 'GT 지후.PNG'),
    ('gt_turbo', 'GT지후(스킬 발동이후).PNG'),
    ('thorn', '가시 지후.PNG'),
    ('fishing', '낚시 지후.PNG'),
    ('scythe', '낫 지후.PNG'),
]

BALANCE = r"""  // ===== 7.0 신규: GT · 가시 · 낚시 · 낫 (px 수치는 45px 격자 기준, 1칸 = 45) =====
  gt: {
    hp: 2000, atk: 200, atkSpeed: 1, range: 135, speed: 76.5,
    deployLimit: 1, // 출격제한: 한 진영 전장에 1기만
    turboCells: 5, turboDuration: 5
  },
  thorn: {
    hp: 2550, atk: 270, atkSpeed: 1, range: 99, speed: 90,
    thornTipCells: 0.5, fatalDuration: 0.6
  },
  fishing: {
    hp: 2490, atk: 380, atkSpeed: 0.75, range: 45, speed: 0,
    isMelee: true, immobile: true, fanAngleDeg: 120, fanRadius: 45,
    lureRadius: 135, hookDelay: 1, reelTime: 0.4,
    stewDuration: 6, stewAtk: 0.5, stewSpeed: 0.5
  },
  scythe: {
    hp: 3440, atk: 744, atkSpeed: 2.7, range: 74.25, speed: 51.75,
    isMelee: true, fanAngleDeg: 120, fanRadius: 74.25,
    tendonFirst: 5, tendonCooldown: 8, tendonWindup: 0.5, tendonRadius: 74.25, tendonDmgRatio: 0.75,
    debuffDuration: 4, lacerateFraction: 0.25
  },
"""

CHARS = r"""  // ===== 7.0 신규: GT · 가시 · 낚시 · 낫 =====
  gt: {
    id: 'gt', name: 'GT 지후', emoji: '🏎️', role: 'support', roleLabel: '서포터',
    rarity: 'legend', color: '#e63946', portrait: PORTRAITS.gt || jhPlaceholder('🏎️', '#e63946'), portraitTurbo: PORTRAITS.gt_turbo || PORTRAITS.gt,
    ...CHARACTER_BALANCE.gt,
    skillDesc: 'HP 2,000 · ATK 200 · 사거리 3칸 · 공격 간격 1초 · 이동속도 1.7칸. <b>출격제한 1</b>. 자신 <b>바로 앞 칸</b>에 배치된 아군이 있으면 라운드 시작 때 그 지후에게 <b>터보엔진</b>을 달아 준다. 터보엔진을 단 지후는 라운드 시작 <b>5초</b> 동안 이동속도가 <b>5칸</b> 늘어난다. 터보엔진을 달아 준 라운드에는 초상화가 바뀐다.'
  },
  thorn: {
    id: 'thorn', name: '가시 지후', emoji: '🌵', role: 'dealer', roleLabel: '딜러',
    rarity: 'rare', color: '#3f8f3a', portrait: PORTRAITS.thorn || jhPlaceholder('🌵', '#3f8f3a'),
    ...CHARACTER_BALANCE.thorn,
    customAttack(caster, target) { thornAttack(caster, target); },
    skillDesc: 'HP 2,550 · ATK 270 · 사거리 2.2칸 · 공격 간격 1초 · 이동속도 2칸. 앞 <b>2.2칸</b> 직사각형을 <b>관통</b>해 찌른다. 끝 사거리(마지막 0.5칸)에 맞은 적은 <b>확정 치명타</b>를 입고 <b>0.6초</b>간 <b>[치명상]</b>을 얻는다. <b>[치명상]</b>: 받는 모든 피해가 확정 치명타가 된다.'
  },
  fishing: {
    id: 'fishing', name: '낚시 지후', emoji: '🎣', role: 'controller', roleLabel: '컨트롤러',
    rarity: 'legend', color: '#2a7fb8', portrait: PORTRAITS.fishing || jhPlaceholder('🎣', '#2a7fb8'),
    ...CHARACTER_BALANCE.fishing,
    skillDesc: 'HP 2,490 · ATK 380 · 근접 부채꼴(1칸 · 120°) · 공격 간격 0.75초 · <b>움직이지 않는다</b>. 라운드 시작 때 적진의 무작위 위치에 <b>찌</b>를 던진다. 찌 <b>반경 3칸</b> 안의 적은 찌로 끌려가고, 가장 먼저 닿은 적이 <b>낚인다</b>(행동불능). 1초 뒤 낚싯대를 당겨 그 적을 자신 바로 앞까지 끌어오고 6초간 <b>[생선조림]</b>을 건다. <b>[생선조림]</b>: 공격력 50% · 이동속도 50% 감소.'
  },
  scythe: {
    id: 'scythe', name: '낫 지후', emoji: '🪓', role: 'controller', roleLabel: '컨트롤러',
    rarity: 'epic', color: '#5b4b8a', portrait: PORTRAITS.scythe || jhPlaceholder('🪓', '#5b4b8a'),
    ...CHARACTER_BALANCE.scythe,
    skillDesc: 'HP 3,440 · ATK 744 · 근접 부채꼴(1.65칸 · 120°) · 공격 간격 2.7초 · 이동속도 1.15칸. 라운드 시작 <b>5초</b> 뒤부터 쿨타임 <b>8초</b>마다 <b>[힘줄 끊기]</b>를 쓴다 (시전 중에는 쿨타임이 줄지 않는다). <b>[힘줄 끊기]</b>: 제자리에 멈춘 뒤 0.5초 뒤 무작위 적 곁으로 순간이동해 <b>반경 1.65칸</b>의 모든 적에게 공격력의 <b>75%</b> 피해를 주고 4초간 <b>[절상]</b>·<b>[치명상]</b>·<b>[침묵]</b>을 건다. <b>[절상]</b>: 체력바 끝 25%가 잘려 최대 체력이 75%가 된다. <b>[침묵]</b>: 모든 스킬 쿨타임과 타격 게이지가 멈춘다.'
  },
"""

READY = r"""  // 7.0 GT · 낚시 · 낫
  if (u.charId === 'gt') u._gtPending = true; // 모든 유닛 준비가 끝난 뒤 첫 틱에 앞칸을 본다
  if (u.charId === 'fishing') { removeBobber(u); u._fishCast = 0.2; }
  if (u.charId === 'scythe') { u._scytheCd = u.def.tendonFirst; u._tendon = null; }
"""

TICK_CALL = r"""  tickNew70b(u, dt); // 7.0 GT · 가시 · 낚시 · 낫 + [치명상]·[절상]·[침묵]·[생선조림]
"""

FUNCTIONS = r"""// ===== 7.0 신규: GT · 가시 · 낚시 · 낫 =====
// 상대 진영을 향한 방향(단위 벡터). 동서 배치면 x축, 남북 배치면 y축, 경매(여러 진영)는 맵 중앙 쪽.
function frontVector(u) {
  if (state.mode === 'auction') {
    const dx = MAP_W / 2 - u.x, dy = MAP_H / 2 - u.y, d = Math.hypot(dx, dy) || 1;
    return { x: dx / d, y: dy / d };
  }
  if (isEastWestLayout()) return { x: Math.sign(MAP_W / 2 - u.x) || (u.side === 'ally' ? -1 : 1), y: 0 };
  return { x: 0, y: Math.sign(MAP_H / 2 - u.y) || (u.side === 'ally' ? -1 : 1) };
}
// GT: 자신 바로 앞 칸(앞으로 0.4~1.6칸, 옆으로 0.6칸 이내)의 아군 중 1칸 지점에 가장 가까운 지후에게 터보엔진
function gtInstallTurbo(u) {
  const f = frontVector(u);
  let best = null, bestD = Infinity;
  state.units.forEach(a => {
    if (a === u || !a.alive || a.isCastle || a.side !== u.side) return;
    const dx = a.x - u.x, dy = a.y - u.y;
    const along = dx * f.x + dy * f.y, across = Math.abs(-dx * f.y + dy * f.x);
    if (along < GRID * 0.4 || along > GRID * 1.6 || across > GRID * 0.6) return;
    const d = Math.hypot(along - GRID, across);
    if (d < bestD) { best = a; bestD = d; }
  });
  if (!best) return;
  const bonus = best.def.speed > 0 ? u.def.turboCells * GRID / best.def.speed : 0; // +5칸/초를 이동속도 배율로
  if (bonus > 0) battleAPI.setBuff(best, 'gt-turbo', 'speed', bonus, u.def.turboDuration);
  best._turbo = u.def.turboDuration;
  best.el.classList.add('turbo');
  battleAPI.setImage(u, u.def.portraitTurbo);
  spawnDamageNumber(best, '🏎️ 터보엔진!', { crit: true });
}
// 가시: 앞 사거리 길이 · 몸 지름 폭의 직사각형 관통 찌르기. 끝 0.5칸에 걸린 적은 확정 치명타 + [치명상]
function thornAttack(c, target) {
  const ang = Math.atan2(target.y - c.y, target.x - c.x), cs = Math.cos(ang), sn = Math.sin(ang);
  const length = c.def.range, half = unitRadius(c), tip = c.def.thornTipCells * GRID;
  const fx = document.createElement('div');
  fx.className = 'fx-thorn';
  fx.style.left = c.x + 'px'; fx.style.top = c.y + 'px';
  fx.style.width = length + 'px'; fx.style.height = half * 2 + 'px';
  fx.style.transform = `translateY(-50%) rotate(${ang}rad)`;
  worldEl().appendChild(fx);
  scheduleTask(() => fx.remove(), 220);
  state.units.slice().forEach(e => {
    if (!e.alive || e.isCastle || !isHostile(c, e) || !sameRealm(c, e)) return;
    const dx = e.x - c.x, dy = e.y - c.y, r = unitRadius(e);
    const along = dx * cs + dy * sn, across = Math.abs(-dx * sn + dy * cs);
    if (along < -r || along > length + r || across > half + r) return;
    const atTip = along + r >= length - tip;
    const hit = dealDamage(c, e, c.def.atk, atTip ? { forceCrit: true } : {});
    if (hit && atTip && e.alive) applyFatalWound(e, c.def.fatalDuration);
    if (hit && c.def.onHit) c.def.onHit(c, e, battleAPI);
  });
}
// [치명상]: 받는 모든 피해가 확정 치명타 (dealDamage · applyDamageRaw 에서 target._fatal 확인)
function applyFatalWound(e, duration) {
  e._fatal = Math.max(e._fatal || 0, duration);
  e.el.classList.add('fatal-wound');
}
// 낚시: 적진 무작위 위치
function enemyFieldPoint(u) {
  const pad = GRID;
  const rand = (a, b) => a + Math.random() * Math.max(0, b - a);
  if (state.mode === 'auction') {
    const foes = state.units.filter(e => e.alive && !e.isCastle && isHostile(u, e));
    const f = foes[Math.floor(Math.random() * foes.length)];
    return f ? { x: clamp(f.x + rand(-GRID, GRID), pad, MAP_W - pad), y: clamp(f.y + rand(-GRID, GRID), pad, MAP_H - pad) } : null;
  }
  if (isEastWestLayout()) {
    const foeLeft = u.x > MAP_W / 2;
    return { x: foeLeft ? rand(pad, MAP_W / 2 - pad) : rand(MAP_W / 2 + pad, MAP_W - pad), y: rand(pad, MAP_H - pad) };
  }
  const foeTop = u.y > MAP_H / 2;
  return { x: rand(pad, MAP_W - pad), y: foeTop ? rand(pad, MAP_H / 2 - pad) : rand(MAP_H / 2 + pad, MAP_H - pad) };
}
function castBobber(u) {
  const p = enemyFieldPoint(u);
  if (!p) return;
  const el = document.createElement('div');
  el.className = 'fx-bobber';
  const line = document.createElement('div');
  line.className = 'fx-fishline';
  const ring = document.createElement('div');
  ring.className = 'fx-bobber-ring';
  const d = u.def.lureRadius * WORLD_SCALE * 2;
  ring.style.width = d + 'px'; ring.style.height = d + 'px';
  worldEl().append(ring, line, el);
  u._bobber = { x: p.x, y: p.y, el, line, ring, phase: 'lure', t: 0, hooked: null };
  drawBobber(u);
  spawnDamageNumber(u, '🎣 휙!', { heal: true });
}
function drawBobber(u) {
  const b = u._bobber;
  b.el.style.left = b.x + 'px'; b.el.style.top = b.y + 'px';
  b.ring.style.left = b.x + 'px'; b.ring.style.top = b.y + 'px';
  b.ring.style.display = b.phase === 'lure' ? '' : 'none';
  const dx = b.x - u.x, dy = b.y - u.y;
  b.line.style.left = u.x + 'px'; b.line.style.top = u.y + 'px';
  b.line.style.width = Math.hypot(dx, dy) + 'px';
  b.line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
}
function removeBobber(u) {
  const b = u._bobber;
  if (!b) return;
  b.el.remove(); b.line.remove(); b.ring.remove();
  if (b.hooked) { b.hooked._hooked = null; b.hooked.el.classList.remove('hooked'); }
  u._bobber = null;
}
function tickBobber(u, dt) {
  const b = u._bobber;
  if (!u.alive) { removeBobber(u); return; }
  if (b.phase === 'lure') {
    const R = u.def.lureRadius * WORLD_SCALE;
    let caught = null;
    state.units.forEach(e => {
      if (!e.alive || e.isCastle || !isHostile(u, e) || !sameRealm(u, e) || e._hooked) return;
      const dist = Math.hypot(e.x - b.x, e.y - b.y);
      if (dist > R + unitRadius(e)) return;
      e._lure = { x: b.x, y: b.y, t: 0.15 }; // 찌 쪽으로 끌려간다 (physIntegrate 에서 조향)
      if (!caught && dist <= unitRadius(e) + 10) caught = e;
    });
    if (caught) {
      b.phase = 'hooked'; b.t = u.def.hookDelay; b.hooked = caught;
      caught._lure = null;
      caught._hooked = u;
      caught.stun = Math.max(caught.stun || 0, u.def.hookDelay + u.def.reelTime + 0.05);
      caught.el.classList.add('stunned', 'hooked');
      spawnDamageNumber(caught, '낚였다!', { crit: true });
    }
  } else if (b.phase === 'hooked') {
    const e = b.hooked;
    if (!e.alive) { removeBobber(u); return; }
    b.x = e.x; b.y = e.y;
    b.t -= dt;
    if (b.t <= 0) {
      const ang = Math.atan2(e.y - u.y, e.x - u.x), off = bodySeparation(u, e) + 2;
      b.phase = 'reel'; b.t = 0;
      b.sx = e.x; b.sy = e.y;
      b.ex = clamp(u.x + Math.cos(ang) * off, PHYS.WALL_PAD, MAP_W - PHYS.WALL_PAD);
      b.ey = clamp(u.y + Math.sin(ang) * off, PHYS.WALL_PAD, MAP_H - PHYS.WALL_PAD);
    }
  } else if (b.phase === 'reel') {
    const e = b.hooked;
    if (!e.alive) { removeBobber(u); return; }
    b.t += dt;
    const p = Math.min(1, b.t / u.def.reelTime);
    physSnap(e, b.sx + (b.ex - b.sx) * p, b.sy + (b.ey - b.sy) * p);
    b.x = e.x; b.y = e.y;
    if (p >= 1) {
      battleAPI.setBuff(e, 'fish-stew-atk', 'atk', -u.def.stewAtk, u.def.stewDuration);
      battleAPI.setBuff(e, 'fish-stew-speed', 'speed', -u.def.stewSpeed, u.def.stewDuration);
      e._stew = u.def.stewDuration;
      spawnDamageNumber(e, '🐟 생선조림', { crit: true });
      removeBobber(u);
      return;
    }
  }
  drawBobber(u);
}
// 낫: [힘줄 끊기]
function startTendonCut(u) {
  const foes = state.units.filter(e => e.alive && !e.isCastle && isHostile(u, e) && sameRealm(u, e));
  if (!foes.length) return false;
  u._tendon = { t: u.def.tendonWindup };
  u.el.classList.add('tendon-windup');
  return true;
}
function finishTendonCut(u) {
  u._tendon = null;
  u.el.classList.remove('tendon-windup');
  const foes = state.units.filter(e => e.alive && !e.isCastle && isHostile(u, e) && sameRealm(u, e));
  const target = foes[Math.floor(Math.random() * foes.length)];
  if (!target) return;
  const ang = Math.random() * Math.PI * 2, off = bodySeparation(u, target) + 2;
  spawnBurst(u.el, u.def.color);
  physSnap(u, clamp(target.x + Math.cos(ang) * off, PHYS.WALL_PAD, MAP_W - PHYS.WALL_PAD), clamp(target.y + Math.sin(ang) * off, PHYS.WALL_PAD, MAP_H - PHYS.WALL_PAD));
  const radius = u.def.tendonRadius * WORLD_SCALE;
  blastEffect(u.x, u.y, radius, u.def.color);
  spawnDamageNumber(u, '힘줄 끊기', { crit: true });
  state.units.slice().forEach(e => {
    if (!e.alive || e.isCastle || !isHostile(u, e) || !sameRealm(u, e)) return;
    if (Math.hypot(e.x - u.x, e.y - u.y) > radius + unitRadius(e)) return;
    if (!dealDamage(u, e, u.def.atk * u.def.tendonDmgRatio, { isSkill: true }) || !e.alive) return;
    applyLaceration(e, u.def.debuffDuration, u.def.lacerateFraction);
    applyFatalWound(e, u.def.debuffDuration);
    applySilence(e, u.def.debuffDuration);
  });
  u.atkCooldown = Math.min(u.atkCooldown, 0.4);
}
// [절상]: 최대 체력이 (1 - fraction) 배가 된다. 체력바 끝부분은 검은색으로 잘려 보인다. 끝나면 최대 체력만 돌아온다.
function applyLaceration(e, duration, fraction) {
  if (e._lacer) { e._lacer.t = Math.max(e._lacer.t, duration); return; }
  const keep = 1 - fraction;
  e.maxHp = e.maxHp * keep;
  e.hp = Math.min(e.hp, e.maxHp);
  e._lacer = { t: duration, keep };
  e.el.classList.add('lacerated');
  e.el.style.setProperty('--lacer-cut', (fraction * 100) + '%');
  updateUnitBars(e);
}
function endLaceration(e) {
  e.maxHp = e.maxHp / e._lacer.keep;
  e._lacer = null;
  e.el.classList.remove('lacerated');
  updateUnitBars(e);
}
// [침묵]: 스킬 쿨타임(…Cd/Cooldown/Timer/Cycle/Delay)과 타격 게이지(…Gauge/Hits/Count/Stack)를 그 자리에 묶는다.
// 체력·쉴드·일반 공격 쿨타임(atkCooldown)·디버프 타이머는 그대로 흐른다.
const SILENCE_COUNTDOWN = /(Cd|Cooldown|Timer|Cycle|Delay)$/;
const SILENCE_COUNTUP = /(Gauge|Hits|Count|Stacks?)$/;
const SILENCE_SKIP = new Set(['atkCooldown']);
function applySilence(e, duration) {
  if (e._silence) { e._silence.t = Math.max(e._silence.t, duration); return; }
  const held = {};
  for (const key of Object.keys(e)) {
    const v = e[key];
    if (typeof v !== 'number' || SILENCE_SKIP.has(key)) continue;
    // 줄어드는 쿨타임은 최소 0.5초로 붙잡아 이번 틱에 발동하지 않게 하고, 쌓이는 게이지는 0으로 붙잡아 차오르지 않게 한다
    if (SILENCE_COUNTDOWN.test(key)) held[key] = { orig: v, hold: Math.max(v, 0.5) };
    else if (SILENCE_COUNTUP.test(key)) held[key] = { orig: v, hold: 0 };
  }
  e._silence = { t: duration, held };
  e.el.classList.add('silenced');
  holdSilence(e);
}
function holdSilence(e) {
  for (const key in e._silence.held) e[key] = e._silence.held[key].hold;
}
function endSilence(e) {
  for (const key in e._silence.held) e[key] = e._silence.held[key].orig; // 멈췄던 곳에서 다시 흐른다
  e._silence = null;
  e.el.classList.remove('silenced');
}
function tickNew70b(u, dt) {
  if (!u.alive) return;
  if (u._gtPending) { u._gtPending = false; gtInstallTurbo(u); }
  if (u._turbo > 0) { u._turbo -= dt; if (u._turbo <= 0) { u._turbo = 0; u.el.classList.remove('turbo'); } }
  if (u._fatal > 0) { u._fatal -= dt; if (u._fatal <= 0) { u._fatal = 0; u.el.classList.remove('fatal-wound'); } }
  if (u._stew > 0) u._stew = Math.max(0, u._stew - dt);
  if (u._lure) { u._lure.t -= dt; if (u._lure.t <= 0) u._lure = null; }
  if (u._lacer) { u._lacer.t -= dt; if (u._lacer.t <= 0) endLaceration(u); }
  if (u._silence) { u._silence.t -= dt; if (u._silence.t <= 0) endSilence(u); }
  if (u.charId === 'fishing') {
    if (u._fishCast > 0) { u._fishCast -= dt; if (u._fishCast <= 0) { u._fishCast = 0; castBobber(u); } }
    if (u._bobber) tickBobber(u, dt);
  }
  if (u.charId === 'scythe') {
    if (u._tendon) { u._tendon.t -= dt; if (u._tendon.t <= 0) { finishTendonCut(u); u._scytheCd = u.def.tendonCooldown; } }
    else {
      u._scytheCd = (u._scytheCd ?? u.def.tendonFirst) - dt; // 시전 중에는 줄지 않는다
      if (u._scytheCd <= 0 && !startTendonCut(u)) u._scytheCd = 0;
    }
  }
}
"""

CSS = r"""/* ===== 7.0 신규: GT · 가시 · 낚시 · 낫 ===== */
.unit.turbo { box-shadow: 0 0 0 3px rgba(255,120,30,.85), 0 0 18px rgba(255,80,20,.9); }
.unit.turbo::before { content:'🔥'; position:absolute; right:-6px; bottom:-4px; font-size:16px; animation:turbo-flame .18s steps(2) infinite; pointer-events:none; z-index:7; }
@keyframes turbo-flame { from { transform:scale(1) translateX(0); } to { transform:scale(1.25) translateX(3px); } }
.fx-thorn { position:absolute; transform-origin:0 50%; pointer-events:none; z-index:8; border-radius:0 40px 40px 0; background:linear-gradient(90deg, rgba(63,143,58,.15), rgba(63,143,58,.8) 70%, rgba(255,60,60,.9)); box-shadow:0 0 10px rgba(63,143,58,.8); }
.unit.fatal-wound { box-shadow: 0 0 0 3px rgba(200,0,0,.9), 0 0 14px rgba(255,0,0,.8); }
.fx-bobber { position:absolute; width:14px; height:14px; margin:-7px 0 0 -7px; border-radius:50%; background:linear-gradient(180deg,#e63946 50%,#fff 50%); border:2px solid #222; z-index:9; pointer-events:none; animation:bobber-bob 1s ease-in-out infinite; }
@keyframes bobber-bob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(3px); } }
.fx-bobber-ring { position:absolute; transform:translate(-50%,-50%); border-radius:50%; border:2px dashed rgba(42,127,184,.6); background:rgba(42,127,184,.08); pointer-events:none; z-index:2; }
.fx-fishline { position:absolute; height:1.5px; background:rgba(30,30,30,.75); transform-origin:0 50%; pointer-events:none; z-index:8; }
.unit.hooked { box-shadow: 0 0 0 3px rgba(42,127,184,.9), 0 0 14px rgba(42,127,184,.8); }
.unit.tendon-windup { box-shadow: 0 0 0 4px rgba(91,75,138,.9), 0 0 22px rgba(91,75,138,.9); }
/* [절상]: 체력바 끝 25%를 검은색으로 잘라 보여준다 */
.unit.lacerated .unit-hpbar-track { position:relative; }
.unit.lacerated .unit-hpbar-track::after { content:''; position:absolute; top:0; right:0; bottom:0; width:var(--lacer-cut, 25%); background:repeating-linear-gradient(135deg,#000 0 2px,#3a3a3a 2px 4px); border-left:1.5px solid #fff; box-sizing:border-box; }
/* [침묵]: 스킬 게이지를 흑백으로 바꾸고 가운데에 🚫 */
.unit.silenced .unit-cdbar-wrap, .unit.silenced .edge-gauge, .unit.silenced .rr-mag, .unit.silenced .calling-card { filter:grayscale(1) brightness(.85); }
.unit.silenced::after { content:'🚫'; position:absolute; left:50%; bottom:-24px; transform:translateX(-50%); font-size:13px; line-height:1; z-index:8; pointer-events:none; filter:drop-shadow(0 0 2px #fff); }
.unit.silenced.has-shield::after { bottom:-28px; }
"""

STATUS_ICONS = r"""  if (u._turbo > 0) html += '<span>🏎️</span>';
  if (u._fatal > 0) html += '<span>🩸</span>';
  if (u._lacer) html += '<span>✂️</span>';
  if (u._silence) html += '<span>🚫</span>';
  if (u._stew > 0) html += '<span>🐟</span>';
  if (u._hooked) html += '<span>🎣</span>';
"""

STAT_LABELS = r"""  turboCells:['터보엔진 이동속도 증가','칸'], turboDuration:['터보엔진 지속','s'],
  thornTipCells:['끝 사거리 판정','칸'], fatalDuration:['치명상 지속','s'],
  lureRadius:['찌 유인 반경','칸'], hookDelay:['낚인 뒤 당기기까지','s'], stewDuration:['생선조림 지속','s'],
  tendonFirst:['힘줄 끊기 첫 사용','s'], tendonCooldown:['힘줄 끊기 쿨타임','s'], tendonRadius:['힘줄 끊기 반경','칸'], tendonDmgRatio:['힘줄 끊기 피해 (공격력)','%'], debuffDuration:['절상·치명상·침묵 지속','s'],
"""

# (제목, 앵커, 위치, 코드)
EDITS = [
    ('CHARACTER_BALANCE 맨 앞에 수치 추가', 'const CHARACTER_BALANCE = {\n', 'after', BALANCE),
    ('CHAR_DB 맨 앞에 캐릭터 추가', 'const CHAR_DB = {\n', 'after', CHARS),
    ('readyRoundSkills: 라운드 준비', "  if (u.charId === 'egg') u._eggCd = u.def.eggShakeEvery || 1;\n", 'after', READY),
    ('statusAndTimers: 매 틱 처리 호출 (tickNewJihooSkills 바로 다음)', "  tickNewJihooSkills(u, dt);\n", 'after', TICK_CALL),
    ('신규 함수 (tickNewJihooSkills 정의 바로 앞)', "function tickNewJihooSkills(u, dt) {\n", 'before', FUNCTIONS),
    ('aiSteerAndAttack: 힘줄 끊기 준비 중에는 멈춘다', "  if (u._flight || u._leap) return;\n  if (u._awakening != null) {\n", 'replace',
     "  if (u._flight || u._leap) return;\n  if (u._tendon) { u.desVx = 0; u.desVy = 0; u.physLock = 0; clearTelegraph(u); return; } // 7.0 낫: [힘줄 끊기] 준비\n  if (u._awakening != null) {\n"),
    ('physIntegrate: 찌로 끌려가는 조향 (최면 블록 바로 다음)', "  let desX = frozen || (stunned && !hypno) ? 0 : (u.desVx || 0);\n", 'before',
     "  // 7.0 낚시: 찌 반경 안의 적은 찌 쪽으로 끌려간다 (행동불능이 아닐 때)\n  if (u._lure && !stunned && !frozen) {\n    const toLure = Math.atan2(u._lure.y - u.y, u._lure.x - u.x);\n    u.desVx = Math.cos(toLure) * (u.def.speed || 80);\n    u.desVy = Math.sin(toLure) * (u.def.speed || 80);\n  }\n"),
    ('dealDamage: [치명상]·확정 치명타', "  const critHit = amount > 0 && Math.random() < critChanceOf(caster);\n", 'replace',
     "  const critHit = amount > 0 && (opts.forceCrit || target._fatal > 0 || Math.random() < critChanceOf(caster)); // 7.0 가시·낫: 확정 치명타 · [치명상]\n"),
    ('applyDamageRaw: [치명상]', "  const critHit = amount > 0 && !(source && source.side === 'enemy' && tutMatch()) && Math.random() < CRIT_CHANCE;\n", 'replace',
     "  const critHit = amount > 0 && (target._fatal > 0 || (!(source && source.side === 'enemy' && tutMatch()) && Math.random() < CRIT_CHANCE)); // 7.0 [치명상]\n"),
    ('updateUnitBars: [절상] 중에는 원래 최대 체력 기준으로 그린다',
     "  if (b.hp) setBarVal(b, 'hp', Math.round(clamp(u.hp / u.maxHp * 100, 0, 100) * 4) / 4, v => { b.hp.style.width = v + '%'; });\n", 'replace',
     "  const fullMax = u._lacer ? u.maxHp / u._lacer.keep : u.maxHp; // 7.0 [절상]: 잘린 부분은 CSS 로 검게\n  if (b.hp) setBarVal(b, 'hp', Math.round(clamp(u.hp / fullMax * 100, 0, 100) * 4) / 4, v => { b.hp.style.width = v + '%'; });\n"),
    ('메인 루프: [침묵] 게이지 고정 (statusAndTimers 직후)', "      statusAndTimers(su, dt);\n", 'replace',
     "      statusAndTimers(su, dt);\n      if (su._silence) holdSilence(su); // 7.0 [침묵]\n"),
    ('메인 루프: [침묵] 게이지 고정 (aiSteerAndAttack 직후)', "    if (units[i].alive && !units[i].isCastle) aiSteerAndAttack(units[i], dt);\n", 'replace',
     "    if (units[i].alive && !units[i].isCastle) { aiSteerAndAttack(units[i], dt); if (units[i]._silence) holdSilence(units[i]); } // 7.0 [침묵]\n"),
    ('skillCdInfo: 낫 쿨타임 바', "  if (u.charId === 'reaper') return null;\n", 'after',
     "  if (u.charId === 'scythe') return { cur: Math.max(0, u._scytheCd ?? u.def.tendonFirst), max: u.def.tendonCooldown };\n"),
    ('updateStatusIcons: 상태 아이콘', "  if (u.trueForm) html += '<span>✨</span>';\n", 'after', STATUS_ICONS),
    ('상세 정보 고유 수치 라벨', "  burnDps:['화상 초당 피해'], burnDuration:['화상 지속','s'],\n", 'before', STAT_LABELS),
]
