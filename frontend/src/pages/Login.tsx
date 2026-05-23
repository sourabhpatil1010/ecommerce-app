import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth";

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();

  // Don't flash the form while the session is being restored
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
      </div>
    );
  }

  // Already logged in — redirect away from the login page
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container-app flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-3xl font-bold">Sign In</h1>
        <LoginForm />
      </div>
    </div>
  );
}
