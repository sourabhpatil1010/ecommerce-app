import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
      <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700">404</h1>
      <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">Page not found</p>
      <Link
        to="/"
        className="mt-8 rounded-lg bg-primary-600 px-6 py-3 text-white transition hover:bg-primary-700"
      >
        Back to Home
      </Link>
    </div>
  );
}
