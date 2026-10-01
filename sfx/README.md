# 효과음 (sfx)

이 폴더에 아래 **파일 이름 그대로** 넣으면 게임에서 바로 소리가 나요. 코드는 고칠 필요 없어요.

- 형식: **mp3** (`이름.mp3`)
- 길이: 짧을수록 좋아요 (버튼·배치는 0.1~0.3초, 승리·패배·전설은 1~3초 정도)
- 없는 파일은 조용히 건너뛰어요. 하나씩 넣어도 돼요.
- 유저는 설정 > 효과음에서 음량을 0~100으로 조절할 수 있어요 (0이면 끔).

| 파일 이름 | 언제 울리나 |
|---|---|
| `click.mp3` | 버튼 누를 때 |
| `open.mp3` | 창 · 모달 열 때 |
| `buy.mp3` | 상점 · 팝업스토어 · 마일리지 구매 완료 |
| `levelup.mp3` | 계정 레벨업 |
| `gacha_common.mp3` | 뽑기 공개 · 일반 |
| `gacha_rare.mp3` | 뽑기 공개 · 희귀 |
| `gacha_epic.mp3` | 뽑기 공개 · 영웅 |
| `gacha_legend.mp3` | 뽑기 공개 · 전설 |
| `gacha_hidden.mp3` | 뽑기 공개 · 히든 |
| `place.mp3` | 내 지후 배치 |
| `merge.mp3` | 합체 · 레벨업 (배치 중) |
| `battle_start.mp3` | 전투 시작 |
| `skill.mp3` | 스킬 이름이 뜰 때 (내 편) |
| `death.mp3` | 지후가 쓰러질 때 |
| `round_win.mp3` | 라운드 승리 |
| `round_lose.mp3` | 라운드 패배 |
| `match_win.mp3` | 경기 승리 (결과 화면) |
| `match_lose.mp3` | 경기 패배 (결과 화면) |
| `emote.mp3` | 이모티콘 (파일이 없으면 지금의 뽁 소리) |
| `mail.mp3` | 우편 · 선물 받기 |

소리별 기본 크기(vol)와 연속으로 울리는 최소 간격(gap)은 `index.html` 의 `const SFX = {` 표에서 바꿀 수 있어요.

## 지후 고유 효과음 (`sfx/char/`)

지후마다 **일반 공격**과 **스킬** 소리를 따로 넣을 수 있어요. 파일을 `sfx/char/` 에 넣고, 같은 폴더의 `list.json` 에 이름을 적으면 돼요 (확장자 없이). 예: `["fire_attack", "fire_skill"]`
(파일을 주면 이름 맞추기 · list.json 적기는 Claude 가 해요.)

- `<id>_attack.mp3` — 일반 공격이 나갈 때 (짧게 · 0.1~0.4초 권장, 자주 울려요)
- `<id>_skill.mp3` — 스킬 이름이 뜰 때 (0.5~2초)
- 상대 편 지후 소리는 조금 작게, 한꺼번에 너무 많이 겹치면 일부 건너뛰어요.
- 지후 고유 스킬 소리가 있으면 공통 `skill.mp3` 대신 그 소리만 나요.

| id | 지후 | 등급 |
|---|---|---|
| `solemn` | 솔렘라멘트 지후 | 히든 |
| `blackflame` | 흑염룡 지후 | 히든 |
| `growth` | 성장 지후 | 전설 |
| `hypno` | 최면 지후 | 전설 |
| `edgy` | 에드게이 지후 | 영웅 |
| `egg` | 알 지후 | 영웅 |
| `sixseven` | 67 지후 | 전설 |
| `gambler` | 도박 지후 | 전설 |
| `mushroom` | 버섯 지후 | 영웅 |
| `phantom` | 괴도 지후 | 전설 |
| `hacker` | 해커 지후 | 전설 |
| `roulette` | 러시안룰렛 지후 | 전설 |
| `dimension` | 차원 지후 | 전설 |
| `syringe` | 주사 지후 | 영웅 |
| `glutton` | 포식 지후 | 전설 |
| `dosa` | 도사 지후 | 전설 |
| `biker` | 폭주족 지후 | 전설 |
| `tentacle` | 촉수 지후 | 영웅 |
| `engineer` | 엔지니어 지후 | 영웅 |
| `turret` | 포탑 지후 | 일반 |
| `frog` | 개구리 지후 | 영웅 |
| `prince` | 왕자 지후 | 영웅 |
| `mafia` | 마피아 지후 | 전설 |
| `henchman` | 부하 지후 | 전설 |
| `hollow` | 공허 지후 | 전설 |
| `star` | 별 지후 | 전설 |
| `demonblade` | 마검 지후 | 전설 |
| `cactus` | 선인장 지후 | 영웅 |
| `moon` | 달 지후 | 전설 |
| `duet` | 듀엣 지후 | 영웅 |
| `duet2` | 듀엣 지후2 | 영웅 |
| `bomber` | 새털라이트 전술폭격 지후 | 전설 |
| `paladin` | 팔라딘 지후 | 전설 |
| `knight` | 팔라딘나이트 지후 | 전설 |
| `func` | 지후함수 | 전설 |
| `zombie` | 좀비 지후 | 영웅 |
| `skul` | 스껄 지후 | 희귀 |
| `farmer` | 농부 지후 | 영웅 |
| `jaws` | 죠스 지후 | 영웅 |
| `rock` | 암석 지후 | 영웅 |
| `ruins` | 유적 지후 | 전설 |
| `vampire` | 흡혈 지후 | 영웅 |
| `unicorn` | 유니콘 지후 | 영웅 |
| `matrix` | 매트릭스 지후 | 전설 |
| `supply` | 보급병 지후 | 영웅 |
| `maestro` | 마에스트로 지후 | 영웅 |
| `bsod` | 블루스크린 지후 | 전설 |
| `contractor` | 청부업자 지후 | 전설 |
| `slot` | 슬롯머신 지후 | 희귀 |
| `developer` | 개발자 지후 | 전설 |
| `powermeter` | 전투력측정기 지후 | 일반 |
| `guardian` | 수호자 지후 | 전설 |
| `broker` | 브로커 지후 | 전설 |
| `hitman` | 자객 지후 | 전설 |
| `sun` | 태양 지후 | 전설 |
| `curse` | 저주 지후 | 전설 |
| `taeguk` | 태극 지후 | 전설 |
| `fire` | 화염 지후 | 일반 |
| `ice` | 얼음 지후 | 일반 |
| `lonely` | 고독한 지후 | 영웅 |
| `shield` | 쉴드 지후 | 일반 |
| `assassin` | 암살 지후 | 영웅 |
| `combo` | 콤보 지후 | 영웅 |
| `sniper` | 스나이퍼 지후 | 희귀 |
| `medic` | 힐 지후 | 일반 |
| `awaken` | 각성 지후 | 전설 |
| `berserk` | 광폭화 지후 | 영웅 |
| `poison` | 독 지후 | 일반 |
| `charge` | 돌격 지후 | 영웅 |
| `stop` | 멈춰 지후 | 희귀 |
| `mutant` | 변이 지후 | 희귀 |
| `revive` | 부활 지후 | 전설 |
| `burning` | 불타는 지후 | 희귀 |
| `bat` | 빠따 지후 | 전설 |
| `clock` | 시계 지후 | 전설 |
| `hmg` | 헤비머신건 지후 | 희귀 |
| `mega` | 확성기 지후 | 희귀 |
| `rank` | 계급 지후 | 전설 |
| `arcade` | 오락기 지후 | 영웅 |
| `gumiho` | 구미호 지후 | 전설 |
| `ninja` | 닌자 지후 | 영웅 |
| `mini` | 미니 지후 | 희귀 |
| `metal` | 메탈 지후 | 전설 |
| `necro` | 네크로맨서 지후 | 영웅 |
| `summon` | 소환체 지후 | 일반 |
| `lasso` | 올가미 지후 | 영웅 |
| `ball` | 볼 지후 | 영웅 |
| `mine` | 지뢰 지후 | 영웅 |
| `dj` | DJ 지후 | 전설 |
| `lightning` | 번개 지후 | 영웅 |
| `slime` | 슬라임 지후 | 희귀 |
| `god` | 갓지후 | 전설 |
| `instinct` | 본능 지후 | 영웅 |
| `arcane` | 아케인 지후 | 전설 |
| `satellite` | 인공위성 지후 | 영웅 |
| `portal` | 포탈 지후 | 영웅 |
| `no_u` | NO U 지후 | 전설 |
| `tyrant` | 폭군 지후 | 전설 |
| `telescope` | 망원경 지후 | 영웅 |
| `hong` | 홍명보 지후 | 영웅 |
| `levelup` | 레벨업 지후 | 영웅 |
| `reaper` | 사신 지후 | 전설 |
| `smoke` | 연막 지후 | 희귀 |
| `battery` | 충전지후 | 희귀 |
| `impeachment` | 탄핵지후 | 전설 |
| `bomb` | 폭탄 지후 | 영웅 |
| `dragon` | 드래곤지후 | 전설 |
| `meteor` | 메테오 지후 | 희귀 |
| `blizzard` | 블리자드 지후 | 전설 |
| `beam` | 빔 지후 | 영웅 |
| `mutation` | 돌연변이 지후 | 전설 |
| `mimic` | 미믹 지후 | 히든 |
| `planet` | 행성 지후 | 전설 |
| `lock` | 자물쇠 지후 | 영웅 |
| `genesis` | 제네시스 지후 | 히든 |
| `dust` | 황사 지후 | 영웅 |
| `train` | 신칸센 지후 | 전설 |
| `berserker` | 버서커 지후 | 희귀 |
| `titanium` | 티타늄 지후 | 전설 |
| `typhoon` | 태풍 지후 | 전설 |
| `cloud` | 먹구름 지후 | 전설 |
| `enhance` | 강화 지후 | 전설 |
| `parasite` | 기생충 지후 | 영웅 |
| `flower` | 꽃 지후 | 영웅 |
| `lantern` | 랜턴 지후 | 영웅 |
| `rocket` | 로켓병 지후 | 영웅 |
| `beatmania` | 비트마니아 지후 | 전설 |
| `gun` | 총 지후 | 전설 |
| `bug` | 버러지후 | 일반 |
| `blackhole` | 블랙홀 지후 | 전설 |
| `ufc` | UFC 지후 | 영웅 |
| `dubstep` | 덥스텝 지후 | 전설 |
| `laser` | 레이저 지후 | 전설 |
| `quickfreeze` | 쾌속냉각 지후 | 전설 |
| `water` | 물 지후 | 영웅 |
| `mercury` | 수은 지후 | 전설 |
| `electric` | 전기 지후 | 희귀 |
| `blessing` | 축복 지후 | 전설 |
| `tesla` | 테슬라코일 지후 | 전설 |
| `soulstealer` | 소울스틸러 지후 | 전설 |
| `moai` | 🗿 지후 | 전설 |
| `nuke` | 핵미사일 지후 | 전설 |
| `golf` | 골프 지후 | 전설 |
| `archer` | 아처 지후 | 희귀 |
| `mortar` | 박격포 지후 | 희귀 |
| `meatshield` | 고기방패 지후 | 희귀 |
