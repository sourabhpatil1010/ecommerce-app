import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary-600">
          E-Commerce
        </Link>
        <nav className="flex items-center gap-6">
          {/* TODO: navigation links, cart icon, auth buttons */}
        </nav>
      </div>
    </header>
  );
}
