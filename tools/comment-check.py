# 줄 주석(//) 뒤에 코드가 묻혔는지 검사 — python tools/comment-check.py [파일=index.html]
# index.html 은 한 줄에 여러 속성을 쓰는 경우가 많아서, 줄 끝에 「// 설명」을 단 뒤 같은 줄에 코드를 더 붙이면 그 코드가 통째로 주석이 된다
# (예: R2.26 지후 상세 heroH · picD 가 주석에 묻혀 초상화 · 이름이 사라졌다). 수정 뒤 이걸 돌려서 아무것도 안 나와야 한다.
import re, sys
try: sys.stdout.reconfigure(encoding='utf-8', errors='replace')  # 윈도우 콘솔 (cp949) 에서 「—」 를 못 찍어 죽던 것
except Exception: pass
path = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
L = open(path, 'rb').read().decode('utf-8', 'replace').split('\n')
bad = 0
# R2.29: 주석 뒤에 묻힌 호출 · 선언 · if 도 (예: R2.25.4 「… [침묵] A.portrait(u, u.def.portraitRealm);」 — 아공간 초상화가 안 바뀌었다)
CODE = re.compile(r"(\b[A-Za-z_$][\w$]*(?:\.[\w$]+)+\([^()]*\);|\bconst [\w$]+ = [^;]+;|\bif \([^)]+\) \{|\breturn [\w$.]+\([^)]*\);|\)\.(?:forEach|push|sort|map|filter)\(.*\);|\b[\w$]+\([^)]*=>)")  # R2.31: 괄호가 든 호출 · 화살표 함수도 (도움말 티어표의 .forEach(id => …) 가 묻혀 티어표가 비어 있었다)
for i, l in enumerate(L):
    for m in re.finditer(r'(?<![:"\'])//', l):  # http:// 같은 주소는 뺀다
        tail = l[m.start():]
        if (re.search(r'\b[a-zA-Z_$][\w$]*: [^,]{1,80}, [a-zA-Z_$][\w$]*: ', tail) and ('=>' in tail or '?' in tail)) or CODE.search(tail):
            print(f'{i + 1}: {tail[:140]}'); bad += 1
        break
print('의심 0줄 · 통과' if not bad else f'의심 {bad}줄 — 주석을 /* … */ 로 바꾸거나 줄을 나누세요')
sys.exit(1 if bad else 0)
