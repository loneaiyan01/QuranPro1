import requests

base_urls = [
    "https://server6.mp3quran.net",
    "https://server8.mp3quran.net",
    "https://server9.mp3quran.net",
    "https://server10.mp3quran.net",
    "https://server11.mp3quran.net",
    "https://server12.mp3quran.net",
    "https://download.quranicaudio.com/quran"
]

slugs = [
    "lhdan", 
    "luhdan", 
    "al_luhaidan", 
    "muhammad_al_luhaidan", 
    "moh_alahidan"
]

for base in base_urls:
    for slug in slugs:
        url = f"{base}/{slug}/001.mp3"
        try:
            r = requests.head(url, timeout=2)
            if r.status_code == 200:
                print(f"FOUND: {url}")
                break
        except:
            pass
