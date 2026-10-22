# RE : 지후배틀 (RE:JHBT) · R2.1

웹에서 플레이: https://jihoobattle.kr/

`index.html` 하나가 게임 전체 (빌드 없음). 로컬 테스트: `python -m http.server 8766`

지후배틀(R1, v8.1)은 R2.0 에서 처음부터 다시 만들었습니다. R1 의 코드 · 지후 · 기능 전체는 **`archive/v8.1` 브랜치**에 그대로 있습니다.

## 파일

- `index.html` — 게임 전체 (지후 데이터 `CHARS` · 초상화 `PORTRAITS`(base64) · 패치노트 `PATCH_NOTES` · Firebase 설정 포함)
- `firestore.rules` — Firestore 규칙. 콘솔 → Firestore Database → 규칙에 **파일 전체**를 붙여넣어 게시
- `infographics/` — 업데이트 인포그래픽 (`make.py` JSON → HTML · `shot.py` HTML → PNG) · R1 시절 인포그래픽은 `infographics/r1/`
- `tools/discord-webhook-worker/` — 디스코드 알림 중계 (Cloudflare Worker)
- `emo/` 이모티콘 · `sfx/attack.mp3` 타격음 · `bgm/lobby.mp3` 로비 음악 · `icons/` · `manifest.webmanifest` · `sw.js` (PWA)

## 릴리스

1. `index.html` 맨 위 `<meta name="jihoo-version">` (R2.0 → R2.1 …) · 잠수함 패치는 `<meta name="jihoo-build">` +1
2. `PATCH_NOTES` 맨 앞에 새 항목
3. 인포그래픽: `infographics/<버전>.json` → `python infographics/make.py …` → `python infographics/shot.py …`
4. 배포하면 켜 둔 화면은 5분마다 버전을 확인해 새로고침 안내를 받습니다 (경기 중에는 끝난 뒤). 태그 이름이 R1 과 같아서 예전 v8.1 화면도 R2.0 을 알아봅니다.

## R2.0 배포 체크리스트 (콘솔)

1. **Firestore 규칙**: 이 저장소의 `firestore.rules` 전체를 게시 (R1 · 지후배틀 2 규칙을 대체 · R1 `backups` 는 읽기만, `leaderboard` 는 명예의 전당으로 읽기만)
2. Authentication → 이메일/비밀번호 · Google · **익명(Anonymous)** 사용 설정 (게스트 리더보드에 필요)
3. 운영자: `admins/<uid>` 문서 (R1 그대로) · 게임 환경설정에 개발자 모드 · 운영 도구(우편 · 공지 · 점검)가 보인다

## 온라인

같은 Firebase 프로젝트(`jihoobattle`) · 같은 계정(UID 8자리 + 비밀번호, Google 연결). 처음 로그인하면 R1 기록(`backups/<uid>`)에서 골드 · 다이아 · 남은 지후 · 이모티콘 · 사용한 쿠폰을 한 번 가져오고 이후 `r2_backups/<uid>` 에 저장합니다. 자세한 규칙은 `CLAUDE.md`.
