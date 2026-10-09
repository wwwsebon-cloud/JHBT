# 인계 문서 — 7.0 신규 지후 4종 (GT · 가시 · 낚시 · 낫)

- 작성: 2026-10-08 · 연습용 브랜치 `claude/jihu-battle-game-x2mw2a`
- 기준 코드: main `05814e0` (7.0, 초상화 업로드 커밋). `index.html` 은 이 문서 커밋에서 **바꾸지 않았다**.
- 대상: 메인 에이전트. 이 문서만 보고 그대로 넣을 수 있게 썼다. 아래 코드는 실제로 게임에 적용해 미리보기 전투로 검증한 것과 **같은 파일(`snippets.py`)에서 생성**했다.

## 0. 빠르게 넣기

같은 폴더의 스크립트가 아래 3장의 수정을 그대로 적용한다. 앵커 문자열이 정확히 1번 나와야만 적용하고, 아니면 멈춘다.

```bash
python3 -I newjihu/handoff/7.0-gt-thorn-fishing-scythe/apply.py .
```

- 넣은 뒤 할 일: `PATCH_NOTES` 항목 추가(6장 초안), 필요하면 버전 올리기. 덱·뽑기·도감은 `CHAR_DB` 에 넣는 것만으로 자동으로 잡힌다.
- main 이 더 진행돼 앵커가 바뀌었으면, 3장의 표를 보고 손으로 같은 자리에 넣으면 된다.

## 1. 스펙 요약

| 지후 | id | 등급·역할 | HP / ATK / 공격 간격 / 사거리 / 이동 | 핵심 |
|---|---|---|---|---|
| GT 지후 | `gt` | 전설 · 서포터 · 출격제한 1 | 2000 / 200 / 1s / 3칸 / 1.7칸 | 바로 앞 칸 아군에게 터보엔진: 라운드 시작 5초간 이동속도 +5칸. 달아 준 라운드엔 스킬 초상화 |
| 가시 지후 | `thorn` | 희귀 · 딜러 | 2550 / 270 / 1s / 2.2칸 / 2칸 | 앞 2.2칸 직사각형 관통. 끝 사거리 적중 = 확정 치명타 + [치명상] 0.6초 |
| 낚시 지후 | `fishing` | 전설 · 컨트롤러 | 2490 / 380 / 0.75s / 근접 부채꼴 1칸·120° / 이동 안 함 | 라운드 시작에 적진 무작위 위치로 찌. 반경 3칸 적을 끌어당겨 먼저 닿은 적을 낚음 → 1초 뒤 바로 앞까지 당기고 [생선조림] 6초 |
| 낫 지후 | `scythe` | 영웅 · 컨트롤러 | 3440 / 744 / 2.7s / 근접 부채꼴 1.65칸·120° / 1.15칸 | 5초 뒤부터 8초마다 [힘줄 끊기]: 0.5초 멈춤 → 무작위 적 곁 순간이동 → 반경 1.65칸 75% 피해 + [절상]·[치명상]·[침묵] 4초 |

### 새 상태이상 (다른 지후도 쓸 수 있게 공용으로 만듦)

| 이름 | 필드 | 효과 | 표시 |
|---|---|---|---|
| [치명상] | `u._fatal` (남은 초) | 받는 모든 피해가 확정 치명타 (`dealDamage`·`applyDamageRaw`) | 빨간 테두리, 🩸 |
| [절상] | `u._lacer = { t, keep }` | 최대 체력 × 0.75. 끝나면 최대 체력만 원래대로 (현재 체력은 그대로) | 체력바 끝 25%를 검은 빗금 + 흰 절단선, ✂️ |
| [침묵] | `u._silence = { t, held }` | 스킬 쿨타임·타격 게이지를 걸린 순간 값으로 고정, 끝나면 그 값에서 다시 흐름 | 쿨타임 바·게이지 흑백 + 🚫, 상태 🚫 |
| [생선조림] | 버프 `fish-stew-atk/speed` + `u._stew` | 공격력 −50%, 이동속도 −50% (기존 `setBuff`) | 📉 🐢 🐟 |
| 터보엔진 | 버프 `gt-turbo` + `u._turbo` | 이동속도 +5칸/초 (`setBuff` speed 배율로 환산) | 주황 테두리 + 🔥, 🏎️ |

### [침묵] 동작 방식 (중요)
- 걸리는 순간 유닛의 **숫자 필드 중 이름이 규칙에 맞는 것**을 모아 고정한다.
  - 줄어드는 쿨타임: 이름이 `Cd|Cooldown|Timer|Cycle|Delay` 로 끝남 → `max(원래 값, 0.5)` 로 고정 (이번 틱에 0 을 넘어 발동하지 않게)
  - 쌓이는 게이지: 이름이 `Gauge|Hits|Count|Stack(s)` 로 끝남 → `0` 으로 고정 (차올라 발동하지 않게)
  - 제외: `atkCooldown`(일반 공격), 체력·쉴드, 디버프 타이머(`…Remaining`, `_fatal` 등)
- 메인 루프에서 `statusAndTimers` 직후와 `aiSteerAndAttack` 직후에 `holdSilence` 로 고정값을 다시 써 넣는다.
- 끝나면 원래 값으로 되돌려 **멈췄던 지점부터** 다시 흐른다.
- 한계: `u._rr.t`, `u._feast.t` 처럼 **객체 안에 든 타이머**는 잡지 않는다. 새 지후를 만들 때 쿨타임 필드 이름을 위 규칙(`_xxxCd` 등)으로 지으면 자동으로 침묵된다.

## 2. 초상화

`PORTRAITS` 맨 앞에 base64 로 넣는다. 원본은 `newjihu/7.0newjihgu/` (모두 400×400 PNG). `apply.py` 가 자동으로 넣는다.

| 키 | 파일 |
|---|---|
| `gt` | `GT 지후.PNG` |
| `gt_turbo` | `GT지후(스킬 발동이후).PNG` |
| `thorn` | `가시 지후.PNG` |
| `fishing` | `낚시 지후.PNG` |
| `scythe` | `낫 지후.PNG` |

`CHAR_DB` 는 `PORTRAITS.gt || jhPlaceholder(...)` 형태라 초상화 없이 넣어도 이모지 임시 초상화로 돌아간다.

## 3. 수정 위치별 코드

각 항목은 `index.html` 에서 **앵커 문자열을 찾아** 그 앞/뒤에 넣거나(before/after) 앵커를 바꾼다(replace). 앵커는 7.0 기준으로 모두 정확히 1번 나온다.

| # | 내용 | 위치 |
|---|---|---|
| 1 | CHARACTER_BALANCE 맨 앞에 수치 추가 | after |
| 2 | CHAR_DB 맨 앞에 캐릭터 추가 | after |
| 3 | readyRoundSkills: 라운드 준비 | after |
| 4 | statusAndTimers: 매 틱 처리 호출 (tickNewJihooSkills 바로 다음) | after |
| 5 | 신규 함수 (tickNewJihooSkills 정의 바로 앞) | before |
| 6 | aiSteerAndAttack: 힘줄 끊기 준비 중에는 멈춘다 | replace |
| 7 | physIntegrate: 찌로 끌려가는 조향 (최면 블록 바로 다음) | before |
| 8 | dealDamage: [치명상]·확정 치명타 | replace |
| 9 | applyDamageRaw: [치명상] | replace |
| 10 | updateUnitBars: [절상] 중에는 원래 최대 체력 기준으로 그린다 | replace |
| 11 | 메인 루프: [침묵] 게이지 고정 (statusAndTimers 직후) | replace |
| 12 | 메인 루프: [침묵] 게이지 고정 (aiSteerAndAttack 직후) | replace |
| 13 | skillCdInfo: 낫 쿨타임 바 | after |
| 14 | updateStatusIcons: 상태 아이콘 | after |
| 15 | 상세 정보 고유 수치 라벨 | before |
| 16 | CSS | before |

### 3.1 CHARACTER_BALANCE 맨 앞에 수치 추가

앵커 바로 뒤에 넣기. 앵커:

```js
const CHARACTER_BALANCE = {
```
코드:

```js
  // ===== 7.0 신규: GT · 가시 · 낚시 · 낫 (px 수치는 45px 격자 기준, 1칸 = 45) =====
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
```

### 3.2 CHAR_DB 맨 앞에 캐릭터 추가

앵커 바로 뒤에 넣기. 앵커:

```js
const CHAR_DB = {
```
코드:

```js
  // ===== 7.0 신규: GT · 가시 · 낚시 · 낫 =====
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
```

### 3.3 readyRoundSkills: 라운드 준비

앵커 바로 뒤에 넣기. 앵커:

```js
  if (u.charId === 'egg') u._eggCd = u.def.eggShakeEvery || 1;
```
코드:

```js
  // 7.0 GT · 낚시 · 낫
  if (u.charId === 'gt') u._gtPending = true; // 모든 유닛 준비가 끝난 뒤 첫 틱에 앞칸을 본다
  if (u.charId === 'fishing') { removeBobber(u); u._fishCast = 0.2; }
  if (u.charId === 'scythe') { u._scytheCd = u.def.tendonFirst; u._tendon = null; }
```

### 3.4 statusAndTimers: 매 틱 처리 호출 (tickNewJihooSkills 바로 다음)

앵커 바로 뒤에 넣기. 앵커:

```js
  tickNewJihooSkills(u, dt);
```
코드:

```js
  tickNew70b(u, dt); // 7.0 GT · 가시 · 낚시 · 낫 + [치명상]·[절상]·[침묵]·[생선조림]
```

### 3.5 신규 함수 (tickNewJihooSkills 정의 바로 앞)

앵커 바로 앞에 넣기. 앵커:

```js
function tickNewJihooSkills(u, dt) {
```
코드:

```js
// ===== 7.0 신규: GT · 가시 · 낚시 · 낫 =====
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
```

### 3.6 aiSteerAndAttack: 힘줄 끊기 준비 중에는 멈춘다

앵커를 아래로 바꾸기. 앵커:

```js
  if (u._flight || u._leap) return;
  if (u._awakening != null) {
```
코드:

```js
  if (u._flight || u._leap) return;
  if (u._tendon) { u.desVx = 0; u.desVy = 0; u.physLock = 0; clearTelegraph(u); return; } // 7.0 낫: [힘줄 끊기] 준비
  if (u._awakening != null) {
```

### 3.7 physIntegrate: 찌로 끌려가는 조향 (최면 블록 바로 다음)

앵커 바로 앞에 넣기. 앵커:

```js
  let desX = frozen || (stunned && !hypno) ? 0 : (u.desVx || 0);
```
코드:

```js
  // 7.0 낚시: 찌 반경 안의 적은 찌 쪽으로 끌려간다 (행동불능이 아닐 때)
  if (u._lure && !stunned && !frozen) {
    const toLure = Math.atan2(u._lure.y - u.y, u._lure.x - u.x);
    u.desVx = Math.cos(toLure) * (u.def.speed || 80);
    u.desVy = Math.sin(toLure) * (u.def.speed || 80);
  }
```

### 3.8 dealDamage: [치명상]·확정 치명타

앵커를 아래로 바꾸기. 앵커:

```js
  const critHit = amount > 0 && Math.random() < critChanceOf(caster);
```
코드:

```js
  const critHit = amount > 0 && (opts.forceCrit || target._fatal > 0 || Math.random() < critChanceOf(caster)); // 7.0 가시·낫: 확정 치명타 · [치명상]
```

### 3.9 applyDamageRaw: [치명상]

앵커를 아래로 바꾸기. 앵커:

```js
  const critHit = amount > 0 && !(source && source.side === 'enemy' && tutMatch()) && Math.random() < CRIT_CHANCE;
```
코드:

```js
  const critHit = amount > 0 && (target._fatal > 0 || (!(source && source.side === 'enemy' && tutMatch()) && Math.random() < CRIT_CHANCE)); // 7.0 [치명상]
```

### 3.10 updateUnitBars: [절상] 중에는 원래 최대 체력 기준으로 그린다

앵커를 아래로 바꾸기. 앵커:

```js
  if (b.hp) setBarVal(b, 'hp', Math.round(clamp(u.hp / u.maxHp * 100, 0, 100) * 4) / 4, v => { b.hp.style.width = v + '%'; });
```
코드:

```js
  const fullMax = u._lacer ? u.maxHp / u._lacer.keep : u.maxHp; // 7.0 [절상]: 잘린 부분은 CSS 로 검게
  if (b.hp) setBarVal(b, 'hp', Math.round(clamp(u.hp / fullMax * 100, 0, 100) * 4) / 4, v => { b.hp.style.width = v + '%'; });
```

### 3.11 메인 루프: [침묵] 게이지 고정 (statusAndTimers 직후)

앵커를 아래로 바꾸기. 앵커:

```js
      statusAndTimers(su, dt);
```
코드:

```js
      statusAndTimers(su, dt);
      if (su._silence) holdSilence(su); // 7.0 [침묵]
```

### 3.12 메인 루프: [침묵] 게이지 고정 (aiSteerAndAttack 직후)

앵커를 아래로 바꾸기. 앵커:

```js
    if (units[i].alive && !units[i].isCastle) aiSteerAndAttack(units[i], dt);
```
코드:

```js
    if (units[i].alive && !units[i].isCastle) { aiSteerAndAttack(units[i], dt); if (units[i]._silence) holdSilence(units[i]); } // 7.0 [침묵]
```

### 3.13 skillCdInfo: 낫 쿨타임 바

앵커 바로 뒤에 넣기. 앵커:

```js
  if (u.charId === 'reaper') return null;
```
코드:

```js
  if (u.charId === 'scythe') return { cur: Math.max(0, u._scytheCd ?? u.def.tendonFirst), max: u.def.tendonCooldown };
```

### 3.14 updateStatusIcons: 상태 아이콘

앵커 바로 뒤에 넣기. 앵커:

```js
  if (u.trueForm) html += '<span>✨</span>';
```
코드:

```js
  if (u._turbo > 0) html += '<span>🏎️</span>';
  if (u._fatal > 0) html += '<span>🩸</span>';
  if (u._lacer) html += '<span>✂️</span>';
  if (u._silence) html += '<span>🚫</span>';
  if (u._stew > 0) html += '<span>🐟</span>';
  if (u._hooked) html += '<span>🎣</span>';
```

### 3.15 상세 정보 고유 수치 라벨

앵커 바로 앞에 넣기. 앵커:

```js
  burnDps:['화상 초당 피해'], burnDuration:['화상 지속','s'],
```
코드:

```js
  turboCells:['터보엔진 이동속도 증가','칸'], turboDuration:['터보엔진 지속','s'],
  thornTipCells:['끝 사거리 판정','칸'], fatalDuration:['치명상 지속','s'],
  lureRadius:['찌 유인 반경','칸'], hookDelay:['낚인 뒤 당기기까지','s'], stewDuration:['생선조림 지속','s'],
  tendonFirst:['힘줄 끊기 첫 사용','s'], tendonCooldown:['힘줄 끊기 쿨타임','s'], tendonRadius:['힘줄 끊기 반경','칸'], tendonDmgRatio:['힘줄 끊기 피해 (공격력)','%'], debuffDuration:['절상·치명상·침묵 지속','s'],
```

### 3.16 CSS

앵커 바로 앞에 넣기. 앵커:

```css
.unit .unit-hpbar-wrap {
```
코드:

```css
/* ===== 7.0 신규: GT · 가시 · 낚시 · 낫 ===== */
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
```

## 4. 검증 결과 (미리보기 전투 · 직접 호출 테스트)

| 항목 | 결과 |
|---|---|
| 페이지 오류 | 4종 모두 미리보기에서 JS 오류 없음 (Firebase 네트워크 오류는 테스트 환경 탓) |
| GT | 앞 칸(1칸)에 둔 힐 지후 이동속도 2.22 → **7.22칸/초** (+5). 동서 배치에서 아군 앞 방향 = −x 확인. GT 초상화가 스킬 초상화로 바뀜 |
| 가시 | 끝 사거리 적중이 **💥540** (270 × 2 확정 치명타), 대상에 `fatal-wound` |
| 낚시 | 🎣 휙! → 낚였다!(행동불능) → 1초 뒤 당겨서 바로 앞 → 🐟 생선조림 순서 확인 |
| 낫 | 5초 뒤 힘줄 끊기: 멈춤 → 순간이동 → 💥1488(744×0.75×2, 치명상 적용) → 대상에 절상·치명상·침묵 |
| [침묵] | 쿨타임 3초 필드가 4초 동안 3에 고정, 게이지 4 → 0 고정, 끝난 뒤 3 / 4 로 복귀 |
| [절상] | 최대 체력 2000 → 1500 (체력도 1500으로 깎임), 4초 뒤 최대 체력 2000 복귀 · 체력 1500 유지 |
| 표시 | 절상 빗금·절단선, 침묵 흑백 쿨타임 바 + 🚫, 상태 아이콘 ✂️ 🚫 🩸 🐟 🏎️ 확인 |

## 5. 스펙 해석으로 정한 부분 (사장님 확인 필요)

1. **GT "바로 앞 칸"**: 상대 진영 쪽으로 0.4~1.6칸, 옆으로 0.6칸 안의 아군 중 정확히 1칸 앞에 가장 가까운 지후 1기. 동서 배치는 x축, 남북 배치는 y축, 경매(여러 진영)는 맵 중앙 방향. 라운드마다 다시 판정한다.
2. **GT 터보 +5.0**: 이동속도 **+5칸/초**로 해석 (기존 `setBuff` 배율로 환산). 이동하지 않는 지후(속도 0)에게는 효과 없음.
3. **가시 직사각형 폭** = 가시 지후 몸 지름. **"끝 사거리"** = 직사각형의 마지막 **0.5칸** 안에 몸이 걸린 적 (`thornTipCells`). 보통 공격 대상이 여기에 들어간다.
4. **가시는 `isMelee: false`**: 근접 부채꼴 예고가 뜨지 않게 하려고. 2.2칸 거리에서 멈춰 찌른다.
5. **낚시 찌**: 라운드마다 1번, 시작 0.2초 뒤. 유인 시간 제한 없음 (아무도 안 오면 라운드 끝까지 떠 있음). 낚인 적은 1초 + 당기기 0.4초 동안 행동불능. 낚시 지후가 죽으면 찌가 사라지고 낚인 적은 풀려난다.
6. **낫 [치명상] 지속**: 스펙에 절상·침묵만 4초라고 있어서 **치명상도 4초**로 맞췄다 (가시의 치명상은 0.6초). 강하면 `debuffDuration` 과 따로 떼면 된다.
7. **낫 순간이동 위치**: 고른 적 바로 옆 무작위 방향. 범위 중심은 순간이동한 낫 지후 자신.
8. **[절상] 중 레벨업 등으로 최대 체력이 다시 계산되면**, 끝날 때 나누기 0.75 를 하므로 조금 커질 수 있다. 실전에서는 드물다.

## 6. 패치노트 초안 (`PATCH_NOTES` 새 버전의 `신규 지후` 섹션)

```js
{ emoji:'🏎️', name:'GT 지후', tag:'new', color:'#e63946', portraitKey:'gt', desc:'전설 · 서포터 · 출격제한 1. 바로 앞 칸의 아군에게 <b>터보엔진</b>을 달아 라운드 시작 <b>5초</b>간 이동속도 <b>+5칸</b>.' },
{ emoji:'🌵', name:'가시 지후', tag:'new', color:'#3f8f3a', portraitKey:'thorn', desc:'희귀 · 딜러. 앞 <b>2.2칸</b>을 관통해 찌르고, 끝에 맞은 적은 <b>확정 치명타</b>와 <b>[치명상]</b>(받는 피해 모두 치명타) 0.6초.' },
{ emoji:'🎣', name:'낚시 지후', tag:'new', color:'#2a7fb8', portraitKey:'fishing', desc:'전설 · 컨트롤러. 적진에 찌를 던져 반경 3칸의 적을 끌어모으고, 낚은 적을 바로 앞까지 당겨 <b>[생선조림]</b>(공격력·이동속도 −50%) 6초.' },
{ emoji:'🪓', name:'낫 지후', tag:'new', color:'#5b4b8a', portraitKey:'scythe', desc:'영웅 · 컨트롤러. 8초마다 <b>[힘줄 끊기]</b>: 무작위 적 곁으로 순간이동해 범위 피해와 <b>[절상]</b>·<b>[치명상]</b>·<b>[침묵]</b> 4초.' },
```
