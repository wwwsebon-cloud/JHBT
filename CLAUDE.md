# RE : 지후배틀 (RE:JHBT) — 작업 규칙 · 게임 핵심 정리

## 이름 · 버전
- 정식 이름 **RE : 지후배틀** · 부제 **RE:JHBT**. 버전은 **R2.0** 부터 (`<meta name="jihoo-version">` · 잠수함 패치는 `<meta name="jihoo-build">` +1)
- 지후배틀(R1, v8.1) · 지후배틀 2(JHBT2) 는 서비스 종료. R1 전체 코드는 `archive/v8.1` 브랜치에 백업
- 버전 태그 이름은 R1 과 같은 `jihoo-version` 이어야 한다 (예전 화면이 새 버전을 알아보고 새로고침 안내를 띄운다)

## 구조
- `index.html` 하나가 게임 전체 (빌드 없음). 로컬 테스트: `python -m http.server 8766`
- 구역: CONFIG → CHARS(지후 데이터) → STATUS → 이모티콘 목록 → 시드 난수 → 저장 · 계정 → Firebase → 엔진(전투) → 라운드 · 배치 → 가차 → 이모티콘 → 봇 → 온라인(점검 · 접속 상태) → 친구 · 채팅 → 우편 · 쿠폰 → 업적 · 출석 → 친선전 → 운영 도구 → 배경음악 → 상점 → 일일 퀘스트 → 통계 → 효과음 → 메뉴 · 패치노트 · 도움말 · 환경설정 → 리더보드 → 업데이트 → 시작
- `firestore.rules` = R2 전체 규칙 (R1 · JHBT2 규칙을 대체). 콘솔에는 **파일 전체**를 게시
- 화면은 **글래스 UI** (R2.1 · iOS 풍 밝은 글래스모르피즘). R1 UI · 예전 흑백 다크 UI 는 쓰지 않는다
  - 토큰(`:root`): 바탕 `#e4e5e8` + 블롭 3개(파랑 · 보라 · 노랑) · 잉크 `#111318` · 글래스 3단계(필 `.g-pill` · 카드 `.g-card` · 시트 `.modal .box`) · 주 버튼 검정(`.k-btn` / `.btn.primary`) · 보조 버튼 `.g-btn` · 스위치 `.sw` · Pretendard 하나
  - 등급 링: 일반 `#c9c9c6` · 희귀 `#4f9dff` · 영웅 `#b26bff` · 전설 `#ffc21a` · 초상화는 원형 흰 바탕 + 링
  - 공통 상단 바(`.topbar`) · 하단 탭 바(`#tabbar`)는 `CHROME` 화면(로비 · 덱 · 뽑기 · 상점 · 친구 · 리더보드)에서만 (`body[data-chrome]`, `show()` 가 정한다) · 탭 이동은 `openTab(name)` · 모바일(≤700px) 탭 5개 · 리더보드는 메뉴
  - 퀘스트 · 출석 · 업적 · 신규 보상은 시트 하나(`#qsModal`) · 전투 화면 상태 클래스 `deploy` / `combat` / `spec` (`setPhase`)

## 업데이트 때 반드시 할 일
1. `index.html` 수정 (CHARS 수치 · 설명 텍스트 · atkText 등 하드코딩된 수치도 같이)
2. version / build 메타 갱신
3. `PATCH_NOTES` 맨 위에 새 항목 (tag: new 신규 · buff 상향 · nerf 하향 · adjust 조정 · fix 수정 · system 시스템)
4. **디스코드 공지용 인포그래픽 만들기 (잊지 말 것)**: `infographics/<버전>.json` → `python infographics/make.py infographics/<버전>.json` → `CHROME=<크롬 경로> python infographics/shot.py infographics/<버전>.html`. 형식은 make.py 상단 주석. 초상화는 `infographics/portraits.json` (index.html 의 PORTRAITS 를 바꾸면 다시 만든다)
5. 이 파일(CLAUDE.md)에 바뀐 규칙이 있으면 갱신

## 게임 규칙 · 데이터
- 모드: **일반전**(봇 · 라이프 4) · **친선전**(온라인 1:1 · 관전)만. 경쟁전 · 경매 · 협동 · 드래프트 등 다른 모드는 없다 (다시 넣지 않는다)
- 지후 20종 (JHBT2 기준 19종 + R2.2 힐 · R1 지후는 삭제): 일반 fire ice sword assassin shield heal · 희귀 accel slime dice coin · 영웅 lonely berserk scythe levelup gun combo · 전설 moon magic gift atom. 기본 지급(starter): 화염 · 얼음 · 검 · 암살 · 쉴드
- 랭크업 · 한계돌파 없음. 지후 레벨은 경기 안에서 겹쳐 놓을 때만 (Lv7까지 · 체력/공격력 ×1.2 · 효과 ×1.1 복리)
- 배치: 진영 3 × 5 칸 · 최대 10기 · 같은 지후 3기(출격제한은 deployLimit) · 카드 3장 중 1장 · 15초
- 덱 5기 · 등급: 일반 / 희귀 / 영웅 / 전설 · 뽑기 일반 65 · 희귀 30 · 영웅 4 · 전설 1 · 중복은 조각
- 모든 지후 초상화는 **흰 배경 PNG** (투명 배경 금지 · 새 초상화도 흰 배경으로 맞춘다)
- 지후 데이터 `CHARS[id]`: name · rarity · role · hp · atk · atkSpeed · range · speed · passive · skill(`type:'sec'` 초당 SP · `'hit'` 공격마다 SP · `need` · `once`) · onHit/onStart/onDeath/tick/onKill/onLethal 훅
- 선물 지후: 초당 SP 1 · **SP 18**에 무작위 지후로 변신(1회) · 변신하면 그 자리를 같은 진영 · 같은 레벨의 변신체가 차지하고 **배치 기록도 바뀌어** 다음 라운드에도 유지
- 슬라임: 쓰러지면 절반 크기 2기 (최대 2단계) · 코인: 10분마다 -50%~+50% (`coinMult` · 친선전은 판 시작 시세로 고정) · 화염: [화상] 5초 · 공격력 80% · 중첩
- 달 지후: 반경 5칸 효과 범위를 점선 원으로 표시 · SP · 쿨 게이지는 매 프레임 다시 그린다
- 힐 지후 (R2.2 · 일반 · 힐러): SP 6 [회복] = 체력 비율이 가장 낮은 아군 하나를 공격력 1000% 회복 (자신 포함 · 다른 힐 지후 제외) · 시전 때 `portraitSkill` 그림 0.8초
- 아직 안 만든 지후 그림 원본은 `지후초상화/` (투명 배경 원본 · 게임에 넣을 때는 흰 배경 256×256 으로 바꿔 PORTRAITS 에)

### 현재 밸런스 (R2.2)
- 화염 HP 1200 · 화상 80% · 암살 ATK 70 · 순간이동 뒤 첫 공격 700% · 달 공격 간격 2초 · 광폭화 [광폭화] 공격력 +140%
- 낫 HP 1240 · 공격 간격 4.5초 · [힘줄 끊기] 55% (회전 낫 이펙트 `.fx-scythe-spin`) · 레벨업 ATK 125 / 175 / 225 · 총 HP 860
- 마탄 [마탄] 8% · 500% · 원자 전자 궤도 2칸 · 콤보 공격 간격 1.7초
- 그대로: 슬라임 HP 600 · 검 ATK 190 · 고독한 HP 1700 · 코인 ATK 80 · 선물 SP 18

## 계정 · 저장
- 같은 Firebase 프로젝트 `jihoobattle` · 같은 계정 (UID 8자리 + 비밀번호 `<UID>@jihoo-battle.invalid` · Google 은 그 계정에 연결) · 게스트는 익명 인증
- 기록: `r2_backups/<uid>` (프로필 JSON) · 이 기기: localStorage `rejhbt.profile.v1`
- **R1 가져오기 (처음 한 번)**: R1 `backups/<uid>`(또는 이 기기의 `jihooBattle2.profile.v2`)에서 골드 · 다이아 · 남은 지후 보유 · 이모티콘 · 사용한 쿠폰 · 받은 운영 우편 번호. 모집권은 다이아로 환산 (`R1_TICKETS`). 삭제된 지후의 조각 · 가루는 환급하지 않는다. R1 레벨 · 전적은 `profile.legacy` (관상용)
- 시즌 초기화: 모두 **Lv.0** 부터 (`xpNeed(lv) = 100 + 50 × lv`) · 레벨업마다 ◆100
- 일반전 보상 (R2.1): 승리 +60 XP · ● 1,000~2,000 · **다이아 없음** / 패배 **경험치 −30** (지금 레벨 안에서만 · 레벨은 내려가지 않는다 · 다이아 없음) · 친선전 · 관전은 보상 없음
- 닉네임 등록부 `nicknames` (R1 과 공유) · 리더보드 `r2lb` (레벨 · 승리) · 명예의 전당 = R1 `leaderboard` 읽기만
- 운영자 = `admins/<uid>` 문서가 있는 계정 · 개발자 모드(모든 지후 해금 · localStorage `rejhbt-dev`) · 운영 도구(우편 · 로비 공지 · 점검)는 환경설정에 표시
- 동시 접속: `sessions/<uid>` · 이용 정지: `bans/<uid>` · 점검: `config/maintenance` · 공지: `config/announce`

## 소셜 · 우편 · 보상
- 친구 `friendships` (pending → accepted) · 접속 상태 `presence` (sp = 관전 가능한 판 번호) · 전체 채팅 `chat` · 공지 이벤트 `events` (join · level · gacha) · 1:1 `dm/<pair>/msgs` · 욕설 검열 · 도배 방지 3초
- 운영 우편 `giftMail` (to = uid 또는 'all' · rewards: diamonds · gold · epicChar · legendChar) · R2_EPOCH 이전 우편은 받지 않는다
- 쿠폰 `CODES` (계정마다 한 번) · 업적 `ACH` · 출석(접속한 날 +1) · 신규 유저 7일 보상 `NEWBIE` (새 계정만)

## 친선전 (온라인 1:1)
- `matches/<id>` 상태 invite → accepted → playing → done · `matches/<id>/msgs` 로 행동 교환
- 방장 = 진영 'a' · 참가자 = 'e' 로 **같은 전투를 두 화면이 돌린다** (시드 난수 `hashSeed`) · 참가자 화면은 전장을 좌우로 뒤집는다 (`flipView` · CSS `#field.flip`)
- 배치 행동 `{ k: 'p'|'m'|'s', id, t, ops }` · 키 `라운드진행번호(S.rk)-배치번호` · 라운드 결과는 방장 화면 기준 (`end` 메시지에 배치 상태 통째로)
- 전투 난수는 `rng` 하나만 (뽑기 · 상점 · 연출은 Math.random) — 전투 코드에 Math.random · Date.now 를 넣지 않는다 (두 화면이 갈라진다)
- 관전: 처음부터 메시지를 받아 끝난 라운드는 결과만 빠르게 · 지금 라운드부터 본다 · 보상 없음
- 테스트: `window.__REJHBT_NET_TEST = { uid }` 를 두 창에 넣고 `__rejhbt.startFriendly(m, 'host'|'guest'|'spec')` → BroadcastChannel 로 연결

## 스타일
- 코드는 주변 코드와 같은 밀도 · 이름 · 한국어 주석. 한 줄에 몰아 쓰는 기존 스타일 유지
- 브랜치: 지정된 개발 브랜치에서만 작업 · PR은 요청이 있을 때만
