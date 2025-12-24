import requests
import json

try:
    response = requests.get('https://api.alquran.cloud/v1/edition?format=audio&type=versebyverse')
    data = response.json()
    
    if 'data' in data:
        print("Available reciters:")
        for reciter in data['data']:
            if reciter['language'] == 'ar':
                print(f"ID: {reciter['identifier']}, Name: {reciter['englishName']}")
    else:
        print("No data found")
except Exception as e:
    print(f"Error: {e}")
