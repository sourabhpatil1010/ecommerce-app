import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth";

export function LoginPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Don't flash the form while the session is being restored
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600 dark:border-gray-800 dark:border-t-indigo-500" />
      </div>
    );
  }

  // Already logged in — redirect away from the login page
  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
    
    const isAdmin = user?.is_superuser || ["SUPER_ADMIN", "PRODUCT_ADMIN", "SHIPPING_ADMIN", "DELIVERY_ADMIN"].includes(user?.role || "");

    if (isAdmin && (!from || from === "/")) {
      const role = user?.role;
      if (role === "PRODUCT_ADMIN") return <Navigate to="/admin/product/dashboard" replace />;
      if (role === "SHIPPING_ADMIN") return <Navigate to="/admin/shipping/dashboard" replace />;
      if (role === "DELIVERY_ADMIN") return <Navigate to="/admin/delivery/dashboard" replace />;
      if (role === "SUPER_ADMIN") return <Navigate to="/admin/super/dashboard" replace />;
      return <Navigate to="/admin" replace />;
    }
    
    return <Navigate to={from || "/"} replace />;
  }

  return (
    <div className="container-app flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">Sign In</h1>
        <LoginForm />
      </div>
    </div>
  );
}
