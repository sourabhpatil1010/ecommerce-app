# Playwright Test Scenarios

This document outlines the core end-to-end (E2E) testing scenarios for the E-Commerce application. These scenarios cover the critical user journeys to ensure the application is reliable and functions correctly under expected use.

## Core Scenarios

### 1. Authentication & User Management

*   **Scenario 1.1: User Registration**
    *   Navigate to the registration page.
    *   Fill out the registration form with valid data.
    *   Submit the form.
    *   Verify successful registration and redirection to the home page or login page.
*   **Scenario 1.2: User Login (Success)**
    *   Navigate to the login page.
    *   Enter valid credentials.
    *   Submit the form.
    *   Verify successful login, session state, and redirection to the home page.
*   **Scenario 1.3: User Login (Failure)**
    *   Navigate to the login page.
    *   Enter invalid credentials.
    *   Submit the form.
    *   Verify an appropriate error message is displayed.
*   **Scenario 1.4: User Logout**
    *   Log in to the application.
    *   Click the user profile menu and select logout.
    *   Verify the session is cleared and the user is redirected to the home/login page.

### 2. Product Discovery & Browsing

*   **Scenario 2.1: View Home Page & Featured Products**
    *   Navigate to the home page.
    *   Verify hero banner, categories, and featured product sections are visible.
*   **Scenario 2.2: Product Filtering & Pagination**
    *   Navigate to the products listing page.
    *   Apply category filters.
    *   Verify the displayed products match the selected category.
    *   Interact with pagination controls and verify product lists update correctly.
*   **Scenario 2.3: View Product Details**
    *   Click on a product card from a listing page.
    *   Verify the product detail page displays the correct name, price, description, and images.
*   **Scenario 2.4: Search Functionality**
    *   Use the global search bar to search for a specific product.
    *   Verify the search results modal/page displays relevant products.

### 3. Shopping Cart & Wishlist

*   **Scenario 3.1: Add Product to Cart**
    *   Navigate to a product detail page.
    *   Select quantity and click "Add to Bag".
    *   Verify the cart icon updates with the correct item count.
*   **Scenario 3.2: Manage Cart Items**
    *   Open the cart page/drawer.
    *   Increase/decrease the quantity of an item.
    *   Verify the subtotal and total prices update correctly.
    *   Remove an item from the cart and verify it disappears.
*   **Scenario 3.3: Manage Wishlist**
    *   Log in to the application.
    *   Navigate to a product detail page and click "Add to Wishlist".
    *   Navigate to the wishlist page and verify the product is present.
    *   Remove the item from the wishlist and verify it disappears.

### 4. Checkout & Order Flow

*   **Scenario 4.1: Complete Checkout with New Address and Simulated Success**
    *   Add an item to the cart and proceed to checkout.
    *   Add a new shipping address.
    *   Select the simulated credit card payment method.
    *   Click "Simulate Success Payment".
    *   Verify redirection to the order confirmation page.
*   **Scenario 4.2: Complete Checkout with Existing Address and COD**
    *   Log in as a user with an existing address.
    *   Add an item to the cart and proceed to checkout.
    *   Select an existing address.
    *   Select Cash on Delivery (COD) as the payment method.
    *   Confirm the order.
    *   Verify redirection to the order confirmation page.
*   **Scenario 4.3: View Order History and Details**
    *   Log in and navigate to the "Orders" section of the profile.
    *   Verify past orders are listed.
    *   Click "View Details" on an order and verify the order information (items, total, shipping address, status) is correct.
*   **Scenario 4.4: Cancel an Order**
    *   Navigate to the details of an order with a "Placed" or "Confirmed" status.
    *   Click the "Cancel Order" button.
    *   Confirm the cancellation in the modal.
    *   Verify the order status updates to "Cancelled".

### 5. Admin Functionality

*   **Scenario 5.1: Admin Dashboard Access**
    *   Log in with a Super Admin or Admin account.
    *   Navigate to the admin dashboard.
    *   Verify key metrics (revenue, orders, users) and charts are visible.
*   **Scenario 5.2: Create and Delete Category**
    *   Navigate to the Admin Categories page.
    *   Click "Add Category" and fill out the form.
    *   Verify the new category appears in the list.
    *   Delete the category and verify it is removed.
*   **Scenario 5.3: Create and Manage Product**
    *   Navigate to the Admin Products page.
    *   Click "Add Product" and fill out the form (name, price, stock, category).
    *   Verify the product appears in the list.
    *   Edit the product (e.g., change price or stock) and save.
    *   Verify the changes are reflected.
*   **Scenario 5.4: Manage Coupons**
    *   Navigate to the Admin Coupons page.
    *   Create a new discount coupon.
    *   Verify the coupon appears in the list.
    *   (Optional: verify it can be applied during checkout in a separate scenario).
*   **Scenario 5.5: Manage Users**
    *   Navigate to the Admin Users page.
    *   Deactivate a standard user account.
    *   Verify the status changes to "Inactive".
    *   (Optional: verify the deactivated user can no longer log in).
