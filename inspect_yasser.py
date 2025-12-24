import requests
import json

try:
    # Fetch Surah 1 from Yasser Al-Dosari
    response = requests.get('https://api.alquran.cloud/v1/surah/1/ar.yasseraldossari')
    print(f"Status: {response.status_code}")
    data = response.json()
    
    # Save validation for inspection
    with open('yasser_response.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print("Saved yasser_response.json")
    
    # Quick peep
    if 'data' in data:
        print(f"Keys in data: {data['data'].keys()}")
        if 'ayahs' in data['data']:
            print(f"First ayah keys: {data['data']['ayahs'][0].keys()}")
            print(f"First ayah audio: {data['data']['ayahs'][0].get('audio')}")
            print(f"First ayah audioSecondary: {data['data']['ayahs'][0].get('audioSecondary')}")
            
except Exception as e:
    print(f"Error: {e}")
