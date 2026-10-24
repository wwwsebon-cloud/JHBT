# RE : 지후배틀 (RE:JHBT) — 작업 규칙 · 게임 핵심 정리

## 이름 · 버전
- 정식 이름 **RE : 지후배틀** · 부제 **RE:JHBT**. 버전은 **R2.0** 부터 (`<meta name="jihoo-version">` · 잠수함 패치는 `<meta name="jihoo-build">` +1)
- 지후배틀(R1, v8.1) · 지후배틀 2(JHBT2) 는 서비스 종료. R1 전체 코드는 `archive/v8.1` 브랜치에 백업
- 버전 태그 이름은 R1 과 같은 `jihoo-version` 이어야 한다 (예전 화면이 새 버전을 알아보고 새로고침 안내를 띄운다)

## 구조
- `index.html` 하나가 게임 전체 (빌드 없음). 로컬 테스트: `python -m http.server 8766`
- 구역: CONFIG → CHARS(지후 데이터) → STATUS → 이모티콘 목록 → 시드 난수 → 저장 · 계정 → Firebase → 엔진(전투) → 라운드 · 배치 → 가차 → 이모티콘 → 봇 → 온라인(점검 · 접속 상태) → 친구 · 채팅 → 우편 · 쿠폰 → 업적 · 출석 → 꾸미기(프로필 테두리) → 친선전 → 운영 도구 → 배경음악 → 상점 → 일일 퀘스트 → 통계 → 효과음 → 메뉴 · 패치노트 · 도움말 · 환경설정 → 리더보드 → 업데이트 → 시작
- `firestore.rules` = R2 전체 규칙 (R1 · JHBT2 규칙을 대체). 콘솔에는 **파일 전체**를 게시
- 화면은 **글래스 UI** (R2.1 · iOS 풍 밝은 글래스모르피즘). R1 UI · 예전 흑백 다크 UI 는 쓰지 않는다
  - 토큰(`:root`): 바탕 `#e4e5e8` + 블롭 3개(파랑 · 보라 · 노랑) · 잉크 `#111318` · 글래스 3단계(필 `.g-pill` · 카드 `.g-card` · 시트 `.modal .box`) · 주 버튼 검정(`.k-btn` / `.btn.primary`) · 보조 버튼 `.g-btn` · 스위치 `.sw` · Pretendard 하나
  - 등급 링: 일반 `#c9c9c6` · 희귀 `#4f9dff` · 영웅 `#b26bff` · 전설 `#ffc21a` · 초상화는 원형 흰 바탕 + 링
  - 공통 상단 바(`.topbar`) · 하단 탭 바(`#tabbar`)는 `CHROME` 화면(로비 · 덱 · 뽑기 · 상점 · 가방 · 아케이드 · 탑 · 경쟁전 · 친구 · 리더보드 · 꾸미기)에서만 (드래프트 화면 `screen-draft` 은 아님) (`body[data-chrome]`, `show()` 가 정한다) · 탭 이동은 `openTab(name)` · 모바일(≤700px) 탭 7개(로비 · 덱 · 뽑기 · 상점 · 가방 · 아케이드 · 친구) · 리더보드는 메뉴
  - 퀘스트 · 출석 · 업적 · 신규 보상은 시트 하나(`#qsModal`) · 전투 화면 상태 클래스 `deploy` / `combat` / `spec` (`setPhase`)

## 업데이트 때 반드시 할 일
1. `index.html` 수정 (CHARS 수치 · 설명 텍스트 · atkText 등 하드코딩된 수치도 같이)
2. version / build 메타 갱신
3. `PATCH_NOTES` 맨 위에 새 항목 (tag: new 신규 · buff 상향 · nerf 하향 · adjust 조정 · fix 수정 · system 시스템)
4. **디스코드 공지용 인포그래픽 만들기 (잊지 말 것)**: `infographics/<버전>.json` → `python infographics/make.py infographics/<버전>.json` → `CHROME=<크롬 경로> python infographics/shot.py infographics/<버전>.html`. 형식은 make.py 상단 주석. 항목이 많으면 JSON 에 `"width": 1600, "cols": 2` (넓게 2단 · 너무 길쭉하지 않게). 초상화는 `infographics/portraits.json` (index.html 의 PORTRAITS 를 바꾸면 다시 만든다)
5. 이 파일(CLAUDE.md)에 바뀐 규칙이 있으면 갱신

## 게임 규칙 · 데이터
- 모드: **일반전**(봇 · 라이프 3 · R2.7.2) · **친선전**(온라인 1:1 · 관전) · **아케이드**(미러전 · 지후의 탑 · 경쟁전 · R2.7.2). 그 밖의 모드(경매 · 협동 등)는 사용자가 요청할 때만
- **게임 모드 (R2.7.2)**: 로비 `#modeSeg` → `profile.mode` 'event'(랜덤 이벤트 · 기본) | 'classic'(이벤트 없음) · 판마다 `S.evOn` (`evRoll` 이 본다). 친선전은 방장 설정을 **시드 맨 아래 비트**로 전달 (`seed & 1` = 랜덤 이벤트 · 규칙 변경 없이)
- 지후 68종 (JHBT2 기준 19종 + R2.2 신규 14종 + R2.5 신규 5종 + R2.6 신규 3종 + R2.7.2 촉수 + R2.8 신규 9종 + R2.9 폭탄 · 핵미사일 + R2.10 신규 8종 + R2.10.2 신규 7종): 일반 fire ice sword assassin shield · 희귀 accel slime dice coin heal berserker slot bow barrier melody tailwind radiation rain · 영웅 scythe levelup gun combo cactus jaws water dust necro rifle bubble syringe tentacle lantern devour bomb sommelier chicken pan lock teemo venom · 전설 moon magic gift atom blizzard bat train titanium sun whirl lonely berserk gumiho deathnote prophecy joker lightning revive guardian clock charge reaper nuke star growth antigrav nou biker (R2.4: 황사 · 물 → 영웅 · 고독한 · 광폭화 → 전설). 기본 지급(starter): 화염 · 얼음 · 검 · 암살 · 쉴드
- 아직 안 만든 지후 (그림만 `지후초상화/`): 팔라딘 · 행성 · 흡혈 · R1 초상화를 쓰는 지후는 `archive/v8.1` 의 PORTRAITS 에서 흰 배경 256 으로 (폭주족) (일부는 배경이 반만 투명 → 흰 배경에 합성하면 된다)
- 랭크업 · 한계돌파 없음. 지후 레벨은 경기 안에서만: 새 카드는 전장의 같은 지후 위에 **레벨 상관없이** 겹쳐 +1 (`stackable` · 2렙 + 카드 = 3렙 · R2.2.1) · 전장의 내 지후를 같은 종류 · **같은 레벨** 위로 옮기면 합체 레벨 +1 (`moveTile` · 2렙 + 2렙 = 3렙 · 전장의 2렙 + 1렙은 안 된다) · **최대 Lv5** · 체력/공격력 ×1.2 · 효과 ×1.1 복리 · 레벨이 올라도 몸 크기는 그대로
- **비공개 배치 (R2.6.2)**: 배치 시간(`HIDE_PHASES` deploy · deploy-resolve · deploy-wait · event)에는 상대 진영을 `S.roundStart` (이번 라운드 시작 때 = 이전 라운드 배치)로 반투명(`.unit.ghost`) 그린다 — `viewPlace(side)` · `oppHidden(side)` (renderField · 미니맵 · 상대 지후 누르기). 전투가 시작되면 공개 · 관전자는 다 본다
- 배치: 진영 3 × 5 칸 · 배치 수 **제한 없음** (R2.7.2 · `CFG.MAX_UNITS` 15 = 칸 수) · 같은 지후 **3기**(R2.2.1 · 출격제한은 deployLimit) · 카드 3장 중 1장 · 15초 · 배치 기회 **첫 라운드 4번 · 그다음 2번 · 데스매치 3번** · 줄 고르기 `roleRow` (탱커 · 딜러 · 근접 · 체력 높으면 앞 / 어쌔신 · 서포터 · 사거리 길면 뒤) · **초보자 보호** (R2.7.1): 일반전 승 + 패 < `CFG.NEWBIE_GAMES` 5 이면 봇 덱 = 일반 4 + 희귀 1 (`botDeck(true)` · `newbieLeft`) · 봇은 유닛 수 먼저 (`botDeployOne` · 등급 높은 카드 · 꽉 찼을 때만 합치기 · R2.3)
- 전투 화면: 양쪽 이름 · 레벨 (`S.lvl` · 봇은 내 레벨 ±3 · 친선전은 `lv` 메시지로 주고받는다) · 프로필 테두리 · 사진 (`S.pf` · `lv` 메시지의 `fr` · `ph`) · 양쪽 덱 (전장 위 모서리 `.fdeck`) · 봇 닉네임 = R1 `BOT_NAMES` 전부
- 덱 5기 (**5기를 다 채워야** 일반전 · 친선전 시작 · R2.3) · 등급: 일반 / 희귀 / 영웅 / 전설 · 뽑기 일반 64.5 · 희귀 30 · 영웅 4 · 전설 1.5 (R2.7.1 build 2) · 중복은 조각
- 모든 지후 초상화는 **흰 배경 PNG** (투명 배경 금지 · 새 초상화도 흰 배경으로 맞춘다)
- **세계관 · 서사 (R2.8)**: 지후들이 사는 **지후왕국** — 국왕 **화염 지후** (부루스타 화상 → 불씨로 왕좌 · 특기 가스라이팅) · 신하 **물 지후** (왕자 시절 화염을 불에서 구한 오른팔 · 콜라 비밀). 서사는 서로 얽혀 있다 — 새 서사를 쓰거나 고칠 때 아래 연결을 깨지 않게:
  - R2.10.2: 방사능 = 핵미사일 칸을 닦던 금고 청소부 (티타늄과 도시락 · 자물쇠가 발견) · 반중력 = 천문대 지붕에 거꾸로 (별 · 손이 닿으면 둘로 → 1호 2호 소문 · 314호도?) · 티모 = 서쪽 숲 정찰병 (반란군을 길 잃게 · 독은 독 지후가 「대장 지시」로 · 반란을 아직 모름) · 비 = 잎사귀 우산 (황사를 가라앉힘 · 황사가 싫어하고 물이 아낌 · 순풍이 구름을 밀어 줌) · **NO U = 카지노 카드 딜러 — 조커가 슬롯머신을 털던 밤 「NO U」 카드로 조커의 기억 지우는 장난을 되돌려서 조커가 기억을 못 함 · 슬롯머신은 그가 유일한 증인인 걸 앎** · 독 = 약초원 (주사 약의 비밀 한 방울 · 주사는 모름 · 티모에게 독) · 폭주족 = 배달부 (신칸센과 원수 · 브레이크를 모름 · 국왕 삼겹살 배달)
  - R2.10: 별 = 왕궁 천문대 (국왕 불면증 · 달과 통함) · 소믈리에 = 연회장 와인 담당 (지원병에게 용기의 맛) · 닭 = 반란군 식량 농장에서 탈출 (포식 피함) · 후라이팬 = 부루스타 사고 때 왕궁 수석 요리사 · 성장 = 왕궁 온실 (자기 화분에도 물을 줘서 동료의 모습으로 자람 · R2.10.1 · 레벨업이 따라다님) · 선율 = 종탑 종지기 (시계와 다툼) · 순풍 = 풍향계 (황사를 거꾸로 막음) · 자물쇠 = 보물 창고 열쇠 관리인 (티타늄 · 핵미사일 발견)
  - R2.9: 폭탄 = 314호가 반란군 창고에서 만든 무기 (누가 적인지 모름 · 수호자도 안 받아 냄) · 핵미사일 = 티타늄 금고 옆 칸에 잠들어 있던 국왕의 마지막 수단 (한 발 쏘고 선글라스)
  - **메인 스토리 (build 7)**: 같은 종류의 지후도 1호 · 2호 · 3호… 많다 (국왕은 화염 지후 1호). 「황사회주의」를 퍼뜨리려는 **황사 지후**의 지령으로 서쪽 마을의 **화염 지후 314호**가 반란군을 이끌고 반란 (황사 지후도 참전) → 국왕이 소탕군을 모았지만 지원자는 **암살 · 쉴드 · 검 · 얼음** 넷뿐 (= 기본 지급 starter 와 화염). 암살은 서쪽 미용실(조커) 때문에 · 얼음은 격리당했는데도 지원 · 검은 플라스틱 검 그대로 · 물 지후가 모집 공고 · 달은 자느라 못 옴
  - 왕궁: 근위대장 수호자 ← 제자 쉴드 · 기사단 검 · 전령 가속 · 점술가 예언 · 의원 주사 (힐은 반창고로 떨어짐) · 금고 지킴이 티타늄 · 과거 시험 콤보(9수) · 원자 · 선로 신칸센 · 왕궁 앞 시계방 시계 · 지후코인(국왕 발행)에 날린 코인 · 생일 선물 상자 선물 · 공고판을 맞힌 활
  - 앙숙 · 사연: 수호자 ↔ 광폭화(그네) · 수호자가 못 받아 낸 회오리 · 블리자드 ↔ 태양(봄) · 태양 → 달(게으름 질투) · 얼음(북쪽 성 격리 · 국왕과 냉랭) ↔ 블리자드(펜팔) · 포식이 먹어 치운 예언의 돈가스 · 버서커의 푸딩 · 구미호의 라면 · 슬라임도 먹힐 뻔
  - 비밀: 조커 = 암살 머리를 망친 미용사 · 슬롯머신을 털어 간 웃는 지후 (본인은 기억 안 남) · 마탄의 첫 구슬이 깬 유리창 (빠따는 자기 홈런 탓인 줄 앎) · 주사가 떨어뜨린 경험치 물약을 레벨업이 마심 · 라이플은 총 지후의 러시안룰렛 트라우마 · 데스노트 사건을 예언이 미리 맞힘
  - 낫 ↔ 사신 (할머니 다락방의 두 번째 낫) · 사신 · 네크로맨서는 부활 꽃집 단골 · 번개 낙뢰 → 랜턴 마을 정전 · 충전은 번개를 따라다니며 랜턴 배터리를 채움 · 보호막 우산은 블리자드 우박 · 활 연습 때 · 촉수 ↔ 죠스 (바다 이웃) · 황사는 서쪽에서 넘어오는 침략자 (물 지후가 막음) · 선인장은 물 지후도 못 다가감 · 버블 목욕물값은 물 지후가 깎아 줌 · 주사위 앞에서 슬롯머신이 자리를 피함 · 고독한의 술래는 가속
- **도감 설명 (R2.4)**: `passive` · `skill.desc` 는 **쉽게** (중요한 피해량 · 확률만 숫자로) · 자세한 숫자는 `CHAR_INFO[id] = [[항목, 값], …]` (도감 '상세' · 전투 상세 창). 수치를 바꾸면 `CHAR_INFO` 도 같이 고친다 · 서사(`story`)는 「~입니다」 체
- **뽑기 연출 (R2.4)**: `showReveal(res, again)` → 봉인 카드(최고 등급 색 · 문구 `GR_SIGN`) → 딜 → 자동 뒤집기 (일반 220 · 희귀 300 · 영웅 520ms · 전설 뒷면은 영웅과 같은 보라) → 전설 컷신 `grCut` (R2.7.1 build 5: 인트로 대사 삭제 · 바로 등장 `grCutShow`) → 요약 · 한 번 더. 타이머는 `GR` 한 곳 (`grClear`).
- 지후 데이터 `CHARS[id]`: name · rarity · role · hp · atk · atkSpeed · range · speed · passive · skill(`type:'sec'` 초당 SP · `'hit'` 공격마다 SP · `need` · `once`) · onHit/onStart/onDeath/tick/onKill/onLethal 훅
- 선물 지후: 초당 SP 1 · **SP 18**에 무작위 지후 **2기**로 변신(1회 · R2.7.1 · 두 번째는 `A.summon` — 빈 칸이 있으면 배치 기록에 f 'b' 로) · 변신하면 그 자리를 같은 진영 · 같은 레벨의 변신체가 차지하고 **배치 기록도 바뀌어** 다음 라운드에도 유지 · 변신 전에 쓰러지면 SP 를 배치 기록 `p.sp` 에 남겨 다음 라운드 `onStart` 에서 이어 간다 (R2.6.4 · 합체는 큰 쪽)
- 슬라임: 쓰러지면 절반 크기 2기 (최대 2단계) · 코인: 10분마다 -50%~+50% (`coinMult` · 친선전은 판 시작 시세로 고정) · 화염: 일반 공격 광역 반경 1.2칸 (`splash` · R2.7.1) · [화상] 5초 · 공격력 80% · 중첩
- 달 지후: 반경 4칸 (R2.7.1) 효과 범위를 점선 원으로 표시 · SP · 쿨 게이지는 매 프레임 다시 그린다
- 힐 지후 (희귀 · 서포터 · 사거리 6): SP 6 [회복] = 체력 비율이 가장 낮은 아군 하나를 공격력 1000% 회복 (자신 포함 · 다른 힐 지후 제외) · 시전 때 `portraitSkill` 그림 0.8초
- R2.2 신규 지후 요점: 물 [해일] 직진 관통 · 넉백 4칸(멀수록 감소) / 버서커 체력 낮을수록 공격력 최대 ×3.5 (`atkMult`) · 15% 미만 공속 +20% / 슬롯머신 2초마다 `rng` 세 자리 · 7×1 7피해 · ×2 럭키독 현재 체력 77% · ×3 잭팟 (상대 라이프 1 + 전멸 → 즉시 승리) · 초상화 3장(R1) / 활 화살 초당 7칸 · 8% 황금 화살 2발 관통 / 황사 10% (R2.6.2) 황사 지대 회피 35% / 선인장 근접 35% 반사 (`reflect`) · 4방향 관통 가시 / 죠스 [잠수] (`dive` 노릴 수 없고 피해 없음 · R1 처럼 대상에게 곧장 헤엄쳐 몸이 닿으면(+10) 떠오름 · 최대 8초 `diveT`) / 블리자드 SP 8 (R2.7.1) 전체 현재 체력 10% 피해 + 빙결 2.5초 → [동상] 2초 / 빠따 넉백 5칸 · [홈런] SP 3 (R2.6.1) · 15칸 / 신칸센 R1 그대로 (신호기 4 · 초당 16칸 · 400) / 티타늄 맞을 때마다 쉴드 60 · 0.7초 / 태양 출격제한 1 · 같은 적 2타마다 공격력 +20 (`sunBonus` · 대상을 바꾸거나 공격을 멈추면 초기화 · R2.2.1) · 혼자 남으면 2초 뒤 낙하 부활 / 회오리 HP 700 · SP 5 4초 회오리 0.2초마다 30% (R2.7 build 2 · R1 whirlSteer)
- R2.5 신규 지후: 구미호 출격제한 1 (R2.7.1) · 체력 40% 미만 라운드당 1번 (`foxDone`) · [여우 보호막] 받는 피해 -40% 3초 · 반경 3칸 [매혹] 3초 / 데스노트 출격제한 1 (R2.7.2 build 6) · `type:'cooldown'` 16초 · 시작 즉시 (`onStart` 에서 `u.sk = cd`) · 대상 `t.dnote = 시전자` + `st.dnote` 남은 초 (15초 · R2.8 에서 build 6 의 21 · 20초를 되돌림) → 0 이면 `deathNoteKill` (쉴드 · 버티기 무시 · 시전자가 죽어도 남음 · 처치마다 `dnKills` 로 -1초) / 네크로맨서 SP 7 소환체 2기 (`SUMMONS.minion` · `summoner` · 4기 이상이면 안 함 · 통계 제외) / 라이플 공격 간격 2.7초 (R2.7 build 4 · R2.6.3 은 2.2) · 3연발 (`customAttack` → `u.burst` · `tick` 에서 나머지 2발 · 간격 = atkSpeed/10 ÷ 공속) · `onStart` 레벨마다 기본 간격 -0.25초 · 공격마다 `atkSpeed /= 1.1` (최소 0.05) / 버블 SP 4 (R2.7.1) · 씌워진 지후는 `.bubbled` 비눗방울 이펙트 · `st.bubble` (처음 받는 피해 1번 무효 · `dealDamage` 회피 다음)
- R2.6 신규 지후: 예언 — `beginCombat` 의 `prophecyResolve()` 가 `S.roundStart[적]` 과 지금 적 배치의 **같은 칸 번호**를 비교 → 바뀌었으면 한 명만 변신(`propMult` = 2.25 + 0.2 × 아르카나 · R2.7.1 +125% · ATK 80 · 그림 `portraitOn`) · 아르카나는 배치 기록 `place.arc` (최대 7 · 경기 내내) · 나머지 예언 지후는 공격력 +20 (R2.6.3) / 조커 — `moveTile` 에서 조커를 다른 지후 위로 → `{ id: 그 지후, lv: 조커 레벨, jk: 1 }` (출격제한 · `sameCount` 에서 그 지후로는 안 세고 **조커로 센다** (R2.6.1 · 변한 뒤 새 조커를 또 못 놓는다) · 체력 · 공격력 +10% · 🃏) · `startRound` 에서 조커로 되돌림 · 봇은 `botJoker` / 주사 — (R2.7) 사거리 9.4 · ATK 70 · 4.5초 · 훅 `pickTarget` 으로 사거리 안 체력 40% 미만 아군을 먼저 노린다 (`aiSteerAndAttack`) · `customAttack` 으로 `A.line(..., { both: true })` (아군도 맞는 관통탄 · 자신 제외) · 적 [독] 2초 · 아군 `u.hots` 지속 회복
- R2.6.1 네크로맨서: 라운드 시작 즉시 [소환] 1번 (`onStart` → `castSkill`)
- **랜덤 이벤트 (R2.6.1)**: `EVENTS[id] = { name, cat: 'pos'|'neg', icon, keep, desc }` (50종 · 긍정 26 · 부정 24 — 중립 성격도 부정으로 친다) · `CFG.EV_EVERY` 1 = 매 라운드 (R2.6.3 · 예전 2) (`startRound` → `evRoll`, 50:50 재경기는 다시 안 뽑음 · roundStart 스냅샷보다 먼저) · 양쪽 따로 하나씩 · 확률 `CFG.EV_POS` 긍정 75 · 부정 25 (R2.7 build 3)
  - 상태: `S.ev[side]` 얻은 목록 · `S.evc` 개수 (`evN(side, id)`) · `S.evf` (yar · curse · none(편애) · posOnly · ban 지후 목록 · fuse 합체 수). 얻기는 `evGrant(side, id, depth)` — 즉시 효과(레벨 · 소환 · 분쇄 · 배신 · 협상 · 함정카드 등)는 여기서, 계속 효과(`keep`)는 개수로 `evUnit`(체력 · 공격력 · 이동속도) · `evCombat`(버프 'ev' · 함성 · 한파 · 트롤링 · 씩스쎄븐 · 천살성 · 밴 · 공습) · `evTick`(사기진작 · 사기감소 · 산성비) · `dealDamage`(강약약강 · 피의 갈증) · `heal`(회복 불가) · 배치(`placeAt` 고오급 · `evLuck` 운빨 · `moveTile` 봉인 · 합체 마스터 · `rollPool` 밴)
  - 🤡: 얻은 이벤트를 상대도 (depth 2 까지) · 날조는 `keep` 이벤트만 훔친다 · 무작위는 배치 중엔 `S.evR` (친선전 `hashSeed(seed, 'ev', 라운드)`), 전투 중엔 `rng`, 운빨은 `hashSeed(seed, 'luck', actKey, 진영, 칸, 레벨)` — 두 화면이 같아야 한다
  - 배치 기록 표시 `p.f` (`normF`): 'b' 이벤트로 온 지후(출격제한에 안 센다) · 'v' 베테랑(개수) · 'g' 내가 고자라니(최대 체력 1). 합체하면 합쳐진다
  - 화면: 이벤트가 나온 라운드는 `startRound` 끝에서 `evShow(nextDeploy)` — 그동안 `S.phase = 'event'` (배치 · 자리 옮기기 막음 · 안 막으면 친선전 행동이 빠져 갈라진다) · 5초 어두운 오버레이 `#evPop` + 양쪽 릴 (연출은 Math.random · 다 멈춘 뒤 누르면 바로) → 배치. 얻은 이벤트 아이콘은 덱 아래 `.fev` (`evIcons` · 마우스를 올리면 설명 `data-tip` · 누르면 `evList()`). 상태 `ban`(밴 · `blocked`) · `doom`(천살성 · `doomKill`)
- 지후 설명 (R2.7.1): `charDetail(id, view)` — view 면 장착 버튼 없이 설명만. 전투 화면 양쪽 덱 지후 · 배치 카드 `i` 버튼(`.pinfo` · `data-info`) · 로비 현재 덱 지후(`data-cid`)
- 전투 화면 양쪽 덱(`.fdeck`) · 배치 카드(`.pcard .pp`) 초상화 테두리 = 지후 고유 색 `CHARS[id].color` (R2.6.1 · 전장 · 덱 설정 등 다른 곳은 등급 색)
- **촉수 (R2.7.2 · 영웅 컨트롤러)**: `customAttack` → `slam` (대상 쪽 직사각형 · 폭 = 자기 지름 · 길이 5칸 · 닿은 적 모두 · 35% [눈가림] 2.5초 · 그림 `portraitAtk` 0.5초) · SP 5 [촉수 내려치기] 가장 가까운 적 최대 5기 120% + [눈가림] 확정 · [눈가림] = 일반 공격 40% 빗나감 (R2.7.2 · 예전 50%)
- **R2.8 신규 지후 9종**:
  - 랜턴 (영웅 하이브리드): 일반 공격 = `customAttack` 으로 공격 빔(`u.beam`) · 0.25초마다 공격력 피해 · 5.5칸 밖이면 희미(멈춤) · 2초면 끊김 / 회복 빔(`u.hbeam`) 0.5초마다 체력 비율 가장 낮은 아군(자신 제외) 다시 고름 · 0.25초마다 공격력 회복 · 그림 `.fx-beam`
  - 번개 (전설): SP 7 [낙뢰] 1800% (R2.10 · 예전 SP 8 · 2000%) + 기절 1초 · 처치하면 0.5초 뒤 무작위 적에게 다시 (`u.boltT`)
  - 보호막 (희귀 서포터): `onStart` 십자(`A.cross`) 아군 쉴드 500% + `guardSh` (쉴드가 남아 있으면 `addStatus` · `A.cut` 디버프 무효) · SP 3 [배리어] `S.barriers` 반지름 3.5칸 2초 — `barrierStop` 이 바깥에서 들어오는 적 투사체(`S.shots` 발사 위치 `sx/sy` · `S.lines` `ox/oy`)를 지운다 (onHit 없음 = SP 없음)
  - 부활 (전설) · 사신 (전설 · build 5 · 예전 영웅): 스킬 `type: 'ally'` = 아군이 쓰러질 때만 SP (`onUnitDeath` 훅 · `killUnit` 이 전투 중 모든 유닛에 부른다 · `spGive`) · 소환체 · 분열체(`small`)는 안 센다. 부활 SP 5 → 1.5초 뒤(`u.revQ`) 지난 부활 뒤로 쓰러진 아군(`u.revL`)을 레벨 수만큼 자기 자리에 (`c.revived`). 사신 SP 6 (R2.10.2 · 예전 5) [사신강림] → `u.def = CHARS.reaper.awake` (체력 1444 비율로 · 1.2초 · 이동속도 2.4 · `.reaper-on`) · 강림 SP 5 (일반 공격 · R2.9 · build 5 는 6) [즉사] = 가장 가까운 적 하나 (`instaKill` · 아무것도 못 막는다) · 이펙트 `reapFx` (`.fx-reap` 낫 호 + 사선 섬광)
  - 수호자 (전설): `onStart` 십자 아군 `guardBy` (광폭화 제외) → `dealDamage` 에서 쓰러질 때 한 번 체력 1 + 무적 1초 (수호자가 살아 있을 때 · `onLethal` 보다 먼저)
  - 시계 (전설): 같은 레벨 적 공격속도 -5% · 아군(자신 포함) +5% (R2.10.2 build 5 · 예전 7%) (버프 키 `clock<uid>` 라 중첩) · 시계 · 순풍 효과는 레벨마다 +1% (R2.10.2) · 시계 버프 받는 유닛 `.clk-up` 하늘색 · 디버프 `.clk-dn` 빨간 시계 표식 (`drawUnit` 이 `clock*` 버프 aspd 합으로 · `.unit::before`) · 충전 (전설): SP 3 반경 3.5칸 아군 `spGive(a, 1)` (자신 · 다른 충전 · `type: 'ally'` 스킬(부활 · 봉인 사신) 제외 · build 4 · cooldown 형은 1초)
  - 포식 (영웅): `onHit` 공격한 적 기록(`u.bit`) + 공격력 5% 회복 · 그 적이 5.1칸 안에서 쓰러지면 [포식] +1 = 공격력 + 기본(레벨 반영) 15% · 최대 체력 +20 · 50 회복 (R2.10.2 build 4 · HP 1150 · ATK 100 · 1.8초 build 5) · 배치 기록 `p.dv` 로 경기 내내 (`packPlace` 7번째 칸 · 합체는 큰 쪽)
- **R2.9 신규 (역할군 `폭발형` · `DECK_ROLES` 끝 · `roleRow` 앞줄)**:
  - 폭탄 (영웅): `noAttack` + `steer` (공격 안 하는 지후도 `steer` 가 있으면 움직인다) · 이동속도 3.3 (R2.10) · 가장 가까운 적에게 굴러가 닿으면 `blast` = `A.boom` 반경 2.5칸 · 자신의 최대 체력 · 3칸 넉백 (`A.boom` 의 kb) · 닿기 전에 쓰러지면 `onDeath` → `A.later(1, …, hold)` (hold 가 남아 있으면 `stepCombat` 이 전멸 판정을 미룬다) · `.rolling`
  - 핵미사일 (전설 · 근접): 처음 출전한 라운드 1초 뒤(밴 · 기절이면 풀린 뒤) [핵 발사] → 배치 기록 `p.nk = 1` (경기 내내 [핵 다씀] · 합체 · 레벨업해도 · `packPlace` 8번째 칸 · 그림 `portraitUsed` · 배치 화면은 `u.picSrc`) · 17초 뒤 (R2.10 · 예전 22) `A.later` 로 적진 가운데(`tileXY(적, 7)`) `A.boom` 반경 99칸 · 공격력 99999% · 라운드가 먼저 끝나면 안 떨어진다 · 스킬 `type: 'nuke'` 라 `spGive` 대상이 아니다 · `gauge`
  - 엔진: `A.later(sec, fn, hold)` = 전투 시간 기준 예약 (`S.timed` · `beginCombat` 에서 비움) · `A.boom(u, x, y, 칸, 피해)` 반경 안 적 모두 (`.fx-boom`) · `spGive` 는 hit · sec · ally · cooldown 스킬만
- **R2.10 신규 지후 8종**:
  - 별 (전설 어쌔신 · ATK 90 (build 4) · `splash` 2 (R2.10.2 build 2) · 사거리 5.7 build 2 · 공격 간격 3초 R2.10.2): SP 4 [졸음] = 지금 `effAtk` 가 가장 높은 적 · `st.drowsy` 1.5초 (공격력 ×0.6 · `addStatus` 를 거치지 않아 쉴드 · 면역 무시) → `stepUnit` 에서 `st.sleep` 7초 (`blocked` · `dealDamage` 에서 150 이상 맞으면 깬다) → 깨는 순간 `sleepBy` 의 `dash` (관전 · 무적 순간이동 · 200% · SP +1 · `.fx-stardash`)
  - 소믈리에 (영웅 서포터): `onStart` 십자 아군 2명 이상이면 와인 — 배치 기록 `p.wn` +1 (`u.wn`: `effAtk` ×(1+0.05n) · 치명타 확률 +3%n (R2.10.2) · 치명타 피해 +30%n) · 그 라운드 체력 −10% · 자기 기록 `p.sm` += 마신 수 → 공격력 +5 × sm (경기 내내 · `packPlace` 9 · 10번째 칸)
  - 닭 (영웅 소환형): 달걀(`shotCls: 'egg'`) · `onHit` 5% `A.spawnChild` 부화 (원본 `origHp` 의 70% · `summoner`) — 부활 · 사신 SP · 성장 대상에서 소환체(`summoner`)는 빠진다
  - 후라이팬 (영웅 탱커 · R1 그대로): `tick` 에서 110° · 반지름 몸+0.7칸 부채꼴이 4.5초에 한 바퀴 (`.fp-pan`) · 닿으면 200 × 레벨 배율 · 7칸 넉백 · 0.2초 · 일반 공격 없음 (`customAttack` 만 · `atkText` —)
  - 성장 (전설 보조형 · R2.10.1 리워크): 스킬 없음 · `tick` 으로 전투 15초 뒤 (build 3 · 예전 7 · R2.10.2 레벨마다 −2초 `growT`) (기절 · 밴이면 풀린 뒤 · `gauge`) **내 덱(`S.deck[side]`)의 지후** 중 무작위 (성장 포함 · [밴] 지후 제외 · `rng`) 로 `A.transform(u, id, lv + 1)` (최대 5 · 체력 가득) · 배치 기록 id · lv 도 바뀐다 · 라운드마다 1번 (`u.grown`) · 성장으로 변이하면 다음 라운드에 또 자란다. `A.transform(u, id, lv)` 의 lv 는 생략하면 그대로 (선물)
  - 선율 (희귀 서포터): 5초마다 (`gauge`) 반경 4칸 종 — 아군 최대 체력 5% 회복 + `pure` 2.5초 (디버프 면역 · `addStatus` 가 막는다) · 적 공격력 100%
  - 순풍 (희귀 컨트롤러 · 공격 안 함): 맵 전체 이동속도 아군 +12% · 적 −12% (R2.10.2 · 레벨마다 +1%) + 공격력 ±5% (버프 `spd` · `atk` · 키 `wind<uid>` 중첩 · `moveToward` · 폭탄 `steer` 가 본다)
  - 자물쇠 (영웅 컨트롤러): 일반 공격 25% [잠금] 2초 (`st.lock` → `stepUnit` 끝에서 `desVx/desVy` 0 · 공격은 한다)
- **R2.10.2 신규 지후 7종**:
  - 방사능 (희귀 딜러): `customAttack` 은 아무것도 안 함 (다가가기만) · `tick` 1초마다 반경 3칸 적 모두 공격력 100% (`.fx-rad`) · `onDeath` → `S.zones` 에 `foe: true` 지대 (5초 · 2.2칸 · 적 초당 40 × 레벨 배율 · 버프 atk −0.2 · `stepZones` 가 처리 · `.fx-rad-zone`)
  - 반중력 (전설 보조형): `onHit` [잠금] 0.5초 · 첫 `tick` 에 무작위 아군(자신 · 소환체 제외) `st.antigrav` → `A.later(4)` `antigravSplit` = 체력 · 최대 체력 절반 둘 (둘째는 `tile` 없음 · `summoner` · 핵은 다시 안 쏨)
  - 티모 (영웅 컨트롤러): 25% `blindOn(t, 3, 0.5)` · SP 9 확정 0.75 + 중첩 [독] 5초 50% · [눈가림] 세기 = `st.blindX.amt` (없으면 0.4 · `dealDamage`) · 끝난 상태는 `stepUnit` 이 `st[k+'X']` 를 지운다
  - 비 (희귀 서포터): SP 8 (사용자가 SP 를 안 줘서 정함) [가랑비] 모든 적 220% + 버프 spd −0.4 3초 · 모든 아군 `hots` 3초 100% · `u.cd` 1.5초
  - NO U (전설 탱커): SP 6 `st.nou` 2초 (build 4) — `dealDamage` 가 받은 피해를 공격자에게 `{ reflect }` 로 돌려주고 0 · `t.nouFrom` = 마지막 공격자 → `addStatus` 가 디버프를 그쪽으로 · `afterHit` SP 없음 · [NO U] 끼리 → `nouClash` (초당 50칸 넉백 0.3초 → 둘 다 `instaKill`) · `.nou-on`
  - 독 (영웅 컨트롤러 · id `venom`): `pickTarget` 중독 안 된 적 먼저 · 중첩 [독] 12초 30% · `t.vmark` → `stepUnit` 이 `st.vweak` (아무 [독] + 체력 50% 이하): 받는 피해 ×1.4 · `heal` ×0.4 · `moveToward` ×0.8 · `effAtk` ×0.85
  - 폭주족 (전설 어쌔신 · R1 초상화): HP 9999 · `immobile` · `noAttack` · `onStart` 각도(적진 가운데 ±35° · `rng`) → 시동 2초 (`takenMult` 0.1 · 기절이면 멈춤 · `.fx-bike-lane`) → `bikerRush` 초당 50칸 · `ghost` · 적 현재 체력 70% · 3칸 넉백 · 기절 3초 · 돌진 중 `immune` → 맵 끝에서 `instaKill` 자신
  - 주사 [독]도 중첩형으로 (`stack` · 섞여도 사라지지 않게)
- **[즉사] (R2.10.2)**: `instaKill(src, t, label)` 하나로 — 무적 · 버티기 · 수호 · 버블 · 잠수 · 쉴드 무시 (사신 · 데스노트 · 천살성 · NO U · 폭주족). 새 즉사도 이걸 쓴다
- **기타 (R2.10.2)**: 상점 이모티콘 `EMO_PRICE` ◆500 · 지후의 탑 드래프트 `TOWER_PH` (일반 3 → 일반~영웅 각 33% → 일반~전설 각 25% · 전설 최대 1 → 전설 1 + 일반~전설 2 → 전설 3) · 코인 시세 한 번에 최소 15%p (`coinMult`) · `CHAR_INFO.coin` 은 getter 로 지금 시세 (`CHARS[id].info` 도 getter — 시작할 때 값을 읽으면 아래쪽 `const`(coinCache 등)가 아직 없어 로딩 0% 멈춤 · build 3) · 사신강림 주석에 삼켜졌던 봉인 해제 코드 복구
- **인트로 만화 (R2.10.2 build 6 · 튜토리얼 1단계)**: 그림 `comic/1.png` ~ `comic/20.png` (620×501 · 사용자가 그린 컷 · 바꿀 땐 같은 이름으로) · 장 목록 `COMIC` (그림 `{ img, cap }` · 글자만 있는 장 `{ text }` — 10 → 11 사이 「한편..」) · 캡션 `COMIC_CAP` (컷 번호: 글 · 그림 왼쪽 위 해설 칸 `.cm-cap` · build 7) · `#comic` 전체 화면 (`showComic(done)` · 누르기 / → / Space 다음 · ← 이전 · Esc · 건너뛰기 → `comicEnd`) · `profile.comic` 이 없는 사람은 모두 한 번 (`updCheck` 맨 앞에서 로비일 때 · 새 닉네임 · 기존 계정 다 · build 7) · 끝나면 `profile.comic = 1` → 다시 `updCheck` (업데이트 보상) · 메뉴 07 '인트로 만화'에서 다시 보기 · 인게임 튜토리얼은 추가 예정
- **전투 중 지후 정보 (R2.10.2 build 5)**: 전투 중 지후를 누르면 사거리 원과 함께 `#uInfo` (전장 왼쪽 아래 · `uInfoHtml` · `renderUInfo` 를 `loop` 이 6프레임마다) — 체력 · 쉴드 · 공격력(`effAtk` vs `u.atk`) · 공격 간격(`baseInterval / aspdRate` vs `u.atkSpeed`) · 이동속도 · 사거리 · SP · 원인 칩(버프 키 → `BUFF_SRC` 이름 · 광폭화 · 약화 · 동상 · 와인 등) · 상태와 남은 초. 바뀐 만큼은 연두(좋음) / 빨강(나쁨) · `hideRangeRing` 이 닫는다. 새 버프 키를 만들면 `BUFF_SRC` 에 이름 추가
- **샌드박스 (R2.10 · 아케이드 · 무료)**: 화면 `screen-sandbox` (`openSandbox` · `renderSandbox` · 상태 `SB` · 이 기기 localStorage `rejhbt-sandbox`) · 양쪽 팀 최대 5기 · 레벨 1~5 · 보유 상관없음 → `sbStart` = `newMatch({ arc: { kind: 'sandbox' }, lives: 1, setup })` (`setup` 이 `roleRow` 줄로 배치 · `nextDeploy` 가 배치 없이 바로 `beginCombat`) → `roundResult` 가 한 라운드로 `endMatch` → `arcEnd` 보상 · 전적 · 처치 업적 없음 → `resBack` 'sandbox'
- **계정 레벨 (R2.10)**: **Lv.1** 부터 (`freshProfile` · 정규화가 Lv0 → Lv1) · `xpNeed(lv) = round(100 × 1.15^(lv−1))` · 레벨업 `CFG.LEVEL_REWARD` ◆250 · 봇 레벨 최소 1
- **기타 (R2.10)**: 랜덤 이벤트는 1라운드에 없다 (`evRoll`) · 밴 된 지후 `.banned` (회색 + 금지 딱지 · 경쟁전 밴 칸 · 밴 공개된 지후 칸 · 전투 화면 덱의 [밴] 이벤트 지후) · 일일 퀘스트 600P ◆200 + 🎟1 · 700P 임테기 (`DAILY_TIERS` 의 `ticket` · `item`) · `S.timed` = `A.later` 예약 (`S.later` 는 라운드 결과 타이머라 이름을 나눴다)
- **라운드 시간 (R2.9)**: `CFG.ROUND_TIME` **60초** (예전 45)
- **피해 규칙 (R2.8)**: `effAtk` 의 감소 배율(약화 · 버프 atk · 동상) 최소 0.05 (공격력 감소 최대 95%) · `dealDamage` 받는 피해 최소 원래의 10% (감소 최대 90%) · 최소 1
- **경쟁전 매칭 (R2.8)**: `compStart` → `#cpMatch` 매칭 중 (레이더 · 지후 그림 · 시간 · 취소 `cpmClose`) 3~5초 → 매칭 완료 (상대 이름 · 티어) 1.5초 → 밴 화면 (R1 매칭 창)
- **랜덤 이벤트 R2.7.2 리워크**: 지난 라운드 진 쪽 긍정 · 이긴 쪽 부정 (`S.hist` 마지막 · 첫 라운드 · 무승부는 `EV_POS` 확률) — 야르 · 저주 · 편애(상대 긍정만) 등 이벤트 설명이 먼저 · 편애에서 '나는 못 얻음' 삭제 · 함정카드는 진영만 (덱 그대로) · 지원요청은 빈 칸마다 화염
- 친선전 배치 동기화 `packPlace` = `[지후, 레벨, 아르카나, 조커, 이벤트 표시 f, 선물 SP sp, 포식 dv, 핵 다씀 nk, 와인 wn, 소믈리에 sm]` — 배치 기록에 새 필드를 넣으면 여기도 같이 (안 넣으면 두 화면이 갈라진다)
- 상태 `charm`(매혹 · `foes()` 가 자기 아군을 돌려준다) · `foxguard` · `bubble` · `dnote` · 소환체 같은 '덱에 없는 유닛'은 `SUMMONS` 에 (`makeUnit` · `pic` 이 같이 본다)
- 엔진 도우미 (R2.2): `A.knock` 넉백 · `A.line` 맵 끝까지 직진 관통탄 (`S.lines`) · `A.zone` 바닥 지대 (`S.zones`) · 훅 `steer`(스스로 이동) · `customAttack` · `onDamaged` · `atkMult` · `reflect` · `shotSpeed`(칸/초) · `ghost`(돌진 중 물리 없음) · 상태 `frost`(동상) · `dive`(잠수)
- 전투 화면: 체력바 안에 체력 숫자 · 아군 연두 / 적 빨강 · 깎이면 흰 잔상 (`.unit-hpbar-lag`) · 치명타 숫자 도장 (`.stamp`) · 승률 예측 게이지 (`#hudOdds` 전장 위)
- 아직 안 만든 지후 그림 원본은 `지후초상화/` (투명 배경 원본 · 게임에 넣을 때는 흰 배경 256×256 으로 바꿔 PORTRAITS 에)

### 현재 밸런스 (R2.4)
- R2.8: 티타늄 쉴드 30 · 0.5초 · 슬롯머신 3초 (레벨마다 -0.2초 · `slot.iv`) · 선인장 HP 1510 · 황사 8% · 광폭화 2.2초 · 광폭화 중 공격 간격 0.5초 · 예언 +150% (`propMult` 2.5) · 활 ATK 100 · 데스노트 출격제한 1 · 쿨타임 16초 · 즉사까지 15초 (build 6 되돌림)
- R2.7.2: 슬롯머신 출격제한 1 · 라이플 ATK 18 · 힐 SP 4 · ATK 50 · 사거리 6.5 · 암살 ATK 100 · 첫 공격 600% · 슬라임 HP 450 · 레벨업 ATK 160/210/260 · 총 ATK 125 · 블리자드 빙결 2초 · 4% · 주사 사거리 8.4 · 검 HP 930 · ATK 215 · 얼음 3.5초 · 죠스 ATK 220 · 잠수 4.5칸 · 태양 +15 · 가속 1초 · 8초 · 3초 · 낫 9초 · 80% · 광폭화 2.5초 · 이동속도 2배
- R2.7.1: 구미호 ATK 45 · HP 910 · 주사위 1~200 · 슬라임 ATK 130
- 화염 HP 1200 · 화상 80% · 암살 ATK 70 · 순간이동 뒤 첫 공격 700% · 달 공격 간격 3.5초 · HP 1150 · 사거리 5 · 버프 반경 4칸 (R2.7.1) · 광폭화 HP 910 (R2.2.1) · [광폭화] 공격력 +140%
- 낫 HP 1240 · 공격 간격 4.5초 · [힘줄 끊기] 55% (회전 낫 이펙트 `.fx-scythe-spin`) · 레벨업 ATK 125 / 175 / 225 · 총 HP 860
- 마탄 [마탄] 10% · 650% (`magicPct` · R2.3) · 원자 전자 궤도 2칸 · 사거리 1.5 (R2.7.1 · 붙어야 전자가 닿는다) · 콤보 ATK 67 · 공격 간격 1.4초 (R2.3) · 공격마다 +5% (R2.4) · 활 ATK 130 (R2.4) · 죠스 이동속도 2.5 · 잠수 속도 3.5 (R2.3)
- 코인 ATK 50 · 시세 반전 확률 55% · 슬라임 HP 300 (R2.6.1) · 그대로: 검 ATK 190 · 고독한 HP 1700 · 선물 SP 18
- 신규 지후 수치는 패치노트 R2.2 · `CHARS` 그대로

## 계정 · 저장
- 같은 Firebase 프로젝트 `jihoobattle` · 같은 계정 (UID 8자리 + 비밀번호 `<UID>@jihoo-battle.invalid` · Google 은 그 계정에 연결) · 게스트는 익명 인증
- 기록: `r2_backups/<uid>` (프로필 JSON) · 이 기기: localStorage `rejhbt.profile.v1`
- **R1 가져오기 (처음 한 번)**: R1 `backups/<uid>`(또는 이 기기의 `jihooBattle2.profile.v2`)에서 골드 · 다이아 · 이모티콘 · 사용한 쿠폰 · 받은 운영 우편 번호. **R1 지후 보유는 넘기지 않는다** (R2.2 공정성 · 기본 지후만). 모집권은 다이아로 환산 (`R1_TICKETS`). R1 레벨 · 전적은 `profile.legacy` (관상용)
- **명예의 전당 보상**: R1 레벨 × ◆50 우편 (`hofMail` · 한 번) · **R2.2 정리** `migrateR22` (`profile.r22`): 이미 가져온 기록은 R1 지후를 미보유로 (R2 에서 다시 뽑아 조각이 된 지후는 조각 1개로 보유 유지) · 명예의 전당 우편 · 출석부 처음부터
- **출석부** (`NEWBIE` · 모두에게 · `newbie.v 2`): ◆1,000 (R2.3 · 예전 10회 뽑기권) · 영웅 모집권 · ◆500 · 빛나는 전설조각 · ◆1,000 · 지후 초기화권 · 선택 전설 모집권 → 가방 `profile.items` (`ITEMS`). 뽑기 화면 '내 모집권'에서 사용 (빛나는 전설조각 · 초기화권은 지후 레벨업 시스템과 함께 쓸 예정)
- 계정 레벨: **Lv.1** 부터 (R2.10 · `xpNeed(lv) = round(100 × 1.15^(lv−1))`) · 레벨업마다 ◆250 (R2.10 · 예전 1,000)
- 일반전 보상 (R2.2): 승리 기본 **+100 XP** · 패배 기본 **−30 XP** · 상대 레벨 차 1마다 승리 ±10 (50~200) · 패배 ∓5 (10~60) · ● 1,000~2,000 · **다이아 없음** · 패배는 지금 레벨 안에서만 깎인다 · 친선전 · 관전은 보상 없음
- 덱 설정: 정렬 3종 (R2.7.2 · `deckSortGet` · localStorage `rejhbt-deck-sort`) 기본순(등급 → 출시) · 역할군순(`DECK_ROLES` 칸막이) · 이름순(등급 → 가나다) · [서사] 버튼 (story 없으면 준비 중)
- 닉네임 등록부 `nicknames` (R1 과 공유) · 리더보드 탭: `r2lb` (레벨 · 승리) · 지후의 탑 `r2tower` · 경쟁전 `r2comp` (이번 시즌) · 명예의 전당 = R1 `leaderboard` 읽기만
- 운영자 = `admins/<uid>` 문서가 있는 계정 · 개발자 모드(모든 지후 해금 · localStorage `rejhbt-dev`) · 운영 도구(우편 · 로비 공지 · 점검)는 환경설정에 표시
- 동시 접속: `sessions/<uid>` · 이용 정지: `bans/<uid>` · 점검: `config/maintenance` · 공지: `config/announce`

## 메인 퀘스트 · 천장 · 부스트 (R2.3)
- **메인 퀘스트** `MQ` (13단계 · 순서대로 · 14번은 추가 예정): `profile.mq = { i, n, done, day }`. `ev` 이벤트(`mqEvent('win'|'newChar'|'dailyAll'|'shop'|'lb'|'boost')`) · `need` 횟수 · `ok` 이벤트 때 조건(5연승 · 전설 5덱 승리) · `state` 지금 상태로 바로 완료(덱 구성 · 일일 퀘스트 · 내일도 접속 = `day` 와 다른 날) — `mqCheck` 는 로비 · 덱 화면에서. 로비 카드 `#btnMQ` · 퀘스트 · 출석 시트 맨 위에서 받기(`mqClaim`) → 다음 단계. 새 단계를 넣을 땐 `MQ` 끝에 추가
- **천장** `CFG.PITY` 80: `profile.pity` = 전설 없이 뽑은 수 · 80 이상이면 다음 뽑기는 전설 (`rollLegend`) · 전설이 나오면 0
- **부스트** `profile.boost = { day, used, until }`: 하루 `BOOST_PER_DAY` 2번 · `BOOST_MIN` 15분 (R2.7.1) · 일반전(봇) 승리마다 ◆1~`BOOST_DIA` 300 (판 시작 때 켜져 있었으면 `S.boost` 로 끝까지)
- **아케이드 (R2.7.2)**: 탭 `arcade` (`screen-arcade` · `renderArcade`) · `profile.arc = { t 티켓, p 포인트, day, free, buy }` (`arcDay` 가 날마다 무료 · 구매 수 초기화) · 티켓: 매일 `ARC_FREE` 1장 무료 · ●`ARC_GOLD` 10,000 으로 하루 `ARC_BUY` 3장 · 결과 승리 `ARC_WIN_P` 5P · 패배 1P (`arcEnd` · XP · 골드 · 퀘스트 없음 · 결과 뒤 아케이드로 `resBack`) · 랜덤 이벤트 없음. 모드는 `ARC_MODES` · 시작은 `newMatch({ arc, decks() })`. 미러전 🎟1 = 양쪽 같은 무작위 덱 5기. P 상품은 사용자가 정해 줄 예정 (지금은 '준비 중')
- **지후의 탑 (R2.7.2)**: 화면 `screen-tower` (`openTower` · `renderTower`) · `profile.tower = { on, deck, draft: { ph, picks, opts }, floor, lose, best }`. 입장 🎟`TOWER_FEE` 2 → 5페이즈 덱 고르기 `TOWER_PH` (R2.10.2: 일반 3 → 일반~영웅 각 33% → 일반~전설 각 25% (전설 최대 1) → 전설 1 + 일반~전설 2 → 전설 3 · 이미 고른 지후 제외 · 고르던 선택지도 저장) → 덱 저장 (바꿀 수 없음) → 층마다 `newMatch({ arc: { kind: 'tower', floor } })` 클래식 · 봇 덱 = 같은 규칙 · 높은 등급 먼저 (`towerBotDeck`) · 초보자 보호 없음 → `towerEnd`: 이기면 `towerRw(층)` 보상 · 다음 층 / 지면 `lose` +1 · `TOWER_LIVES` 3번이면 처음부터 (build 5 · 예전 2) (탑 판은 5P/1P 없음 · 층 보상만). 보상 `TOWER_RW` 1~15층 · 16층부터 `TOWER_RW_LOOP` (● 1,000 → ◆100 → 2P 반복) · 지후 상자는 가방 아이템 `boxLow` · `boxMid` · `boxHigh` (`BOX_RAR`) · 리더보드 탭 '지후의 탑' = `r2tower/<uid>` { nickname, best, fav, frame } (`towerPush` · 규칙 게시 전이면 `FB.noTower`)
- **경쟁전 (R2.7.2 · 아케이드 · 무료)**: 화면 `screen-comp` (`openComp` · `renderComp`) → `screen-draft` (`compStart` · 상태 `CP`). 밴 `COMP.BAN` 3기 (30초 · 봇 밴은 `cpBotBans`: 후수면 점수 높은 지후 · 선수면 상위 12 중 무작위) → 공개 → 드래프트 5페이즈 (`cpNextPhase`: 남은 지후가 3기 이상인 등급 하나 무작위 · 같은 등급 3기 · 홀수 페이즈는 선수가 먼저 · 후수는 남은 둘 중 · 남은 하나는 버림 · 5페이즈는 **블라인드** = 역할군만 · 20초) → `cpFinish` → `newMatch({ arc: { kind: 'comp', botTp, bans, picks }, lives: COMP.LIVES 2 })` = 클래식 3판 2선승 (`S.maxLives`) → `compEnd`
  - 티어 · TP · 보상은 R1 그대로: `COMP_TIER_NAMES` · `COMP_TIER_POINTS` · `compWinTp` (골드까지 200~240 → 높을수록 약 50) · `compLossTp` (× `LOSS_SCALE` 0.7 · 최대 200) · 상대 티어 1칸마다 `compDiff` 12% · 한 판 ◆`GAME_DIA` 50 (항복 `S.quit` 은 없음) · 승급 보상 `compPromoReward` (시즌마다 처음 오르는 묶음 · `comp.promo`) · XP 승 100~150 · 패 30~50 (깎이지 않음) · 티어 그림 `TIER_ART` (R1)
  - 시즌 `compSeason()` = `COMP.SEASON0` (2026-10-24 KST) 부터 14일마다 · 바뀌면 `compApplySeasonReset` (세 묶음 내림 `compSeasonResetTp` · 전적 0 · promo = 지금 묶음) · 지난 시즌 순위 보상 `compSeasonReward` (`COMP_SEASON_RW` 1위 ◆5,000 + 전설 5 … 50위까지 · 우편 `comp-s<시즌>`)
  - `profile.comp = { tp, peak, wins, losses, season, promo, played, rwDone }` · 리더보드 `r2comp/<시즌>_<uid>` (`compPush` · 이번 시즌만 `where('season')` 로 읽고 정렬은 화면에서 · 색인 필요 없음)
  - **봇 학습** (서버 공용 통계): `profile.cstat = { picks, pwins, bans, norm, nwins }` (경쟁전 픽 · 승 · 밴 + 일반전 덱 · 승) → `r2picks/<uid>` (`cstatPush` · 규칙 게시 전이면 `FB.noPicks`) → `cstatLoad` 가 최대 300명 합산 (10분 캐시) → `cscore(id)` = 픽률(밴 2배) + 승률(보정) + 등급 조금. 봇 픽은 점수 높은 지후 (블라인드는 무작위)
- **가방 (R2.7)**: 탭 `inv` (`screen-inv` · `renderInv`) · 가진 `ITEMS` 전부 · `use` 면 바로 사용 (`useItem` · 뽑기 화면 '내 모집권' 과 같은 함수). 임테기 `testKit` = 전설 10 · 영웅 · 희귀 · 일반 각 30 (Math.random)
- **업데이트 안내 · 보상 (R2.7)**: `updCheck()` — `profile.updRw` 가 지금 버전(`jihoo-version`)과 다르면 로비에서 간단한 패치노트(`PATCH_NOTES` 의 그 버전 · 6개까지) + 보상 창 `#updModal` → `updClaim` 으로 ◆`CFG.UPD_DIA` 500 + `CFG.UPD_ITEM` 임테기 1개 · `updRw = 버전`. 지금 버전 것만 (놓친 예전 버전은 쌓이지 않는다) · 서버 기록과 맞춘 뒤 부른다 (`accBoot` 끝 · `syncAfterLogin` 끝 · 닉네임 정한 뒤) — 잠수함 패치(build)는 버전이 같아 안 뜬다
- **올리기 전에 반드시 빈 브라우저로 첫 로딩을 확인** (pageerror 없음 · 로비까지) — 수정 뒤 테스트를 다시 안 돌려 로딩 0% 멈춤이 나간 적 있다 (R2.10.2 build 3)
- 시작할 때 프로필 정규화가 보는 데이터(`ITEMS` · `FRAMES` · `MQ`)는 `let profile = loadProfile()` **보다 앞**에 둔다 (정의 전 접근 오류 → 로딩 0% 멈춤)

## 소셜 · 우편 · 보상
- 친구 `friendships` (pending → accepted) · 접속 상태 `presence` (sp = 관전 가능한 판 번호) · 전체 채팅 `chat` · 공지 이벤트 `events` (join · level · gacha) · 1:1 `dm/<pair>/msgs` · 욕설 검열 · 도배 방지 3초
- 운영 우편 `giftMail` (to = uid 또는 'all' · rewards: diamonds · gold · epicChar · legendChar) · R2_EPOCH 이전 우편은 받지 않는다
- 쿠폰 `CODES` (계정마다 한 번 · `until` 이 있으면 그때까지만 · 지나면 목록에서도 빠진다 `codeLive` · `ticket` = 아케이드 티켓 · 예: TICKETJH 🎟5 · 2026-10-30 까지) · 업적 `ACH` · 출석(접속한 날 +1) · 출석부 7일 보상 `NEWBIE` (R2.2 · 모두에게)

## 꾸미기 (프로필 테두리 · R2.2)
- 프로필 사진 = 정사각 둥근 **대표 지후 초상화** (`myPhoto()` = `favChar()`) + 테두리 · 그리기는 `pfHtml(frame, 크기px, 지후id, { lock, badge, letter, fc })` 하나로 (56px 미만은 보석 · 배지 · 회전 없음 · reduced-motion 이면 회전 없음)
- 테두리 9종 `FRAMES`: 기본 · 레벨 10/20/30/40/50 (루키 · 실버 · 사파이어 · 아메시스트 · 골드 크라운) · 일반전 최고 5/12/20연승 (불씨 · 불꽃 · 업화). **업적 보상으로만** 얻는다
- 저장: `profile.frames` (보유 · 'none' 항상) · `profile.frame` (장착) · `profile.streak` (봇전 연승 · 지면 0) · `profile.bestStreak`. 상태 잠김 → 보상 받기(빨간 점 · 퀘스트 · 출석 시트의 '테두리 업적' 또는 꾸미기) → 보유 → 장착 중
- 들어가는 곳: 메뉴 '꾸미기' · 로비 상단 프로필 사진 (이름 쪽은 계정) · 화면 `screen-custom` (CHROME)
- 남에게 보이는 곳: 리더보드 `r2lb.frame` · 친구 목록 `presence.frame/fav` · 친선전 `lv` 메시지 · 봇은 레벨에 맞는 레벨 테두리 (`botFrame`). 규칙을 아직 게시하지 않았으면 `FB.noFrame` 으로 테두리 없이 다시 쓴다

## 친선전 (온라인 1:1)
- `matches/<id>` 상태 invite → accepted → playing → done · `matches/<id>/msgs` 로 행동 교환
- 방장 = 진영 'a' · 참가자 = 'e' 로 **같은 전투를 두 화면이 돌린다** (시드 난수 `hashSeed`) · 참가자 화면은 전장을 좌우로 뒤집는다 (`flipView` · CSS `#field.flip`)
- 배치 행동 `{ k: 'p'|'m'|'s', id, t, ops }` · 키 `라운드진행번호(S.rk)-배치번호` · 라운드 결과는 방장 화면 기준 (`end` 메시지에 배치 상태 통째로 + 라운드 직전 라이프 `lv` — 슬롯머신 잭팟)
- 전투 난수는 `rng` 하나만 (뽑기 · 상점 · 연출은 Math.random) — 전투 코드에 Math.random · Date.now 를 넣지 않는다 (두 화면이 갈라진다)
- 관전: 처음부터 메시지를 받아 끝난 라운드는 결과만 빠르게 · 지금 라운드부터 본다 · 보상 없음
- 테스트: `window.__REJHBT_NET_TEST = { uid }` 를 두 창에 넣고 `__rejhbt.startFriendly(m, 'host'|'guest'|'spec')` → BroadcastChannel 로 연결

## 스타일
- 코드는 주변 코드와 같은 밀도 · 이름 · 한국어 주석. 한 줄에 몰아 쓰는 기존 스타일 유지
- 브랜치: 지정된 개발 브랜치에서만 작업 · **머지하지 말라고 하지 않는 이상 기본적으로 머지까지 할 것** (작업 → 커밋 · 푸시 → PR → main 에 머지)
