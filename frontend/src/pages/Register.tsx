import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { RegisterForm } from "@/components/auth";

export function RegisterPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600 dark:border-gray-800 dark:border-t-indigo-500" />
      </div>
    );
  }

  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
    
    if (user?.is_superuser && (!from || from === "/")) {
      const role = user.role;
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
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
