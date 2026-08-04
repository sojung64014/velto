import urllib.request
import json
from datetime import datetime

# Fetch from Firestore REST API
url = "https://firestore.googleapis.com/v1/projects/velto-58801/databases/(default)/documents/applications?pageSize=100"

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        documents = data.get('documents', [])
        
        parsed_apps = []
        for doc in documents:
            fields = doc.get('fields', {})
            
            # Helper to extract value
            def get_val(field_name):
                field_data = fields.get(field_name, {})
                for t in ['stringValue', 'integerValue', 'doubleValue', 'booleanValue']:
                    if t in field_data:
                        return field_data[t]
                # Check for arrayValue
                if 'arrayValue' in field_data:
                    values = field_data['arrayValue'].get('values', [])
                    return [v.get('stringValue', '') for v in values]
                return None

            name = get_val('name') or get_val('company') or 'N/A'
            submitted_at = get_val('submittedAt') or 'N/A'
            source = get_val('source') or 'N/A'
            email = get_val('email') or 'N/A'
            phone = get_val('phone') or 'N/A'
            track = get_val('track') or 'N/A'
            status = get_val('status') or 'N/A'
            meds = get_val('meds') or 'N/A'
            dates = get_val('dates') or []
            referral = get_val('referral') or 'N/A'
            
            parsed_apps.append({
                'name': name,
                'submitted_at': submitted_at,
                'source': source,
                'email': email,
                'phone': phone,
                'track': track,
                'status': status,
                'meds': meds,
                'dates': dates,
                'referral': referral
            })
            
        # Sort by submitted_at (descending)
        # Parse ISO date string for sorting
        def parse_date(date_str):
            try:
                # Handle trailing Z or timezone offsets
                return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            except:
                return datetime.min
                
        parsed_apps.sort(key=lambda x: parse_date(x['submitted_at']), reverse=True)
        
        print(f"--- TOTAL APPLICATIONS COUNT: {len(parsed_apps)} ---")
        for i, app in enumerate(parsed_apps):
            print(f"\n[{i+1}] Submitted At: {app['submitted_at']}")
            print(f"    Name: {app['name']}")
            print(f"    Source: {app['source']}")
            print(f"    Contact: Email({app['email']}), Phone({app['phone']})")
            if app['track'] != 'N/A':
                print(f"    Track: {app['track']}")
                print(f"    Dates: {app['dates']}")
                print(f"    Status: {app['status']}, Meds: {app['meds']}, Referral: {app['referral']}")
            
except Exception as e:
    import traceback
    print(f"Error reading Firestore: {e}")
    traceback.print_exc()
