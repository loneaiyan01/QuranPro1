import requests

def check(url):
    try:
        r = requests.head(url)
        print(f"[{r.status_code}] {url}")
    except:
        print(f"[ERR] {url}")

print("Checking MP3Quran...")
check("https://server11.mp3quran.net/yasser/001.mp3")
check("https://server11.mp3quran.net/lhdan/001.mp3")
