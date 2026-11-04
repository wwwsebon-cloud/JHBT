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
- 정식 이름 **RE : 지후배틀** · 부제 **RE:JHBT** · 지금 **R2.18** (build 16).
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
- 밸런스 지후가 30명 이상이면 자동으로 타일 모드 (여러 장 `<버전>-2.png` …) · 적으면 칩 목록.
- **신규 지후**: `node infographics/notes2json.js <버전> --new` (그 버전 패치노트의 tag 'new' 지후 · 직접 고르려면 id 를 뒤에) → make.py · shot.py.
- 티어표: make.py `"type": "tierlist"` · `infographics/tier-<버전>.json` (시뮬 결과로).
- 새 지후는 make.py 의 `NAMES` 와 `infographics/portraits.json` 에도 넣는다.
- 만든 PNG 는 커밋하고 사용자에게 보낸다.

## 신규 지후 체크리스트
- 초상화: **흰 배경 256×256 PNG** (투명 금지) → `PORTRAITS` (base64) · 원본은 `지후초상화/` 또는 사용자가 준 폴더.
- `CHARS` 끝에 추가 (도우미 함수는 `reapFx` 바로 앞 `// ── R2.xx 신규 지후 도우미 ──`). 사용자가 안 준 역할군 · 사거리 등은 정하고 알린다.
- `passive` · `skill.desc` 는 **쉽게 · 존댓말 ~니다** (중요한 숫자만) · 자세한 숫자는 `CHAR_INFO[id]`.
- **서사 `story`**: 「~입니다 · ~해요」 체 · 5~7문장 · 지후왕국 세계관과 다른 지후를 엮는다 (아래 「세계관」 · 기존 연결을 깨지 않게).
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
- 확인: `?bench=50&ids=<지후,…>` (왼쪽 위 FPS · 최악 프레임 · 계산 ms) · 헤드리스 `Performance.getMetrics` 의 RecalcStyle · Layout 횟수를 다른 지후와 비교.

## 전투 엔진 핵심
- 전투 난수는 `rng` 하나만 (친선전 두 화면이 같아야 한다) · 전투 코드에 `Math.random` · `Date.now` 금지. 연출 · 뽑기는 `Math.random`.
- 스킬 도우미 `A` (`A.dmg` %피해 · `A.status` · `A.buff` · `A.line` 관통탄 · `A.zone` · `A.boom` · `A.knock` · `A.later` 전투 시간 예약 · `A.transform` · `A.summon` · `A.spawnChild`). 훅: `onStart` · `tick` · `customAttack` · `onHit` · `onKill` · `onUnitDeath` · `steer` · `takenMult` · `atkMult` · `pickTarget` · `gauge`.
- 즉사는 `instaKill(src, t, label)` 하나로 (모든 생존기 무시). 피해는 `dealDamage` (받는 피해 감소 최대 90% · 최소 1 · 죽인 쪽 `t.killer`).
- 투사체 `S.shots` · 관통탄 `S.lines` 는 맞는 순간 새로 쏜 것도 남도록 목록을 비우고 돈다 (R2.18 수정 · 다시 `filter` 한 번으로 바꾸지 말 것).
- 전투 중 `drawUnit` 은 모았다가 프레임마다 한 번 그린다. 화면 효과 DOM 은 `S.fast` (시뮬) 일 때 만들지 않는다.
- 전장: 세로 17 × 24칸 (`CFG.CELL`) · 라운드 60초 · 배치 3 × 5칸 · 같은 지후 3기 (출격제한 `deployLimit`) · 레벨은 경기 안에서만 (최대 Lv5 · 갓지후 Lv6 · 레벨마다 체력 · 공격력 기본의 +80% `CFG.LEVEL_ADD` · R2.18 build 10).

## 게임 규칙 요약
- 모드: 일반전 (봇 · 라이프 3) · 친선전 (온라인 1:1) · 아케이드 (미러전 · 지후의 탑 · 경쟁전) · 샌드박스. 랜덤 이벤트는 임시로 꺼져 있다 (`CFG.EV_ENABLED`).
- 덱 5기 · 등급 일반 / 희귀 / 영웅 / 전설 · 뽑기 64.5 / 30 / 4 / 1.5 · 천장 80 · 중복은 조각 · 랭크 (조각 + 골드 · 랭크 6 고유능력 `enh6`).
- 봇: 초보자 보호 (5판 · 봇 ×0.75) → Lv.5~10 사이 봇 덱이 서서히 강해진다 (`botDeckRamp` · `TIER_SC`).
- 화면: 새 로비 `#ui2` (어두운 남색 디자인 · 템플릿 `ui2Tpl` · `u2Vals` / `u2Render`). 새 CSS 는 `u2-` 접두사.

## 세계관 (서사를 쓸 때)
- 지후들이 사는 **지후왕국**. 국왕 **화염 지후 1호** · 오른팔 **물 지후**. 같은 종류도 1호 · 2호 … 여럿.
- 메인 스토리: 황사 지후의 「황사회주의」 지령으로 서쪽 마을 **화염 지후 314호**가 반란 → 소탕군 지원자는 암살 · 쉴드 · 검 · 얼음 넷뿐.
- 자주 쓰는 연결: 왕궁 (근위대장 수호자 · 의원 주사 · 금고 티타늄 · 시계방 시계 · 천문대 별) · 블리자드 ↔ 태양 · 얼음 ↔ 블리자드 (펜팔) · 촉수 ↔ 죠스 · 라이플의 러시안룰렛 트라우마 · 포식이 남의 음식을 먹어 치움 · 조커가 슬롯머신을 털었음.
- 지후마다 자세한 서사 연결은 `docs/CLAUDE-history.md` 의 「세계관 · 서사」와 각 버전 서사 항목.

## 시뮬 · 티어
- `tools/tier-5v5.js` (무작위 10기 5:5 · Lv1 · 60초 판정 · Bradley-Terry 점수 · k-평균으로 S~D). 헤드리스: `%TEMP%/ld/bprun.js <tier-5v5.js> index.html <포트> <판수> <out.json>` (전투 시간도 기록 · R2.18 build 16 에서 1,000판 약 5분 · 판 시드가 고정이라 N 을 늘리면 앞 판은 그대로 두고 뒤에 더 붙는다). 지금 `TIER_SC` · `infographics/tier-R2.18` 은 build 16 · 1,000판.
- 결과로 `TIER_SC` (S 80~100 · A 65~79 · B 40~64 · C 20~39 · D 0~19) 를 갱신한다.
- 메커니즘을 바꾸는 중에 돌린 시뮬은 무효 — 마지막 코드로 다시 돌린다.

## 계정 · 서버 (짧게)
- Firebase 프로젝트 `jihoobattle` · 게스트는 익명 인증 · 기록 `r2_backups/<uid>` · 이 기기 `rejhbt.profile.v1`.
- **켤 때 서버 기록과 맞추기 (R2.18 build 6)**: 저장 시각(`savedAt`)은 켜는 동안 `save()` 가 바꿔 버리니 비교에 쓰지 않는다 — 백업마다 기록 안에 저장 번호 `profile.bkWid` 를 넣고, 이 기기는 마지막으로 맞춘 번호 `profile.syncWid` 를 기억 → `serverNewer(b)`: 번호가 다르면 서버 기록 · 번호가 없으면 진행도(레벨 → 경험치 → 판 수) 앞선 쪽. 서버 규칙(`r2_backups` 는 payload · savedAt · updatedAt 만)을 안 바꾸려고 번호는 payload 안에.
- 운영자 `admins/<uid>` · 정지 `bans/<uid>` · 점검 `config/maintenance` · 공지 `config/announce` · 욕설 검사 `hasBad` (금지어를 늘리면 rules 의 `cleanName` 도).
- 프로필 정규화가 보는 데이터 (`ITEMS` · `FRAMES` · `MQ`) 는 `let profile = loadProfile()` 보다 앞에.

## 최근 변경 (R2.18)
- 신규 지후 4종: BB탄 `bbgun` (영웅 딜러 · ATK 200 · 2.3초 · 가장 가까운 다른 적에게 거리 제한 없이 최대 2번 튕김 ×0.7) · 홍명보 `hong` (영웅 서포터 · ATK 320 · 5초 · 3~6번 패스 · 받으면 공격력 50% 회복 · 패스 × 25% 슛 · 서사: 수비만 하다 축구계에서 쫓겨날 뻔했지만 돌아옴) · EMP `emp` (전설 컨트롤러 · 사거리 4 · 6.5칸 파동 · SP 8 자기장) · 드래곤 `dragon` (전설 탱커 · ATK 70 · 1.25초 · 사거리 6 불덩이 → 1.9칸 광역 · SP 11 브레스 = 다음 공격 한 번 150% · 3.2칸 · 화상 · 8% 비행 = 1초 승천 (`dragon-rise` · 공격 안 함) 뒤 초당 9.5칸 · 13칸 + 불길 5초 · 150% · build 14 착지 `dragonTouch`: 주위 3칸 [화상] 3초 120% · 3초 받는 피해 −20% `u.landDr` → `takenMult`).
- 밸런스 21종 (솔렘라멘트 · 블리자드 · 회오리 하향 등) · 괴도는 레벨 1 도 훔친다 (그 라운드에서 사라지고 다음 라운드에 다시 나옴) · 핵은 30초 + 떨어질 자리에 남은 초 · 고독한 [고독] 공속 · 이속 + 검은 아우라.
- build 5 렉 수정: EMP 자기장 · 드래곤 불길 · 고독 아우라를 합성 애니메이션 (transform · opacity) 으로 · 자주 들어가는 범위 피해는 `dealDamage` 의 `lite` (피해 숫자를 한도 안에서만) · EMP 는 걸려 있는 [침묵] · 감속의 시간만 늘린다 · 큰 이펙트는 `fxRoom` 한도 안에서만.
- build 8: 빠따 ATK 190 · SP 6 / 성검 최대 체력 3% · 사거리 5 / 솔렘라멘트 ATK 66 · 0.7초 / 달 공격마다 +1%p / 괴도 사거리 5.5 · 1.7초 · 예고장 13초 · 괴도가 쓰러지면 취소 (`thiefCancel` · `onDeath`) / **충전 리워크** (HP 1140 · 반경 5칸 충전 범위 0.5초마다 최대 SP 8% `spGive` · SP 11 [급속 충전] 가장 가까운 아군 SP 가득 · 제외 `chExcl`) / UltraProMax+ 계정당 1회 (`once`) / 랭크 표시: 지후 카드 동그라미 숫자 · 매치 인트로 · 전투 덱 `rkDot` (`S.enh` 가 있는 판만 · 봇은 내 덱 평균) / **중복 로그인: 새로 연 창이 우선 · 먼저 켠 창은 [새로고침] 만** (`boBtn` → `location.reload`). 따라쟁이 봇은 R2.13.2 에 이미 삭제.
- build 9 상점 개편: 오늘의 매물 5칸 = 지후 매물 (희귀 68 · 영웅 26 · 전설 5) 또는 아이템 `SHOP_ITEMS` (w 무게 · t 등급 · 전설급 t≥3 은 하루 1개 · 같은 아이템 한 번 · t 순으로 뒤로) · `buyShopItem` · 지후 매물은 골드로만 · 초보자 지원 패키지 I · UltraProMax+ 는 `shopOnly` (고정 패키지 칸에서 빠지고 매물로만 · 계정당 1회는 그대로 · 산 계정에는 안 나온다) · 빛나는 조각 4종 `GLOW_OF` (`enhGlow` 가 등급에 맞는 조각을 쓴다) · 오늘 매물은 `shop.v` 2 로 한 번 다시 뽑는다.
- build 10: 인게임 레벨업 +50 → +80% / 샌드박스 레벨 [+] 는 `maxLv(id)` 까지 (갓지후 Lv6) / 상점 리롤마다 무료 보상 새로.
- build 11: EMP 자기장 수정 (build 10 · [매혹] 무시 · [NO U] 제외) 은 사용자 요청으로 되돌림 — 예전 동작 (`foes(u)` · [매혹]되면 아군에게 · NO U 는 디버프를 마지막 공격자에게) 이 그대로 규칙이다.
- build 12 · 13: 번개 HP 640 · ATK 60 · 사거리 3.5 · 낙뢰 1350% / 레벨업 HP 2150 · 레벨이 오르면 체력 가득 · `forms` 는 시작 능력치 `u.lvB` 의 배수 (체력 · 공격력 Lv2 ×1.15 · ×1.3125 · Lv3 ×1.3 · ×1.625 (build 15) · 예전엔 R2.17.2 전 숫자라 레벨이 오르면 약해졌다).
- build 16: 반중력 지후는 다른 반중력 지후에게 [반중력]을 걸지 않는다.
- 아직 남은 일: `firestore.rules` 콘솔 게시 (사용자) · 신규 지후 랭크 6 고유능력 (사용자가 줄 때).
