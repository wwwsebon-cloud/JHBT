"""인포그래픽 HTML → PNG (헤드리스 크롬으로 길게 찍은 뒤 아래쪽 남는 부분을 잘라낸다).

사용법:  python infographics/shot.py infographics/R2.0.html
"""
import os
import subprocess
import sys

from PIL import Image

CHROME = os.environ.get('CHROME') or (r'C:\Program Files\Google\Chrome\Application\chrome.exe' if os.name == 'nt' else '/opt/pw-browsers/chromium/chrome-linux/chrome')


def main():
    src = os.path.abspath(sys.argv[1])
    png = os.path.splitext(src)[0] + '.png'
    url = 'file:///' + src.replace('\\', '/')
    subprocess.run([CHROME, "--no-sandbox", '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                    '--window-size=1080,5000', '--virtual-time-budget=8000', '--screenshot=' + png, url], capture_output=True)
    im = Image.open(png).convert('RGB')
    w, h = im.size
    px = im.load()
    bg = px[w - 1, h - 1]
    bottom = h
    for y in range(h - 1, 0, -1):
        if any(px[x, y] != bg for x in range(0, w, 3)):
            bottom = y + 1
            break
    im.crop((0, 0, w, bottom)).save(png)
    print(png, w, bottom)


if __name__ == '__main__':
    main()
