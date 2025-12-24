import requests

def check(url):
    try:
        r = requests.head(url)
        print(f"[{r.status_code}] {url}")
    except:
        print(f"[ERR] {url}")

servers = range(1, 15)
for i in servers:
    url = f"https://server{i}.mp3quran.net/lhdan/001.mp3"
    check(url)
