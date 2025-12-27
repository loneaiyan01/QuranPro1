import requests

urls = [
    "https://server6.mp3quran.net/lhdan/001.mp3",
    "https://server8.mp3quran.net/lhdan/001.mp3",
    "https://server12.mp3quran.net/lhdan/001.mp3",
    "https://download.quranicaudio.com/quran/muhammad_al_luhaidan/001.mp3",
    "https://mirrors.mp3quran.net/lhdan/001.mp3" 
]

for url in urls:
    try:
        r = requests.head(url, timeout=5)
        print(f"{url}: {r.status_code}")
    except Exception as e:
        print(f"{url}: Error {e}")
