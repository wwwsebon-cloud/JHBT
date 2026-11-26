#!/usr/bin/env node
// RE : 지후배틀 — 안 올린 공지 모아 올리기 (R3.7)
//   node tools/post-all.js --list              디스코드 · Threads 에 아직 안 올린 버전 · build 확인
//   node tools/post-all.js                     합친 인포그래픽 → 커밋 · 푸시 → 미리보기 → 「y」 를 눌러야 올림
//   node tools/post-all.js --dry               합친 그림과 글만 만들어 보기 (커밋 · 푸시 · 올리기 없음)
//   node tools/post-all.js --yes               묻지 않고 올림 (딸깍 패치기 화면이 미리보기 뒤에 부른다)
//   옵션: --only discord|threads|instagram
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process'), readline = require('readline');
const P = require('./post-patch.js');
const ROOT = path.join(__dirname, '..'), INFO = path.join(ROOT, 'infographics');
const args = process.argv.slice(2), flag = k => args.includes('--' + k), opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : undefined; };
const run = (cmd, a) => spawnSync(cmd, a, { cwd: ROOT, stdio: 'inherit', env: { ...process.env, PYTHONIOENCODING: 'utf-8', CHROME: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' } }).status === 0;
const git = (...a) => (spawnSync('git', a, { cwd: ROOT, encoding: 'utf8' }).stdout || '').trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ask = q => new Promise(r => { const io = readline.createInterface({ input: process.stdin, output: process.stdout }); io.question(q, a => { io.close(); r(a.trim().toLowerCase()); }); });
const die = m => { console.error('✖ ' + m); process.exit(1); };

(async () => {
  const to = (opt('only') ? [opt('only')] : P.channels()), pend = P.pending(to);
  for (const k of to) console.log(`${k}: ${pend[k].units.length ? P.rangeText(pend[k].units) : '밀린 것 없음'}${pend[k].last ? `  (마지막으로 올린 것 ${pend[k].last})` : ''}`);
  if (flag('list')) return;
  const todo = to.filter(k => pend[k].units.length); if (!todo.length) { console.log('✔ 올릴 것이 없어요'); return; }

  /* 같은 범위를 올릴 곳끼리 한 벌의 그림을 쓴다 (범위가 다르면 그림도 따로) */
  const groups = new Map(); todo.forEach(k => { const key = P.rangeKey(pend[k].units); (groups.get(key) || groups.set(key, { units: pend[k].units, to: [] }).get(key)).to.push(k); });
  for (const [name, g] of groups) {
    console.log(`\n── 합친 인포그래픽 ${name} (${g.to.join(' · ')})`);
    const made = P.mergeDeck(g.units, name);
    if (made.deck) {
      if (!run('python', ['infographics/make.py', `infographics/${name}.json`])) die('그림 만들기 실패');
      if (!run('python', ['infographics/shot.py', `infographics/${name}*.html`])) die('그림 찍기 실패');
    } else console.log('합칠 덱이 없어요 → build 별 그림을 그대로 씁니다');
    if (flag('dry')) continue;
    if (made.deck) {
      if (git('branch', '--show-current') !== (process.env.JHBT_BRANCH || 'main')) die('main 브랜치에서 실행해 주세요');
      run('git', ['add', '--', `infographics/${name}*`]);
      if (git('diff', '--cached', '--name-only') && !run('git', ['commit', '-m', `${name} 합친 공지 인포그래픽`])) die('커밋 실패');
    }
    git('fetch', '-q', 'origin', 'main'); if (+git('rev-list', '--count', 'main..origin/main')) die('원격에 새 커밋이 있어요 — 먼저 받은 뒤 다시');
    if (+git('rev-list', '--count', 'origin/main..main')) { console.log('── GitHub 푸시 (이미지 주소가 필요해요)'); if (!run('git', ['push', 'origin', 'main'])) die('푸시 실패'); }
    const imgs = P.pendingImages(g.units, name); console.log('이미지 주소 확인 중…');
    for (let i = 0; i < 40; i++) { const bad = (await Promise.all(imgs.map(P.checkUrl))).filter(x => x !== 'ok'); if (!bad.length) break; if (i === 39) die('이미지 주소가 아직 안 열려요: ' + bad[0]); await sleep(8000); }
  }

  const call = extra => todo.every(k => run('node', ['tools/post-patch.js', '--pending', '--only', k, ...extra]) || (console.error(`✖ ${k} 실패`), false));
  console.log('\n══ 미리보기 ══'); if (!call(['--dry'])) process.exit(1);
  if (flag('dry')) { console.log('\n(--dry: 커밋 · 푸시 · 올리기 안 함)'); return; }
  if (!flag('yes') && (await ask(`\n${todo.join(' · ')} 에 진짜로 올릴까요? (y = 올림) `)) !== 'y') { console.log('올리지 않았어요'); return; }
  let ok = true; for (const k of todo) ok = run('node', ['tools/post-patch.js', '--pending', '--only', k]) && ok;
  process.exitCode = ok ? 0 : 1;
})().catch(e => die(e.message));
