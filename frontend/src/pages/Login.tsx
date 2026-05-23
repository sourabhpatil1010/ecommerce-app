import { LoginForm } from "@/components/auth";

export function LoginPage() {
  return (
    <div className="container-app flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-3xl font-bold">Sign In</h1>
        <LoginForm />
      </div>
    </div>
  );
}
