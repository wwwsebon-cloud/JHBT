// 여러 버전의 밸런스 패치를 지후별 하나로 묶은 인포그래픽 JSON (R2.22.1 · 「R2.21 ~ R2.22 밸런스 총정리」)
//   node infographics/balance-sum.js R2.21 R2.22.1 [제목]   → infographics/balance-R2.21-R2.22.1.json
//   먼저 node infographics/extract.js · 랭크 6 고유능력 구역은 뺀다 · tag 가 buff · nerf · adjust · rework 인 지후 항목만 (추가 패치 구역 안의 것도)
//   같은 수치 (「공격력」 등) 는 처음 값 → 마지막 값으로 합치고, 처음과 같아진 수치는 뺀다 · 문장은 그대로 (같은 문장은 한 번)
//   손으로 줄인 지후는 아래 OVERRIDE (문장이 여러 번 바뀌어 자동으로 합치면 지저분한 지후)
const fs = require('fs'), path = require('path');
const DATA = path.join(__dirname, '_data'), [from, to, ...rest] = process.argv.slice(2), title = rest.join(' ') || `${from} ~ ${to} 밸런스 총정리`;
const NOTES = JSON.parse(fs.readFileSync(path.join(DATA, 'patch_notes.json'), 'utf8')), INFO = JSON.parse(fs.readFileSync(path.join(DATA, 'chars_info.json'), 'utf8'));
const strip = h => String(h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const num = s => { const t = String(s).replace(/,/g, '').trim(); const m = /^(-?\d+(?:\.\d+)?)\s*(%|초|칸|배)?$/.exec(t); return m ? { v: +m[1], u: m[2] || '' } : null; };
const STAT_RE = /^(.*?)<b>\s*([^<→]+?)\s*→\s*([^<]+?)\s*<\/b>\.?\s*$/;
const BAL = ['buff', 'nerf', 'adjust', 'rework'];
const OVERRIDE = { // 지후 id → 줄 (수치 { stat, from, to, unit } 또는 { text }) · tag
  monolith: { tag: 'adjust', lines: [{ stat: '체력', from: 1800, to: 2300, unit: '' }, { text: '레이저 현재 체력 × 레벨 × 10%' }, { text: '충전 스스로 · 아군마다 1%' }] },
  sniper: { tag: 'adjust', lines: [{ stat: '공격력', from: 1000, to: 800, unit: '' }, { stat: '공격 간격', from: 8.5, to: 7.5, unit: '초' }, { text: '가까울수록 피해 감소 (바로 앞 −50%)' }] },
  reaper: { tag: 'adjust', lines: [{ text: '소환체 · 분열체도 SP 충전' }, { text: '[봉인] 중 이동 불가' }] },
  revive: { tag: 'buff', lines: [{ text: '소환체 · 분열체도 SP 충전 · 부활' }] },
  biker: { tag: 'buff', lines: [{ stat: '돌진 피해 (체력 비례)', from: '현재 50%', to: '최대 75%', unit: '' }] },
  archaeo: { tag: 'buff', lines: [{ stat: '낡은', from: 52.5, to: 45, unit: '%' }, { stat: '전설', from: 13, to: 20, unit: '%' }, { stat: '개쩌는', from: 2, to: 5, unit: '%' }] },
  coin: { tag: 'adjust', lines: [{ stat: '시세', from: '±50%', to: '0.3 ~ 4배', unit: '' }, { text: '장세 · 펌핑 / 떡락' }] },
};
const vi = v => NOTES.findIndex(n => n.v === v), i0 = vi(to), i1 = vi(from); // NOTES 는 최신이 앞
if (i0 < 0 || i1 < 0) { console.error('패치노트에 없는 버전'); process.exit(1); }
const by = new Map(); // id → { parts: [{ stat… } | { text }], tags: Set, dirs: [] }
for (let i = i1; i >= i0; i--) for (const sec of NOTES[i].sections) { if (/랭크 6/.test(sec.title)) continue;
  for (const it of sec.items) { if (!it.id || !BAL.includes(it.tag) || !INFO[it.id] || / · /.test(it.name)) continue; // 「코인 · 존버 정신」 같은 랭크 6 항목은 이름에 「 · 」
    const e = by.get(it.id) || { parts: [], tags: new Set() }; by.set(it.id, e); e.tags.add(it.tag);
    for (const p of String(it.desc).split(/\s·\s/)) { const m = STAT_RE.exec(p.trim());
      if (m) { const label = strip(m[1]).replace(/[:·]$/, '').trim() || '수치', f = num(m[2]), t = num(m[3]), old = e.parts.find(x => x.stat === label);
        if (old) { old.to = t ? t.v : strip(m[3]); old.unit = (t && t.u) || old.unit; } else e.parts.push({ stat: label, from: f ? f.v : strip(m[2]), to: t ? t.v : strip(m[3]), unit: (t && t.u) || (f && f.u) || '' }); }
      else { const tx = strip(p).replace(/\.$/, ''); if (tx && !e.parts.some(x => x.text === tx)) e.parts.push({ text: tx }); } } } }
const tiles = [];
for (const [id, e] of by) {
  const o = OVERRIDE[id]; let lines = o ? o.lines : e.parts.filter(x => x.text || String(x.from) !== String(x.to)); if (!lines.length) continue;
  let tag = o && o.tag;
  if (!tag) { const ds = lines.filter(l => l.stat && typeof l.from === 'number' && typeof l.to === 'number').map(l => ((l.to > l.from) !== /간격|쿨|SP|대기|감소/.test(l.stat) ? 'buff' : 'nerf'));
    const tg = [...new Set([...e.tags].map(t => (t === 'rework' ? 'adjust' : t)))], all = tg.length === 1 ? tg : ds.length === lines.length ? ds : tg; // 패치노트 태그가 하나로 같으면 그것 · 섞였으면 수치로 (SP 「충전량」 은 높을수록 좋아서 수치만으로는 틀릴 수 있다)
    tag = all.every(t => t === 'buff') ? 'buff' : all.every(t => t === 'nerf') ? 'nerf' : 'adjust'; }
  tiles.push({ id, name: INFO[id].name, rarity: INFO[id].rarity, tag, lines: lines.slice(0, 4) });
}
const d = { version: to, date: NOTES[i0].date, title, subtitle: `지후별로 ${from} 전 → 지금 (${to}) 수치 · 랭크 6 고유능력 제외 · ${tiles.length}종`, width: 1920, cols: 2, theme: 'dark', chars: tiles.slice(0, 5).map(t => t.id), sections: [{ kind: 'balance', label: '밸런스', tiles }] };
const out = path.join(__dirname, `balance-${from}-${to}.json`); fs.writeFileSync(out, JSON.stringify(d, null, 1)); console.log(out, tiles.length + '종');
