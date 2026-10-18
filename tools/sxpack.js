// 스페셜 지후 조건 코드 → SX_PACK 문자열 (암호화 전용). 사용: node tools/sxpack.js 조건.js
// 조건 원본(.js)은 저장소에 올리지 마세요. 출력된 문자열만 index.html 에 const SX_PACK3 = '…'; try { eval(unpackRes(SX_PACK3)); } catch (error) {} 처럼 넣습니다.
const src = require('fs').readFileSync(process.argv[2], 'utf8');
const bytes = Buffer.from(src, 'utf8'), out = Buffer.alloc(bytes.length);
let x = 0x9e3779b9 | 0;
for (let i = 0; i < bytes.length; i++) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; out[i] = bytes[i] ^ (x & 255); }
process.stdout.write(out.toString('base64') + '\n');
