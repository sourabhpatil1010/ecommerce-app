# API Endpoints Inventory

This document provides a comprehensive inventory of the FastAPI backend endpoints available for testing.

## Authentication & Users

| Module | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| Auth | POST | `/api/v1/auth/login` | No | Authenticate user and receive access token (form-data: username, password) |
| Auth | POST | `/api/v1/auth/register` | No | Register a new user |
| Users | GET | `/api/v1/users/me` | Yes | Get current authenticated user details |
| Users | PUT | `/api/v1/users/me` | Yes | Update current user profile |
| Users | GET | `/api/v1/users` | Yes (Admin) | List all users |

## Products

| Module | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| Products | GET | `/api/v1/products` | No | List products with pagination, search, and filters |
| Products | GET | `/api/v1/products/{id}` | No | Get product details by ID |
| Products | POST | `/api/v1/products` | Yes (Admin) | Create a new product |
| Products | PUT | `/api/v1/products/{id}` | Yes (Admin) | Update an existing product |
| Products | DELETE | `/api/v1/products/{id}` | Yes (Admin) | Delete a product |

## Categories

| Module | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| Categories | GET | `/api/v1/categories` | No | List all categories |
| Categories | GET | `/api/v1/categories/{id}` | No | Get category details |
| Categories | POST | `/api/v1/categories` | Yes (Admin) | Create a new category |
| Categories | PUT | `/api/v1/categories/{id}` | Yes (Admin) | Update a category |
| Categories | DELETE | `/api/v1/categories/{id}` | Yes (Admin) | Delete a category |

## Shopping Cart

| Module | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| Cart | GET | `/api/v1/cart` | Yes | Get current user's cart and items |
| Cart | POST | `/api/v1/cart/items` | Yes | Add item to cart |
| Cart | PUT | `/api/v1/cart/items/{id}` | Yes | Update cart item quantity |
| Cart | DELETE | `/api/v1/cart/items/{id}` | Yes | Remove item from cart |
| Cart | DELETE | `/api/v1/cart` | Yes | Empty the cart |

## Wishlist

| Module | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| Wishlist | GET | `/api/v1/wishlist` | Yes | Get current user's wishlist |
| Wishlist | POST | `/api/v1/wishlist/{product_id}` | Yes | Add a product to wishlist |
| Wishlist | DELETE | `/api/v1/wishlist/{product_id}`| Yes | Remove a product from wishlist |

## Orders

| Module | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| Orders | POST | `/api/v1/orders` | Yes | Create a new order from cart |
| Orders | GET | `/api/v1/orders` | Yes | Get current user's order history |
| Orders | GET | `/api/v1/orders/{id}` | Yes | Get specific order details |
| Orders | PUT | `/api/v1/orders/{id}/status`| Yes (Admin) | Update order status |

## Addresses

| Module | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| Addresses | GET | `/api/v1/addresses` | Yes | List user's saved addresses |
| Addresses | POST | `/api/v1/addresses` | Yes | Add a new address |
| Addresses | PUT | `/api/v1/addresses/{id}` | Yes | Update an existing address |
| Addresses | DELETE | `/api/v1/addresses/{id}` | Yes | Delete an address |

## Reviews

| Module | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| Reviews | GET | `/api/v1/reviews/product/{id}`| No | Get reviews for a product |
| Reviews | POST | `/api/v1/reviews` | Yes | Add a review for a product |
| Reviews | PUT | `/api/v1/reviews/{id}` | Yes | Update a review |
| Reviews | DELETE | `/api/v1/reviews/{id}` | Yes | Delete a review (User or Admin) |

## Admin & Dashboard

| Module | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| Dashboard | GET | `/api/v1/dashboard/stats` | Yes (Admin) | Get general store statistics (revenue, orders, etc.) |
| Coupons | GET | `/api/v1/coupons` | Yes (Admin) | List coupons |
| Coupons | POST | `/api/v1/coupons` | Yes (Admin) | Create coupon |
| Coupons | PUT | `/api/v1/coupons/{id}` | Yes (Admin) | Update coupon |
