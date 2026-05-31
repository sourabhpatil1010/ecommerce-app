import { useState, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth, useCart } from "@/hooks";
import { ThemeContext } from "@/contexts/ThemeContext";
import { NotificationDropdown } from "./NotificationDropdown";
import { HeaderSearch } from "./HeaderSearch";

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);
  
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
    `text-sm transition-colors duration-200 hover:text-black dark:hover:text-white ${
      isActive ? "text-black dark:text-white font-medium" : "text-gray-500 dark:text-gray-400"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 dark:border-gray-800/60 bg-white/70 dark:bg-black/70 backdrop-blur-xl">
      <div className="container-app flex h-16 items-center justify-between gap-4 sm:gap-8">
        
        {/* Logo & Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" data-testid="header-logo" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-black dark:text-white transition hover:opacity-80">
            Store.
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} data-testid={`nav-link-${link.label.toLowerCase()}`} className={getLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Search Bar (Desktop) */}
        <div className="hidden flex-1 md:flex items-center max-w-md">
          <HeaderSearch />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Theme Toggle */}
          {themeContext && (
            <button
              onClick={themeContext.toggleTheme}
              data-testid="theme-toggle-btn"
              className="p-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors focus:outline-none rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle Theme"
            >
              {themeContext.theme === "light" ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              )}
            </button>
          )}

          {isAuthenticated && <NotificationDropdown />}

          {/* Wishlist Icon */}
          <Link
            to="/wishlist"
            data-testid="wishlist-btn"
            className="p-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="View Wishlist"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </Link>

          {/* Cart Icon & Badge */}
          <Link
            to="/cart"
            data-testid="cart-btn"
            className="relative p-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="View Cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute top-1.5 right-1 flex h-2 w-2 items-center justify-center rounded-full bg-black dark:bg-white animate-fade-in" />
            )}
          </Link>

          {/* User Account Controls */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                data-testid="profile-btn"
                className="flex items-center gap-2 focus:outline-none ml-1"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-black dark:text-white hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
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
                  <div className="absolute right-0 mt-3 w-56 origin-top-right rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-1.5 shadow-2xl z-40 animate-fade-in-down">
                    <div className="px-3 py-2.5 mb-1 border-b border-gray-100 dark:border-gray-800">
                      <p className="truncate text-sm font-medium text-black dark:text-white">
                        {user?.full_name || user?.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{user?.email}</p>
                    </div>
                    
                    <div className="space-y-0.5">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        data-testid="dropdown-profile"
                        className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white rounded-lg transition-colors"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setIsUserDropdownOpen(false)}
                        data-testid="dropdown-orders"
                        className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white rounded-lg transition-colors"
                      >
                        My Orders
                      </Link>
                    </div>

                    {(user?.is_superuser || user?.role !== "CUSTOMER") && (
                      <div className="mt-1 pt-1 border-t border-gray-100 dark:border-gray-800">
                        <Link
                          to={
                            user?.role === "PRODUCT_ADMIN" ? "/admin/product/dashboard" :
                            user?.role === "SHIPPING_ADMIN" ? "/admin/shipping/dashboard" :
                            user?.role === "DELIVERY_ADMIN" ? "/admin/delivery/dashboard" :
                            user?.role === "SUPER_ADMIN" ? "/admin/super/dashboard" : "/admin"
                          }
                          onClick={() => setIsUserDropdownOpen(false)}
                          data-testid="dropdown-admin"
                          className="block px-3 py-2 text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors font-medium"
                        >
                          Admin Dashboard
                        </Link>
                      </div>
                    )}
                    
                    <div className="mt-1 pt-1 border-t border-gray-100 dark:border-gray-800">
                      <button
                        onClick={handleLogout}
                        data-testid="dropdown-logout"
                        className="block w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 rounded-lg transition-colors"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/login"
                data-testid="header-login-link"
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                data-testid="header-register-link"
                className="rounded-full bg-black dark:bg-white px-4 py-1.5 text-sm font-medium text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Hamburger Menu Toggle (Mobile) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="mobile-menu-toggle-btn"
            className="md:hidden p-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white focus:outline-none rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800/60 bg-white dark:bg-black shadow-lg animate-fade-in-down absolute w-full pb-4">
          <div className="container-app flex flex-col gap-2 pt-4">
            
            {/* Mobile Search */}
            <HeaderSearch isMobile={true} onSearchComplete={() => setIsMobileMenuOpen(false)} />

            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white py-2 px-1 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {!isAuthenticated && (
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center rounded-lg border border-gray-200 dark:border-gray-700 py-2 text-sm font-medium text-black dark:text-white"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center rounded-lg bg-black dark:bg-white py-2 text-sm font-medium text-white dark:text-black"
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
