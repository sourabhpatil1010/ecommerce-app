import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { RegisterForm } from "@/components/auth";

export function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600 dark:border-gray-800 dark:border-t-indigo-500" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
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
