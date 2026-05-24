import httpx
import random

def run():
    # 1. Generate random user credentials
    email = f"user_checkout_{random.randint(1000, 9999)}@example.com"
    password = "password123"
    
    print(f"1. Registering user: {email} ...")
    try:
        r_reg = httpx.post("http://localhost:8000/api/v1/auth/register", json={
            "email": email,
            "password": password,
            "full_name": "Checkout Tester"
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
        
        # 3. Get products to select one
        print("3. Fetching product catalog...")
        r_prod = httpx.get("http://localhost:8000/api/v1/products/")
        assert r_prod.status_code == 200, f"Catalog failed: {r_prod.text}"
        products = r_prod.json()["items"]
        assert len(products) > 0, "No products available in DB!"
        
        selected_product = products[0]
        product_id = selected_product["id"]
        initial_stock = selected_product["stock"]
        print(f"Selected Product: '{selected_product['name']}' (ID: {product_id}, Stock: {initial_stock}, Price: ${selected_product['price']})")
        
        # 4. Add product to cart
        print("4. Adding product to cart...")
        r_add = httpx.post("http://localhost:8000/api/v1/cart/items", headers=headers, json={
            "product_id": product_id,
            "quantity": 2
        })
        assert r_add.status_code == 201, f"Add to cart failed: {r_add.text}"
        print("Product added to cart!")
        
        # 5. Place order (Checkout)
        print("5. Placed Order (Checkout)...")
        r_checkout = httpx.post("http://localhost:8000/api/v1/orders/", headers=headers, json={
            "shipping_address": "123 Test Boulevard, Suite 5, San Francisco, CA 94107"
        })
        print("Checkout Response Status:", r_checkout.status_code)
        print("Checkout Response Text:", r_checkout.text)
        assert r_checkout.status_code == 201, f"Checkout failed: {r_checkout.text}"
        order = r_checkout.json()
        order_id = order["id"]
        print(f"Order created successfully! Order ID: {order_id}, Status: {order['status']}, Total Amount: ${order['total_amount']}")
        
        # 6. Verify cart is cleared
        print("6. Verifying cart is cleared...")
        r_cart = httpx.get("http://localhost:8000/api/v1/cart/", headers=headers)
        assert r_cart.status_code == 200
        cart_data = r_cart.json()
        assert len(cart_data["items"]) == 0, f"Cart is not empty: {cart_data['items']}"
        print("Cart is verified empty!")
        
        # 6b. Verify empty cart checkout fails
        print("6b. Verifying checkout with empty cart fails...")
        r_checkout_empty = httpx.post("http://localhost:8000/api/v1/orders/", headers=headers, json={
            "shipping_address": "123 Test Boulevard, Suite 5, San Francisco, CA 94107"
        })
        assert r_checkout_empty.status_code == 400, f"Expected 400, got: {r_checkout_empty.status_code}"
        assert r_checkout_empty.json()["detail"] == "Cannot checkout with an empty cart", f"Unexpected error detail: {r_checkout_empty.json()}"
        print("Empty cart checkout validation works successfully!")
        
        # 7. Verify stock is decremented
        print("7. Verifying product stock is decremented...")
        r_prod_verify = httpx.get(f"http://localhost:8000/api/v1/products/{product_id}")
        assert r_prod_verify.status_code == 200
        verified_stock = r_prod_verify.json()["stock"]
        assert verified_stock == initial_stock - 2, f"Stock mismatch! Initial: {initial_stock}, Current: {verified_stock}, Expected: {initial_stock - 2}"
        print(f"Stock decremented correctly: {initial_stock} -> {verified_stock}")
        
        # 8. List user's orders
        print("8. Listing user's orders...")
        r_orders = httpx.get("http://localhost:8000/api/v1/orders/", headers=headers)
        assert r_orders.status_code == 200
        orders_list = r_orders.json()
        assert len(orders_list) == 1, f"Expected 1 order, got: {len(orders_list)}"
        assert orders_list[0]["id"] == order_id
        print(f"User's order history successfully returned: {len(orders_list)} order(s).")
        
        # 9. Get single order details
        print("9. Getting single order details...")
        r_order_detail = httpx.get(f"http://localhost:8000/api/v1/orders/{order_id}", headers=headers)
        assert r_order_detail.status_code == 200
        order_detail = r_order_detail.json()
        assert order_detail["id"] == order_id
        assert len(order_detail["items"]) == 1
        assert order_detail["items"][0]["product"]["id"] == product_id
        print("Order details retrieved and validated successfully!")
        print("\nALL TESTS PASSED SUCCESSFULLY! END-TO-END CHECKOUT FLOW IS 100% FUNCTIONAL!")
        
    except Exception as e:
        print("\nTEST FAILED:", e)

if __name__ == "__main__":
    run()
