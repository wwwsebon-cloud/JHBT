// PATCH_NOTES → 인포그래픽 JSON (R2.17.2 · 예전 %TEMP%/ld/pn2info.js 를 옮김)
//   node infographics/notes2json.js R2.17.2            → infographics/R2.17.2.json (업데이트 노트)
//   node infographics/notes2json.js R2.17 --new        → infographics/R2.17-new.json (신규 지후 · 그 버전 패치노트의 tag 'new' 지후)
//   node infographics/notes2json.js R2.17 --new god rush   (지후를 직접 고르기)
//   먼저 node infographics/extract.js 로 _data/ 를 만든다
// 밸런스 항목은 늘 "tiles" (5칸 타일 · 여러 장 · R2.20: 예전엔 30명 이상일 때만 · 적으면 흰 "stats" 칩 목록이었다) · 테마는 늘 남색 (dark)
const fs = require('fs'), path = require('path');
const DATA = path.join(__dirname, '_data'), args = process.argv.slice(2), ver = args[0], NEW = args.includes('--new'), pick = args.slice(1).filter(a => a !== '--new');
const NOTES = JSON.parse(fs.readFileSync(path.join(DATA, 'patch_notes.json'), 'utf8')), INFO = JSON.parse(fs.readFileSync(path.join(DATA, 'chars_info.json'), 'utf8'));
const TILE_MIN = 1; // R2.20: 30 → 1 (최신 남색 · 타일 레이아웃을 늘 쓴다)
const strip = h => String(h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const num = s => { const t = String(s).replace(/,/g, '').trim(); const m = /^(-?\d+(?:\.\d+)?)\s*(%|초|칸|배)?$/.exec(t); return m ? { v: +m[1], u: m[2] || '' } : null; };
const STAT_RE = /^(.*?)<b>\s*([^<→]+?)\s*→\s*([^<]+?)\s*<\/b>\.?\s*$/;
function statOf(it, p) { // '공격력 <b>200 → 100</b>' → { stat, from, to, unit } (아니면 null)
  const m = STAT_RE.exec(p.trim()); if (!m) return null;
  const label = strip(m[1]).replace(/[:·]$/, '').trim() || '수치', f = num(m[2]), t = num(m[3]);
  const st = { id: it.id, stat: label, from: f ? f.v : strip(m[2]), to: t ? t.v : strip(m[3]), unit: (t && t.u) || (f && f.u) || '' };
  if (/간격|쿨|SP|대기|시간이 줄/.test(label)) st.lower = true;
  if (!(f && t)) st.dir = it.tag === 'nerf' ? 'nerf' : 'buff';
  else if (it.tag === 'buff' || it.tag === 'nerf') { const d = (t.v < f.v) !== !!st.lower ? 'nerf' : 'buff'; if (d !== it.tag) st.dir = it.tag; }
  return st;
}
function toStats(it) { const out = []; for (const p of String(it.desc).split(/\s·\s/)) { const st = statOf(it, p); if (!st) return null; out.push(st); } return out.length ? out : null; }
function toTile(it) { // 타일: 수치는 칩 · 나머지 문장은 글 줄 (짧게)
  const lines = String(it.desc).split(/\s·\s/).map(p => { const st = statOf(it, p); return st ? { stat: st.stat, from: st.from, to: st.to, unit: st.unit } : { text: strip(p).replace(/\.$/, '') }; }).filter(l => l.stat || l.text);
  return { id: it.id, name: (INFO[it.id] || {}).name || it.name, rarity: (INFO[it.id] || {}).rarity || '', tag: ['buff', 'nerf'].includes(it.tag) ? it.tag : 'adjust', lines };
}
const KIND = (title, items) => { const tags = items.map(i => i.tag); if (/수정|버그/.test(title) || tags.every(t => t === 'fix')) return 'fix'; if (/밸런스|랭크 6|하향|상향/.test(title) || tags.every(t => ['buff', 'nerf', 'adjust', 'rework'].includes(t))) return 'balance'; if (tags.every(t => t === 'system' || t === 'adjust')) return 'change'; return 'new'; };
const n = NOTES.find(x => x.v === ver); if (!n) { console.error('패치노트에 없는 버전: ' + ver); process.exit(1); }
if (NEW) { // 신규 지후 인포그래픽
  const ids = pick.length ? pick : [...new Set(n.sections.flatMap(s => s.items).filter(it => it.tag === 'new' && it.id && INFO[it.id]).map(it => it.id))];
  if (!ids.length) { console.error('신규 지후가 없어요 (지후 id 를 직접 적어 주세요)'); process.exit(1); }
  const latest = NOTES[0].v, d = { type: 'newchars', version: ver, date: n.date, title: ids.length > 1 ? `신규 지후 ${ids.length}종` : '신규 지후', subtitle: latest !== ver ? `수치는 ${latest} 기준` : '', chars: ids.map(id => ({ id, ...INFO[id] })) };
  const out = path.join(__dirname, ver + '-new.json'); fs.writeFileSync(out, JSON.stringify(d, null, 1)); console.log(out, ids.join(' '));
  process.exit(0);
}
const secs = [], chars = [];
for (const sec of n.sections) { const kind = KIND(sec.title, sec.items), items = [], stats = [], tiles = [];
  const balIds = kind === 'balance' ? sec.items.filter(it => it.id) : [], tileMode = balIds.length >= TILE_MIN;
  for (const it of sec.items) { if (it.id && !chars.includes(it.id)) chars.push(it.id);
    if (tileMode && it.id) { tiles.push(toTile(it)); continue; }
    const st = kind === 'balance' && it.id ? toStats(it) : null;
    if (st) stats.push(...st); else items.push({ ...(it.id ? { id: it.id } : { icon: it.icon || '✦' }), title: it.name, lines: [strip(it.desc)] }); }
  const s = { kind, label: sec.title }; if (items.length) s.items = items; if (stats.length) s.stats = stats; if (tiles.length) s.tiles = tiles; secs.push(s); }
const count = n.sections.reduce((k, s) => k + s.items.length, 0), tiled = secs.some(s => s.tiles);
const d = { version: n.v, date: n.date, title: n.title, ...(tiled ? { width: 1920, cols: 2 } : count > 7 ? { width: 1600, cols: 2 } : {}), theme: 'dark', ...(chars.length ? { chars: chars.slice(0, 5) } : {}), sections: secs };
const out = path.join(__dirname, n.v + '.json'); fs.writeFileSync(out, JSON.stringify(d, null, 1)); console.log(out, count + ' items' + (tiled ? ' · tiles' : ''));
