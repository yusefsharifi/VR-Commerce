import { ChevronDown, ShoppingCart, User } from "lucide-react";
import useUser from "@/utils/useUser";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { data: user } = useUser();
  const { cart } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#121212] border-b border-[#ECECEC] dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#FF5224] rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <span className="font-extrabold text-xl text-[#111111] dark:text-white">
              Passage 414
            </span>
          </a>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="/"
              className="font-medium text-sm text-[#111111] dark:text-white/87 hover:opacity-100 transition-opacity"
            >
              Lobby
            </a>
            <div className="relative group">
              <button className="flex items-center font-medium text-sm text-[#111111] dark:text-white/87 opacity-85 hover:opacity-100 transition-opacity">
                Regions
                <ChevronDown size={12} className="ml-1" />
              </button>
              <div className="absolute top-full left-0 w-48 bg-white dark:bg-[#1e1e1e] shadow-xl rounded-lg py-2 hidden group-hover:block border border-gray-100 dark:border-white/10">
                <a
                  href="/mall/iran"
                  className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  Iran
                </a>
                <a
                  href="/mall/arab"
                  className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  Arab Countries
                </a>
                <a
                  href="/mall/europe"
                  className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  Europe
                </a>
                <a
                  href="/mall/africa"
                  className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  Africa
                </a>
              </div>
            </div>
            <a
              href="/dashboard"
              className="font-medium text-sm text-[#111111] dark:text-white/87 opacity-85 hover:opacity-100 transition-opacity"
            >
              Vendor Hub
            </a>
          </nav>

          {/* Right cluster */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <ShoppingCart
                size={20}
                className="text-[#111111] dark:text-white cursor-pointer"
              />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FF5224] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>

            {user ? (
              <a
                href="/account/profile"
                className="flex items-center space-x-2 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full"
              >
                <User size={16} />
                <span className="text-sm font-medium">
                  {user.name || "User"}
                </span>
              </a>
            ) : (
              <>
                <a
                  href="/account/signin"
                  className="font-medium text-sm text-[#111111] dark:text-white/87 hover:opacity-80 transition-opacity"
                >
                  Log in
                </a>
                <a
                  href="/account/signup"
                  className="bg-[#FF5224] text-white font-semibold text-sm px-6 py-2 rounded-full transition-all transform hover:scale-105 active:scale-95"
                >
                  Join Now
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
