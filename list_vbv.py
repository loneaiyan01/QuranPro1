import requests

try:
    response = requests.get('https://api.alquran.cloud/v1/edition?format=audio&type=versebyverse')
    data = response.json()
    for r in data['data']:
        print(f"{r['identifier']} : {r['englishName']}")
except:
    pass
