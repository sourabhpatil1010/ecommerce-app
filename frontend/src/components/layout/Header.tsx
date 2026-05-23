import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth, useCart } from "@/hooks";

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  const navLinks = [
    { to: "/products", label: "Products" },
  ];

  // Utility to determine active link classes
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-primary-600 ${
      isActive ? "text-primary-600 font-semibold" : "text-gray-600"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container-app flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 transition hover:opacity-90">
          <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            E-Commerce
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={getLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Action Controls (Desktop) */}
        <div className="hidden md:flex items-center gap-6">
          {/* Cart Icon & Badge */}
          <Link
            to="/cart"
            className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
            aria-label="View Cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.116 60.116 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white ring-2 ring-white animate-fade-in">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Account Controls */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 hover:bg-primary-200 transition-colors">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase() || "U"}
                </div>
              </button>

              {/* User Dropdown Menu */}
              {isUserDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg border border-gray-200 bg-white p-1 shadow-lg ring-1 ring-black/5 z-40 animate-fade-in-down">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {user?.full_name || user?.email}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-md transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-md transition-colors"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 shadow-sm transition-all hover:shadow"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navbar Controls */}
        <div className="flex md:hidden items-center gap-4">
          {/* Mobile Cart */}
          <Link
            to="/cart"
            className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
            aria-label="View Cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.116 60.116 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white ring-2 ring-white">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white py-4 shadow-inner animate-slide-in">
          <div className="container-app flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-medium text-gray-700 hover:text-primary-600 py-2 border-b border-gray-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Auth options for mobile */}
            {isAuthenticated ? (
              <div className="flex flex-col gap-3 mt-2 border-t border-gray-100 pt-4">
                <div className="px-2 pb-2">
                  <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {user?.full_name || user?.email}
                  </p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-base font-medium text-gray-700 hover:text-primary-600 py-2 transition-colors"
                >
                  Profile
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-base font-medium text-gray-700 hover:text-primary-600 py-2 transition-colors"
                >
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-base font-medium text-red-600 hover:text-red-700 py-2 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mt-4">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center rounded-lg border border-gray-300 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center rounded-lg bg-primary-600 py-2.5 text-base font-medium text-white hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
