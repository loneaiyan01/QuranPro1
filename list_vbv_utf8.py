import requests

try:
    response = requests.get('https://api.alquran.cloud/v1/edition?format=audio&type=versebyverse')
    data = response.json()
    with open('vbv_list_utf8.txt', 'w', encoding='utf-8') as f:
        for r in data['data']:
            f.write(f"{r['identifier']} : {r['englishName']}\n")
except Exception as e:
    print(e)
