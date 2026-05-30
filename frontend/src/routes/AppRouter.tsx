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
  AdminManagementPage,
  AdminCouponsPage,
  WishlistPage,
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
  if (user?.role === "PRODUCT_ADMIN") return <Navigate to="/admin/product/dashboard" replace />;
  if (user?.role === "SHIPPING_ADMIN") return <Navigate to="/admin/shipping/dashboard" replace />;
  if (user?.role === "DELIVERY_ADMIN") return <Navigate to="/admin/delivery/dashboard" replace />;
  if (user?.role === "SUPER_ADMIN" || (user?.is_superuser && user?.role === "CUSTOMER")) return <Navigate to="/admin/super/dashboard" replace />;
  return <Navigate to="/" replace />;
}

function RoleGuard({ allowedRoles, children }: { allowedRoles: string[], children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  
  // Super Admin bypasses all checks
  if (user.role === "SUPER_ADMIN" || (user.is_superuser && user.role === "CUSTOMER")) {
    return <>{children}</>;
  }
  
  if (!allowedRoles.includes(user.role)) return <Navigate to="/admin" replace />;
  return <>{children}</>;
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
        <Route
          path="wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
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
        <Route path="dashboard" element={<Navigate to="/admin" replace />} />
        
        {/* Dashboards */}
        <Route path="super/dashboard" element={<RoleGuard allowedRoles={["SUPER_ADMIN"]}><AdminDashboardPage /></RoleGuard>} />
        <Route path="product/dashboard" element={<RoleGuard allowedRoles={["PRODUCT_ADMIN"]}><ProductAdminDashboardPage /></RoleGuard>} />
        <Route path="shipping/dashboard" element={<RoleGuard allowedRoles={["SHIPPING_ADMIN"]}><ShippingAdminDashboardPage /></RoleGuard>} />
        <Route path="delivery/dashboard" element={<RoleGuard allowedRoles={["DELIVERY_ADMIN"]}><DeliveryAdminDashboardPage /></RoleGuard>} />

        {/* Fallbacks for old exact paths */}
        <Route path="super" element={<Navigate to="/admin/super/dashboard" replace />} />
        <Route path="product" element={<Navigate to="/admin/product/dashboard" replace />} />
        <Route path="shipping" element={<Navigate to="/admin/shipping/dashboard" replace />} />
        <Route path="delivery" element={<Navigate to="/admin/delivery/dashboard" replace />} />
        
        {/* Product Management */}
        <Route path="products" element={<RoleGuard allowedRoles={["PRODUCT_ADMIN", "SUPER_ADMIN"]}><AdminProductsPage /></RoleGuard>} />
        <Route path="products/new" element={<RoleGuard allowedRoles={["PRODUCT_ADMIN", "SUPER_ADMIN"]}><AdminProductFormPage /></RoleGuard>} />
        <Route path="products/edit/:id" element={<RoleGuard allowedRoles={["PRODUCT_ADMIN", "SUPER_ADMIN"]}><AdminProductFormPage /></RoleGuard>} />
        
        {/* Categories */}
        <Route path="categories" element={<RoleGuard allowedRoles={["SUPER_ADMIN", "PRODUCT_ADMIN"]}><AdminCategoriesPage /></RoleGuard>} />
        <Route path="categories/new" element={<RoleGuard allowedRoles={["SUPER_ADMIN", "PRODUCT_ADMIN"]}><AdminCategoryFormPage /></RoleGuard>} />
        <Route path="categories/edit/:id" element={<RoleGuard allowedRoles={["SUPER_ADMIN", "PRODUCT_ADMIN"]}><AdminCategoryFormPage /></RoleGuard>} />
        
        {/* Users & Admins */}
        <Route path="users" element={<RoleGuard allowedRoles={["SUPER_ADMIN"]}><AdminUsersPage /></RoleGuard>} />
        <Route path="super/admins" element={<RoleGuard allowedRoles={["SUPER_ADMIN"]}><AdminManagementPage /></RoleGuard>} />
        
        {/* Coupons */}
        <Route path="coupons" element={<RoleGuard allowedRoles={["SUPER_ADMIN", "PRODUCT_ADMIN"]}><AdminCouponsPage /></RoleGuard>} />
      </Route>
    </Routes>
  );
}
