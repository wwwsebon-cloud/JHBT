# RE : 지후배틀 (RE:JHBT) — 작업 규칙

## 꼭 지킬 것
1. **한국어를 쓴다** — 대답 · 코드 주석 · 커밋 메시지 · 패치노트 모두.
2. **작업 전에 이 파일을 꼭 읽는다.** 함수 이름 · 예전 수치 · 연혁이 필요하면 `docs/CLAUDE-history.md` (R2.18 까지의 자세한 기록)에서 필요한 부분만 검색해서 본다.
3. **작업이 끝나면 디스코드 공지용 인포그래픽을 꼭 만든다** (아래 「인포그래픽」).
4. **신규 지후가 나오면 신규 지후 인포그래픽도 만든다. 서사(`story`)가 없으면 서사도 쓴다** (아래 「신규 지후」).
5. 기본적으로 **main 에 머지까지** 한다 (작업 브랜치 → 커밋 → main 에 머지 → 푸시). 푸시는 사용자 터미널에서.
6. 테스트할 때 실서버 Firebase 에 테스트 계정을 만들거나 로그인하지 않는다. 실제 계정 데이터를 건드리지 않는다 (`?bench=` · 로컬 프로필 · 헤드리스는 Firebase 주소를 막고).
7. 올리기 전에 빈 브라우저로 첫 로딩을 확인한다 (오류 없이 로비까지).

## 이름 · 버전 · 구조
- 정식 이름 **RE : 지후배틀** · 부제 **RE:JHBT** · 지금 **R2.20** (build 5).
- 버전은 `<meta name="jihoo-version">` (이름은 R1 과 같아야 한다 · 예전 화면이 새로고침 안내를 띄움). 버전 그대로인 잠수함 패치는 `<meta name="jihoo-build">` +1.
- `index.html` 하나가 게임 전체 (빌드 없음). 로컬 테스트: `python -m http.server 8766` → `index.html?bench=` (로그인 없이 · 테스트 함수는 `window.__rejhbt`).
- `firestore.rules` 는 R2 전체 규칙 · 콘솔에는 파일 전체를 게시 (사용자가 직접).
- R1 (v8.1) 코드는 `archive/v8.1` 브랜치.

## 업데이트 때 할 일
1. `index.html` 수정 — `CHARS` 수치와 함께 `passive` · `skill.desc` · `atkText` · `CHAR_INFO` (도감 상세) · 팁 (`TIPS_MORE` · `BOOT_TIPS`) 에 적힌 숫자도 같이.
2. 버전 / build 메타.
3. `PATCH_NOTES` 맨 위에 새 항목 (tag: new · buff · nerf · adjust · rework · fix · system).
4. 인포그래픽 (아래).
5. 이 파일에 바뀐 규칙이 있으면 짧게 갱신 (긴 연혁은 적지 않는다).

## 인포그래픽 (저장소 `infographics/`)
- 로컬 서버를 켠 뒤: `node infographics/extract.js` → `node infographics/notes2json.js <버전>` → `python infographics/make.py infographics/<버전>.json` → `CHROME=<크롬 경로> python infographics/shot.py "infographics/<버전>*.html"`.
- 레이아웃은 늘 최신 **남색 · 타일** (R2.20 부터 · `notes2json.js` `TILE_MIN` 1 · `theme: 'dark'`) — 밸런스 지후는 5칸 타일 (많으면 여러 장 `<버전>-2.png` …). 타일 글자가 넘치면 패치노트 문구를 짧게 (예: 「[최후의 탄환] 체력 손실 16% → 19%」).
- **신규 지후**: `node infographics/notes2json.js <버전> --new` (그 버전 패치노트의 tag 'new' 지후 · 직접 고르려면 id 를 뒤에) → make.py · shot.py.
- 티어표: make.py `"type": "tierlist"` · `infographics/tier-<버전>.json` (시뮬 결과로).
- 새 지후는 make.py 의 `NAMES` 와 `infographics/portraits.json` 에도 넣는다.
- 만든 PNG 는 커밋하고 사용자에게 보낸다.

## 신규 지후 체크리스트
- 초상화: **흰 배경 256×256 PNG** (투명 금지) → `PORTRAITS` (base64) · 원본은 `지후초상화/` 또는 사용자가 준 폴더.
- `CHARS` 끝에 추가 (도우미 함수는 `reapFx` 바로 앞 `// ── R2.xx 신규 지후 도우미 ──`). 사용자가 안 준 역할군 · 사거리 등은 정하고 알린다.
- `passive` · `skill.desc` 는 **쉽게 · 존댓말 ~니다** (중요한 숫자만) · 자세한 숫자는 `CHAR_INFO[id]`.
- **서사 `story`**: 「~입니다 · ~해요」 체 · 5~7문장 · 지후왕국 세계관과 다른 지후를 엮는다 (아래 「세계관」 · 기존 연결을 깨지 않게).
- 뽑기 · 덱 · 도감에 안 나오는 변신 지후 (왕자 지후 `prince`) 는 `Object.defineProperty(CHARS, id, { enumerable: false })` — `Object.keys(CHARS)` 에는 없고 `CHARS[id]` 로는 찾는다 (배치 기록 · 친선전 · 이름 표시가 그대로 돈다).
- 새 상태 · 버프는 `STATUS` · `FX_OF` / `fxList` (효과 아이콘) · `BUFF_SRC` (버프 출처 이름).
- 배치 기록에 새 필드를 넣으면 친선전 `packPlace` 에도.
- `TIER_SC` 에 없으면 50 (B) 으로 본다 → 티어 시뮬 뒤 넣는다.
- 헤드리스로 전투 테스트 (오류 · 이펙트가 남지 않는지 · 스크린샷).
- **렉이 거의 없게 만든다 — 유닛 50기 이상에서도 프레임 드랍이 전혀 없어야 한다** (아래 「성능 규칙」 · 벤치로 확인).

## 성능 규칙 (새 지후 · 새 이펙트)
- 전투 중 **화면이 다시 그려지는 일 (레이아웃 · 리페인트)을 최소로**: 이펙트는 `transform` · `opacity` 애니메이션만 (`box-shadow` · `filter` · `border-color` · `background` · `width` 를 애니메이션하지 않는다 · 큰 반투명 그라데이션 원을 매번 새로 만들지 않는다).
- CSS 에 `[style*=…]` 같은 **style 속성 선택자를 쓰지 않는다** — 하나만 있어도 전투 중 인라인 style (위치 · 체력바) 이 바뀔 때마다 자식 요소를 모두 다시 계산한다 (R2.18 build 5 · 새 로비 그리드는 `U2_GRID_TAG` 가 붙이는 클래스 `u2-gr` 로). 쓰러진 유닛은 효과 아이콘 줄 `ufxOf` 을 다시 만들지 않는다.
- DOM 위치 · 크기는 프레임마다 한 번 이하로 (`tick` 은 한 프레임에 여러 번 돈다 · 그리기는 바뀐 값만 · `translate` 로).
- 매 스텝 `A.status` · `A.buff` 를 다시 걸지 않는다 (걸 때마다 `drawUnit` → 상태 아이콘을 다시 그린다) — 이미 걸려 있으면 남은 시간만 늘린다.
- 이펙트 DOM 은 `S.fast` 일 때 만들지 않고, 끝나면 꼭 지운다 (`u.fx` 에 넣으면 쓰러질 때 · 라운드 끝에 지워진다).
- 여러 유닛을 잇는 선 · 빛줄기는 유닛마다 DOM 을 만들지 않는다 → 전장 캔버스 하나에 프레임마다 한 번 (모노리스 `monoDraw` · R2.20 · DOM 으로는 50기 벤치 FPS 46 → 36).
- **큰 원 · 긴 빛줄기도 DOM 으로 만들지 않는다** — 반경 15칸 원 (지름 2,250px) · 대각선 레이저는 폰 GPU 에 거대한 레이어가 된다 (헤드리스로는 안 보인다) → `fxRing(x, y, R, 색, ms, 테두리)` · `FXC.beams` (monoDraw 캔버스 · R2.20 build 3 DJ · 모노리스).
- 넓은 범위 스킬 피해 숫자는 `dealDamage(..., { skill: true, lite: true })` (처음 몇 개만 크게) — 스킬 피해 숫자는 원래 한도(FX_CAP)를 무시한다.
- 전장 격자는 `#fieldGrid` 를 transform 으로만 옮긴다 (`applyCamera`) — fieldWrap 의 background-position 을 매 프레임 바꾸면 화면 전체를 다시 그린다.
- 확인: `?bench=50&ids=<지후,…>` (왼쪽 위 FPS · 최악 프레임 · 계산 ms) · 헤드리스 `Performance.getMetrics` 의 RecalcStyle · Layout 횟수를 다른 지후와 비교.

## 전투 엔진 핵심
- 전투 난수는 `rng` 하나만 (친선전 두 화면이 같아야 한다) · 전투 코드에 `Math.random` · `Date.now` 금지. 연출 · 뽑기는 `Math.random`.
- 스킬 도우미 `A` (`A.dmg` %피해 · `A.status` · `A.buff` · `A.line` 관통탄 · `A.zone` · `A.boom` · `A.knock` · `A.later` 전투 시간 예약 · `A.transform` · `A.summon` · `A.spawnChild`). 훅: `onStart` · `tick` · `customAttack` · `onHit` · `onKill` · `onUnitDeath` · `steer` · `takenMult` · `atkMult` · `pickTarget` · `gauge`.
- 즉사는 `instaKill(src, t, label)` 하나로 (모든 생존기 무시). 피해는 `dealDamage` (받는 피해 감소 최대 90% · 최소 1 · 죽인 쪽 `t.killer`).
- 투사체 `S.shots` · 관통탄 `S.lines` 는 맞는 순간 새로 쏜 것도 남도록 목록을 비우고 돈다 (R2.18 수정 · 다시 `filter` 한 번으로 바꾸지 말 것).
- 전투 중 `drawUnit` 은 모았다가 프레임마다 한 번 그린다. 화면 효과 DOM 은 `S.fast` (시뮬) 일 때 만들지 않는다.
- 전장: 세로 17 × 24칸 (`CFG.CELL`) · 라운드 60초 · 배치 3 × 5칸 · 같은 지후 3기 (출격제한 `deployLimit`) · 레벨은 경기 안에서만 (최대 Lv5 · 갓지후 Lv6 · 레벨마다 체력 · 공격력 기본의 +60% `CFG.LEVEL_ADD` · R2.19).

## 게임 규칙 요약
- 모드: 일반전 (봇 · 라이프 3) · 친선전 (온라인 1:1) · 아케이드 (미러전 · 지후의 탑 · 경쟁전) · 샌드박스. 랜덤 이벤트는 임시로 꺼져 있다 (`CFG.EV_ENABLED`).
- 덱 5기 · 등급 일반 / 희귀 / 영웅 / 전설 · 뽑기 64.5 / 30 / 4 / 1.5 · 천장 80 · 중복은 조각 · 랭크 (조각 + 골드 · 랭크 6 고유능력 `enh6`).
- 봇 배치 `botDeployOne`: 둘 수도 · 합칠 수도 있으면 페르소나의 합체 확률 `mf` (없으면 **50%** · R2.19) 로 레벨업 · 아니면 새로 놓기.
- 배속 (R2.19): 전투 화면 동그란 버튼 `#speedSeg` 하나 · 누구나 1.5배속 · VIP 는 2배속 (`fastSpeed`) · 꺼 두어도 25초 뒤 자동 1.5배속.
- 봇: 초보자 보호 (5판 · 봇 ×0.75) → Lv.5~10 사이 봇 덱이 서서히 강해진다 (`botDeckRamp` · `TIER_SC`).
- 화면: 새 로비 `#ui2` (어두운 남색 디자인 · 템플릿 `ui2Tpl` · `u2Vals` / `u2Render`). 새 CSS 는 `u2-` 접두사.

## 세계관 (서사를 쓸 때)
- 지후들이 사는 **지후왕국**. 국왕 **화염 지후 1호** · 오른팔 **물 지후**. 같은 종류도 1호 · 2호 … 여럿.
- 메인 스토리: 황사 지후의 「황사회주의」 지령으로 서쪽 마을 **화염 지후 314호**가 반란 → 소탕군 지원자는 암살 · 쉴드 · 검 · 얼음 넷뿐.
- 자주 쓰는 연결: 왕궁 (근위대장 수호자 · 의원 주사 · 금고 티타늄 · 시계방 시계 · 천문대 별) · 블리자드 ↔ 태양 · 얼음 ↔ 블리자드 (펜팔) · 촉수 ↔ 죠스 · 라이플의 러시안룰렛 트라우마 · 포식이 남의 음식을 먹어 치움 · 조커가 슬롯머신을 털었음.
- 지후마다 자세한 서사 연결은 `docs/CLAUDE-history.md` 의 「세계관 · 서사」와 각 버전 서사 항목.

## 시뮬 · 티어
- `tools/tier-5v5.js` (무작위 10기 5:5 · Lv1 · 60초 판정 · Bradley-Terry 점수 · k-평균으로 S~D). 헤드리스: `%TEMP%/ld/bprun.js <tier-5v5.js> index.html <포트> <판수> <out.json>` (전투 시간도 기록 · R2.18 build 16 에서 1,000판 약 5분 · 판 시드가 고정이라 N 을 늘리면 앞 판은 그대로 두고 뒤에 더 붙는다). 지금 `TIER_SC` · `infographics/tier-R2.19` 은 R2.19 · 613판 (1,000판 중 사용자 요청으로 중단).
- 결과로 `TIER_SC` (S 80~100 · A 65~79 · B 40~64 · C 20~39 · D 0~19) 를 갱신한다.
- 메커니즘을 바꾸는 중에 돌린 시뮬은 무효 — 마지막 코드로 다시 돌린다.

## 계정 · 서버 (짧게)
- Firebase 프로젝트 `jihoobattle` · 게스트는 익명 인증 · 기록 `r2_backups/<uid>` · 이 기기 `rejhbt.profile.v1`.
- **켤 때 서버 기록과 맞추기 (R2.18 build 6)**: 저장 시각(`savedAt`)은 켜는 동안 `save()` 가 바꿔 버리니 비교에 쓰지 않는다 — 백업마다 기록 안에 저장 번호 `profile.bkWid` 를 넣고, 이 기기는 마지막으로 맞춘 번호 `profile.syncWid` 를 기억 → `serverNewer(b)`: 번호가 다르면 서버 기록 · 번호가 없으면 진행도(레벨 → 경험치 → 판 수) 앞선 쪽. 서버 규칙(`r2_backups` 는 payload · savedAt · updatedAt 만)을 안 바꾸려고 번호는 payload 안에.
- **백업 강화 (R2.20 build 3)**: `backupNow` 는 이 창이 BK_TRUST(60초) 안에 저장 · 확인하지 않았으면 `runTransaction` 으로 서버 `bkWid` 가 `profile.syncWid` 와 같을 때만 쓴다 (다르면 `bkConflict` → `bkPick`: 진행도 `bkSum` 이 한쪽이 모두 같거나 앞서면 그쪽 · 엇갈리면 묻는다). 숨었다 돌아옴 · 잠들었다 깸 · 다른 탭이 기록을 바꿈 → `ACC.vAt = 0`. 멈춘 창(`ACC.kicked`)은 `writeLocal` 도 안 한다. 다시 로그인해도 이 계정 기록이면 비교 (예전엔 서버로 무조건). 게스트 진행이 있으면 로그인 전에 `guestLoginOk`. 서버 이력 `r2_backups/<uid>/hist/{t0~t7 · x0~x3}` (3시간마다 · 버린 기록) → 운영 도구 「보기」가 지금 없는 지후를 보여 준다 (rules 게시 필요). 상태는 `bkState` · 메뉴 점 `bkWarn`.
- 계정 창: 햄버거 → **JHBT 계정** (`#accModal` · `renderAccount` · `openAccount(tab)`) · 환경설정 맨 위는 요약 한 줄 (`renderSetAcc`) · 튜토리얼 `#tutAcc` · 닉네임 단계 `#nsAcc` 「이미 계정이 있나요?」 (로그인하면 `TUT.abort`). 가입 보상 `joinReward` = **선택 전설 모집권** (`signRw` 로 계정당 한 번).
- `dlg` 가 다른 dlg 에 밀리면 `null` (예전 false) — 꼭 골라야 하는 창은 null 이면 다시 묻는다.
- 운영 우편 `giftMail` 보상: ◆ · ● · 랜덤 영웅/전설 · **정해진 지후** `{ kind: 'char', id, amount }` (R2.20 build 2 · 운영 도구 「지후」 칸에 이름) · 이 버전이 모르는 보상이 든 우편은 받은 것으로 치지 않고 남겨 둔다 (`giftOk`).
- 운영자 `admins/<uid>` · 정지 `bans/<uid>` · 점검 `config/maintenance` · 공지 `config/announce` · 욕설 검사 `hasBad` (금지어를 늘리면 rules 의 `cleanName` 도).
- 프로필 정규화가 보는 데이터 (`ITEMS` · `FRAMES` · `MQ`) 는 `let profile = loadProfile()` 보다 앞에.

## 최근 변경 (R2.20)
- build 5: **초보자 모집** (`CFG.NB_GACHA` 전설 3% · `NB_PULL10` ◆950 · `NB_PULLS` 50 · `profile.nbPulls` · 50번째 `rollLegend` 확정 · 일반 천장 `pity` 는 건드리지 않음 · `pull(10, false, true)` · 결과 요약 `GR.again = 'nb'`) · 새 로비 상점 확률 칩은 `CFG.GACHA` 에서 (예전엔 1.5% 로 박혀 있었다) · 전투 곡 `BGM_MUL.battle` 0.9 (`BGM_GAIN` 삭제 · 원래 곡 크기).
- build 4: 전투 배경음악 Sagöl (`bgm/battle.mp3`) 삭제 → `bgm/troll.mp3` · `bgm/lounge.mp3` 무작위 (`BGM_SRC.battle` 배열 · 판마다 새로 · 끝나면 다른 곡 · 들은 위치는 파일별 `bgm.pos`) · (build 5 에서 곡 크기 맞춤은 뺐다 — 원래 크기 × 0.9).
- build 3: 백업 강화 · JHBT 계정 창 · 가입 보상 선택 전설 · DJ ATK 30 → 67.5 · 출격제한 1 · 모노리스 범위 밖 0.25 → 0.5% · DJ 파동 · 모노리스 레이저 캔버스 · 격자 transform (위 「계정」 · 「성능 규칙」).
- 신규 지후 8종 (CHARS 끝 · 도우미는 `reapFx` 바로 앞 `// ── R2.20 신규 지후 도우미 ──`):
  - **개구리** `frog`: 레벨이 오르면 (`levelUp` · `moveTile` 합체 → `frogEvolve`) 35% 왕자 · 65% 배치 칸에서 지운다 · 다른 방법으로 오른 개구리는 전투 시작 `frogSweep` · 친선전은 `hashSeed(seed, 'frog', actKey() …)`.
  - **왕자** `prince` (숨은 항목): 근접 cleave · `onHit` 15% 미만 `instaKill` · `atkMult` 공격 한 번에 +5% · `onDeath` 아군 버프 `royal<uid>`.
  - **모노리스** `monolith` (출격제한 1): `u.mn` 충전 (4.5칸 안 아군 초당 4% · 밖 2% · build 3) → 2초 차징 (`portraitCharge`) → 무작위 적 5기 현재 체력 × 레벨 × 10% · 빛줄기는 캔버스 `monoDraw` (loop · 초당 30번 · 전투가 끝나면 지운다) · 머리 위 % 는 `.xlv.mono`.
  - **엑시노스** `exynos`: 십자 칸 아군 `u.gpu` · `gpuTick` 이 `buffs.gpu` 를 직접 고친다 (spd · atk · dodge · crit · critDmg 최대 0.5) · 치명타 계산이 `crit` · `critDmg` 버프를 본다 · 10초 뒤 근접 일반 공격한 적 `gpuBurn` (dealDamage 끝).
  - **엔지니어** `engineer` + 소환체 **포탑** `turret` (SUMMONS · 움직이지 않음 · `invMass` 0): `engTick` 5초 설치 (steer 로 멈춤) → `engPlace` · 다음 설치 10초 뒤 (15초마다).
  - **왜곡** `warp`: SP 7 · `warpCast` 반경 5.2칸 · `t.wp` (아군 +25% · 적 −25% · `warpSet` 이 최대 체력 `baseMaxHp` 와 현재 체력을 5초 동안 선형으로 되돌린다) · 상태 `warpUp` · `warpDn`.
  - **저격** `sniper`: `bonus` 로 거리 비례 −80% (`sniperCut`).
  - **DJ** `dj`: 일반 공격 `djWave` (5.7칸 · SP 1) · SP 12 `djBlast` × 4 (0.5초 · 15칸 · `DJ_WAVES` 8색 · 스킬 파동은 테두리 0.8칸) · 이펙트는 `fx-emp-wave` 재사용 (`fxRoom` 한도).
  - **아케인** `arcane`: `def.lifesteal` 0.3 (dealDamage · 체력 피해만 · 넘친 피해 제외) · SP 4 `arcaneBlink`.
- 밸런스: 탄환 ATK 190 → 160 · [최후의 탄환] 체력 손실 16 → 19%.
- 테스트 훅에 `levelUp` · `moveTile` · `frogEvolve` · `djBlast` · `setRng` 추가. 인포그래픽 `make.py` 밸런스 머리 숫자는 지후 수로.
- 신규 지후 `TIER_SC` 는 아직 없다 (50 = B 로 본다) · 랭크 6 고유능력도 아직.

## 지난 변경 (R2.19)
- 밸런스 26종 · 리워크 3종: **예언** (`prophecyResolve`: 예언 지후 자신이 그 칸에 새로 왔거나 레벨이 바뀌었고 **그리고** 대칭 칸도 바뀌어야 성공) · **별** (돌진 = 초당 `STAR_DASH` 17칸으로 대상에게 부딪힌 뒤 제자리로 · `u.sd` · steer/tick · [졸음] 4초 −30% · [수면] 200) · **신칸센** (ATK 400 · 충돌 공격력 100% · 멈춰 있는 동안 일반 공격 10% · 1.4초 · 사거리 3.9 · 돌진 중엔 steer 로 공격 안 함).
- 레벨업 지후: 레벨업 회복 최대 체력 50% · build 13 부터 주석에 묻혀 있던 그림 · 레벨 표시 (`A.portrait` · `A.headLv`) 를 되살림.
- 테스트 훅 `window.__rejhbt` 에 `prophecyResolve` · `botDeployOne` 추가.
