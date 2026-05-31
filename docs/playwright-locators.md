# Playwright Locators Reference

This document serves as a reference for all the standard, stable, and maintainable locators (primarily `data-testid`) implemented across the E-Commerce application. This standard aims to provide robust element selectors for our enterprise-grade Playwright automation framework.

## Locator Strategy & Rules

Our primary locator strategy is a hybrid approach emphasizing robust data-testids along with standard HTML attributes (id, role, aria-label).

1. **`data-testid`**: We utilize `data-testid` extensively. This provides a clear, unambiguous hook specifically for testing, decoupling tests from CSS classes or DOM structure changes.
2. **`getByRole` and `getByLabel`**: When appropriate, testing should rely on accessible roles and labels, enhancing both the tests and the application's overall accessibility.

### Naming Conventions

*   **Buttons**: `data-testid="<action>-btn"` (e.g., `login-btn`, `add-to-cart-btn`)
*   **Inputs**: `data-testid="<field>-input"` (e.g., `email-input`, `password-input`)
*   **Links**: `data-testid="<destination>-link"` (e.g., `home-link`, `cart-link`)
*   **Dynamic Lists/Items**: `data-testid="<item-type>-<id>"` (e.g., `product-card-123`, `cart-item-456`)

---

## Shared / Common Components

| Element Description | Test ID (`data-testid`) | Component / Context |
| :--- | :--- | :--- |
| Common Button | `data-testid` is passed via props | `Button.tsx` |
| Common Modal | `data-testid` is passed via props | `Modal.tsx` |
| Modal Close Button | `modal-close-btn` | `Modal.tsx` |
| Empty State Container | `empty-state` | `EmptyState.tsx` |
| Empty State Action Button | `empty-state-action-btn` | `EmptyState.tsx` |
| Error State Container | `error-state` | `ErrorState.tsx` |
| Error State Retry Button | `error-retry-btn` | `ErrorState.tsx` |
| Error Fallback Container| `error-fallback` | `ErrorFallback.tsx` |
| Error Fallback Retry Btn| `error-fallback-retry-btn` | `ErrorFallback.tsx` |

## Authentication

| Element Description | Test ID (`data-testid`) | Component / Context |
| :--- | :--- | :--- |
| Login Email Input | `email-input` | `LoginForm.tsx` |
| Login Password Input | `password-input` | `LoginForm.tsx` |
| Login Submit Button | `login-submit-btn` | `LoginForm.tsx` |
| Register Name Input | `name-input` | `RegisterForm.tsx` |
| Register Email Input | `email-input` | `RegisterForm.tsx` |
| Register Password Input | `password-input` | `RegisterForm.tsx` |
| Register Submit Button | `register-submit-btn` | `RegisterForm.tsx` |

## Layout (Header, Sidebar, Navigation)

| Element Description | Test ID (`data-testid`) | Component / Context |
| :--- | :--- | :--- |
| Header Navigation Links | `home-nav-link`, `products-nav-link`, `categories-nav-link` | `Header.tsx` |
| Header Actions | `header-search-btn`, `header-wishlist-link`, `header-cart-link`, `header-profile-menu-btn` | `Header.tsx` |
| Header Profile Menu | `profile-menu-admin-link`, `profile-menu-dashboard-link`, `profile-menu-orders-link`, `profile-menu-logout-btn` | `Header.tsx` |
| Header Search Input | `header-search-input` | `HeaderSearch.tsx` |
| Header Search Result | `search-result-<id>` | `HeaderSearch.tsx` |
| Notification Dropdown | `notification-dropdown-btn`, `mark-all-read-btn`, `notification-item-<id>` | `NotificationDropdown.tsx` |
| Admin Sidebar Links | `admin-sidebar-dashboard`, `admin-sidebar-products`, `admin-sidebar-categories`, `admin-sidebar-orders`, `admin-sidebar-coupons`, `admin-sidebar-users` | `Sidebar.tsx` |
| Admin Logout | `admin-sidebar-logout` | `Sidebar.tsx` |

## Home & Products

| Element Description | Test ID (`data-testid`) | Component / Context |
| :--- | :--- | :--- |
| Hero Shop Now Button | `hero-shop-now-btn` | `Home.tsx` |
| Category Filter Card | `category-filter-<slug>` | `Home.tsx` |
| Product Card | `product-card-<id>` | `ProductCard.tsx` |
| Add to Cart (Card) | `add-to-cart-<id>` | `ProductCard.tsx` |
| Product Details (Grid)| `product-details-link-<id>` | `ProductCard.tsx` |
| Products Page Filter | `category-filter-<category_id>` | `Products.tsx` |
| Products Pagination | `pagination-prev`, `pagination-next`, `pagination-page-<page>` | `Products.tsx` |
| Product Detail Title | `product-detail-title` | `ProductDetailView.tsx` |
| Product Detail Price | `product-detail-price` | `ProductDetailView.tsx` |
| Qty Decrease Btn | `qty-decrease-btn` | `ProductDetailView.tsx` |
| Qty Increase Btn | `qty-increase-btn` | `ProductDetailView.tsx` |
| Qty Input | `qty-input` | `ProductDetailView.tsx` |
| Add to Cart (Detail) | `add-to-cart-detail-btn` | `ProductDetailView.tsx` |
| Add to Wishlist Btn | `add-to-wishlist-btn` | `ProductDetailView.tsx` |
| Product Review Rating | `review-rating-<value>` | `ProductReviews.tsx` |
| Product Review Input | `review-comment-input` | `ProductReviews.tsx` |
| Submit Review Btn | `submit-review-btn` | `ProductReviews.tsx` |
| Admin Edit Modal Btn | `admin-edit-product-modal-btn` | `ProductDetail.tsx` |

## Cart & Checkout

| Element Description | Test ID (`data-testid`) | Component / Context |
| :--- | :--- | :--- |
| Cart Item Container | `cart-item-<id>` | `Cart.tsx` |
| Cart Item Remove Btn | `remove-cart-item-<id>` | `Cart.tsx` |
| Cart Proceed to Checkout| `proceed-to-checkout-btn` | `Cart.tsx` |
| Continue Shopping Btn | `continue-shopping-btn` | `Cart.tsx` |
| Checkout Add Address | `add-new-address-btn` | `Checkout.tsx` |
| Checkout Return to Bag | `return-to-bag-link` | `Checkout.tsx` |
| Checkout Continue Btn | `continue-payment-btn` | `Checkout.tsx` |
| Checkout Coupon Input | `coupon-code-input` | `Checkout.tsx` |
| Checkout Apply Coupon | `apply-coupon-btn` | `Checkout.tsx` |
| Checkout Remove Coupon| `remove-coupon-btn` | `Checkout.tsx` |
| Address Card Container | `address-card-<id>` | `AddressCard.tsx` |
| Address Card Edit Btn | `edit-address-btn-<id>` | `AddressCard.tsx` |
| Address Card Delete | `delete-address-btn-<id>` | `AddressCard.tsx` |
| Address Card Set Default| `set-default-address-btn-<id>`| `AddressCard.tsx` |
| Address Form Inputs | `address-fullname-input`, `address-phone-input`, `address-pincode-input`, `address-locality-input`, `address-line-input`, `address-city-input`, `address-state-input`, `address-landmark-input`, `address-alternate-phone-input` | `AddressForm.tsx` |
| Address Type Radios | `address-type-home`, `address-type-work` | `AddressForm.tsx` |
| Address Form Default | `address-is-default` | `AddressForm.tsx` |
| Address Form Save/Cancel| `address-submit-btn`, `address-cancel-btn` | `AddressForm.tsx` |
| Payment Method Radios | `payment-method-stripe`, `payment-method-razorpay`, `payment-method-cod` | `CheckoutPayment.tsx` |
| Simulated Card Inputs | `simulate-cardholder-input`, `simulate-card-number-input`, `simulate-expiry-input`, `simulate-cvv-input` | `CheckoutPayment.tsx` |
| Simulated Submit Btns | `simulate-success-btn`, `simulate-failure-btn` | `CheckoutPayment.tsx` |

## User Account (Profile, Orders, Wishlist)

| Element Description | Test ID (`data-testid`) | Component / Context |
| :--- | :--- | :--- |
| Profile Addresses Link | `manage-addresses-link` | `Profile.tsx` |
| Profile Edit Inputs | `profile-name-input`, `profile-email-input` | `Profile.tsx` |
| Profile Save Btn | `profile-save-btn` | `Profile.tsx` |
| Manage Address (Large) | `add-new-address-btn-large` | `Addresses.tsx` |
| Return to Profile Link | `return-to-profile-link` | `Addresses.tsx` |
| Order History Item | `view-order-<id>` | `OrderHistory.tsx` |
| Order Detail Cancel Btn | `cancel-order-btn` | `OrderDetail.tsx` |
| Order Detail Back Link| `back-to-orders-link` | `OrderDetail.tsx` |
| Cancel Order Modal | `cancel-order-modal` | `OrderDetail.tsx` |
| Cancel Order Confirm | `cancel-confirm-btn` | `OrderDetail.tsx` |
| Cancel Order Keep | `cancel-keep-btn` | `OrderDetail.tsx` |
| Wishlist Item Card | `wishlist-item-<id>` | `Wishlist.tsx` |
| Wishlist Remove Btn | `wishlist-remove-<id>` | `Wishlist.tsx` |
| Wishlist Add to Bag | `wishlist-add-to-bag-<id>` | `Wishlist.tsx` |

## Admin Dashboard

| Element Description | Test ID (`data-testid`) | Component / Context |
| :--- | :--- | :--- |
| Dashboard Report Btn | `admin-download-report-btn` | `Dashboard.tsx` |
| Admin Categories Add | `admin-add-category-btn` | `Categories.tsx` |
| Admin Categories Edit | `admin-edit-category-<id>` | `Categories.tsx` |
| Admin Categories Delete| `admin-delete-category-<id>`| `Categories.tsx` |
| Admin Category Save | `category-save-btn` | `CategoryForm.tsx` |
| Admin Products Add | `admin-add-product-btn` | `Products.tsx` |
| Admin Products Edit | `admin-edit-product-<id>` | `Products.tsx` |
| Admin Products Delete | `admin-delete-product-<id>` | `Products.tsx` |
| Admin Product Save | `product-save-btn` | `ProductForm.tsx` |
| Admin Coupons Add | `admin-add-coupon-btn` | `Coupons.tsx` |
| Admin Coupons Edit | `admin-edit-coupon-<id>` | `Coupons.tsx` |
| Admin Coupon Inputs | `coupon-code-input`, `coupon-discount-input` | `Coupons.tsx` |
| Admin Coupon Save | `coupon-save-btn` | `Coupons.tsx` |
| Admin Users Toggle | `admin-toggle-user-<id>` | `Users.tsx` |

---
*Note: This standard ensures all elements have clear, predictable identifiers, minimizing flaky tests and simplifying the creation of Page Object Models (POM).*
