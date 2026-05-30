import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppRouter } from "@/routes";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <AppRouter />
              <Toaster position="top-center" />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
