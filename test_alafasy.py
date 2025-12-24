import requests

try:
    response = requests.get('https://api.alquran.cloud/v1/surah/1/ar.alafasy')
    data = response.json()
    print(f"Alafasy Audio: {data['data']['ayahs'][0].get('audio')}")
except:
    pass
