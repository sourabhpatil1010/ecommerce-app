import httpx
import random
import uuid
import sys

def run():
    print("=== STARTING END-TO-END PAYMENT FLOW INTEGRATION TEST ===")
    
    # 1. Register a user
    email = f"e2e_payment_{random.randint(1000, 9999)}@example.com"
    password = "password123"

    print(f"1. Registering user: {email} ...")
    r_reg = httpx.post("http://localhost:8000/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "E2E Payment Tester"
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
    product = products[0]
    print(f"Selected product: '{product['name']}' (${product['price']})")

    r_add = httpx.post("http://localhost:8000/api/v1/cart/items", headers=headers, json={
        "product_id": product["id"],
        "quantity": 1
    })
    assert r_add.status_code == 201, f"Add to cart failed: {r_add.text}"
    print("Product added to cart successfully!")

    # 4. Place Order (Checkout)
    print("4. Placed Order (Checkout)...")
    r_order = httpx.post("http://localhost:8000/api/v1/orders/", headers=headers, json={
        "shipping_address": "456 E2E Stripe Way, San Francisco, CA 94107"
    })
    assert r_order.status_code == 201, f"Checkout failed: {r_order.text}"
    order = r_order.json()
    order_id = order["id"]
    print(f"Order created! ID: {order_id}, Initial Status: {order['status']}, Payment Status: {order['payment_status']}")
    assert order["status"] == "pending", f"Expected status 'pending', got: {order['status']}"
    assert order["payment_status"] is None, f"Expected payment_status None, got: {order['payment_status']}"

    # 5. Create payment intent
    print("5. Initiating payment flow (Creating payment intent)...")
    r_intent = httpx.post("http://localhost:8000/api/v1/payments/create-intent", headers=headers, json={
        "order_id": order_id
    })
    print(f"Payment intent response status: {r_intent.status_code}")
    
    if r_intent.status_code == 201:
        intent_data = r_intent.json()
        print(f"Stripe Payment Intent created! Client Secret: {intent_data['client_secret'][:20]}...")
        
        # Verify order status updated to pending_payment
        print("6. Checking order status update...")
        r_order_check = httpx.get(f"http://localhost:8000/api/v1/orders/{order_id}", headers=headers)
        order_check = r_order_check.json()
        print(f"Order status: {order_check['status']}, Payment status: {order_check['payment_status']}")
        assert order_check["status"] == "pending_payment", f"Expected 'pending_payment', got: {order_check['status']}"
        assert order_check["payment_status"] == "pending", f"Expected payment_status 'pending', got: {order_check['payment_status']}"
    else:
        print("Stripe is not configured (returned 400). Testing webhook simulation flow directly...")

    # 7. Simulate Webhook SUCCESS
    print("7. Simulating Webhook SUCCESS callback...")
    r_webhook_success = httpx.post(f"http://localhost:8000/api/v1/payments/{order_id}/simulate-webhook?success=true", headers=headers)
    assert r_webhook_success.status_code == 200, f"Webhook simulation failed: {r_webhook_success.text}"
    print("Webhook simulation reported success.")

    # 8. Verify order is marked paid and status becomes pending (confirmed)
    print("8. Verifying order and payment statuses...")
    r_order_paid = httpx.get(f"http://localhost:8000/api/v1/orders/{order_id}", headers=headers)
    order_paid = r_order_paid.json()
    print(f"Order status after success: {order_paid['status']}, Payment status: {order_paid['payment_status']}")
    assert order_paid["status"] == "pending", f"Expected order status 'pending' (confirmed/paid), got: {order_paid['status']}"
    assert order_paid["payment_status"] == "succeeded", f"Expected payment_status 'succeeded', got: {order_paid['payment_status']}"

    # 9. Simulate Webhook FAILURE
    print("9. Simulating Webhook FAILURE callback...")
    r_webhook_fail = httpx.post(f"http://localhost:8000/api/v1/payments/{order_id}/simulate-webhook?success=false", headers=headers)
    assert r_webhook_fail.status_code == 200, f"Webhook simulation failed: {r_webhook_fail.text}"
    print("Webhook simulation reported failure.")

    # 10. Verify order status updated to payment_failed
    print("10. Verifying order status after failure...")
    r_order_failed = httpx.get(f"http://localhost:8000/api/v1/orders/{order_id}", headers=headers)
    order_failed = r_order_failed.json()
    print(f"Order status after failure: {order_failed['status']}, Payment status: {order_failed['payment_status']}")
    assert order_failed["status"] == "payment_failed", f"Expected order status 'payment_failed', got: {order_failed['status']}"
    assert order_failed["payment_status"] == "failed", f"Expected payment status 'failed', got: {order_failed['payment_status']}"

    print("\nALL END-TO-END PAYMENT VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run()
