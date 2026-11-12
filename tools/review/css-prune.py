#!/usr/bin/env python3
# 안 쓰는 CSS 규칙 지우기 (R2.36 코드 리뷰) — python tools/review/css-prune.py [--dry] <클래스 …>
#   클래스 이름은 점 없이 · 끝에 * 를 붙이면 접두사 (예: evf-*) · survey.py 가 알려 준 후보 중 확실한 것만 넣는다
#   그 클래스가 든 선택자만 뺀다 (쉼표 목록에 다른 선택자가 남으면 규칙은 남는다) · @media 안도 본다 · @keyframes 는 건드리지 않는다
#   안전장치: 이름이 <style> 밖 (HTML · JS) 에 낱말로 나오면 멈춘다 (JS 변수 이름과 겹칠 뿐이면 --force=이름,이름) · index.html 의 섞인 줄바꿈은 그대로 둔다
import re, sys, fnmatch
args = [a for a in sys.argv[1:] if not a.startswith('--')]; DRY = '--dry' in sys.argv
if not args: sys.exit(__doc__ or '클래스 이름을 주세요')
P = 'index.html'; s = open(P, encoding='utf-8', newline='').read()
blocks = [(m.start(1), m.end(1)) for m in re.finditer(r'<style[^>]*>(.*?)</style>', s, re.S)]
outside = ''.join(s[a:b] for a, b in zip([0] + [e for _, e in blocks], [st for st, _ in blocks] + [len(s)]))
outside = re.sub(r'[A-Za-z0-9+/]{200,}={0,2}', '', outside); toks = set(re.findall(r'[A-Za-z][\w-]*', outside))
allcls = set(); [allcls.update(re.findall(r'\.([a-zA-Z][\w-]*)', re.sub(r'\{[^{}]*\}', '{}', re.sub(r'/\*.*?\*/', '', s[a:b], flags=re.S)))) for a, b in blocks]
dead = {c for c in allcls if any(fnmatch.fnmatchcase(c, pat) for pat in args)}
FORCE = set(','.join(a[8:] for a in sys.argv[1:] if a.startswith('--force=')).split(','))
used = sorted(c for c in dead if c in toks and c not in FORCE)
if used: sys.exit('멈춤 — <style> 밖에서 쓰인다: ' + ' '.join(used))
if not dead: sys.exit('해당하는 클래스가 없어요')
DEAD_RE = re.compile(r'\.(' + '|'.join(sorted(map(re.escape, dead), key=len, reverse=True)) + r')(?![\w-])')
stat = {'rule': 0, 'sel': 0}

def skip(css, i):  # 주석 · 따옴표를 건너뛴 다음 위치
    if css.startswith('/*', i): j = css.find('*/', i + 2); return len(css) if j < 0 else j + 2
    if css[i] in '"\'':
        q = css[i]; i += 1
        while i < len(css) and css[i] != q: i += 2 if css[i] == '\\' else 1
        return i + 1
    return None

def block_end(css, i):  # css[i] == '{' → 짝 '}' 다음 위치
    d = 0
    while i < len(css):
        k = skip(css, i)
        if k: i = k; continue
        if css[i] == '{': d += 1
        elif css[i] == '}':
            d -= 1
            if d == 0: return i + 1
        i += 1
    return len(css)

def split_sel(t):
    out, d, cur = [], 0, ''
    for ch in t:
        if ch in '([': d += 1
        elif ch in ')]': d -= 1
        if ch == ',' and d == 0: out.append(cur); cur = ''
        else: cur += ch
    out.append(cur); return out

def prune(css):
    out, i, n = [], 0, len(css)
    while i < n:
        j = i  # 머리 (선택자 · @규칙) 읽기
        while j < n and css[j] not in '{;}':
            k = skip(css, j); j = k if k else j + 1
        if j >= n or css[j] != '{': out.append(css[i:j + 1]); i = j + 1; continue
        pre, e = css[i:j], block_end(css, j)
        m = re.match(r'((?:\s|/\*.*?\*/)*)(.*)$', pre, re.S); lead, sel = m.group(1), m.group(2)
        if sel.startswith('@'):
            if re.match(r'@(media|supports|container|layer)\b', sel): out.append(pre + '{' + prune(css[j + 1:e - 1]) + '}')
            else: out.append(css[i:e])
        else:
            parts = split_sel(sel); keep = [x for x in parts if not DEAD_RE.search(x)]
            if len(keep) == len(parts): out.append(css[i:e])
            elif keep: stat['sel'] += len(parts) - len(keep); out.append(lead + ','.join(keep).strip() + ' ' + css[j:e])
            else:
                stat['rule'] += 1
                if '\n' in lead or lead.strip(): out.append(lead.rstrip(' ') if lead.strip() else lead)  # 줄바꿈 · 앞 주석은 남긴다
        i = e
    return ''.join(out)

res, last = [], 0
for a, b in blocks: res.append(s[last:a]); res.append(prune(s[a:b])); last = b
res.append(s[last:]); t = ''.join(res)
print(f'클래스 {len(dead)}개 · 규칙 {stat["rule"]}개 삭제 · 선택자 {stat["sel"]}개 덜어 냄 · {len(s) - len(t):,}자 줄었어요' + (' (--dry: 저장 안 함)' if DRY else ''))
if not DRY: open(P, 'w', encoding='utf-8', newline='').write(t)
