# 지후배틀

웹에서 플레이: https://wwwsebon-cloud.github.io/JHBT/

`index.html` 하나로 실행됩니다. 화면·게임 흐름·전투·캐릭터 수치(`CHARACTER_BALANCE`)·초상화(`PORTRAITS`, base64)·Firebase 설정·패치노트(`PATCH_NOTES`)가 모두 이 파일 안에 있습니다. 빌드 과정은 없습니다.

## 파일

- `index.html` — 게임 전체
- `firestore.rules` — Firestore 보안 규칙. Firebase 콘솔 → Firestore Database → 규칙에 전체를 붙여넣어 게시합니다.
- `infographics/` — 업데이트 인포그래픽. `python3 infographics/make.py infographics/<버전>.json`
- `tools/migrate-leaderboard-deck/` — 레벨 리더보드 덱을 1번 슬롯 덱으로 일괄 변환 (관리자 키로 한 번 실행)
- `tools/discord-webhook-worker/` — 디스코드 알림 중계 (Cloudflare Worker). 가입 · 전설 획득 · 게임 결과
- `manifest.webmanifest`, `sw.js`, `icons/` — 앱으로 설치(PWA). 메뉴(☰) → 앱으로 설치. 서비스 워커는 항상 네트워크를 먼저 쓰고 연결이 없을 때만 마지막으로 받은 사본을 보여주므로, 새 버전 배포나 버전 확인에 영향을 주지 않습니다.

## 릴리스

1. `index.html` 맨 위 `<meta name="jihoo-version" content="…">`의 버전을 올립니다. 문서 제목·로비 배지·패치노트 버튼·인트로 버전이 모두 여기서 나옵니다.
2. `PATCH_NOTES` 맨 앞에 같은 버전 항목을 추가합니다. 신규 지후가 있으면 섹션 제목을 `신규 지후`로 하고 `releasedAt`을 배포 시각으로 두면 48시간 신규 지후 픽업이 열립니다.
3. 배포하면 이미 게임을 켜 둔 사람은 버전 태그를 확인해(5분마다·탭으로 돌아올 때) 새로고침 안내를 받습니다. 경기 중에는 끝난 뒤에 뜹니다.

## 온라인 기능

Firebase 프로젝트 `jihoobattle`의 이메일/비밀번호 인증과 Firestore를 사용합니다. 닉네임과 비밀번호(6~32자)로 계정을 만들면 8자리 UID가 배정되고, 다른 기기에서는 UID와 비밀번호로 로그인해 백업을 복원합니다. 3.0 시절 4자리 UID 계정은 32자 복구 키를 비밀번호로 써서 로그인할 수 있습니다. 닉네임으로도 로그인할 수 있습니다. 로그인한 계정이 리더보드를 갱신할 때 `nicknames` 컬렉션에 닉네임 → UID를 등록하며, 같은 닉네임은 먼저 등록한 계정만 씁니다. 이 기능은 `firestore.rules`의 `nicknames` 규칙이 게시되어 있어야 동작합니다. 비밀번호 재설정 수단은 없습니다.

웹 API 키는 공개 클라이언트 설정입니다. 리더보드 수치는 클라이언트가 올리므로 조작을 막지는 못합니다.
