import urllib.request
import json

url = 'http://localhost:8000/api/v1/auth/token'
data = json.dumps({'email': 'admin@example.com', 'password': 'AdminSecurePassword123!'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        token_data = json.loads(response.read().decode())
        token = token_data['access_token']
        print('Login successful for admin@example.com')
        
        req2 = urllib.request.Request('http://localhost:8000/api/v1/auth/me', headers={'Authorization': 'Bearer ' + token})
        with urllib.request.urlopen(req2) as resp2:
            me_data = json.loads(resp2.read().decode())
            print('Admin user fetched:', me_data.get('email'))
            
        req3 = urllib.request.Request('http://localhost:8000/api/v1/products/')
        with urllib.request.urlopen(req3) as resp3:
            prod_data = json.loads(resp3.read().decode())
            items = prod_data.get('items', [])
            print('Products found:', len(items))
            
        req4 = urllib.request.Request('http://localhost:8000/api/v1/orders/all', headers={'Authorization': 'Bearer ' + token})
        with urllib.request.urlopen(req4) as resp4:
            order_data = json.loads(resp4.read().decode())
            print('Orders found:', len(order_data))
            
except Exception as e:
    print('Test failed:', e)
    if hasattr(e, 'read'):
        print(e.read().decode())
