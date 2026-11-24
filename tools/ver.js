// 지금 게임 버전 출력 (bat 파일용) — 예: R3.5
const m = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8').match(/name="jihoo-version" content="([^"]+)"/);
console.log(m ? m[1] : '');
