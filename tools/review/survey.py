#!/usr/bin/env python3
# 주기적 코드 리뷰용 조사 (R2.36) — python tools/review/survey.py
#   index.html 을 고치지 않고 정리 후보만 알려 준다: 안 쓰는 함수 · 한 번만 나오는 최상위 변수 · 안 쓰는 CSS 클래스 · 머리말 없이 긴 구간
#   후보는 꼭 눈으로 확인한다 (즉시 실행 함수 · 문자열로 조립하는 클래스 이름 `'r-' + 등급` 은 여기서 「안 쓰는」 것으로 보일 수 있다)
import re, collections
s = open('index.html', encoding='utf-8', newline='').read()
lite = re.sub(r'[A-Za-z0-9+/]{200,}={0,2}', '', s)  # 초상화 base64 빼기
words = collections.Counter(re.findall(r'[A-Za-z_$][\w$]*', lite))
js = lite[lite.index("'use strict';"):]
fn = collections.Counter(re.findall(r'(?<![\w$.(])function\s+([A-Za-z_$][\w$]*)\s*\(', js))
print('■ 안 쓰는 함수 (선언만 있고 부르는 곳 없음):', ' '.join(k for k in fn if words[k] == fn[k]) or '없음')
dup = [k for k, v in collections.Counter(re.findall(r'(?m)^(?:async )?function\s+([A-Za-z_$][\w$]*)', js)).items() if v > 1]
print('■ 두 번 선언된 최상위 함수:', ' '.join(dup) or '없음')
names = []
for m in re.finditer(r'(?m)^(?:const|let|var)\s+(.*)$', js):
    d, cur, parts = 0, '', []
    for ch in m.group(1):
        if ch in '([{': d += 1
        elif ch in ')]}': d -= 1
        if ch == ',' and d == 0: parts.append(cur); cur = ''
        else: cur += ch
    parts.append(cur)
    for x in parts:
        mm = re.match(r'\s*([A-Za-z_$][\w$]*)\s*=', x)
        if mm: names.append(mm.group(1))
print('■ 한 번만 나오는 최상위 변수:', ' '.join(n for n in names if words[n] == 1) or '없음')
blocks = [(m.start(1), m.end(1)) for m in re.finditer(r'<style[^>]*>(.*?)</style>', lite, re.S)]
outside = ''.join(lite[a:b] for a, b in zip([0] + [e for _, e in blocks], [st for st, _ in blocks] + [len(lite)]))
toks = set(re.findall(r'[A-Za-z][\w-]*', outside)); cls = set()
for a, b in blocks: cls.update(re.findall(r'\.([a-zA-Z][\w-]*)', re.sub(r'\{[^{}]*\}', '{}', re.sub(r'/\*.*?\*/', '', lite[a:b], flags=re.S))))
un = sorted(c for c in cls if c not in toks)
print(f'■ <style> 밖에 안 나오는 CSS 클래스 {len(un)} / {len(cls)} (확실한 것만 css-prune.py 로):'); print('  ' + ' '.join(un))
L = s.split('\n'); a = next(i for i, l in enumerate(L) if "'use strict';" in l); b = max(i for i, l in enumerate(L) if l.startswith('</script>'))
hd = [i for i in range(a, b) if re.match(r'// (═════════|──) ', L[i])] + [b]
print('■ 머리말 없이 200줄 넘는 구간 (머리말을 달거나 나눌 후보):')
for p, q in zip(hd, hd[1:]):
    if q - p > 200: print(f'  {q - p:5d}줄  {L[p][:70].strip()}')
