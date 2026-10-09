# 7.0 인계 2차 — 신화 등급 + 신규 지후 6종 (눈덩이 · 늑대 · 드림스케이프 · 락 · 리콜 · 마녀)
# 1차 인계(GT·가시·낚시·낫)를 먼저 적용한 index.html 위에 적용한다 (tickNew70b · [절상] 체력바 줄을 앵커로 쓴다).
# 각 항목: (제목, 앵커, 'before'|'after'|'replace', 코드)

PORTRAIT_FILES = [
    ('snowball', '눈 지후.PNG'),
    ('wolf', '늑대 지후.PNG'),
    ('dreamscape', '드림스케이프 지후.PNG'),
    ('rockstar', '락 지후.PNG'),
    ('recall', '리콜 지후.PNG'),
    ('witch', '마녀 지후.PNG'),
]

MYTHIC_COLOR = '#ff3b5c'

# ---------- 신화 등급 ----------
MYTHIC_EDITS = [
    ('[신화] 등급 색 변수', "  --rarity-legend: #f2c94c;\n", 'after', f"  --rarity-mythic: {MYTHIC_COLOR}; /* 7.0 신화 */\n"),
    ('[신화] .rarity-* 클래스', ".rarity-common { --rc:var(--rarity-common); } .rarity-rare { --rc:var(--rarity-rare); } .rarity-epic { --rc:var(--rarity-epic); } .rarity-legend { --rc:var(--rarity-legend); }\n", 'after',
     ".rarity-mythic { --rc:var(--rarity-mythic); } /* 7.0 신화 */\n"),
    ('[신화] 등급 이름', "const RARITY_LABEL = { common: '일반', rare: '희귀', epic: '영웅', legend: '전설', hidden: '히든' };\n", 'replace',
     "const RARITY_LABEL = { common: '일반', rare: '희귀', epic: '영웅', legend: '전설', mythic: '신화', hidden: '히든' };\n"
     "// 7.0 신화: 연출(번쩍임·카드 테두리 등)은 전설 것을 그대로 쓰고 색만 신화 색\n"
     "function fxRarity(r) { return r === 'mythic' ? 'legend' : r; }\n"),
    ('[신화] 등급 색', "  return { common: 'var(--rarity-common)', rare: 'var(--rarity-rare)', epic: 'var(--rarity-epic)', legend: 'var(--rarity-legend)', hidden: 'var(--rarity-hidden)' }[r];\n", 'replace',
     "  return { common: 'var(--rarity-common)', rare: 'var(--rarity-rare)', epic: 'var(--rarity-epic)', legend: 'var(--rarity-legend)', mythic: 'var(--rarity-mythic)', hidden: 'var(--rarity-hidden)' }[r];\n"),
    ('[신화] 영문 이름', "const V4_RARITY_EN = { common: 'COMMON', rare: 'RARE', epic: 'EPIC', legend: 'LEGEND', hidden: 'HIDDEN' };\n", 'replace',
     "const V4_RARITY_EN = { common: 'COMMON', rare: 'RARE', epic: 'EPIC', legend: 'LEGEND', mythic: 'MYTHIC', hidden: 'HIDDEN' };\n"),
    ('[신화] 1회 뽑기 확률 0.5% (일반에서 뺌)',
     "    ? [{rarity:'legend',weight:3.3},{rarity:'epic',weight:10},{rarity:'rare',weight:38.5},{rarity:'common',weight:48.2}]\n    : [{rarity:'legend',weight:3},{rarity:'epic',weight:10},{rarity:'rare',weight:38.5},{rarity:'common',weight:48.5}]; // 4.4.1: 1회 뽑기에서는 히든이 나오지 않는다\n",
     'replace',
     "    ? [{rarity:'mythic',weight:0.5},{rarity:'legend',weight:3.3},{rarity:'epic',weight:10},{rarity:'rare',weight:38.5},{rarity:'common',weight:47.7}]\n    : [{rarity:'mythic',weight:0.5},{rarity:'legend',weight:3},{rarity:'epic',weight:10},{rarity:'rare',weight:38.5},{rarity:'common',weight:48}]; // 4.4.1: 1회 뽑기에서는 히든이 나오지 않는다 · 7.0 신화 0.5%\n"),
    ('[신화] 천장: 신화도 천장을 초기화', "  if (rarity === 'legend' || rarity === 'hidden') profile.gachaPity = 0;\n", 'replace',
     "  if (rarity === 'legend' || rarity === 'mythic' || rarity === 'hidden') profile.gachaPity = 0;\n"),
    ('[신화] 지후 상자: 전설 칸 성공 시 신화 15%', "const GACHA_BOX_STEPS = { normal: [['epic', 50], ['legend', 50]], pickup: [['epic', 50], ['legend', 50]] };\n", 'replace',
     "const GACHA_BOX_STEPS = { normal: [['epic', 50], ['legend', 50], ['mythic', 15]], pickup: [['epic', 50], ['legend', 50], ['mythic', 15]] }; // 7.0 신화: 상자당 3.75%\n"),
    ('[신화] 상자 천장', "  if (ids.some(id => ['legend', 'hidden'].includes(CHAR_DB[id]?.rarity))) profile.gachaPity = 0;\n", 'replace',
     "  if (ids.some(id => ['legend', 'mythic', 'hidden'].includes(CHAR_DB[id]?.rarity))) profile.gachaPity = 0;\n"),
    ('[신화] 정렬 순서 (뽑기)', "const GACHA_RARITY_ORDER = { common: 0, rare: 1, epic: 2, legend: 3, hidden: 4 };\n", 'replace',
     "const GACHA_RARITY_ORDER = { common: 0, rare: 1, epic: 2, legend: 3, mythic: 4, hidden: 5 };\n"),
    ('[신화] 확률표', "  const odds = [['hidden', '상자 1%'], ['legend', '3%'], ['epic', '10%'], ['rare', '38.5%'], ['common', '48.5%']];\n", 'replace',
     "  const odds = [['hidden', '상자 1%'], ['mythic', '0.5% · 상자 3.75%'], ['legend', '3%'], ['epic', '10%'], ['rare', '38.5%'], ['common', '48%']];\n"),
    ('[신화] 확률표 목록 순서', "    + ['hidden', 'legend', 'epic', 'rare', 'common'].map(r => {\n", 'replace',
     "    + ['hidden', 'mythic', 'legend', 'epic', 'rare', 'common'].map(r => {\n"),
    ('[신화] 여러 장 공개 연출 = 전설', "    const rarity = CHAR_DB[results[i].id]?.rarity;\n", 'replace',
     "    const rarity = fxRarity(CHAR_DB[results[i].id]?.rarity); // 7.0 신화는 전설 연출\n"),
    ('[신화] 한 장 공개 대기', "  const delays = { common: 650, rare: 900, epic: 1200, legend: 1650, hidden: 3000 };\n", 'replace',
     "  const delays = { common: 650, rare: 900, epic: 1200, legend: 1650, mythic: 2200, hidden: 3000 };\n"),
    ('[신화] 한 장 공개 연출 = 전설', "  if (character.rarity === 'legend' || character.rarity === 'hidden') { void overlay.offsetWidth; overlay.classList.add('fx-' + character.rarity); }\n", 'replace',
     "  if (['legend', 'mythic', 'hidden'].includes(character.rarity)) { void overlay.offsetWidth; overlay.classList.add('fx-' + fxRarity(character.rarity)); }\n"),
    ('[신화] 소식 티커', "  if (rarity === 'legend') postEvent('gacha', id, 'legend');\n", 'replace',
     "  if (rarity === 'legend' || rarity === 'mythic') postEvent('gacha', id, rarity);\n"),
    ('[신화] 티커 연출', "  if (tk) { tk.classList.toggle('fx-legend', ev.type === 'gacha' && ev.b === 'legend'); tk.classList.toggle('fx-hidden', ev.type === 'gacha' && ev.b === 'hidden'); }\n", 'replace',
     "  if (tk) { tk.classList.toggle('fx-legend', ev.type === 'gacha' && (ev.b === 'legend' || ev.b === 'mythic')); tk.classList.toggle('fx-hidden', ev.type === 'gacha' && ev.b === 'hidden'); }\n"),
    ('[신화] 마일리지', "const MILEAGE_POINTS = { common: 1, rare: 3, epic: 10, legend: 30, hidden: 30 };\n", 'replace',
     "const MILEAGE_POINTS = { common: 1, rare: 3, epic: 10, legend: 30, mythic: 30, hidden: 30 };\n"),
    ('[신화] 대진 카드 연출', "  const fx = r === 'legend' || r === 'hidden' ? r : '';\n", 'replace',
     "  const fx = r === 'legend' || r === 'mythic' || r === 'hidden' ? fxRarity(r) : ''; // 7.0 신화는 전설 연출 · 태그만 MYTHIC\n"),
    ('[신화] 대진 카드 태그', "'<span class=\"sweep\"></span><span class=\"tag\">LEGEND</span>'", 'replace',
     "'<span class=\"sweep\"></span><span class=\"tag\">' + (r === 'mythic' ? 'MYTHIC' : 'LEGEND') + '</span>'"),
    ('[신화] 도감 정렬 1', "  const rarityOrder = { common: 0, rare: 1, epic: 2, legend: 3, hidden: 4 };\n  ", 'replace', None),  # placeholder, 아래에서 2곳 모두 처리
    ('[신화] 도감 정렬 2', "  const order = { hidden: 0, legend: 1, epic: 2, rare: 3, common: 4 };\n", 'replace',
     "  const order = { hidden: 0, mythic: 1, legend: 2, epic: 3, rare: 4, common: 5 };\n"),
    ('[신화] 도감 필터', "  const f = [['all', '전체'], ['hidden', '히든'], ['legend', '전설'], ['epic', '영웅'], ['rare', '희귀'], ['common', '일반']];\n", 'replace',
     "  const f = [['all', '전체'], ['hidden', '히든'], ['mythic', '신화'], ['legend', '전설'], ['epic', '영웅'], ['rare', '희귀'], ['common', '일반']];\n"),
    ('[신화] 등급 태그 글자색', "color:${c.rarity === 'legend' ? '#3a2a05' : '#fff'};", 'replace', "color:${c.rarity === 'legend' ? '#3a2a05' : '#fff'};"),
    ('[신화] 배치 링 색', "const V41_RING = { hidden: '#111', legend: '#f2c94c', epic: '#c77dff', rare: '#4d8ef7' };\n", 'replace',
     f"const V41_RING = {{ hidden: '#111', mythic: '{MYTHIC_COLOR}', legend: '#f2c94c', epic: '#c77dff', rare: '#4d8ef7' }};\n"),
    ('[신화] 등급 단계 = 전설', "  const tier = CHAR_DB[id].rarity === 'hidden' ? 'legend' : CHAR_DB[id].rarity;\n", 'replace',
     "  const tier = CHAR_DB[id].rarity === 'hidden' || CHAR_DB[id].rarity === 'mythic' ? 'legend' : CHAR_DB[id].rarity;\n"),
    ('[신화] 등급 가중치', "  const base = { common: 1, rare: 1.35, epic: 1.75, legend: 2.3, hidden: 2.6 }[CHAR_DB[id]?.rarity] || 1;\n", 'replace',
     "  const base = { common: 1, rare: 1.35, epic: 1.75, legend: 2.3, mythic: 2.45, hidden: 2.6 }[CHAR_DB[id]?.rarity] || 1;\n"),
    ('[신화] 처치 효과음', "    if (rar === 'legend' || rar === 'hidden' || (u.level || 1) >= 5)", 'replace',
     "    if (rar === 'legend' || rar === 'mythic' || rar === 'hidden' || (u.level || 1) >= 5)"),
]
# 도감 정렬 1 은 같은 줄이 2번 나온다 → replace_all 로 처리
MYTHIC_EDITS = [e for e in MYTHIC_EDITS if e[3] is not None and e[0] != '[신화] 등급 태그 글자색']
MYTHIC_REPLACE_ALL = [
    ('[신화] 정렬 순서 (덱·도감, 2곳)', "  const rarityOrder = { common: 0, rare: 1, epic: 2, legend: 3, hidden: 4 };\n",
     "  const rarityOrder = { common: 0, rare: 1, epic: 2, legend: 3, mythic: 4, hidden: 5 };\n", 2),
]

# ---------- 신규 지후 6종 ----------
BALANCE = r"""  // ===== 7.0 신규 2차: 눈덩이 · 늑대 · 드림스케이프 · 락 · 리콜 · 마녀 (px 는 45px 격자 기준) =====
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
"""

CHARS = r"""  // ===== 7.0 신규 2차: 눈덩이 · 늑대 · 드림스케이프 · 락 · 리콜 · 마녀 =====
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
"""

READY = r"""  // 7.0 신규 2차
  if (u.charId === 'wolf') { u._wolfHits = 0; u._wolfLeap = null; u._wolfForm = false; }
  if (u.charId === 'dreamscape') u._dreamCd = 0;
  if (u.charId === 'witch') { u._potionCd = 1; u._witchSecret = false; }
"""

TICK_CALL = r"""  tickNew70c(u, dt); // 7.0 신규 2차: 늑대 · 드림스케이프 · 마녀 + [눈덩이]·[ㅤㅤㅤ]·[일렉]·포션 버프
"""

FUNCTIONS = r"""// ===== 7.0 신규 2차: 눈덩이 · 늑대 · 드림스케이프 · 락 · 리콜 · 마녀 =====
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
"""

CSS = r"""/* ===== 7.0 신규 2차 ===== */
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
"""

STATUS_ICONS = r"""  if (u._snowStacks > 0) html += `<span class="grudge-timer">❄️${u._snowStacks}</span>`;
  if (u._dreams) html += `<span class="grudge-timer">💭${u._dreams.length}</span>`;
  if (u._elec) html += '<span>⚡</span>';
  if (u._potCrit > 0 || u._potCritDmg > 0) html += '<span>🧪</span>';
  if (u._witchDr) html += '<span>🧪</span>';
"""

STAT_LABELS = r"""  snowSlowPerStack:['중첩당 이동속도 감소','%'], snowFreeze:['3중첩 빙결','s'],
  wolfHowlAfter:['하울링까지 공격','회'], howlRadius:['하울링 반경','칸'], wolfHp:['순간이동 후 HP'], wolfAtk:['순간이동 후 ATK'],
  dreamEvery:['파동 간격','s'], dreamRadius:['파동 반경','칸'], dreamTime:['[ㅤㅤㅤ] 지속','s'],
  elecChain:['일렉 연쇄 피해','%'], potionEvery:['포션 간격','s'], potionRadius:['포션 범위','칸'],
"""

EDITS = [
    ('CHARACTER_BALANCE 맨 앞에 수치 추가', 'const CHARACTER_BALANCE = {\n', 'after', BALANCE),
    ('CHAR_DB 맨 앞에 캐릭터 추가', 'const CHAR_DB = {\n', 'after', CHARS),
    ('readyRoundSkills: 라운드 준비', "  // 7.0 GT · 낚시 · 낫\n", 'before', READY),
    ('statusAndTimers: 매 틱 처리 호출 (1차 tickNew70b 바로 다음)', "  tickNew70b(u, dt); // 7.0 GT · 가시 · 낚시 · 낫 + [치명상]·[절상]·[침묵]·[생선조림]\n", 'after', TICK_CALL),
    ('신규 함수 (1차 신규 함수 블록 바로 앞)', "// ===== 7.0 신규: GT · 가시 · 낚시 · 낫 =====\n// 상대 진영을 향한 방향", 'before', FUNCTIONS),
    ('리콜: 배치하는 순간 소환 (spawnUnit 의 새 배치 블록)', "    unit.placementId = unit.uid;\n    state.placements.push({ id: unit.placementId, side, x, y, charId, form, level: 1 });\n", 'after',
     "    if (charId === 'recall') scheduleTask(() => recallSummon(unit), 30); // 7.0 리콜: 진영에 배치하면 바로 소환\n"),
    ('리콜: 매 라운드 다시 소환 (라운드 시작 재배치 직후)', "  // 좀비 S: 지난 라운드에 좀비로 만든 적이 있으면 이번 라운드에 아군 좀비 1기\n", 'before',
     "  state.units.filter(x => x.alive && x.charId === 'recall').forEach(recallSummon); // 7.0 리콜: 매 라운드 소환\n"),
    ('dealDamage: 마녀 비장의 포션 받는 피해 -15%', "  if (caster) caster._lastHitDamage = Math.max(0, finalDmg); // 쉴드에 막힌 양 포함, 실제로 들어간 피해\n", 'before',
     "  if (target._witchDr) finalDmg *= 1 - CHARACTER_BALANCE.witch.secretDr; // 7.0 마녀 비장의 포션\n"),
    ('dealDamage: [일렉] 연쇄 (피해가 들어간 직후)', "  // 흡혈 (에드게이): 입힌 피해(쉴드 흡수 포함)의 일정 비율 회복\n", 'before',
     "  if (target._elec && !opts.isDot && !opts.elecChain && (caster || opts.src) && shownDmg > 0) elecChain(target, shownDmg, caster || opts.src); // 7.0 락 [일렉]\n"),
    ('치명타 피해: 마녀 포션 +500%', "  if (critHit) amount *= 2 + (ravageCritBonus(caster) ? CHARACTER_BALANCE.ravage.rvCritDmg : 0); // 6.2 [유린]: 치명타 피해 +40%\n", 'replace',
     "  if (critHit) amount *= 2 + (ravageCritBonus(caster) ? CHARACTER_BALANCE.ravage.rvCritDmg : 0) + (caster && caster._potCritDmg > 0 ? CHARACTER_BALANCE.witch.potCritDmg : 0); // 6.2 [유린]: 치명타 피해 +40% · 7.0 마녀 포션 +500%\n"),
    ('치명타 확률: 마녀 포션 +5%', "  return CRIT_CHANCE + bc;\n", 'replace',
     "  return CRIT_CHANCE + bc + (caster && caster._potCrit > 0 ? CHARACTER_BALANCE.witch.potCrit : 0); // 7.0 마녀 포션\n"),
    ('updateUnitBars: [ㅤㅤㅤ] 잘림도 체력바에 표시 (1차 [절상] 줄 교체)', "  const fullMax = u._lacer ? u.maxHp / u._lacer.keep : u.maxHp; // 7.0 [절상]: 잘린 부분은 CSS 로 검게\n", 'replace',
     "  // 7.0 [절상] · [ㅤㅤㅤ]: 잘린 최대 체력을 원래 길이에 대해 검게 보여준다\n"
     "  const cutHp = (u._lacer ? u.maxHp / u._lacer.keep - u.maxHp : 0) + (u._dreams ? u._dreams.reduce((s, d) => s + d.cut, 0) : 0);\n"
     "  const fullMax = u.maxHp + cutHp;\n"
     "  if (u.el.classList.contains('lacerated') !== cutHp > 0) u.el.classList.toggle('lacerated', cutHp > 0);\n"
     "  if (cutHp > 0) u.el.style.setProperty('--lacer-cut', (cutHp / fullMax * 100).toFixed(1) + '%');\n"),
    ('aiSteerAndAttack: 늑대 순간이동 대기 중 멈춤', "  if (u._tendon) { u.desVx = 0; u.desVy = 0; u.physLock = 0; clearTelegraph(u); return; } // 7.0 낫: [힘줄 끊기] 준비\n", 'after',
     "  if (u._wolfLeap) { u.desVx = 0; u.desVy = 0; u.physLock = 0; clearTelegraph(u); return; } // 7.0 늑대: 하울링 후 순간이동 대기\n"),
    ('updateStatusIcons: 상태 아이콘', "  if (u._hooked) html += '<span>🎣</span>';\n", 'after', STATUS_ICONS),
    ('상세 정보 고유 수치 라벨', "  burnDps:['화상 초당 피해'], burnDuration:['화상 지속','s'],\n", 'before', STAT_LABELS),
]
