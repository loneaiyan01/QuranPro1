import requests
import sys

try:
    response = requests.get('https://api.alquran.cloud/v1/edition?format=audio&language=ar')
    if response.status_code != 200:
        print(f"Status: {response.status_code}")
        print(response.text[:100])
        sys.exit(1)
        
    data = response.json()
    
    for reciter in data['data']:
         if 'yasser' in reciter['identifier'] or 'dossari' in reciter['identifier']:
             print(f"YASSER: {reciter['identifier']} - Type: {reciter['type']}")
         if 'luhaidan' in reciter['identifier']:
             print(f"LUHAIDAN: {reciter['identifier']} - Type: {reciter['type']}")

except Exception as e:
    print(f"Error: {e}")
