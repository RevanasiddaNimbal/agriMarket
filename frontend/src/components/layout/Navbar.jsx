import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Sprout,
  Menu,
  X,
  User,
  ShoppingBag,
  TrendingUp,
  CloudSun,
  BookOpen,
  Search,
  PlusCircle,
  LogOut,
  ShieldAlert,
  ChevronDown,
  LayoutDashboard,
  Layers,
  Info,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isCropsPage = location.pathname.startsWith('/crops');
  const isMarketPricesPage = location.pathname.startsWith('/market-prices');
  const isMarketplacePage =
    location.pathname.startsWith('/marketplace') || location.pathname.startsWith('/products');

  const getSearchPlaceholder = () => {
    if (isCropsPage) return 'Search crop guide (press Enter)...';
    if (isMarketPricesPage) return 'Search mandi prices (press Enter)...';
    if (location.pathname === '/') return 'Search products, crops, seeds...';
    return 'Search products (press Enter)...';
  };

  // Sync navbar search input with URL 'q' or 'commodity' query param based on active page
  useEffect(() => {
    if (isMarketplacePage) {
      setSearchQuery(searchParams.get('q') || '');
    } else if (isCropsPage) {
      setSearchQuery(searchParams.get('q') || '');
    } else if (isMarketPricesPage) {
      setSearchQuery(searchParams.get('q') || searchParams.get('commodity') || '');
    } else {
      setSearchQuery('');
    }
  }, [location.pathname, searchParams, isMarketplacePage, isCropsPage, isMarketPricesPage]);

  const handleLogout = async () => {
    await logout();
    setIsUserDropdownOpen(false);
    navigate('/');
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (isMarketplacePage) {
      navigate('/marketplace');
    } else if (isCropsPage) {
      navigate('/crops');
    } else if (isMarketPricesPage) {
      navigate('/market-prices');
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      handleClearSearch();
      return;
    }

    if (isCropsPage) {
      navigate(`/crops?q=${encodeURIComponent(trimmed)}`);
    } else if (isMarketPricesPage) {
      navigate(`/market-prices?q=${encodeURIComponent(trimmed)}`);
    } else {
      // Home page, Marketplace, and default for all other pages
      navigate(`/marketplace?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const navLinks = [
    { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { to: '/market-prices', label: 'Mandi Prices', icon: TrendingUp },
    { to: '/crops', label: 'Crop Guide', icon: BookOpen },
    { to: '/weather', label: 'Weather', icon: CloudSun },
    { to: '/about', label: 'About', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex h-16 items-center justify-between gap-2 lg:gap-3 xl:gap-4">
          {/* Logo - Clean AgriMarket branding */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-brand-600 to-emerald-700 flex items-center justify-center text-white shadow-soft-sm group-hover:scale-105 transition-transform">
              <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-brand-700 via-emerald-800 to-slate-900 bg-clip-text text-transparent">
              AgriMarket
            </span>
          </Link>

          {/* Desktop Search Bar - Submits strictly on Enter */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative flex-1 min-w-[140px] max-w-[220px] lg:max-w-[270px] xl:max-w-[340px]"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={getSearchPlaceholder()}
              className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm bg-slate-100/90 hover:bg-slate-100 focus:bg-white rounded-xl border border-slate-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-slate-400 shadow-soft-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-shrink-0 lg:translate-x-3 xl:translate-x-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 px-2 xl:px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-brand-600 flex-shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Actions / Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {isAuthenticated ? (
              <>
                {/* User Menu: Small Picture Only, No Name */}
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center justify-center p-0.5 rounded-full border-2 border-slate-200 hover:border-brand-500 hover:shadow-soft-xs transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                    aria-label="User profile menu"
                  >
                    <img
                      src={user?.profilePictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      alt={user?.fullName || 'User'}
                      className="w-8 h-8 rounded-full object-cover bg-slate-100"
                      onError={(e) => {
                        e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.fullName || 'User') + '&background=16a34a&color=fff';
                      }}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-soft-xl border border-slate-100 z-50 animate-slide-up">
                        <div className="px-3 py-2 border-b border-slate-100 mb-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        </div>

                        <Link
                          to="/dashboard"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-xl transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          <span>User Dashboard</span>
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-xl transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 text-slate-400" />
                          <span>My Orders</span>
                        </Link>

                        <Link
                          to="/dashboard/selling"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-xl transition-colors"
                        >
                          <Layers className="w-4 h-4 text-slate-400" />
                          <span>My Listed Products</span>
                        </Link>

                        <Link
                          to="/profile"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Profile & Settings</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-xl transition-colors border-t border-slate-100 my-1 pt-2"
                          >
                            <div className="flex items-center gap-2.5">
                              <ShieldAlert className="w-4 h-4 text-purple-600" />
                              <span>Admin Panel</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700">
                              Admin
                            </span>
                          </Link>
                        )}

                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            <LogOut className="w-4 h-4 text-rose-500" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-fade-in shadow-soft-lg">
          {/* Mobile Search Bar */}
          <form
            onSubmit={(e) => {
              setIsMobileMenuOpen(false);
              handleSearchSubmit(e);
            }}
            className="relative pb-2"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={getSearchPlaceholder()}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-100 rounded-xl border border-transparent focus:border-brand-500 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-5 h-5 text-slate-400" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}

          <div className="border-t border-slate-100 pt-3 mt-3 space-y-2">
            <Link
              to="/support"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Support & Help Center
            </Link>

            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors border border-purple-200/80 bg-purple-50/40"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  <span>Admin Panel</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-purple-200 text-purple-800">
                  Admin
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
