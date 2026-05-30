import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { productsApi } from "@/api";
import { formatCurrency } from "@/utils/currency";

interface HeaderSearchProps {
  isMobile?: boolean;
  onSearchComplete?: () => void;
}

export function HeaderSearch({ isMobile = false, onSearchComplete }: HeaderSearchProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const isProductsPage = location.pathname === "/products";
  
  const [query, setQuery] = useState(isProductsPage ? (searchParams.get("search") || "") : "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<number>();

  useEffect(() => {
    if (isProductsPage) {
      setQuery(searchParams.get("search") || "");
    }
  }, [isProductsPage, searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await productsApi.getProducts({ skip: 0, limit: 5, search: searchTerm });
      setSuggestions(res.data);
    } catch (err) {
      console.error("Failed to fetch search suggestions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setShowSuggestions(true);

    if (isProductsPage) {
      setSearchParams((prev) => {
        if (val) prev.set("search", val);
        else prev.delete("search");
        return prev;
      }, { replace: true });
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (!isProductsPage && query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      onSearchComplete?.();
    }
  };

  const handleSuggestionClick = (productId: string) => {
    setShowSuggestions(false);
    setQuery("");
    navigate(`/products/${productId}`);
    onSearchComplete?.();
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${isMobile ? 'mb-2' : 'group'}`}>
      <form onSubmit={handleSearchSubmit}>
        <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 ${!isMobile && 'group-focus-within:text-black dark:group-focus-within:text-white transition-colors'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          onFocus={() => { if (query.trim().length >= 2) setShowSuggestions(true); }}
          placeholder="Search products..."
          className={`w-full bg-gray-100/50 dark:bg-gray-900/50 border border-transparent text-sm rounded-full focus:border-gray-300 dark:focus:border-gray-700 focus:bg-white dark:focus:bg-black block pl-9 p-2 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-500 ${isMobile ? 'py-2.5 bg-gray-100 dark:bg-gray-900' : ''}`}
        />
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-black rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">Searching...</div>
          ) : suggestions.length > 0 ? (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {suggestions.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleSuggestionClick(item.id)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-10 h-10 object-cover rounded-md bg-gray-100 dark:bg-gray-800" />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-800" />
                    )}
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-black dark:text-white truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{formatCurrency(item.price)}</p>
                    </div>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={handleSearchSubmit}
                  className="w-full text-center px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  See all results for "{query}"
                </button>
              </li>
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No products found.</div>
          )}
        </div>
      )}
    </div>
  );
}
