import httpx
import random


def run():
    # 1. Register a user
    email = f"user_payment_{random.randint(1000, 9999)}@example.com"
    password = "password123"

    print(f"1. Registering user: {email} ...")
    try:
        r_reg = httpx.post("http://localhost:8000/api/v1/auth/register", json={
            "email": email,
            "password": password,
            "full_name": "Payment Tester"
        })
        assert r_reg.status_code == 201, f"Reg failed: {r_reg.text}"
        print("Registration Succeeded!")

        # 2. Login
        print("2. Logging in...")
        r_login = httpx.post("http://localhost:8000/api/v1/auth/token", json={
            "email": email,
            "password": password
        })
        assert r_login.status_code == 200, f"Login failed: {r_login.text}"
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
        print(f"Selected: '{product['name']}' (${product['price']})")

        r_add = httpx.post("http://localhost:8000/api/v1/cart/items", headers=headers, json={
            "product_id": product["id"],
            "quantity": 1
        })
        assert r_add.status_code == 201, f"Add to cart failed: {r_add.text}"
        print("Product added to cart!")

        # 4. Create order
        print("4. Creating order...")
        r_order = httpx.post("http://localhost:8000/api/v1/orders/", headers=headers, json={
            "shipping_address": "123 Payment Test Blvd, San Francisco, CA 94107"
        })
        assert r_order.status_code == 201, f"Order creation failed: {r_order.text}"
        order = r_order.json()
        order_id = order["id"]
        print(f"Order created! ID: {order_id}, Total: ${order['total_amount']}")

        # 5. Create payment intent
        print("5. Creating payment intent...")
        r_intent = httpx.post("http://localhost:8000/api/v1/payments/create-intent", headers=headers, json={
            "order_id": order_id
        })
        print(f"Payment intent response status: {r_intent.status_code}")
        print(f"Payment intent response: {r_intent.text}")

        if r_intent.status_code == 201:
            intent_data = r_intent.json()
            assert "client_secret" in intent_data, "No client_secret in response"
            assert "payment_id" in intent_data, "No payment_id in response"
            assert intent_data["amount"] == order["total_amount"], f"Amount mismatch: {intent_data['amount']} != {order['total_amount']}"
            assert intent_data["currency"] == "USD", f"Currency mismatch: {intent_data['currency']}"
            print(f"Payment Intent created! Payment ID: {intent_data['payment_id']}")
            print(f"Client Secret: {intent_data['client_secret'][:20]}...")

            # 6. Verify payment status
            print("6. Checking payment status...")
            r_status = httpx.get(f"http://localhost:8000/api/v1/payments/{order_id}/status", headers=headers)
            assert r_status.status_code == 200, f"Payment status failed: {r_status.text}"
            status_data = r_status.json()
            assert status_data["status"] == "pending", f"Expected 'pending', got: {status_data['status']}"
            assert status_data["provider"] == "stripe", f"Expected 'stripe', got: {status_data['provider']}"
            print(f"Payment status: {status_data['status']} (provider: {status_data['provider']})")

            # 7. Verify order status is updated to pending_payment
            print("7. Verifying order status is pending_payment...")
            r_order_check = httpx.get(f"http://localhost:8000/api/v1/orders/{order_id}", headers=headers)
            assert r_order_check.status_code == 200
            order_check = r_order_check.json()
            assert order_check["status"] == "pending_payment", f"Expected 'pending_payment', got: {order_check['status']}"
            assert order_check["payment_status"] == "pending", f"Expected payment_status 'pending', got: {order_check['payment_status']}"
            print(f"Order status: {order_check['status']}, Payment status: {order_check['payment_status']}")

            # 8. Verify duplicate intent reuses existing
            print("8. Verifying duplicate payment intent reuses existing...")
            r_intent2 = httpx.post("http://localhost:8000/api/v1/payments/create-intent", headers=headers, json={
                "order_id": order_id
            })
            assert r_intent2.status_code == 201, f"Duplicate intent failed: {r_intent2.text}"
            intent_data2 = r_intent2.json()
            assert intent_data2["payment_id"] == intent_data["payment_id"], "Should reuse existing payment"
            print("Duplicate intent correctly reuses existing payment!")

            print("\nALL PAYMENT TESTS PASSED SUCCESSFULLY!")
        elif r_intent.status_code == 400:
            detail = r_intent.json().get("detail", "")
            if "temporarily unavailable" in detail.lower() or "stripe" in detail.lower():
                print(f"\nSTRIPE NOT CONFIGURED (expected in dev without keys): {detail}")
                print("Payment endpoint exists and validates correctly.")
                print("Set STRIPE_SECRET_KEY to enable full payment flow.")

                # Verify the endpoint still validates properly
                # Test with invalid order_id
                print("\n--- Validation Tests ---")
                import uuid
                fake_id = str(uuid.uuid4())
                r_bad = httpx.post("http://localhost:8000/api/v1/payments/create-intent", headers=headers, json={
                    "order_id": fake_id
                })
                assert r_bad.status_code == 404, f"Expected 404 for fake order, got: {r_bad.status_code}"
                print("[OK] Invalid order_id correctly returns 404")

                # Test without auth
                r_noauth = httpx.post("http://localhost:8000/api/v1/payments/create-intent", json={
                    "order_id": order_id
                })
                assert r_noauth.status_code in (401, 403), f"Expected 401/403 without auth, got: {r_noauth.status_code}"
                print("[OK] Unauthenticated request correctly rejected")

                print("\nALL VALIDATION TESTS PASSED! (Full payment flow requires Stripe keys)")
            else:
                print(f"\nUNEXPECTED 400 ERROR: {detail}")
        else:
            print(f"\nUNEXPECTED STATUS CODE: {r_intent.status_code}")

    except Exception as e:
        print("\nTEST FAILED:", e)
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    run()
