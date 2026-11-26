// 딸깍 패치기 핵심 (R3.7) — index.html 에서 지후 하나의 숫자 · 설명을 뽑고, 고친 값을 그 자리 (글자 위치) 에 그대로 넣는다
//   지후 정의 (CHARS) · 그 지후만 쓰는 도우미 함수 · 상수 객체 · 필살기 (ULT) · 토큰 표 · 설명 (passive · skill.desc · CHAR_INFO · 랭크 S) 를 모은다
//   index.html 은 줄바꿈이 섞여 있다 → 바꾸는 글자 범위만 갈아 끼우고 나머지는 한 글자도 건드리지 않는다
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..', '..'), FILE = path.join(ROOT, 'index.html');
const read = () => fs.readFileSync(FILE, 'utf8');
const sha = s => crypto.createHash('sha1').update(s).digest('hex');

// ── 아주 작은 JS 훑개: 문자열 · 주석 · 정규식은 건너뛰고 숫자 · 이름 · 문자열 위치를 알려 준다 ──
function scan(src, a, b, cb) {
  let i = a, depth = 0, prev = '(';
  const ts = [];
  const tmpl = j => { while (j < b) { const c = src[j]; if (c === '\\') { j += 2; continue; } if (c === '`') { i = j + 1; prev = 'x'; return; } if (c === '$' && src[j + 1] === '{') { ts.push(depth); depth++; i = j + 2; prev = '('; return; } j++; } i = b; };
  while (i < b) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { const e = src.indexOf('\n', i); i = e < 0 || e > b ? b : e; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? b : e + 2; continue; }
    if (c === "'" || c === '"') { let j = i + 1; while (j < b && src[j] !== c && src[j] !== '\n') { if (src[j] === '\\') j++; j++; } if (cb.str) cb.str(i, j + 1); i = j + 1; prev = 'x'; continue; }
    if (c === '`') { tmpl(i + 1); continue; }
    if (c === '{') { depth++; i++; prev = '{'; continue; }
    if (c === '}') { if (ts.length && ts[ts.length - 1] === depth - 1) { ts.pop(); depth--; tmpl(i + 1); continue; } depth--; i++; prev = '}'; continue; }
    if (c === '/' && '(,=:[!&|?{};+-*%<>~^'.includes(prev)) { let j = i + 1, cls = false; while (j < b && src[j] !== '\n') { const d = src[j]; if (d === '\\') { j += 2; continue; } if (d === '[') cls = true; else if (d === ']') cls = false; else if (d === '/' && !cls) break; j++; } j++; while (/[a-z]/.test(src[j] || '')) j++; i = j; prev = 'x'; continue; }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) { const m = /^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/.exec(src.slice(i, i + 40)); if (cb.num) cb.num(i, i + m[0].length, m[0]); i += m[0].length; prev = 'x'; continue; }
    if (/[A-Za-z_$]/.test(c)) { let j = i; while (j < b && /[\w$]/.test(src[j])) j++; if (cb.id) cb.id(src.slice(i, j), i); i = j; prev = 'x'; continue; }
    if (!/\s/.test(c)) prev = c; i++;
  }
}

// 줄 시작 위치 목록 · 맨 앞 (들여쓰기 없는) 정의 찾기
function lines(src) { const L = [0]; for (let i = src.indexOf('\n'); i >= 0; i = src.indexOf('\n', i + 1)) L.push(i + 1); return L; }
function lineAt(L, pos) { let lo = 0, hi = L.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (L[m] <= pos) lo = m; else hi = m - 1; } return lo; }
let CACHE = null;
function model() {
  const src = read(), h = sha(src); if (CACHE && CACHE.sha === h) return CACHE;
  const L = lines(src), defs = new Map();
  const RE = /^(?:async )?function ([\w$]+)\s*\(|^const ([\w$]+) = /;
  for (let k = 0; k < L.length; k++) {
    const st = L[k], head = src.slice(st, st + 120), m = RE.exec(head); if (!m) continue;
    let e = k + 1; while (e < L.length && /\s/.test(src[L[e]] || '')) e++;
    const name = m[1] || m[2]; if (!defs.has(name)) defs.set(name, { name, a: st, b: e < L.length ? L[e] : src.length, fn: !!m[1] });
  }
  const sec = name => { const d = defs.get(name); return d ? [d.a, d.b] : null; };
  const [ca, cb] = sec('CHARS'), chars = [];
  const CRE = /^  ([A-Za-z0-9_]+): \{ name: '([^']*)', rarity: '([a-z]+)'/gm; CRE.lastIndex = ca; let m;
  while ((m = CRE.exec(src)) && m.index < cb) chars.push({ id: m[1], name: m[2], rarity: m[3], a: m.index });
  chars.forEach((c, i) => { c.b = i + 1 < chars.length ? chars[i + 1].a : cb; });
  const meta = { version: (/<meta name="jihoo-version" content="([^"]+)">/.exec(src) || [])[1], build: +(/<meta name="jihoo-build" content="(\d+)">/.exec(src) || [])[1] };
  CACHE = { src, sha: h, L, defs, sec, chars, meta, cnt: new Map() };
  return CACHE;
}
function count(M, name) { if (M.cnt.has(name)) return M.cnt.get(name); const re = new RegExp('(?<![\\w$])' + name.replace(/\$/g, '\\$') + '(?![\\w$])', 'g'); let n = 0; while (re.exec(M.src)) n++; M.cnt.set(name, n); return n; }

const KEY_KO = { hp: '체력', atk: '공격력', atkSpeed: '공격 간격 (초)', range: '사거리 (칸)', speed: '이동속도', tok: '토큰', need: '스킬 SP', cd: '쿨타임 (초)', splash: '광역 반경', shield: '쉴드', deployLimit: '출격 제한', maxLv: '최대 레벨', mass: '무게' };
const NOT_HELPER = new Set(['CHARS', 'PORTRAITS', 'CFG', 'S', 'A', 'DF2', 'DF', 'TOK', 'TOK_COST', 'DF2_TOK', 'STATUS', 'ULT', 'CHAR_INFO', 'ENH_SKILL', 'SUMMONS', 'RARITY', 'FX_OF', 'BUFF_SRC', 'baseInterval', 'effAtk', 'dealDamage', 'heal', 'instaKill', 'pctD', 'killUnit', 'makeUnit', 'launchProjectile', 'performAttack', 'moveToward', 'rkX', 'WS', 'bodySeparation', 'physMass', 'flatD', 'midXY', 'recut', 'lvShift', 'ultPlace', 'tileXY', 'coinState', 'unitRadius', 'physSnap', 'spGive', 'evSp', 'njSpAdd', 'njNear', 'njInR', 'inFan', 'attackLunge', 'muzzle']);
const oneLine = s => s.replace(/\s+/g, ' ');
// ── 사람이 읽는 이름 (숫자 앞뒤 코드로 짐작) · 사용자가 붙인 이름은 labels.json 이 먼저 ──
const LABELS_F = path.join(__dirname, 'labels.json');
const labels = () => { try { return JSON.parse(fs.readFileSync(LABELS_F, 'utf8')); } catch (e) { return {}; } };
function setLabel(k, v) { const L = labels(); if (v) L[k] = v; else delete L[k]; fs.writeFileSync(LABELS_F, JSON.stringify(L, null, 1)); }
const BUFF_KO = { atk: '공격력 증가', aspd: '공격속도 증가', spd: '이동속도 증가', tk: '받는 피해 증가', critB: '치명타 확률 증가', crit: '치명타 확률', critD: '치명타 피해', amt: '효과량', dps: '초당 피해', miss: '빗나감 확률', dodge: '회피 확률', heal: '회복량', ls: '흡혈', range: '사거리', sp: 'SP' };
let STATUS_KO = null;
function statusKo(src) { if (STATUS_KO) return STATUS_KO; STATUS_KO = {}; const a = src.indexOf('const STATUS = {'), b = src.indexOf('\n};', a); const re = /^\s+(\w+): \{ name: '([^']+)'/gm; re.lastIndex = a; let m; while ((m = re.exec(src)) && m.index < b) STATUS_KO[m[1]] = m[2]; return STATUS_KO; }
const ABBR = { N: '개수', MAX: '최대', MIN: '최소', CD: '쿨타임 (초)', T: '시간 (초)', TIME: '시간 (초)', R: '반경 (칸)', RR: '반경 (칸)', K: '배율', HEAL: '회복', DMG: '피해 배율', LINK: '연결 시간 (초)', HOLD: '유지 시간 (초)', SPD: '속도', SPEED: '속도', HP: '체력', ATK: '공격력', P: '확률', PROB: '확률', CHAIN: '연쇄 확률', SP: 'SP', TOK: '토큰', GROW: '자라는 시간 (초)', LOW: '낮은 체력 기준', USES: '사용 횟수', HALF: '부채꼴 반각 (도)', RANGE: '사거리', W: '폭', IV: '간격 (초)', LOCK: '잠금 시간 (초)', SLOW: '감속', STEAL: '빼앗는 비율', GIVE: '나눠 주는 대상 수', FIRST: '처음 대기 (초)', ON: '지속 (초)', OFF: '꺼진 시간 (초)', LIFE: '수명 (초)', TURN: '회전 속도', AMP: '증폭', RAMP: '증가량', CAP: '최대치', BOOM: '폭발', TAKEN: '받는 피해 배율', NEAR: '가까운 거리 (칸)', HV: '수확 시간 (초)', REACH: '닿는 거리 (칸)', WAVE: '파동', ST: '쌓기', EN: '기력', B: '보너스 배율', KA: '공격력 비율', KH: '체력 비율', LOSE: '잃는 비율', LV: '레벨', AW: '각성', WIND: '준비 시간 (초)', SWING: '휘두르는 시간 (초)', HIT: '맞는 순간 (초)', FADE: '사라지는 시간 (초)', PCT: '비율', SH: '쉴드', STACK: '중첩', DUR: '지속 (초)', RATE: '비율', ANG: '각도', ARC: '각도', NUM: '개수', MS: '연출 시간 (ms)', t: '시간 (초)', on: '지속 (초)', cd: '쿨타임 (초)', r: '반경', n: '개수', k: '배율', v: '값', ms: '연출 시간 (ms)', amt: '효과량' };
const keyKo = k => { if (ABBR[k]) return ABBR[k]; const p = String(k).split(/_|(?<=[A-Z])(?=\d)|(?<=\d)(?=[A-Z])/).filter(Boolean); const t = p.map(x => /^\d+$/.test(x) ? (x === '6' ? '랭크 S' : x) : ABBR[x] || ABBR[x.toUpperCase()]); return t.every(Boolean) ? t.join(' ') : ''; };
const SEG_KO = { sum: '합계', hits: '맞힌 수', stack: '중첩', cnt: '개수', count: '개수', wave: '웨이브', round: '라운드', lives: '목숨', tok: '토큰', hp: '체력', atk: '공격력', as: '공격 간격', atkSpeed: '공격 간격', speed: '이동속도', range: '사거리', maxHp: '최대 체력', baseMaxHp: '체력', form: '단계', lv: '레벨', sk: 'SP', shield: '쉴드', time: '전투 시간', cd: '공격 쿨타임', mult: '레벨 배율' };
const segKo = s => SEG_KO[s] || ABBR[s] || '';
function arrInfo(src, s) { // 숫자가 key: [ … ] 배열 안이면 { key, idx }
  const ls = src.lastIndexOf('\n', s) + 1, line = src.slice(ls, s), re = /([A-Za-z_$][\w$]*)\s*:\s*\[/g; let m, best = null;
  while ((m = re.exec(line))) { let d = 0; for (let k = m.index + m[0].length - 1; k < line.length; k++) { if (line[k] === '[') d++; else if (line[k] === ']') d--; } if (d > 0) best = m; }
  if (!best) return null; const cur = [];
  for (let k = best.index + best[0].length - 1; k < line.length; k++) { const c = line[k]; if (c === '[') cur.push(0); else if (c === ']') cur.pop(); else if (c === ',' && cur.length) cur[cur.length - 1]++; }
  return { key: best[1], idx: cur };
}
const ARR_M = new Map();
function arrMeaning(src, key) { // const [kh, ka, as] = u.def.forms[…] → b.hp * kh → 체력 배율
  if (ARR_M.has(key)) return ARR_M.get(key); let out = null;
  const m = new RegExp('\\[\\s*([\\w$]+(?:\\s*,\\s*[\\w$]+)+)\\s*\\]\\s*=\\s*[^;\\n]*\\.' + key + '\\[').exec(src);
  if (m) { const tail = src.slice(m.index, m.index + 700); out = m[1].split(/\s*,\s*/).map(n => { const r = new RegExp('([\\w$.]+)\\s*\\*\\s*' + n + '(?![\\w$])').exec(tail); const g = r && segKo(r[1].split('.').pop()); return g ? g + ' 배율' : n; }); }
  ARR_M.set(key, out); return out;
}
function arrLabel(src, a) { const mean = arrMeaning(src, a.key), last = a.idx[a.idx.length - 1], name = keyKo(a.key) || a.key;
  return `${name} ${a.idx.length > 1 ? a.idx.slice(0, -1).map(i => i + 1).join('-') + '단계 · ' : ''}${mean && mean[last] ? mean[last] : last + 1 + '번째 값'}`; }
function guess(src, before, after, key, v) {
  const b = before.slice(-140), pct = x => (+x < 10 ? ` (${+(x * 100).toFixed(1)}%)` : '');
  if (key && BUFF_KO[key] && /\{[^{}]*$/.test(b) && /A\.buff\(|buff/.test(b)) return BUFF_KO[key] + pct(v);
  let m;
  if ((m = /A\.status\(\s*[\w.]+,\s*'(\w+)',\s*$/.exec(b))) return (statusKo(src)[m[1]] || m[1]) + ' 시간 (초)';
  if (/A\.buff\(\s*[\w.]+,\s*[^,]+,\s*\{[^}]*\},\s*$/.test(b)) return '버프 지속 (초)';
  if (/A\.later\(\s*$/.test(b)) return '지연 (초)';
  if (/A\.dmg\(\s*[\w.]+,\s*[\w.]+,\s*$/.test(b)) return `피해 (공격력의 ${v}%)`;
  if (/A\.knock\(\s*[\w.]+,\s*[\w.]+,\s*$/.test(b)) return '넉백 거리 (칸)';
  if (/A\.cut\(\s*[\w.]+,\s*$/.test(b)) return '최대 체력 깎는 비율' + pct(v);
  if (/A\.cut\(\s*[\w.]+,\s*[^,]+,\s*$/.test(b)) return '최대 체력 깎기 지속 (초)';
  if (/A\.(?:around|zone)\(\s*[\w.]+,\s*(?:[\w.]+,\s*[\w.]+,\s*)?$/.test(b)) return '범위 반경 (칸)';
  if (/A\.zone\(\s*[\w.]+,\s*[^,]+,\s*$/.test(b)) return '장판 지속 (초)';
  if (/A\.boom\(\s*[\w.]+,\s*[^,]+,\s*[^,]+,\s*$/.test(b)) return '폭발 반경 (칸)';
  if (/A\.boom\(\s*[\w.]+,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*$/.test(b)) return '넉백 거리 (칸)';
  if (/A\.line\([^;]*speed:\s*$/.test(b)) return '날아가는 속도';
  { const am = /([\w$.]+)\s*=\s*$/.exec(b); if (am) { const w = am[1].split('.').pop(), sg = segKo(w) || keyKo(w); return (sg || w) + ' 값'; } }
  { const e1 = /enh6\([^)]*\)\s*\?\s*$/.test(b), e2 = /enh6\([^)]*\)\s*\?\s*[\d.]+\s*:\s*$/.test(b);
    if (e1 || e2) { const mm = /([\w$.]+)\s*\*\s*\(\s*enh6\([^)]*\)\s*\?[^()]*$/.exec(b), sg = mm && segKo(mm[1].split('.').pop()); return (sg ? sg + ' 비율 · ' : '') + (e1 ? '랭크 S 일 때' : '랭크 S 아닐 때') + (sg ? pct(v) : ' 값'); } }
  { const cm = /([\w$.]+)\s*(?:\|\|\s*[\d.]+\s*\)\s*)?(?:[<>]=?|[!=]==?)\s*$/.exec(b); if (cm) { const w = cm[1].split('.').pop(), sg = segKo(w); return (sg || w) + (/[!=]==?\s*$/.test(b) ? ' = 이 값일 때' : ' 기준값 (이 값과 비교)'); } }
  { const tm = /([\w$.]+(?:\(\))?)\s*\?\s*$/.exec(b); if (tm && /^[A-Za-z_$]/.test(tm[1]) && !/enh6/.test(tm[1])) { const w = tm[1].replace(/\(\)$/, '').split('.').pop(), sg = segKo(w); return `${sg || w} 일 때 값`; } }
  { const tm = /([\w$.]+(?:\(\))?)\s*\?\s*[\d.]+\s*:\s*$/.exec(b); if (tm && /^[A-Za-z_$]/.test(tm[1])) { const w = tm[1].replace(/\(\)$/, '').split('.').pop(), sg = segKo(w); return `${sg || w} 아닐 때 값`; } }
  { const vm = /(?:\b(?:const|let|var)\s+|,\s*)([A-Za-z_$][\w$]*)\s*=\s*[^;,=]*$/.exec(b); if (vm && !/^(?:i|j|k)$/.test(vm[1])) { const ko = segKo(vm[1]) || keyKo(vm[1]); if (ko) return `${ko} (${vm[1]})`; } }
  if (/rkX\([^)]*\)\s*\*\s*$/.test(b) || /^\s*\*\s*rkX\(/.test(after)) return '랭크마다 늘어나는 값';
  if (/\(\s*u\.lv\s*-\s*1\s*\)\s*\*\s*$/.test(b) || /^\s*\*\s*\(\s*u\.lv\s*-\s*1/.test(after)) return '레벨마다 늘어나는 값';
  if (/rng\(\)\s*<\s*$/.test(b)) return '확률' + pct(v);
  if (/^\s*\*\s*CFG\.CELL/.test(after)) return '거리 (칸)';
  if (/maxHp\s*\*\s*$/.test(b) || /^\s*\*\s*[\w.]*maxHp/.test(after)) return '최대 체력 비율' + pct(v);
  if (/\.hp\s*\*\s*$/.test(b)) return '현재 체력 비율' + pct(v);
  if (/heal\([^;]*\*\s*$/.test(b)) return '회복 배율' + pct(v);
  if (/(?:effAtk\([^)]*\)|\batk|\.atk)\s*\*\s*$/.test(b) || /^\s*\*\s*effAtk\(/.test(after)) return '공격력 배율' + pct(v);
  if (/dealDamage\(\s*\w+,\s*[\w.]+,\s*$/.test(b)) return '피해량';
  if (/S\.time\s*\+\s*$/.test(b)) return '지속 (초)';
  if (/\bdt\s*\*\s*$/.test(b)) return '초당 변화량';
  if (/(?:cd|\.t|left|wait|T)\s*=\s*$/.test(b)) return '시간 (초)';
  if (/Math\.min\(\s*$|,\s*$/.test(b) && /Math\.min\(/.test(b.slice(-40))) return '최대 한도';
  if (/Math\.max\(\s*$/.test(b)) return '최소 한도';
  if (/[<>]=?\s*$/.test(b)) return '기준값';
  { const am = /([\w$.]+)\s*[+\-*/]?=\s*[^=;]*$/.exec(b), sg = am && segKo(am[1].split('.').pop()), op = /\+=?\s*$/.test(b) ? '더하는 값' : /-=?\s*$/.test(b) ? '빼는 값' : /\*\s*$/.test(b) ? '곱하는 값' : /\/\s*$/.test(b) ? '나누는 값' : '';
    if (sg && op) return `${sg} 계산 · ${op}`; }
  if (/\+=?\s*$/.test(b)) return '더하는 값';
  if (/-=?\s*$/.test(b)) return '빼는 값';
  if (/\*\s*$/.test(b) || /^\s*\*/.test(after)) return '배율';
  if (/\/\s*$/.test(b)) return '나누는 값';
  if (/\?\s*$/.test(b)) return '조건이 맞을 때 값';
  if (/:\s*$/.test(b)) return '아닐 때 값';
  return '';
}

function numsIn(M, a, b, group, opt = {}) { // 범위 안 숫자 → 항목
  const out = [], src = M.src;
  scan(src, a, b, { num: (s, e, v) => {
    const before = src.slice(Math.max(a, s - 140), s), after = src.slice(e, e + 40);
    const km = /(?:^|[{,]|\*\/)\s*([A-Za-z_$][\w$]*)\s*:\s*$/.exec(before.slice(-60)), key = km && km[1];
    if (+v === 0) return; if (+v === 1 && !key) return;
    if (/\[\s*$/.test(before) && /^\s*\]/.test(after) && +v < 10) return; /* 배열 칸 번호 */
    if (/e-\d/.test(v) || /\*\s*$/.test(before) && /^\s*\)\s*\/\s*100/.test(after) || /Math\.round\([^()]*\*\s*[^()]*\)\s*\/\s*$/.test(before)) return; /* 아주 작은 값 · 반올림 */
    if (/Math\.PI\s*[*/]\s*$/.test(before) || /^\s*\*\s*Math\.PI/.test(after)) return; /* 각도 계산 */
    if (/[%]\s*$/.test(before) || /(?<![\w$])(?:[cs][12]|i|k|j)\s*(?:[<>]=?|===?)\s*$/.test(before)) return; /* 카드 · 반복 계산 */
    const vis = /rgba?\([^)]*$|(?:fxRing|fxAt|dmgNum|njFx|shake|hitFx|sfx[A-Za-z]*|setTimeout|animate|A\.ring|FXC\.beams\.push)\([^;]*$|\.style\.|style="|toFixed\(\s*$|\$\{[^}]*$/.test(before.slice(-90)) || /^\s*(?:px|deg|s"|%)/.test(after) || ['ms', 'w1', 'w2', 't0', 'fs', 'padX', 'dx', 'dy'].includes(key || '') || opt.fxFn;
    const note = (/^\s*,?\s*\/\*\s*([^*]{1,90}?)\s*\*\//.exec(after) || [])[1] || '';
    const ls = src.lastIndexOf('\n', s) + 1, ctxA = Math.max(ls, s - 70), le = src.indexOf('\n', e), ctxB = Math.min(le < 0 ? src.length : le, e + 50);
    const lk = (opt.id || '') + '|' + oneLine(src.slice(ctxA, s)).slice(-40) + '|' + oneLine(src.slice(e, ctxB)).slice(0, 20), mine = (opt.L || {})[lk];
    const g = guess(src, before, after, key, v), arr = !key ? arrInfo(src, s) : null;
    const dead = (opt.dead || []).some(([x, y]) => s >= x && s < y) || !!(arr && opt.deadKey && opt.deadKey(arr.key));
    const kk = key && keyKo(key), code = key ? (opt.prefix ? opt.prefix + '.' : '') + key : '';
    const lab0 = mine || (arr ? arrLabel(src, arr) : key && opt.base && KEY_KO[key] ? KEY_KO[key] : key && BUFF_KO[key] && g ? g : key ? (kk ? `${kk} (${code})` : code + (g && !/값$/.test(g) ? ' · ' + g : '')) : vis ? '연출 숫자' : g || '기타 숫자');
    const lab = dead && !mine ? '(안 쓰는 코드) ' + lab0 : lab0;
    out.push({ group, vis: vis || dead, dead, lk, mine: !!mine, start: s, end: e, value: v, label: lab, key: key || '', note, ctx: [oneLine(src.slice(ctxA, s)).trimStart(), v, oneLine(src.slice(e, ctxB)).trimEnd()] });
  } });
  return out;
}

function charInfo(id) {
  const M = model(), c = M.chars.find(x => x.id === id); if (!c) return null;
  const src = M.src, groups = [], texts = [];
  // 1) 기본 스탯 (정의 첫 줄 + skill 의 need · cd)
  const firstEnd = src.indexOf('\n', c.a) + 1;
  // 안 쓰는 코드: 이름이 …Old 이거나 「안 쓴다」 주석이 붙은 멤버 · 그 안에서만 쓰는 배열
  const dead = [], MRE = /^    ([A-Za-z_$][\w$]*)\s*(?:\(|:)/gm; MRE.lastIndex = c.a; let mm, prevM = null;
  const closeM = at => { if (prevM && prevM.d) dead.push([prevM.a, at]); };
  while ((mm = MRE.exec(src)) && mm.index < c.b) { closeM(mm.index); const ln = src.slice(mm.index, src.indexOf('\n', mm.index)); prevM = { a: mm.index, d: /Old$/.test(mm[1]) || /안 쓴다|안 씀/.test(ln.slice(0, 200)) }; }
  closeM(c.b);
  const deadKey = k => { const re = new RegExp('\\.' + k + '(?![\\w$])', 'g'); let r, n = 0; while ((r = re.exec(src))) { n++; if (!dead.some(([x, y]) => r.index >= x && r.index < y)) return false; } return n > 0; };
  const LB = labels(), O = x => ({ id, L: LB, dead, deadKey, ...x });
  const base = numsIn(M, c.a, firstEnd, '기본 스탯', O({ base: true }));
  const rest = numsIn(M, firstEnd, c.b, '지후 정의 (CHARS)', O({ base: true }));
  const skillNum = rest.filter(x => x.key === 'need' || x.key === 'cd'); base.push(...skillNum);
  groups.push({ title: '기본 스탯', items: base });
  // 토큰 표
  const tokIn = (name, label) => { const d = M.defs.get(name); if (!d) return null; const seg = src.slice(d.a, d.b), r = new RegExp('(?<![\\w$])' + id + ':\\s*(\\d+(?:\\.\\d+)?)').exec(seg); if (!r) return { group: '토큰', insert: true, table: name, label, value: '', start: d.a, end: d.a, key: id, ctx: ['', '(표에 없음 · 기본 2)', ''] }; const s = d.a + r.index + r[0].length - r[1].length; return { group: '토큰', start: s, end: s + r[1].length, value: r[1], label, key: id, table: name, ctx: [name + ' { … ' + id + ': ', r[1], ' … }'] }; };
  const tk = [];
  if (!base.some(x => x.key === 'tok')) { const t = tokIn('TOK_COST', '토큰 (일반전)'); if (t) tk.push(t); }
  const t2 = tokIn('DF2_TOK', '디펜스 토큰'); if (t2) tk.push(t2);
  if (tk.length) groups.push({ title: '토큰', items: tk });
  groups.push({ title: '지후 정의 (CHARS)', items: rest.filter(x => !skillNum.includes(x)) });
  // 2) 도우미 함수 · 상수 (이 지후 근처에서만 쓰는 이름 · 두 단계)
  const seen = new Set([id]), order = [];
  const visit = (a, b, d) => { const ids = new Set(); scan(src, a, b, { id: n => ids.add(n) }); for (const n of ids) { if (seen.has(n) || NOT_HELPER.has(n) || /^(sfx|fx[A-Z]|draw|dmgNum|hitFx|cv[A-Z]|njFx|banner|shake)/.test(n)) continue; const df = M.defs.get(n); if (!df) continue; const lim = df.fn ? 10 : 45; if (count(M, n) > lim) continue; seen.add(n); order.push(df); if (d < 2) visit(df.a, df.b, d + 1); } };
  visit(c.a, c.b, 1);
  // 필살기
  const U = M.defs.get('ULT'); let ultR = null;
  if (U) { const re = new RegExp('^  ' + id + ': \\{', 'm'), seg = src.slice(U.a, U.b), r = re.exec(seg); if (r) { const a = U.a + r.index, nx = /^  [A-Za-z0-9_]+: \{|^\};/m; const tail = src.slice(a + 3, U.b), n2 = nx.exec(tail); ultR = [a, n2 ? a + 3 + n2.index : U.b]; visit(ultR[0], ultR[1], 1); } }
  order.sort((x, y) => x.a - y.a).forEach(df => { const it = numsIn(M, df.a, df.b, (df.fn ? '함수 ' : '상수 ') + df.name, O({ prefix: df.fn ? '' : df.name, fxFn: /(?:Fx|Draw|Spin|Head|Count|Pic|El|Css)$/.test(df.name) })); if (it.length) groups.push({ title: (df.fn ? '도우미 함수 · ' : '상수 · ') + df.name, items: it }); });
  if (ultR) { const it = numsIn(M, ultR[0], ultR[1], '필살기 (SSS)', O({})); if (it.length) groups.push({ title: '필살기 (SSS)', items: it }); }
  // 3) 설명 글
  const strAfter = (a, b, keyRe, label) => { scan(src, a, b, { str: (s, e) => { if (keyRe.test(src.slice(Math.max(a, s - 20), s))) texts.push({ label, start: s + 1, end: e - 1, value: src.slice(s + 1, e - 1), kind: 'str' }); } }); };
  strAfter(c.a, c.b, /passive:\s*$/, '패시브 설명 (passive)');
  strAfter(c.a, c.b, /(?<!\w)desc:\s*$/, '스킬 설명 (skill.desc)');
  if (ultR) strAfter(ultR[0], ultR[1], /(?<!\w)desc:\s*$/, '필살기 설명');
  const lineOf = (name, re, label) => { const d = M.defs.get(name); if (!d) return; const seg = src.slice(d.a, d.b), r = re.exec(seg); if (!r) return; const a = d.a + r.index, e = src.indexOf('\n', a); let b = e < 0 ? src.length : e; if (src[b - 1] === '\r') b--; texts.push({ label, start: a, end: b, value: src.slice(a, b), kind: 'line' }); };
  lineOf('CHAR_INFO', new RegExp('^  ' + id + ': \\[\\[', 'm'), '도감 상세 (CHAR_INFO · 한 줄 그대로)');
  lineOf('ENH_SKILL', new RegExp('^  ' + id + ': \\{ 6:', 'm'), '랭크 S 고유능력 (ENH_SKILL · 한 줄 그대로)');
  const pm = new RegExp("^  " + id + ": '(data:image/[^']+)'", 'm').exec(src);
  return { sha: M.sha, meta: M.meta, id, name: c.name, rarity: c.rarity, portrait: pm ? pm[1] : '', groups: groups.filter(g => g.items.length), texts };
}

// ── 적용 ──
const nlOf = (src, at) => (src.slice(at, at + 400).includes('\r\n') ? '\r\n' : '\n');
const q = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/[\r\n]+/g, ' ');
function todayKST() { return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10).replace(/-/g, '.'); }
function bumpVer(v) { const m = /^(.*?)(\d+)$/.exec(v); return m ? m[1] + (+m[2] + 1) : v; }

function apply(req) { // req: { sha, id, edits: [{start,end,old,new,insert?,table?,key?}], texts: [{start,end,old,new,kind}], mode: 'sub'|'build'|'version', title, notes: [{tag, desc}] }
  const M = model(); if (req.sha !== M.sha) throw new Error('index.html 이 그 사이에 바뀌었어요 — 지후를 다시 불러오세요');
  let s = M.src; const ops = [];
  for (const e of req.edits || []) {
    const nv = String(e.new).trim(); if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(nv)) throw new Error('숫자가 아니에요: ' + nv);
    if (e.insert) { const d = M.defs.get(e.table), at = s.indexOf('{', d.a) + 1; ops.push({ a: at, b: at, t: ` ${e.key}: ${nv},` }); continue; }
    if (s.slice(e.start, e.end) !== String(e.old)) throw new Error('위치가 맞지 않아요: ' + e.old);
    if (nv.startsWith('-')) throw new Error('음수는 넣을 수 없어요 (코드 앞의 - 를 직접 고치세요): ' + nv);
    ops.push({ a: e.start, b: e.end, t: nv });
  }
  for (const t of req.texts || []) {
    if (s.slice(t.start, t.end) !== t.old) throw new Error('설명 위치가 맞지 않아요');
    let v = String(t.new); if (t.kind === 'str') { v = v.replace(/[\r\n]+/g, ' ').replace(/(^|[^\\])'/g, "$1\\'"); } else v = v.replace(/[\r\n]+/g, ' ');
    ops.push({ a: t.start, b: t.end, t: v });
  }
  ops.sort((x, y) => y.a - x.a); for (let i = 1; i < ops.length; i++) if (ops[i].b > ops[i - 1].a) throw new Error('바꾸는 자리가 겹쳐요');
  for (const o of ops) s = s.slice(0, o.a) + o.t + s.slice(o.b);
  // 버전 · build · 패치노트
  const meta = { ...M.meta }; let notesAt = null;
  if (req.mode === 'build' || req.mode === 'version') {
    const items = (req.notes || []).filter(n => n.desc && n.desc.trim());
    if (!items.length) throw new Error('패치노트 항목이 없어요 (잠수함이 아니면 한 줄 이상)');
    const c = M.chars.find(x => x.id === req.id), name = c ? c.name : req.id;
    const pa = s.indexOf('const PATCH_NOTES = ['); if (pa < 0) throw new Error('PATCH_NOTES 를 못 찾았어요');
    const nl = nlOf(s, pa), first = s.indexOf(nl, pa) + nl.length;
    const itemL = items.map(n => `      { id: '${q(n.id || req.id)}', name: '${q(n.name || name)}', tag: '${['buff', 'nerf', 'adjust', 'rework', 'fix', 'new', 'system'].includes(n.tag) ? n.tag : 'adjust'}', desc: '${q(n.desc)}' },`);
    if (req.mode === 'build') {
      const top = /^  \{ v: '([^']+)'[^\n]*sections: \[\r?\n/.exec(s.slice(first, first + 600)); if (!top) throw new Error('맨 위 패치노트 줄을 못 읽었어요');
      if (top[1] !== meta.version) throw new Error(`맨 위 패치노트 (${top[1]}) 가 지금 버전 (${meta.version}) 과 달라요 — 새 버전으로 고르세요`);
      meta.build += 1; const at = first + top[0].length;
      s = s.slice(0, at) + [`    { title: '추가 패치 (build ${meta.build})', items: [`, ...itemL, '    ] },'].join(nl) + nl + s.slice(at);
    } else {
      meta.version = bumpVer(meta.version); meta.build = 1;
      const title = q(req.title || `${name} 밸런스`);
      s = s.slice(0, first) + [`  { v: '${meta.version}', date: '${todayKST()}', title: '${title}', sections: [`, `    { title: '밸런스', items: [`, ...itemL, '    ] },', '  ] },'].join(nl) + nl + s.slice(first);
    }
    s = s.replace(/<meta name="jihoo-version" content="[^"]+"><meta name="jihoo-build" content="\d+">/, `<meta name="jihoo-version" content="${meta.version}"><meta name="jihoo-build" content="${meta.build}">`);
    notesAt = items.length;
  }
  return { text: s, meta, notes: notesAt };
}

module.exports = { ROOT, FILE, read, model, charInfo, apply, scan, todayKST, setLabel };
