"""인포그래픽 HTML → PNG (헤드리스 크롬으로 길게 찍은 뒤 아래쪽 빈 배경을 잘라낸다).

사용법:  python infographics/shot.py infographics/7.7.6.html   (미리보기 서버 localhost:8765 가 떠 있어야 한다)
"""
import os
import subprocess
import sys

from PIL import Image

CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    rel = sys.argv[1].replace('\\', '/')
    png = os.path.join(ROOT, os.path.splitext(rel)[0] + '.png')
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                    '--window-size=1080,6000', '--virtual-time-budget=8000', '--screenshot=' + png,
                    'http://localhost:8765/' + rel], capture_output=True)
    im = Image.open(png).convert('RGB')
    w, h = im.size
    bg = im.getpixel((w - 1, h - 1))
    px = im.load()
    bottom = h
    for y in range(h - 1, 0, -1):
        if any(px[x, y] != bg for x in range(0, w, 3)):
            bottom = y + 1
            break
    im.crop((0, 0, w, bottom)).save(png)
    print(png, im.size[0], bottom)


if __name__ == '__main__':
    main()
