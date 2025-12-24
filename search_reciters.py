import requests

try:
    # Check all audio reciters, not just versebyverse
    response = requests.get('https://api.alquran.cloud/v1/edition?format=audio')
    data = response.json()
    
    targets = ['yasser', 'dossari', 'luhaidan', 'muhammad']
    
    if 'data' in data:
        print("Found matching reciters:")
        for reciter in data['data']:
            name_lower = reciter['englishName'].lower().replace('-', '')
            id_lower = reciter['identifier'].lower()
            
            if any(t in name_lower for t in targets) or any(t in id_lower for t in targets):
                print(f"ID: {reciter['identifier']}, Name: {reciter['englishName']}, Type: {reciter['type']}")
    else:
        print("No data found")
except Exception as e:
    print(f"Error: {e}")
