# 인계 문서 2 — 신화 등급 + 신규 지후 6종 (눈덩이 · 늑대 · 드림스케이프 · 락 · 리콜 · 마녀)

- 작성: 2026-10-08 · 연습용 브랜치 `claude/jihu-battle-game-x2mw2a`
- 기준 코드: main `05814e0` (7.0) **+ 1차 인계(`../7.0-gt-thorn-fishing-scythe`) 적용 후**. 1차가 만든 함수·줄을 앵커로 쓰므로 순서를 지켜야 한다.
- `index.html` 은 이 커밋에서 바꾸지 않았다. 아래 코드는 실제로 1차 + 2차를 적용해 검증한 것과 같은 파일(`snippets.py`)에서 생성했다.

## 0. 빠르게 넣기

```bash
python3 -I newjihu/handoff/7.0-gt-thorn-fishing-scythe/apply.py .   # 1차 (아직 안 넣었다면)
python3 -I newjihu/handoff/7.0-mythic-snowball-wolf-dreamscape-rock-recall-witch/apply.py .   # 2차
```

- 1차가 없으면 2차 스크립트가 멈추고 안내한다. 앵커가 정확히 1번(정렬 순서 줄은 2번) 나와야만 적용한다.
- 넣은 뒤: `PATCH_NOTES`(6장 초안), 필요하면 버전 올리기.

## 1. 신화 등급 (`mythic`)

전설보다 희귀하고 히든보다 흔한 등급. 색 `#ff3b5c` (`--rarity-mythic`).

| 항목 | 값 |
|---|---|
| 1회 뽑기 | **0.5%** (일반 48.5 → 48%, 픽업 일반 48.2 → 47.7%) |
| 지후 상자 | 영웅 50% → 전설 50% → **신화 15%** (상자당 3.75%, 시뮬레이션 3.74%) |
| 천장 | 신화가 나와도 천장(80회) 초기화 |
| 연출 | 공개·대진 카드·티커는 **전설 연출을 그대로** 쓰고 색만 신화 색, 대진 카드 태그는 `MYTHIC` (`fxRarity()` 로 전설로 매핑) |
| 정렬·필터 | 전설과 히든 사이. 도감 필터에 `신화` 추가 |
| 기타 | 마일리지 30 · 등급 가중치 2.45 · 배치 링 색 · 처치 효과음 = 전설과 같게 |
| 넣지 않은 것 | 상점 매물, 확정권·조각(✦), 업적(신화 획득) — 필요하면 따로 |

## 2. 신규 지후 6종

`*` = 스펙에 없어서 제가 정한 값.

| 지후 | id | 등급·역할 | HP / ATK / 공격 간격 / 사거리 / 이동 | 핵심 |
|---|---|---|---|---|
| 눈덩이 지후 | `snowball` | 희귀 · 컨트롤러* | 1900* / 120 / 1s / 4칸* / 1.8칸* | 맞힐 때마다 눈덩이 1중첩(최대 3). 중첩당 이속 −20%(최대 −60%, 라운드 동안 유지). 3중첩인 적을 맞히면 1.8초 빙결 + 중첩 제거 |
| 늑대 지후 | `wolf` | 영웅* · 어쌔신* | 2330 / 150 / 1s* / 3칸* / 1.7칸 | 10번 공격 → [하울링](반경 5칸 아군 공속 +20% · 3초) → 0.5초 뒤 적진 후열로 순간이동, 풀회복 · HP 3830 · ATK 440 · 이속 2.7 · 공속 1s · 근접 · 공격마다 ATK 50% 회복 |
| 드림스케이프 지후 | `dreamscape` | 히든 · 컨트롤러 · 출격제한 1 | 4500 / 0* / – / 3칸 거리 유지* / 1.2칸* | 5초마다 반경 4칸 파동 → [ㅤㅤㅤ](이름이 공백 U+3164): 4초간 1초마다 최대 체력 10% 절단, 끝나면 [망각]: 체력 복구, 최대 체력은 이전의 80~100% |
| 락 지후 | `rockstar` | **신화** · 컨트롤러* | 3990 / 10 / 4s / 부채꼴 100°·7칸 / 1칸 | 맞힌 적에게 [일렉]: 쉴드 전부 제거·획득 불가. 다음 피격 때 그 적과 가장 가까운 같은 편에게 그 피해 50% 연쇄 |
| 리콜 지후 | `recall` | 전설 · 서포터* · 출격제한 2 | 2000* / 160* / 1.2s* / 4칸* / 1.5칸* | 배치 즉시 + 매 라운드: 덱의 무작위 지후를 Lv.1 로 상하좌우 빈 칸에 소환 |
| 마녀 지후 | `witch` | 전설* · 서포터* | 2400* / 180* / 1.2s* / 4칸* / 1.6칸* | 2.5초마다 포션(반경 0.7칸): 아군에 회복15%·공격력+20%·치명타+5%·치명타 피해+500%, 적에 500 피해·독·화상·개구리화. 체력 25% 미만이면 비장의 포션 |

> **id 주의**: `rock` 은 이미 **암석 지후**가 쓰고 있어 락 지후는 `rockstar` 로 했다 (초상화 키도 `PORTRAITS.rockstar`).

### 새 상태 · 효과

| 이름 | 필드 | 효과 | 표시 |
|---|---|---|---|
| 눈덩이 | `t._snowStacks`, `t._snowSlow`, 버프 `snowball-slow` | 위 표 | ❄️n |
| [ㅤㅤㅤ] | `t._dreams = [{ base, cut, hpLost, t, ticks, src }]` | 맞을 때마다 새 항목. 각 항목이 따로 절단·망각 | 보라 테두리, 체력바 절단(1차 [절상]과 같은 검은 빗금), 💭n |
| [일렉] | `t._elec` | 매 틱 쉴드(일반·흰·가드·티타늄) 0. 다음 피격(도트 제외) 때 연쇄 후 풀림. 연쇄 피해는 다시 연쇄하지 않음 | 깜빡이는 전기 테두리, ⚡ |
| 마녀 포션 | `_potCrit`, `_potCritDmg`(남은 초), 버프 `witch-atk` | 치명타 확률 +5%p, 치명타 배율 ×2 → ×7 | 🧪 |
| 비장의 포션 | `_witchDr`, 버프 `witch-secret-atk/speed`, 쉴드 | 라운드 끝까지 | 보라·분홍 테두리, 🧪 |
| 개구리화 | — | 그 자리에 같은 레벨 개구리 지후로 바꿈. 배치 기록은 그대로라 다음 라운드엔 원래 지후 | 🐸 개굴! |

## 3. 초상화

`PORTRAITS` 맨 앞에 base64 (원본 `newjihu/7.0newjihgu/`, 모두 400×400). `apply.py` 가 자동으로 넣는다.

| 키 | 파일 |
|---|---|
| `snowball` | `눈 지후.PNG` |
| `wolf` | `늑대 지후.PNG` |
| `dreamscape` | `드림스케이프 지후.PNG` |
| `rockstar` | `락 지후.PNG` |
| `recall` | `리콜 지후.PNG` |
| `witch` | `마녀 지후.PNG` |

## 4. 수정 위치별 코드

앵커를 찾아 앞(before)·뒤(after)에 넣거나 바꾼다(replace).

### 4.A 신화 등급

**A1. [신화] 등급 색 변수** — 앵커 바로 뒤에 넣기

앵커:

```js
  --rarity-legend: #f2c94c;
```

코드:

```js
  --rarity-mythic: #ff3b5c; /* 7.0 신화 */
```

**A2. [신화] .rarity-* 클래스** — 앵커 바로 뒤에 넣기

앵커:

```js
.rarity-common { --rc:var(--rarity-common); } .rarity-rare { --rc:var(--rarity-rare); } .rarity-epic { --rc:var(--rarity-epic); } .rarity-legend { --rc:var(--rarity-legend); }
```

코드:

```js
.rarity-mythic { --rc:var(--rarity-mythic); } /* 7.0 신화 */
```

**A3. [신화] 등급 이름** — 앵커를 아래로 바꾸기

앵커:

```js
const RARITY_LABEL = { common: '일반', rare: '희귀', epic: '영웅', legend: '전설', hidden: '히든' };
```

코드:

```js
const RARITY_LABEL = { common: '일반', rare: '희귀', epic: '영웅', legend: '전설', mythic: '신화', hidden: '히든' };
// 7.0 신화: 연출(번쩍임·카드 테두리 등)은 전설 것을 그대로 쓰고 색만 신화 색
function fxRarity(r) { return r === 'mythic' ? 'legend' : r; }
```

**A4. [신화] 등급 색** — 앵커를 아래로 바꾸기

앵커:

```js
  return { common: 'var(--rarity-common)', rare: 'var(--rarity-rare)', epic: 'var(--rarity-epic)', legend: 'var(--rarity-legend)', hidden: 'var(--rarity-hidden)' }[r];
```

코드:

```js
  return { common: 'var(--rarity-common)', rare: 'var(--rarity-rare)', epic: 'var(--rarity-epic)', legend: 'var(--rarity-legend)', mythic: 'var(--rarity-mythic)', hidden: 'var(--rarity-hidden)' }[r];
```

**A5. [신화] 영문 이름** — 앵커를 아래로 바꾸기

앵커:

```js
const V4_RARITY_EN = { common: 'COMMON', rare: 'RARE', epic: 'EPIC', legend: 'LEGEND', hidden: 'HIDDEN' };
```

코드:

```js
const V4_RARITY_EN = { common: 'COMMON', rare: 'RARE', epic: 'EPIC', legend: 'LEGEND', mythic: 'MYTHIC', hidden: 'HIDDEN' };
```

**A6. [신화] 1회 뽑기 확률 0.5% (일반에서 뺌)** — 앵커를 아래로 바꾸기

앵커:

```js
    ? [{rarity:'legend',weight:3.3},{rarity:'epic',weight:10},{rarity:'rare',weight:38.5},{rarity:'common',weight:48.2}]
    : [{rarity:'legend',weight:3},{rarity:'epic',weight:10},{rarity:'rare',weight:38.5},{rarity:'common',weight:48.5}]; // 4.4.1: 1회 뽑기에서는 히든이 나오지 않는다
```

코드:

```js
    ? [{rarity:'mythic',weight:0.5},{rarity:'legend',weight:3.3},{rarity:'epic',weight:10},{rarity:'rare',weight:38.5},{rarity:'common',weight:47.7}]
    : [{rarity:'mythic',weight:0.5},{rarity:'legend',weight:3},{rarity:'epic',weight:10},{rarity:'rare',weight:38.5},{rarity:'common',weight:48}]; // 4.4.1: 1회 뽑기에서는 히든이 나오지 않는다 · 7.0 신화 0.5%
```

**A7. [신화] 천장: 신화도 천장을 초기화** — 앵커를 아래로 바꾸기

앵커:

```js
  if (rarity === 'legend' || rarity === 'hidden') profile.gachaPity = 0;
```

코드:

```js
  if (rarity === 'legend' || rarity === 'mythic' || rarity === 'hidden') profile.gachaPity = 0;
```

**A8. [신화] 지후 상자: 전설 칸 성공 시 신화 15%** — 앵커를 아래로 바꾸기

앵커:

```js
const GACHA_BOX_STEPS = { normal: [['epic', 50], ['legend', 50]], pickup: [['epic', 50], ['legend', 50]] };
```

코드:

```js
const GACHA_BOX_STEPS = { normal: [['epic', 50], ['legend', 50], ['mythic', 15]], pickup: [['epic', 50], ['legend', 50], ['mythic', 15]] }; // 7.0 신화: 상자당 3.75%
```

**A9. [신화] 상자 천장** — 앵커를 아래로 바꾸기

앵커:

```js
  if (ids.some(id => ['legend', 'hidden'].includes(CHAR_DB[id]?.rarity))) profile.gachaPity = 0;
```

코드:

```js
  if (ids.some(id => ['legend', 'mythic', 'hidden'].includes(CHAR_DB[id]?.rarity))) profile.gachaPity = 0;
```

**A10. [신화] 정렬 순서 (뽑기)** — 앵커를 아래로 바꾸기

앵커:

```js
const GACHA_RARITY_ORDER = { common: 0, rare: 1, epic: 2, legend: 3, hidden: 4 };
```

코드:

```js
const GACHA_RARITY_ORDER = { common: 0, rare: 1, epic: 2, legend: 3, mythic: 4, hidden: 5 };
```

**A11. [신화] 확률표** — 앵커를 아래로 바꾸기

앵커:

```js
  const odds = [['hidden', '상자 1%'], ['legend', '3%'], ['epic', '10%'], ['rare', '38.5%'], ['common', '48.5%']];
```

코드:

```js
  const odds = [['hidden', '상자 1%'], ['mythic', '0.5% · 상자 3.75%'], ['legend', '3%'], ['epic', '10%'], ['rare', '38.5%'], ['common', '48%']];
```

**A12. [신화] 확률표 목록 순서** — 앵커를 아래로 바꾸기

앵커:

```js
    + ['hidden', 'legend', 'epic', 'rare', 'common'].map(r => {
```

코드:

```js
    + ['hidden', 'mythic', 'legend', 'epic', 'rare', 'common'].map(r => {
```

**A13. [신화] 여러 장 공개 연출 = 전설** — 앵커를 아래로 바꾸기

앵커:

```js
    const rarity = CHAR_DB[results[i].id]?.rarity;
```

코드:

```js
    const rarity = fxRarity(CHAR_DB[results[i].id]?.rarity); // 7.0 신화는 전설 연출
```

**A14. [신화] 한 장 공개 대기** — 앵커를 아래로 바꾸기

앵커:

```js
  const delays = { common: 650, rare: 900, epic: 1200, legend: 1650, hidden: 3000 };
```

코드:

```js
  const delays = { common: 650, rare: 900, epic: 1200, legend: 1650, mythic: 2200, hidden: 3000 };
```

**A15. [신화] 한 장 공개 연출 = 전설** — 앵커를 아래로 바꾸기

앵커:

```js
  if (character.rarity === 'legend' || character.rarity === 'hidden') { void overlay.offsetWidth; overlay.classList.add('fx-' + character.rarity); }
```

코드:

```js
  if (['legend', 'mythic', 'hidden'].includes(character.rarity)) { void overlay.offsetWidth; overlay.classList.add('fx-' + fxRarity(character.rarity)); }
```

**A16. [신화] 소식 티커** — 앵커를 아래로 바꾸기

앵커:

```js
  if (rarity === 'legend') postEvent('gacha', id, 'legend');
```

코드:

```js
  if (rarity === 'legend' || rarity === 'mythic') postEvent('gacha', id, rarity);
```

**A17. [신화] 티커 연출** — 앵커를 아래로 바꾸기

앵커:

```js
  if (tk) { tk.classList.toggle('fx-legend', ev.type === 'gacha' && ev.b === 'legend'); tk.classList.toggle('fx-hidden', ev.type === 'gacha' && ev.b === 'hidden'); }
```

코드:

```js
  if (tk) { tk.classList.toggle('fx-legend', ev.type === 'gacha' && (ev.b === 'legend' || ev.b === 'mythic')); tk.classList.toggle('fx-hidden', ev.type === 'gacha' && ev.b === 'hidden'); }
```

**A18. [신화] 마일리지** — 앵커를 아래로 바꾸기

앵커:

```js
const MILEAGE_POINTS = { common: 1, rare: 3, epic: 10, legend: 30, hidden: 30 };
```

코드:

```js
const MILEAGE_POINTS = { common: 1, rare: 3, epic: 10, legend: 30, mythic: 30, hidden: 30 };
```

**A19. [신화] 대진 카드 연출** — 앵커를 아래로 바꾸기

앵커:

```js
  const fx = r === 'legend' || r === 'hidden' ? r : '';
```

코드:

```js
  const fx = r === 'legend' || r === 'mythic' || r === 'hidden' ? fxRarity(r) : ''; // 7.0 신화는 전설 연출 · 태그만 MYTHIC
```

**A20. [신화] 대진 카드 태그** — 앵커를 아래로 바꾸기

앵커:

```js
'<span class="sweep"></span><span class="tag">LEGEND</span>'
```

코드:

```js
'<span class="sweep"></span><span class="tag">' + (r === 'mythic' ? 'MYTHIC' : 'LEGEND') + '</span>'
```

**A21. [신화] 도감 정렬 2** — 앵커를 아래로 바꾸기

앵커:

```js
  const order = { hidden: 0, legend: 1, epic: 2, rare: 3, common: 4 };
```

코드:

```js
  const order = { hidden: 0, mythic: 1, legend: 2, epic: 3, rare: 4, common: 5 };
```

**A22. [신화] 도감 필터** — 앵커를 아래로 바꾸기

앵커:

```js
  const f = [['all', '전체'], ['hidden', '히든'], ['legend', '전설'], ['epic', '영웅'], ['rare', '희귀'], ['common', '일반']];
```

코드:

```js
  const f = [['all', '전체'], ['hidden', '히든'], ['mythic', '신화'], ['legend', '전설'], ['epic', '영웅'], ['rare', '희귀'], ['common', '일반']];
```

**A23. [신화] 배치 링 색** — 앵커를 아래로 바꾸기

앵커:

```js
const V41_RING = { hidden: '#111', legend: '#f2c94c', epic: '#c77dff', rare: '#4d8ef7' };
```

코드:

```js
const V41_RING = { hidden: '#111', mythic: '#ff3b5c', legend: '#f2c94c', epic: '#c77dff', rare: '#4d8ef7' };
```

**A24. [신화] 등급 단계 = 전설** — 앵커를 아래로 바꾸기

앵커:

```js
  const tier = CHAR_DB[id].rarity === 'hidden' ? 'legend' : CHAR_DB[id].rarity;
```

코드:

```js
  const tier = CHAR_DB[id].rarity === 'hidden' || CHAR_DB[id].rarity === 'mythic' ? 'legend' : CHAR_DB[id].rarity;
```

**A25. [신화] 등급 가중치** — 앵커를 아래로 바꾸기

앵커:

```js
  const base = { common: 1, rare: 1.35, epic: 1.75, legend: 2.3, hidden: 2.6 }[CHAR_DB[id]?.rarity] || 1;
```

코드:

```js
  const base = { common: 1, rare: 1.35, epic: 1.75, legend: 2.3, mythic: 2.45, hidden: 2.6 }[CHAR_DB[id]?.rarity] || 1;
```

**A26. [신화] 처치 효과음** — 앵커를 아래로 바꾸기

앵커:

```js
    if (rar === 'legend' || rar === 'hidden' || (u.level || 1) >= 5)
```

코드:

```js
    if (rar === 'legend' || rar === 'mythic' || rar === 'hidden' || (u.level || 1) >= 5)
```

**[신화] 정렬 순서 (덱·도감, 2곳)** — 앵커 2곳 모두 바꾸기

앵커:

```js
  const rarityOrder = { common: 0, rare: 1, epic: 2, legend: 3, hidden: 4 };
```

코드:

```js
  const rarityOrder = { common: 0, rare: 1, epic: 2, legend: 3, mythic: 4, hidden: 5 };
```

### 4.B 신규 지후 6종

**B1. CHARACTER_BALANCE 맨 앞에 수치 추가** — 앵커 바로 뒤에 넣기

앵커:

```js
const CHARACTER_BALANCE = {
```

코드:

```js
  // ===== 7.0 신규 2차: 눈덩이 · 늑대 · 드림스케이프 · 락 · 리콜 · 마녀 (px 는 45px 격자 기준) =====
  snowball: {
    hp: 1900, atk: 120, atkSpeed: 1, range: 180, speed: 81,
    snowMaxStacks: 3, snowSlowPerStack: 0.2, snowFreeze: 1.8
  },
  wolf: {
    hp: 2330, atk: 150, atkSpeed: 1, range: 135, speed: 76.5,
    wolfHowlAfter: 10, howlRadius: 225, howlAspd: 0.2, howlTime: 3, wolfLeapDelay: 0.5,
    wolfHp: 3830, wolfAtk: 440, wolfSpeed: 121.5, wolfAtkSpeed: 1, wolfRange: 72, wolfHealRatio: 0.5
  },
  dreamscape: {
    hp: 4500, atk: 0, atkSpeed: 1, range: 135, speed: 54,
    noAttack: true, holdRange: true,
    deployLimit: 1, // 출격제한: 한 진영 전장에 1기만
    dreamEvery: 5, dreamRadius: 180, dreamTime: 4, dreamCutPerSec: 0.1, forgetMin: 0.8, forgetMax: 1
  },
  rockstar: { // 'rock' 은 이미 암석 지후가 쓰는 id
    hp: 3990, atk: 10, atkSpeed: 4, range: 315, speed: 45,
    isMelee: true, isRanged: false, fanAngleDeg: 100, fanRadius: 315, // 축복 지후와 같은 범위 (부채꼴 100° · 7칸)
    elecChain: 0.5
  },
  recall: {
    hp: 2000, atk: 160, atkSpeed: 1.2, range: 180, speed: 67.5,
    deployLimit: 2 // 출격제한 2
  },
  witch: {
    hp: 2400, atk: 180, atkSpeed: 1.2, range: 180, speed: 72,
    potionEvery: 2.5, potionRadius: 31.5, potionRange: 315, potionFlight: 0.45,
    potHeal: 0.15, potAtk: 0.2, potCrit: 0.05, potCritDmg: 5, potBuffTime: 3,
    potDamage: 500, potPoisonDps: 200, potPoisonTime: 4, potBurnDps: 200, potBurnTime: 4,
    secretAt: 0.25, secretAtk: 0.3, secretShield: 1500, secretDr: 0.15, secretSpeed: 0.15
  },
```

**B2. CHAR_DB 맨 앞에 캐릭터 추가** — 앵커 바로 뒤에 넣기

앵커:

```js
const CHAR_DB = {
```

코드:

```js
  // ===== 7.0 신규 2차: 눈덩이 · 늑대 · 드림스케이프 · 락 · 리콜 · 마녀 =====
  snowball: {
    id: 'snowball', name: '눈덩이 지후', emoji: '☃️', role: 'controller', roleLabel: '컨트롤러',
    rarity: 'rare', color: '#8fd3ff', portrait: PORTRAITS.snowball || jhPlaceholder('☃️', '#8fd3ff'),
    ...CHARACTER_BALANCE.snowball,
    onHit(caster, target) { snowballHit(caster, target); },
    skillDesc: 'HP 1,900 · ATK 120 · 사거리 4칸 · 공격 간격 1초 · 이동속도 1.8칸. 맞힌 적에게 <b>눈덩이</b>를 1중첩 남긴다 (최대 3중첩). 중첩마다 이동속도 <b>20%</b> 감소 (최대 60%), 이 감소는 중첩이 사라져도 그 라운드 동안 남는다. <b>3중첩</b>인 적을 맞히면 <b>1.8초 빙결</b>시키고 중첩을 없앤다.'
  },
  wolf: {
    id: 'wolf', name: '늑대 지후', emoji: '🐺', role: 'assassin', roleLabel: '어쌔신',
    rarity: 'epic', color: '#6b7a8f', portrait: PORTRAITS.wolf || jhPlaceholder('🐺', '#6b7a8f'),
    ...CHARACTER_BALANCE.wolf,
    customAttack(caster, target) { wolfAttack(caster, target); },
    skillDesc: 'HP 2,330 · ATK 150 · 사거리 3칸 · 공격 간격 1초 · 이동속도 1.7칸. <b>10번</b> 공격하면 <b>[하울링]</b>(반경 5칸 아군 공격속도 <b>+20%</b> · 3초) 후 0.5초 뒤 <b>적진 후열</b>로 순간이동한다. 순간이동하면 체력을 모두 회복하고 HP <b>3,830</b> · ATK <b>440</b> · 이동속도 2.7칸 · 공격 간격 1초 <b>근접</b>이 되며, 공격할 때마다 공격력의 <b>50%</b>를 회복한다.'
  },
  dreamscape: {
    id: 'dreamscape', name: '드림스케이프 지후', emoji: '🌌', role: 'controller', roleLabel: '컨트롤러',
    rarity: 'hidden', color: '#7a5cff', portrait: PORTRAITS.dreamscape || jhPlaceholder('🌌', '#7a5cff'),
    ...CHARACTER_BALANCE.dreamscape,
    skillDesc: 'HP 4,500 · 출격제한 1 · 공격하지 않는다. <b>5초마다</b> 자신 주변 <b>반경 4칸</b>에 파동을 쏜다. 맞은 적은 <b>[ㅤㅤㅤ]</b>에 걸린다 (맞을 때마다 새로 걸린다). <b>[ㅤㅤㅤ]</b>: 4초 동안 1초마다 최대 체력 <b>10%</b>씩, 모두 <b>40%</b>가 잘린다. 끝나면 <b>[망각]</b>: 잘림이 풀리고 깎인 체력이 돌아오지만, 최대 체력은 걸리기 전의 <b>80~100%</b>로만 돌아온다.'
  },
  rockstar: {
    id: 'rockstar', name: '락 지후', emoji: '🎸', role: 'controller', roleLabel: '컨트롤러',
    rarity: 'mythic', color: '#ff3b5c', portrait: PORTRAITS.rockstar || jhPlaceholder('🎸', '#ff3b5c'),
    ...CHARACTER_BALANCE.rockstar,
    onHit(caster, target) { applyElec(target); },
    skillDesc: 'HP 3,990 · ATK 10 · 부채꼴 100° · 사거리 7칸 · 공격 간격 4초 · 이동속도 1칸. 맞은 적은 다음 공격을 맞기 전까지 <b>[일렉]</b>에 걸린다. <b>[일렉]</b>: 걸리는 즉시 모든 쉴드가 사라지고 풀릴 때까지 쉴드를 얻지 못한다. 다음에 공격을 맞으면 그 적과 가장 가까운 아군(그 적의 편)에게 그 피해의 <b>50%</b>를 연쇄 전기 피해로 준다.'
  },
  recall: {
    id: 'recall', name: '리콜 지후', emoji: '📣', role: 'support', roleLabel: '서포터',
    rarity: 'legend', color: '#e07a1f', portrait: PORTRAITS.recall || jhPlaceholder('📣', '#e07a1f'),
    ...CHARACTER_BALANCE.recall,
    skillDesc: 'HP 2,000 · ATK 160 · 사거리 4칸 · 공격 간격 1.2초 · 이동속도 1.5칸 · <b>출격제한 2</b>. 진영에 배치하면 덱의 무작위 지후 하나를 <b>레벨 1</b>로 자신의 <b>상하좌우 한 칸</b> 중 빈 곳에 소환한다. 이후 매 라운드 다시 소환한다. 배치 한도에 걸리거나 상하좌우가 모두 막혀 있으면 소환하지 않는다.'
  },
  witch: {
    id: 'witch', name: '마녀 지후', emoji: '🧙', role: 'support', roleLabel: '서포터',
    rarity: 'legend', color: '#7b2fbf', portrait: PORTRAITS.witch || jhPlaceholder('🧙', '#7b2fbf'),
    ...CHARACTER_BALANCE.witch,
    skillDesc: 'HP 2,400 · ATK 180 · 사거리 4칸 · 공격 간격 1.2초 · 이동속도 1.6칸. <b>2.5초마다</b> 무작위 포션을 던진다 (반경 0.7칸). 아군에게는 이로운 것: 최대 체력 15% 회복 · 3초 공격력 +20% · 3초 치명타 확률 +5% · 3초 치명타 피해 +500%. 적에게는 해로운 것: 500 피해 · 독(0.5초마다 100, 4초) · 화상(초당 200, 4초) · <b>개구리화</b>(그 라운드 동안 개구리 지후). 체력이 <b>25%</b> 아래로 떨어지면 즉시 <b>비장의 포션</b>을 마신다: 공격력 +30% · 쉴드 1,500 · 받는 피해 -15% · 이동속도 +15%.'
  },
```

**B3. readyRoundSkills: 라운드 준비** — 앵커 바로 앞에 넣기

앵커:

```js
  // 7.0 GT · 낚시 · 낫
```

코드:

```js
  // 7.0 신규 2차
  if (u.charId === 'wolf') { u._wolfHits = 0; u._wolfLeap = null; u._wolfForm = false; }
  if (u.charId === 'dreamscape') u._dreamCd = 0;
  if (u.charId === 'witch') { u._potionCd = 1; u._witchSecret = false; }
```

**B4. statusAndTimers: 매 틱 처리 호출 (1차 tickNew70b 바로 다음)** — 앵커 바로 뒤에 넣기

앵커:

```js
  tickNew70b(u, dt); // 7.0 GT · 가시 · 낚시 · 낫 + [치명상]·[절상]·[침묵]·[생선조림]
```

코드:

```js
  tickNew70c(u, dt); // 7.0 신규 2차: 늑대 · 드림스케이프 · 마녀 + [눈덩이]·[ㅤㅤㅤ]·[일렉]·포션 버프
```

**B5. 신규 함수 (1차 신규 함수 블록 바로 앞)** — 앵커 바로 앞에 넣기

앵커:

```js
// ===== 7.0 신규: GT · 가시 · 낚시 · 낫 =====
// 상대 진영을 향한 방향
```

코드:

```js
// ===== 7.0 신규 2차: 눈덩이 · 늑대 · 드림스케이프 · 락 · 리콜 · 마녀 =====
// 눈덩이: 중첩마다 이동속도 -20% (최대 -60%, 그 라운드 동안 유지). 3중첩에 맞으면 빙결 + 중첩 제거
function snowballHit(c, t) {
  if (!t.alive || t.isCastle) return;
  if ((t._snowStacks || 0) >= c.def.snowMaxStacks) {
    t._snowStacks = 0;
    battleAPI.applyFreeze(t, c.def.snowFreeze);
    spawnDamageNumber(t, '❄️ 꽁꽁', { crit: true });
    return;
  }
  t._snowStacks = (t._snowStacks || 0) + 1;
  t._snowSlow = Math.max(t._snowSlow || 0, Math.min(c.def.snowMaxStacks, t._snowStacks) * c.def.snowSlowPerStack);
  battleAPI.setBuff(t, 'snowball-slow', 'speed', -t._snowSlow, 9999); // 라운드가 끝날 때까지 (유닛은 라운드마다 새로 나온다)
}
// 늑대: 공격 10번 → 하울링 → 0.5초 뒤 적진 후열로 순간이동해 근접 폼
function wolfAttack(c, target) {
  if (c._wolfForm) {
    const angle0 = Math.atan2(target.y - c.y, target.x - c.x);
    const half = (c.def.fanAngleDeg ?? 120) * Math.PI / 360;
    const reach = Math.max((c.def.fanRadius ?? c.def.range ?? 72) + 8, bodySeparation(c, target) + 8);
    spawnSlash(c, target);
    state.units.forEach(e => {
      if (!e.alive || !isHostile(c, e) || !inFan(c, e, angle0, half, reach)) return;
      const hit = dealDamage(c, e, c.def.atk, {});
      if (hit && c.def.onHit) c.def.onHit(c, e, battleAPI);
    });
    const heal = Math.min(c.maxHp - c.hp, c.def.atk * c.def.wolfHealRatio * healRecvMult(c));
    if (heal > 0 && c.alive) { c.hp += heal; updateUnitBars(c); }
    return;
  }
  launchProjectileAttack(c, target, c.def.atk);
  c._wolfHits = (c._wolfHits || 0) + 1;
  if (c._wolfHits >= c.def.wolfHowlAfter && !c._wolfLeap) {
    const R = c.def.howlRadius * WORLD_SCALE;
    state.units.forEach(a => {
      if (a.alive && !a.isCastle && a.side === c.side && Math.hypot(a.x - c.x, a.y - c.y) <= R) battleAPI.setBuff(a, 'wolf-howl', 'aspd', c.def.howlAspd, c.def.howlTime);
    });
    blastEffect(c.x, c.y, R, c.def.color);
    spawnDamageNumber(c, '🐺 아우우~', { crit: true });
    c._wolfLeap = { t: c.def.wolfLeapDelay };
  }
}
// 적진 후열: 내 앞 방향으로 가장 깊이 들어가 있는 적
function enemyBackline(u) {
  const f = frontVector(u);
  let best = null, bestAlong = -Infinity;
  state.units.forEach(e => {
    if (!e.alive || e.isCastle || !isHostile(u, e) || !sameRealm(u, e)) return;
    const along = (e.x - u.x) * f.x + (e.y - u.y) * f.y;
    if (along > bestAlong) { bestAlong = along; best = e; }
  });
  return best;
}
function wolfTransform(u) {
  u._wolfLeap = null;
  const back = enemyBackline(u);
  if (back) {
    const f = frontVector(u), off = bodySeparation(u, back) + 2;
    physSnap(u, clamp(back.x + f.x * off, PHYS.WALL_PAD, MAP_W - PHYS.WALL_PAD), clamp(back.y + f.y * off, PHYS.WALL_PAD, MAP_H - PHYS.WALL_PAD));
  }
  const factor = Math.pow(LEVEL_MULT, (u.level || 1) - 1);
  u._wolfForm = true;
  u.def.isMelee = true; u.isRanged = false;
  u.def.range = u.def.wolfRange * WORLD_SCALE;
  u.def.speed = u.def.wolfSpeed * WORLD_SCALE;
  u.def.atkSpeed = u.def.wolfAtkSpeed;
  u.def.atk = Math.round(u.def.wolfAtk * factor);
  u.maxHp = Math.round(u.def.wolfHp * factor);
  u.hp = u.maxHp; // 풀회복
  u.atkCooldown = Math.min(u.atkCooldown, 0.3);
  u.el.classList.add('wolf-form');
  spawnBurst(u.el, u.def.color);
  spawnDamageNumber(u, '🐺 습격!', { crit: true });
  updateUnitBars(u);
}
// 드림스케이프: 5초마다 반경 4칸 파동 → [ㅤㅤㅤ] (맞을 때마다 새로 걸린다)
const DREAM_NAME = '[ㅤㅤㅤ]'; // 이름이 공백 문자(U+3164)
function dreamPulse(u) {
  const R = u.def.dreamRadius * WORLD_SCALE;
  blastEffect(u.x, u.y, R, u.def.color);
  state.units.forEach(e => {
    if (!e.alive || e.isCastle || !isHostile(u, e) || !sameRealm(u, e)) return;
    if (Math.hypot(e.x - u.x, e.y - u.y) > R + unitRadius(e)) return;
    applyDream(e, u);
  });
}
function applyDream(e, src) {
  (e._dreams || (e._dreams = [])).push({ base: e.maxHp, cut: 0, hpLost: 0, t: 0, ticks: 0, src });
  e.el.classList.add('dreaming');
  spawnDamageNumber(e, DREAM_NAME, { crit: true });
}
function tickDreams(e, dt) {
  for (const d of e._dreams.slice()) {
    d.t += dt;
    const maxTicks = Math.round(d.src.def.dreamTime);
    while (d.ticks < maxTicks && d.t >= d.ticks + 1) {
      d.ticks++;
      const amount = Math.min(d.base * d.src.def.dreamCutPerSec, Math.max(1, e.maxHp - 1));
      e.maxHp -= amount; d.cut += amount;
      if (e.hp > e.maxHp) { d.hpLost += e.hp - e.maxHp; e.hp = e.maxHp; }
    }
    if (d.t >= d.src.def.dreamTime) {
      // [망각]: 잘린 만큼 돌려주고, 걸리기 전 최대 체력의 80~100% 로만 기억한다
      const r = d.src.def.forgetMin + Math.random() * (d.src.def.forgetMax - d.src.def.forgetMin);
      e.maxHp = Math.max(1, e.maxHp + d.cut - d.base * (1 - r));
      e.hp = Math.min(e.maxHp, e.hp + d.hpLost);
      e._dreams.splice(e._dreams.indexOf(d), 1);
      spawnDamageNumber(e, `망각 ${Math.round(r * 100)}%`, { heal: true });
    }
  }
  if (!e._dreams.length) { e._dreams = null; e.el.classList.remove('dreaming'); }
  updateUnitBars(e);
}
// [일렉]: 쉴드를 모두 잃고 얻지 못한다. 다음 피격 때 그 적과 가장 가까운 같은 편에게 피해 50% 연쇄 (dealDamage 에서 처리)
function applyElec(t) {
  if (!t.alive || t.isCastle) return;
  t._elec = true;
  stripShields(t);
  t.el.classList.add('electrified');
}
function stripShields(t) {
  if (t.shield > 0) { t.shield = 0; breakShieldVisual(t); }
  if (t._whiteShield > 0) t._whiteShield = 0;
  if (t._guardShield > 0) t._guardShield = 0;
  if (t._tiShield > 0) t._tiShield = 0;
}
function elecChain(target, dmg, attacker) {
  target._elec = false;
  target.el.classList.remove('electrified');
  let best = null, bestD = Infinity;
  state.units.forEach(a => {
    if (a === target || !a.alive || a.isCastle || a.side !== target.side || !sameRealm(a, target)) return;
    const d = Math.hypot(a.x - target.x, a.y - target.y);
    if (d < bestD) { bestD = d; best = a; }
  });
  if (!best || !(dmg > 0)) return;
  const bolt = document.createElement('div');
  bolt.className = 'fx-elec-chain';
  bolt.style.left = target.x + 'px'; bolt.style.top = target.y + 'px';
  bolt.style.width = bestD + 'px';
  bolt.style.transform = `rotate(${Math.atan2(best.y - target.y, best.x - target.x)}rad)`;
  worldEl().appendChild(bolt);
  scheduleTask(() => bolt.remove(), 260);
  const src = attacker && attacker.alive ? attacker : null;
  dealDamage(src, best, dmg * CHARACTER_BALANCE.rockstar.elecChain, { isSkill: true, elecChain: true, skipAtkBuff: true, noLifesteal: true, fromDeath: !src, src: attacker });
}
// 리콜: 덱의 무작위 지후 하나를 레벨 1로 상하좌우 빈 칸에 소환 (배치 기록에는 남기지 않아 라운드마다 새로 소환)
function sameHalfAsUnit(u, x, y) {
  if (state.mode === 'auction') return true;
  return isEastWestLayout() ? Math.sign(x - MAP_W / 2) === Math.sign(u.x - MAP_W / 2) : Math.sign(y - MAP_H / 2) === Math.sign(u.y - MAP_H / 2);
}
function recallSummon(u) {
  if (!u || !u.alive || u.charId !== 'recall') return;
  if (state.maxUnits && countedAlive(u.side) >= state.maxUnits) return; // 배치 한도
  const deck = ((u.side === 'ally' ? state.myDeckIds : state.enemyDeckIds) || []).filter(id => CHAR_DB[id] && id !== 'recall' && canPlaceNew(u.side, id));
  if (!deck.length) return;
  const spots = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => ({ x: u.x + dx * GRID, y: u.y + dy * GRID }))
    .filter(p => p.x >= PHYS.WALL_PAD && p.x <= MAP_W - PHYS.WALL_PAD && p.y >= PHYS.WALL_PAD && p.y <= MAP_H - PHYS.WALL_PAD && sameHalfAsUnit(u, p.x, p.y)
      && !state.units.some(o => o.alive && Math.hypot(o.x - p.x, o.y - p.y) < GRID * 0.6));
  if (!spots.length) return;
  const spot = spots[Math.floor(Math.random() * spots.length)];
  const id = deck[Math.floor(Math.random() * deck.length)];
  const s = spawnUnit(u.side, spot.x, spot.y, id, { saved: true, quiet: true, level: 1 });
  if (!s) return;
  s.placementId = null;
  s._recalled = true;
  spawnBurst(s.el, u.def.color);
  spawnDamageNumber(s, '📣 소환', { heal: true });
}
// 마녀: 2.5초마다 아군(이로운 포션) 또는 적(해로운 포션) 무작위 대상에게 던진다
const WITCH_GOOD = ['heal', 'atk', 'crit', 'critdmg'];
const WITCH_BAD = ['damage', 'poison', 'burn', 'frog'];
function throwPotion(u) {
  const R = u.def.potionRange * WORLD_SCALE;
  const pick = side => state.units.filter(x => x.alive && !x.isCastle && x.side === side && sameRealm(u, x) && Math.hypot(x.x - u.x, x.y - u.y) <= R);
  const friends = pick(u.side), foes = state.units.filter(x => x.alive && !x.isCastle && isHostile(u, x) && sameRealm(u, x) && Math.hypot(x.x - u.x, x.y - u.y) <= R);
  const toFoe = foes.length && (!friends.length || Math.random() < 0.5);
  const list = toFoe ? foes : friends;
  if (!list.length) return false;
  const target = list[Math.floor(Math.random() * list.length)];
  const kinds = toFoe ? WITCH_BAD : WITCH_GOOD;
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  const flask = document.createElement('div');
  flask.className = 'fx-potion ' + (toFoe ? 'bad' : 'good');
  flask.style.left = u.x + 'px'; flask.style.top = u.y + 'px';
  flask.style.transition = `left ${u.def.potionFlight}s ease-out, top ${u.def.potionFlight}s cubic-bezier(.2,-.6,.6,1)`;
  worldEl().appendChild(flask);
  const tx = target.x, ty = target.y;
  requestAnimationFrame(() => { flask.style.left = tx + 'px'; flask.style.top = ty + 'px'; });
  scheduleTask(() => { flask.remove(); if (u.alive) splashPotion(u, tx, ty, toFoe, kind); }, u.def.potionFlight * 1000);
  return true;
}
function splashPotion(u, x, y, toFoe, kind) {
  const R = u.def.potionRadius * WORLD_SCALE;
  blastEffect(x, y, R, toFoe ? '#59c234' : '#ff8ad8');
  state.units.slice().forEach(t => {
    if (!t.alive || t.isCastle || !sameRealm(u, t)) return;
    if (toFoe ? !isHostile(u, t) : t.side !== u.side) return;
    if (Math.hypot(t.x - x, t.y - y) > R + unitRadius(t)) return;
    if (kind === 'heal') { const h = Math.min(t.maxHp - t.hp, t.maxHp * u.def.potHeal * healRecvMult(t)); if (h > 0) { t.hp += h; updateUnitBars(t); spawnDamageNumber(t, Math.round(h), { heal: true }); } }
    else if (kind === 'atk') { battleAPI.setBuff(t, 'witch-atk', 'atk', u.def.potAtk, u.def.potBuffTime); spawnDamageNumber(t, '🧪 공격력↑', { heal: true }); }
    else if (kind === 'crit') { t._potCrit = u.def.potBuffTime; spawnDamageNumber(t, '🧪 치명타↑', { heal: true }); }
    else if (kind === 'critdmg') { t._potCritDmg = u.def.potBuffTime; spawnDamageNumber(t, '🧪 치명타 피해↑', { heal: true }); }
    else if (kind === 'damage') dealDamage(u, t, u.def.potDamage, { isSkill: true, skipAtkBuff: true });
    else if (kind === 'poison') battleAPI.applyPoison(t, u.def.potPoisonDps, u.def.potPoisonTime, u);
    else if (kind === 'burn') battleAPI.applyBurn(t, u.def.potBurnDps, u.def.potBurnTime, u);
    else if (kind === 'frog') frogForRound(t);
  });
}
// 개구리화: 그 라운드 동안만 개구리 지후. 배치 기록은 그대로라 다음 라운드엔 원래 지후로 나온다
function frogForRound(t) {
  if (!t.alive || t.charId === 'frog' || !CHAR_DB.frog) return;
  const frog = spawnUnit(t.side, t.x, t.y, 'frog', { saved: true, quiet: true, level: t.level || 1 });
  if (!frog) return;
  frog.placementId = null;
  frog._grown = true; // 같은 지후 제한에서 빼기
  t.alive = false; t._devoured = true;
  dropUnitFx(t);
  t.el.remove();
  if (t.ringEl) t.ringEl.remove();
  if (rangeRing && rangeRing.unit === t) hideRangeRing();
  physInitBody(frog);
  readyRoundSkills(frog);
  spawnBurst(frog.el, '#59c234');
  spawnDamageNumber(frog, '🐸 개굴!', { crit: true });
}
function witchSecret(u) {
  u._witchSecret = true;
  battleAPI.setBuff(u, 'witch-secret-atk', 'atk', u.def.secretAtk, 9999);
  battleAPI.setBuff(u, 'witch-secret-speed', 'speed', u.def.secretSpeed, 9999);
  u.shield = (u.shield || 0) + u.def.secretShield;
  u.maxShield = Math.max(u.maxShield || 0, u.shield);
  u._witchDr = true;
  u.el.classList.add('witch-secret');
  spawnBurst(u.el, u.def.color);
  spawnDamageNumber(u, '🧪 비장의 포션!', { crit: true });
  updateUnitBars(u);
}
function tickNew70c(u, dt) {
  if (!u.alive) return;
  if (u._elec) stripShields(u); // [일렉] 중에는 쉴드를 얻지 못한다
  if (u._dreams) tickDreams(u, dt);
  if (u._potCrit > 0) u._potCrit = Math.max(0, u._potCrit - dt);
  if (u._potCritDmg > 0) u._potCritDmg = Math.max(0, u._potCritDmg - dt);
  if (u.charId === 'wolf' && u._wolfLeap) { u._wolfLeap.t -= dt; if (u._wolfLeap.t <= 0) wolfTransform(u); }
  if (u.charId === 'dreamscape') {
    u._dreamCd = (u._dreamCd ?? 0) - dt;
    if (u._dreamCd <= 0) { u._dreamCd = u.def.dreamEvery; dreamPulse(u); }
  }
  if (u.charId === 'witch') {
    if (!u._witchSecret && u.hp > 0 && u.hp < u.maxHp * u.def.secretAt) witchSecret(u);
    u._potionCd = (u._potionCd ?? 1) - dt;
    if (u._potionCd <= 0) u._potionCd = throwPotion(u) ? u.def.potionEvery : 0.5;
  }
}
```

**B6. 리콜: 배치하는 순간 소환 (spawnUnit 의 새 배치 블록)** — 앵커 바로 뒤에 넣기

앵커:

```js
    unit.placementId = unit.uid;
    state.placements.push({ id: unit.placementId, side, x, y, charId, form, level: 1 });
```

코드:

```js
    if (charId === 'recall') scheduleTask(() => recallSummon(unit), 30); // 7.0 리콜: 진영에 배치하면 바로 소환
```

**B7. 리콜: 매 라운드 다시 소환 (라운드 시작 재배치 직후)** — 앵커 바로 앞에 넣기

앵커:

```js
  // 좀비 S: 지난 라운드에 좀비로 만든 적이 있으면 이번 라운드에 아군 좀비 1기
```

코드:

```js
  state.units.filter(x => x.alive && x.charId === 'recall').forEach(recallSummon); // 7.0 리콜: 매 라운드 소환
```

**B8. dealDamage: 마녀 비장의 포션 받는 피해 -15%** — 앵커 바로 앞에 넣기

앵커:

```js
  if (caster) caster._lastHitDamage = Math.max(0, finalDmg); // 쉴드에 막힌 양 포함, 실제로 들어간 피해
```

코드:

```js
  if (target._witchDr) finalDmg *= 1 - CHARACTER_BALANCE.witch.secretDr; // 7.0 마녀 비장의 포션
```

**B9. dealDamage: [일렉] 연쇄 (피해가 들어간 직후)** — 앵커 바로 앞에 넣기

앵커:

```js
  // 흡혈 (에드게이): 입힌 피해(쉴드 흡수 포함)의 일정 비율 회복
```

코드:

```js
  if (target._elec && !opts.isDot && !opts.elecChain && (caster || opts.src) && shownDmg > 0) elecChain(target, shownDmg, caster || opts.src); // 7.0 락 [일렉]
```

**B10. 치명타 피해: 마녀 포션 +500%** — 앵커를 아래로 바꾸기

앵커:

```js
  if (critHit) amount *= 2 + (ravageCritBonus(caster) ? CHARACTER_BALANCE.ravage.rvCritDmg : 0); // 6.2 [유린]: 치명타 피해 +40%
```

코드:

```js
  if (critHit) amount *= 2 + (ravageCritBonus(caster) ? CHARACTER_BALANCE.ravage.rvCritDmg : 0) + (caster && caster._potCritDmg > 0 ? CHARACTER_BALANCE.witch.potCritDmg : 0); // 6.2 [유린]: 치명타 피해 +40% · 7.0 마녀 포션 +500%
```

**B11. 치명타 확률: 마녀 포션 +5%** — 앵커를 아래로 바꾸기

앵커:

```js
  return CRIT_CHANCE + bc;
```

코드:

```js
  return CRIT_CHANCE + bc + (caster && caster._potCrit > 0 ? CHARACTER_BALANCE.witch.potCrit : 0); // 7.0 마녀 포션
```

**B12. updateUnitBars: [ㅤㅤㅤ] 잘림도 체력바에 표시 (1차 [절상] 줄 교체)** — 앵커를 아래로 바꾸기

앵커:

```js
  const fullMax = u._lacer ? u.maxHp / u._lacer.keep : u.maxHp; // 7.0 [절상]: 잘린 부분은 CSS 로 검게
```

코드:

```js
  // 7.0 [절상] · [ㅤㅤㅤ]: 잘린 최대 체력을 원래 길이에 대해 검게 보여준다
  const cutHp = (u._lacer ? u.maxHp / u._lacer.keep - u.maxHp : 0) + (u._dreams ? u._dreams.reduce((s, d) => s + d.cut, 0) : 0);
  const fullMax = u.maxHp + cutHp;
  if (u.el.classList.contains('lacerated') !== cutHp > 0) u.el.classList.toggle('lacerated', cutHp > 0);
  if (cutHp > 0) u.el.style.setProperty('--lacer-cut', (cutHp / fullMax * 100).toFixed(1) + '%');
```

**B13. aiSteerAndAttack: 늑대 순간이동 대기 중 멈춤** — 앵커 바로 뒤에 넣기

앵커:

```js
  if (u._tendon) { u.desVx = 0; u.desVy = 0; u.physLock = 0; clearTelegraph(u); return; } // 7.0 낫: [힘줄 끊기] 준비
```

코드:

```js
  if (u._wolfLeap) { u.desVx = 0; u.desVy = 0; u.physLock = 0; clearTelegraph(u); return; } // 7.0 늑대: 하울링 후 순간이동 대기
```

**B14. updateStatusIcons: 상태 아이콘** — 앵커 바로 뒤에 넣기

앵커:

```js
  if (u._hooked) html += '<span>🎣</span>';
```

코드:

```js
  if (u._snowStacks > 0) html += `<span class="grudge-timer">❄️${u._snowStacks}</span>`;
  if (u._dreams) html += `<span class="grudge-timer">💭${u._dreams.length}</span>`;
  if (u._elec) html += '<span>⚡</span>';
  if (u._potCrit > 0 || u._potCritDmg > 0) html += '<span>🧪</span>';
  if (u._witchDr) html += '<span>🧪</span>';
```

**B15. 상세 정보 고유 수치 라벨** — 앵커 바로 앞에 넣기

앵커:

```js
  burnDps:['화상 초당 피해'], burnDuration:['화상 지속','s'],
```

코드:

```js
  snowSlowPerStack:['중첩당 이동속도 감소','%'], snowFreeze:['3중첩 빙결','s'],
  wolfHowlAfter:['하울링까지 공격','회'], howlRadius:['하울링 반경','칸'], wolfHp:['순간이동 후 HP'], wolfAtk:['순간이동 후 ATK'],
  dreamEvery:['파동 간격','s'], dreamRadius:['파동 반경','칸'], dreamTime:['[ㅤㅤㅤ] 지속','s'],
  elecChain:['일렉 연쇄 피해','%'], potionEvery:['포션 간격','s'], potionRadius:['포션 범위','칸'],
```

**B16. CSS** — 앵커 바로 앞에 넣기 (1차 CSS 블록 앞)

앵커:

```css
/* ===== 7.0 신규: GT · 가시 · 낚시 · 낫 ===== */
```

코드:

```css
/* ===== 7.0 신규 2차 ===== */
.unit.wolf-form { box-shadow: 0 0 0 3px rgba(107,122,143,.9), 0 0 16px rgba(160,170,190,.9); }
.unit.dreaming { box-shadow: 0 0 0 3px rgba(122,92,255,.85), 0 0 16px rgba(122,92,255,.8); }
.unit.dreaming .unit-icon img { filter: saturate(.4) hue-rotate(200deg) brightness(.9); }
.unit.electrified { box-shadow: 0 0 0 2px #fff, 0 0 12px #59d0ff, 0 0 22px #ffe14d; animation: elec-flicker .25s steps(2) infinite; }
@keyframes elec-flicker { from { filter: brightness(1); } to { filter: brightness(1.35); } }
.fx-elec-chain { position:absolute; height:4px; transform-origin:0 50%; pointer-events:none; z-index:9; background:repeating-linear-gradient(90deg,#fff 0 6px,#ffe14d 6px 10px,#59d0ff 10px 14px); box-shadow:0 0 10px #59d0ff; }
.fx-potion { position:absolute; width:14px; height:18px; margin:-9px 0 0 -7px; border-radius:40% 40% 50% 50%; border:2px solid #222; z-index:9; pointer-events:none; }
.fx-potion.good { background:linear-gradient(180deg,#fff 20%,#ff8ad8 20%); }
.fx-potion.bad { background:linear-gradient(180deg,#fff 20%,#59c234 20%); }
.unit.witch-secret { box-shadow: 0 0 0 3px rgba(123,47,191,.9), 0 0 18px rgba(255,138,216,.9); }
```

## 5. 검증 결과

1차 + 2차를 적용한 `index.html` 로 미리보기 전투와 직접 호출 테스트를 돌렸다.

| 항목 | 결과 |
|---|---|
| 문법 | 모든 `<script>` 블록 파싱 통과, 미리보기 6종 JS 오류 없음 |
| 신화 | 1회 20만 번 0.50%, 상자 5만 번 3.74%. 뽑기 확률표에 `MYTHIC 0.5% · 상자 3.75%`, 목록에 `신화 · 1 (락 지후)` |
| 눈덩이 | 3중첩 뒤 `❄️ 꽁꽁` 빙결 |
| 늑대 | 미리보기에서 `🐺 아우우~` → `🐺 습격!` → 근접 폼. 직접 변신: HP 3830/3830 · ATK 440 · 근접 · 이속 2.7칸 · 공속 1s |
| 드림스케이프 | `[ㅤㅤㅤ]` → `망각 88~99%` 반복, 체력바 절단 표시 |
| 락 | 미리보기에서 `electrified`. 직접: 쉴드 500 → 0, 400 피해를 받자 옆 아군이 200(50%) 연쇄 피해, [일렉] 해제 |
| 리콜 | 직접: 1칸 옆에 덱 지후(Lv.1) 1기 소환 (미리보기 전장은 배치 단계를 거치지 않아 여기서만 확인) |
| 마녀 | 미리보기에서 공격력↑·치명타 피해↑·독·화상 포션. 직접: 비장의 포션 쉴드 1500 · 피해 감소, 개구리화로 개구리 지후 1기, 치명타 포션 중 치명타 확률 0.02 → 0.07 |

## 6. 스펙 해석으로 정한 부분 (사장님 확인 필요)

1. **비어 있던 스탯**은 위 표의 `*` 값으로 정했다 (사장님 지시: 안 쓴 스탯은 적당히).
2. **눈덩이 감속 "영구"** = 그 라운드 끝까지 (유닛이 라운드마다 새로 나오므로). 빙결은 기존 `applyFreeze` 라 쉴드 있는 탱커는 빙결되지 않는다 (기존 규칙).
3. **늑대**: 변신 전은 원거리(3칸). 변신은 한 라운드에 한 번. **적진 후열** = 늑대가 바라보는 방향으로 가장 깊이 있는 적, 그 뒤에 착지. 3830·440 에도 레벨 배율을 곱한다. 0.5초 대기 동안 멈춘다.
4. **드림스케이프**: 공격하지 않고 적과 3칸 거리를 유지한다. 파동은 라운드 시작 직후부터 5초마다. 이미 걸린 적이 또 맞으면 새 [ㅤㅤㅤ]가 하나 더 겹친다 (각각 따로 망각). [망각]은 그동안 깎인 체력을 돌려주되 최대 체력 한도까지.
5. **락**: "다음으로 자신이 공격을 받을시"를 [일렉] 설명과 같은 효과로 보고 하나로 구현했다 (락 자신이 맞을 때 반격하는 효과는 넣지 않음). 연쇄 피해는 쉴드·감소를 거친 **실제 피해의 50%**, 도트 피해로는 터지지 않는다.
6. **리콜**: 소환된 지후는 배치 기록에 남지 않는 **그 라운드용**이고, 라운드마다 새로 무작위로 뽑는다. 리콜 지후 자신은 소환 후보에서 뺐다. 같은 지후 3기 제한·출격제한·유닛 수 한도를 지킨다. 자기 진영 칸에만 소환한다.
7. **마녀**: 포션은 7칸 안의 아군·적 중 50% 확률로 고른 쪽의 무작위 대상에게 던진다 (0.45초 비행). 독 "0.5초마다 100"은 엔진의 초당 처리에 맞춰 **초당 200**으로 넣었다. 치명타 피해 +500% = 치명타 배율 2배 → 7배. 비장의 포션 효과는 라운드 끝까지. 개구리화는 범위 안 적 **모두**에게 걸린다.

## 7. 패치노트 초안

```js
{ emoji:'☃️', name:'눈덩이 지후', tag:'new', color:'#8fd3ff', portraitKey:'snowball', desc:'희귀 · 컨트롤러. 맞힐 때마다 눈덩이를 쌓아 이동속도를 최대 60% 늦추고, 3중첩인 적은 <b>1.8초 빙결</b>.' },
{ emoji:'🐺', name:'늑대 지후', tag:'new', color:'#6b7a8f', portraitKey:'wolf', desc:'영웅 · 어쌔신. 10번 공격하면 <b>[하울링]</b>으로 아군 공속을 올리고 적진 후열로 순간이동해 강한 근접 폼이 됩니다.' },
{ emoji:'🌌', name:'드림스케이프 지후', tag:'new', color:'#7a5cff', portraitKey:'dreamscape', desc:'히든 · 컨트롤러. 5초마다 파동으로 <b>[ㅤㅤㅤ]</b>를 걸어 최대 체력을 잘라 내고, 끝나면 <b>[망각]</b>.' },
{ emoji:'🎸', name:'락 지후', tag:'new', color:'#ff3b5c', portraitKey:'rockstar', desc:'<b>신화</b> · 컨트롤러. 맞힌 적에게 <b>[일렉]</b>: 쉴드를 없애고, 다음 피격 때 옆 아군에게 50% 연쇄 전기.' },
{ emoji:'📣', name:'리콜 지후', tag:'new', color:'#e07a1f', portraitKey:'recall', desc:'전설 · 서포터 · 출격제한 2. 매 라운드 덱의 지후 하나를 레벨 1로 옆 칸에 소환합니다.' },
{ emoji:'🧙', name:'마녀 지후', tag:'new', color:'#7b2fbf', portraitKey:'witch', desc:'전설 · 서포터. 2.5초마다 아군엔 이로운, 적엔 해로운 포션을 던지고, 위기 땐 <b>비장의 포션</b>을 마십니다.' },
```

신화 등급 소개 문구 예: `{ emoji:'🔴', name:'신화 등급', tag:'new', color:'#ff3b5c', desc:'전설과 히든 사이의 새 등급. 1회 뽑기 0.5%, 지후 상자에서 전설 칸 성공 후 15%.' }`
