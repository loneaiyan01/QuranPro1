import requests

urls = [
    "https://download.quranicaudio.com/quran/yasser_ad-dussary/001.mp3",
    "https://server11.mp3quran.net/yasser/001.mp3",
    "https://download.quranicaudio.com/quran/muhammad_al_luhaidan/001.mp3"
]

for url in urls:
    try:
        r = requests.head(url)
        print(f"{url}: {r.status_code}")
    except Exception as e:
        print(f"{url}: Error {e}")
