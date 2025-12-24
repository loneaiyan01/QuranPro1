import requests

try:
    # Try to fetch Surah 1 from Yasser Al-Dosari
    response = requests.get('https://api.alquran.cloud/v1/surah/1/ar.yasseraldossari')
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        if 'data' in data and 'ayahs' in data['data']:
            ayahs = data['data']['ayahs']
            print(f"Ayahs found: {len(ayahs)}")
            if len(ayahs) > 0:
                print(f"Sample Audio: {ayahs[0].get('audio')}")
        else:
            print("Structure invalid")
    else:
        print("Not main success")
        
except Exception as e:
    print(f"Error: {e}")
