import requests

def check(url):
    try:
        r = requests.head(url)
        print(f"[{r.status_code}] {url}")
    except:
        print(f"[ERR] {url}")

check("https://download.quranicaudio.com/quran/yasser_ad-dussary/001.mp3")
check("https://download.quranicaudio.com/quran/muhammad_al_luhaidan/001.mp3") # Likely wrong
check("https://download.quranicaudio.com/quran/m_jibreel/001.mp3") 
