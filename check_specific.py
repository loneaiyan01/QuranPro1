import requests

try:
    response = requests.get('https://api.alquran.cloud/v1/edition?format=audio&type=versebyverse')
    data = response.json()
    
    if 'data' in data:
        print(f"Total versebyverse reciters: {len(data['data'])}")
        found = False
        for reciter in data['data']:
            if 'yasser' in reciter['identifier'] or 'dossari' in reciter['identifier']:
                print(f"FOUND YASSER: {reciter['identifier']}")
                found = True
            if 'luhaidan' in reciter['identifier']:
                print(f"FOUND LUHAIDAN: {reciter['identifier']}")
                found = True
        
        if not found:
             print("Did not find Yasser or Luhaidan in versebyverse list.")
             
        # Print first 5 just to check
        print("First 5 reciters:")
        for r in data['data'][:5]:
            print(r['identifier'])

except Exception as e:
    print(f"Error: {e}")
