import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout";
import {
  HomePage,
  ProductsPage,
  ProductDetailPage,
  CartPage,
  CheckoutPage,
  LoginPage,
  RegisterPage,
  ProfilePage,
  OrderHistoryPage,
  OrderDetailPage,
  AddressesPage,
  CheckoutPaymentPage,
  PaymentSuccessPage,
  NotFoundPage,
  AdminDashboardPage,
  AdminProductsPage,
  AdminProductFormPage,
  AdminCategoriesPage,
  AdminCategoryFormPage,
  AdminUsersPage,
} from "@/pages";
import {
  ProductAdminDashboardPage,
  ShippingAdminDashboardPage,
  DeliveryAdminDashboardPage
} from "@/pages/admin/dashboards";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";

function AdminIndexRedirect() {
  const { user } = useAuth();
  if (user?.role === "PRODUCT_ADMIN") return <Navigate to="/admin/product" replace />;
  if (user?.role === "SHIPPING_ADMIN") return <Navigate to="/admin/shipping" replace />;
  if (user?.role === "DELIVERY_ADMIN") return <Navigate to="/admin/delivery" replace />;
  return <Navigate to="/admin/super" replace />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout/payment/:orderId"
          element={
            <ProtectedRoute>
              <CheckoutPaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout/success"
          element={
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile/addresses"
          element={
            <ProtectedRoute>
              <AddressesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Auth Routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminIndexRedirect />} />
        <Route path="super" element={<AdminDashboardPage />} />
        <Route path="product" element={<ProductAdminDashboardPage />} />
        <Route path="shipping" element={<ShippingAdminDashboardPage />} />
        <Route path="delivery" element={<DeliveryAdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductFormPage />} />
        <Route path="products/edit/:id" element={<AdminProductFormPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="categories/new" element={<AdminCategoryFormPage />} />
        <Route path="categories/edit/:id" element={<AdminCategoryFormPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
    </Routes>
  );
}
