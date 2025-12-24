import requests

try:
    response = requests.get('https://api.alquran.cloud/v1/edition?format=audio&language=ar')
    data = response.json()
    
    for reciter in data['data']:
         if reciter['identifier'] == 'ar.yasseraldossari':
             print(f"YASSER: {reciter}")
         if reciter['identifier'] == 'ar.muhammadalluhaidan':
             print(f"LUHAIDAN: {reciter}")
except Exception as e:
    print(e)
