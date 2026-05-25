import httpx
import random
import uuid
import sys
import os
import hmac
import hashlib
import json

def run():
    print("=== STARTING END-TO-END RAZORPAY REAL INTEGRATION TEST ===")
    
    # Load Razorpay secrets from backend/.env or root .env
    razorpay_key_secret = ""
    razorpay_webhook_secret = ""
    
    # Try reading from current directory .env first
    env_paths = [".env", "../.env"]
    for env_path in env_paths:
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                for line in f:
                    if line.startswith("RAZORPAY_KEY_SECRET="):
                        razorpay_key_secret = line.split("=", 1)[1].strip()
                    elif line.startswith("RAZORPAY_WEBHOOK_SECRET="):
                        razorpay_webhook_secret = line.split("=", 1)[1].strip()
            if razorpay_key_secret:
                break

    if not razorpay_key_secret:
        print("Error: RAZORPAY_KEY_SECRET not found in configuration files!")
        sys.exit(1)

    print(f"Loaded credentials. Webhook secret: '{razorpay_webhook_secret}'")

    # 1. Register a user
    email = f"razorpay_real_tester_{random.randint(1000, 9999)}@example.com"
    password = "password123"

    print(f"1. Registering user: {email} ...")
    r_reg = httpx.post("http://localhost:8000/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Razorpay Real Tester"
    })
    if r_reg.status_code != 201:
        print(f"Registration failed: {r_reg.text}")
        sys.exit(1)
    print("Registration Succeeded!")

    # 2. Login
    print("2. Logging in...")
    r_login = httpx.post("http://localhost:8000/api/v1/auth/token", json={
        "email": email,
        "password": password
    })
    if r_login.status_code != 200:
        print(f"Login failed: {r_login.text}")
        sys.exit(1)
    token = r_login.json()["access_token"]
    print("Login Succeeded! Token acquired.")

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Add product to cart
    print("3. Fetching product catalog and adding to cart...")
    r_prod = httpx.get("http://localhost:8000/api/v1/products/")
    assert r_prod.status_code == 200
    products = r_prod.json()["items"]
    assert len(products) > 0, "No products available in DB!"
    
    # Filter products that have stock >= 5
    available_products = [p for p in products if p.get("stock", 0) >= 5]
    if not available_products:
        print("WARNING: No products with stock >= 5 available. Using first product in catalog.")
        product = products[0]
    else:
        product = available_products[0]
        
    print(f"Selected product: '{product['name']}' (${product['price']}) (stock left: {product.get('stock')})")

    r_add = httpx.post("http://localhost:8000/api/v1/cart/items", headers=headers, json={
        "product_id": product["id"],
        "quantity": 1
    })
    assert r_add.status_code == 201, f"Add to cart failed: {r_add.text}"
    print("Product added to cart successfully!")

    # 4. Place Order (Checkout)
    print("4. Placed Order (Checkout)...")
    r_order = httpx.post("http://localhost:8000/api/v1/orders/", headers=headers, json={
        "shipping_address": "789 UPI Lane, Bangalore, KA 560001"
    })
    assert r_order.status_code == 201, f"Checkout failed: {r_order.text}"
    order = r_order.json()
    order_id = order["id"]
    print(f"Order created! ID: {order_id}, Initial Status: {order['status']}, Payment Status: {order['payment_status']}")
    assert order["status"] == "pending", f"Expected status 'pending', got: {order['status']}"
    assert order["payment_status"] is None, f"Expected payment_status None, got: {order['payment_status']}"

    # 5. Create Razorpay Payment Order
    print("5. Initiating Razorpay flow (Creating Razorpay order)...")
    r_rzp_order = httpx.post("http://localhost:8000/api/v1/payments/razorpay/create-order", headers=headers, json={
        "order_id": order_id
    })
    assert r_rzp_order.status_code == 201, f"Razorpay order creation failed: {r_rzp_order.text}"
    rzp_data = r_rzp_order.json()
    print(f"Razorpay Order response: {rzp_data}")
    assert "razorpay_order_id" in rzp_data, "No razorpay_order_id in response"
    assert "payment_id" in rzp_data, "No payment_id in response"
    assert rzp_data["currency"] == "INR", f"Expected currency INR, got: {rzp_data['currency']}"
    
    # 80x conversion verification
    expected_amount = int(round(order["total_amount"] * 80.0 * 100))
    assert rzp_data["amount"] == expected_amount, f"Expected amount {expected_amount}, got {rzp_data['amount']}"

    # 6. Verify payment record status in DB
    print("6. Verifying local Payment record status is pending and in INR...")
    r_pay_status = httpx.get(f"http://localhost:8000/api/v1/payments/{order_id}/status", headers=headers)
    assert r_pay_status.status_code == 200, f"Get payment status failed: {r_pay_status.text}"
    pay_data = r_pay_status.json()
    print(f"Payment record status: {pay_data['status']}, Currency: {pay_data['currency']}, Amount: {pay_data['amount']}")
    assert pay_data["status"] == "pending", f"Expected pending, got: {pay_data['status']}"
    assert pay_data["currency"] == "INR", f"Expected INR, got: {pay_data['currency']}"
    assert float(pay_data["amount"]) == float(order["total_amount"] * 80.0), "Amount mismatch"

    # Verify order is updated to pending_payment
    r_order_check = httpx.get(f"http://localhost:8000/api/v1/orders/{order_id}", headers=headers)
    assert r_order_check.json()["status"] == "pending_payment", "Order status should be pending_payment"

    # 7. Simulate Webhook success using a valid webhook signature
    print("7. Simulating webhook success callback...")
    rzp_order_id = rzp_data["razorpay_order_id"]
    webhook_payload = {
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_test_success_999",
                    "order_id": rzp_order_id,
                    "amount": expected_amount,
                    "currency": "INR"
                }
            }
        }
    }
    payload_str = json.dumps(webhook_payload, separators=(',', ':'))
    # Calculate webhook signature
    webhook_sig = hmac.new(
        razorpay_webhook_secret.encode("utf-8"),
        payload_str.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    
    r_webhook_success = httpx.post(
        "http://localhost:8000/api/v1/payments/razorpay/webhook",
        content=payload_str,
        headers={"X-Razorpay-Signature": webhook_sig, "Content-Type": "application/json"}
    )
    assert r_webhook_success.status_code == 200, f"Webhook failed: {r_webhook_success.text}"
    
    r_order_paid = httpx.get(f"http://localhost:8000/api/v1/orders/{order_id}", headers=headers)
    order_paid = r_order_paid.json()
    print(f"Order status after success: {order_paid['status']}, Payment status: {order_paid['payment_status']}")
    assert order_paid["status"] == "pending", f"Expected order status 'pending', got: {order_paid['status']}"
    assert order_paid["payment_status"] == "succeeded", f"Expected payment_status 'succeeded', got: {order_paid['payment_status']}"

    # 8. Simulate Webhook failure using a valid webhook signature
    print("8. Simulating webhook failure callback...")
    webhook_payload_fail = {
        "event": "payment.failed",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_test_fail_999",
                    "order_id": rzp_order_id,
                    "amount": expected_amount,
                    "currency": "INR"
                }
            }
        }
    }
    payload_fail_str = json.dumps(webhook_payload_fail, separators=(',', ':'))
    # Calculate webhook signature
    webhook_fail_sig = hmac.new(
        razorpay_webhook_secret.encode("utf-8"),
        payload_fail_str.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    
    r_webhook_fail = httpx.post(
        "http://localhost:8000/api/v1/payments/razorpay/webhook",
        content=payload_fail_str,
        headers={"X-Razorpay-Signature": webhook_fail_sig, "Content-Type": "application/json"}
    )
    assert r_webhook_fail.status_code == 200, f"Webhook failed: {r_webhook_fail.text}"
    
    r_order_failed = httpx.get(f"http://localhost:8000/api/v1/orders/{order_id}", headers=headers)
    order_failed = r_order_failed.json()
    print(f"Order status after failure: {order_failed['status']}, Payment status: {order_failed['payment_status']}")
    assert order_failed["status"] == "payment_failed", f"Expected order status 'payment_failed', got: {order_failed['status']}"
    assert order_failed["payment_status"] == "failed", f"Expected payment_status 'failed', got: {order_failed['payment_status']}"

    # 9. Test direct verify endpoint with valid payment signature
    print("9. Testing direct signature verification endpoint...")
    # Add another product to cart for a new order
    httpx.post("http://localhost:8000/api/v1/cart/items", headers=headers, json={
        "product_id": product["id"],
        "quantity": 1
    })
    r_order2 = httpx.post("http://localhost:8000/api/v1/orders/", headers=headers, json={
        "shipping_address": "456 Verify Rd, Mumbai, MH 400001"
    })
    order2_id = r_order2.json()["id"]
    
    # Initiate Razorpay payment
    r_rzp_order2 = httpx.post("http://localhost:8000/api/v1/payments/razorpay/create-order", headers=headers, json={
        "order_id": order2_id
    })
    rzp_order2_id = r_rzp_order2.json()["razorpay_order_id"]
    
    # Calculate valid payment signature
    pay_id = "pay_test_verify_888"
    msg = f"{rzp_order2_id}|{pay_id}"
    pay_signature = hmac.new(
        razorpay_key_secret.encode("utf-8"),
        msg.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    
    r_verify = httpx.post("http://localhost:8000/api/v1/payments/razorpay/verify", headers=headers, json={
        "razorpay_payment_id": pay_id,
        "razorpay_order_id": rzp_order2_id,
        "razorpay_signature": pay_signature
    })
    assert r_verify.status_code == 200, f"Verify endpoint failed: {r_verify.text}"
    print("Verify endpoint succeeded!")
    
    # Check order is marked as paid
    r_order2_check = httpx.get(f"http://localhost:8000/api/v1/orders/{order2_id}", headers=headers)
    order2_check = r_order2_check.json()
    assert order2_check["status"] == "pending", f"Expected pending order status, got: {order2_check['status']}"
    assert order2_check["payment_status"] == "succeeded", f"Expected succeeded payment status, got: {order2_check['payment_status']}"
    print("Direct signature verification correctly updated order status to Paid!")

    # 10. Test direct fail endpoint
    print("10. Testing direct payment failure endpoint...")
    r_add3 = httpx.post("http://localhost:8000/api/v1/cart/items", headers=headers, json={
        "product_id": product["id"],
        "quantity": 1
    })
    print(f"Cart add status: {r_add3.status_code}, body: {r_add3.text}")
    r_order3 = httpx.post("http://localhost:8000/api/v1/orders/", headers=headers, json={
        "shipping_address": "111 Fail Dr, Delhi, DL 110001"
    })
    print(f"Order create status: {r_order3.status_code}, body: {r_order3.text}")
    order3_id = r_order3.json()["id"]
    r_rzp_order3 = httpx.post("http://localhost:8000/api/v1/payments/razorpay/create-order", headers=headers, json={
        "order_id": order3_id
    })
    rzp_order3_id = r_rzp_order3.json()["razorpay_order_id"]
    
    r_fail = httpx.post("http://localhost:8000/api/v1/payments/razorpay/fail", headers=headers, json={
        "razorpay_order_id": rzp_order3_id,
        "error_code": "BAD_CREDENTIALS",
        "error_description": "Mocked bank cancellation"
    })
    assert r_fail.status_code == 200
    
    r_order3_check = httpx.get(f"http://localhost:8000/api/v1/orders/{order3_id}", headers=headers)
    order3_check = r_order3_check.json()
    assert order3_check["status"] == "payment_failed"
    assert order3_check["payment_status"] == "failed"
    print("Direct failure endpoint correctly updated order status to Failed!")

    print("\nALL REAL RAZORPAY INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run()
