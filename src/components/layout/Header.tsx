import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Heart, Phone, Truck, User, Search, X, Menu, ChevronRight, Percent, HelpCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCategories } from '../../context/CategoryContext';
import { useUsers } from '../../context/UserContext';
import { useProducts } from '../../context/ProductContext';
import { CategoryDropdown } from './CategoryDropdown';
import logo from '../../assets/logo.png';
import * as Icons from 'lucide-react';
import { OrderTrackingModal } from '../order/OrderTrackingModal';
import { slugify } from '../../utils/slugify';

export const Header: React.FC = () => {
    const { totalItems, totalPrice, items, removeItem } = useCart();
    const { categories } = useCategories();
    const { currentUser, logout, favorites } = useUsers();
    const { products } = useProducts();
    // const { orders } = useOrders();
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Order Tracking State
    const [trackingNumber, setTrackingNumber] = useState('');
    const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
    const [trackedOrder, setTrackedOrder] = useState<any>(null);

    const searchRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    // Close search when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearch(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const searchResults = searchTerm.length > 2
        ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    const handleSearchCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setShowSearch(true);
    };

    const handleTrackOrder = async (number?: string) => {
        const num = number || trackingNumber;
        if (!num.trim()) return;

        try {
            const response = await fetch(`/api/orders/track?orderNo=${num.trim()}`);
            if (response.ok) {
                const result = await response.json();
                setTrackedOrder(result.data);
            } else {
                setTrackedOrder(null);
            }
            setIsTrackModalOpen(true);
        } catch (error) {
            console.error("Takip sorgusu hatası", error);
            setTrackedOrder(null);
            setIsTrackModalOpen(true);
        }
    };

    return (
        <header className="bg-white shadow-sm font-sans sticky top-0 z-40">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-xl flex flex-col animate-slideRight">
                        {/* Header of Drawer */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <img src={logo} alt="Dörtel Tedarik" className="h-8 w-auto object-contain" />
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto">
                            {/* User Info / Login */}
                            <div className="p-4 bg-blue-50/50 border-b border-blue-100">
                                {currentUser ? (
                                    <Link to="/hesabim" className="flex items-center gap-3 text-blue-900 group">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                            <span className="font-bold">{currentUser.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <div className="text-xs text-blue-600 font-medium">Hoşgeldiniz</div>
                                            <div className="font-bold text-sm">{currentUser.name}</div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 ml-auto text-blue-400 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                ) : (
                                    <Link to="/giris" className="flex items-center gap-3 text-blue-900 group">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                            <User className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-blue-600 font-medium">Hoşgeldiniz</div>
                                            <div className="font-bold text-sm">Giriş Yap / Üye Ol</div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 ml-auto text-blue-400 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                )}
                            </div>

                            {/* Main Navigation */}
                            <nav className="p-2">
                                <ul className="space-y-1">
                                    <li>
                                        <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                                            <Icons.Home className="w-5 h-5 text-gray-400" />
                                            Ana Sayfa
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/kampanyalar" className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium">
                                            <Percent className="w-5 h-5" />
                                            Kampanyalar
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => setIsTrackModalOpen(true)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium text-left"
                                        >
                                            <Truck className="w-5 h-5 text-gray-400" />
                                            Sipariş Takip
                                        </button>
                                    </li>
                                    <li>
                                        <Link to="/hesabim?tab=favorites" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                                            <Heart className="w-5 h-5 text-gray-400" />
                                            Favorilerim
                                        </Link>
                                    </li>
                                </ul>
                            </nav>

                            <div className="h-2 bg-gray-50 border-t border-b border-gray-100"></div>

                            {/* Categories */}
                            <div className="p-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Kategoriler</h3>
                                <ul className="space-y-1">
                                    {categories.map((cat) => {
                                        const iconName = cat?.icon || 'Circle';
                                        const IconComponent = (Icons as any)[iconName] || Icons.Circle;
                                        // Simple mobile implementation: just show main categories for now, 
                                        // or could make this an accordion. Let's make it a simple accordion.
                                        // Since we can't easily add state to this specific map without refactoring the whole Header to subcomponents,
                                        // we will just list them. Or we can just show the main category link.
                                        // For now, let's keep it simple as a link, but maybe add a small text indicating subcategories exist.
                                        return (
                                            <li key={cat.id}>
                                                <Link to={`/kategori/${slugify(cat.name)}`} className="flex items-center justify-between px-2 py-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg group transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <IconComponent className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">{cat.name}</span>
                                                            {cat.subcategories && (
                                                                <span className="text-[10px] text-gray-400">{cat.subcategories.length} Alt Kategori</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            <div className="h-2 bg-gray-50 border-t border-b border-gray-100"></div>

                            {/* Support */}
                            <div className="p-4">
                                <ul className="space-y-1">
                                    <li>
                                        <Link to="/iletisim" className="flex items-center gap-3 px-2 py-2 text-gray-600 hover:text-blue-600 transition-colors text-sm">
                                            <HelpCircle className="w-5 h-5" />
                                            Destek Merkezi
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/iletisim" className="flex items-center gap-3 px-2 py-2 text-gray-600 hover:text-blue-600 transition-colors text-sm">
                                            <Phone className="w-5 h-5" />
                                            Bize Ulaşın
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Footer of Drawer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-400">
                            Dörtel Tedarik v1.0
                        </div>
                    </div>
                </div>
            )}

            {/* First Row: Top Navigation */}
            <div className="border-b border-gray-100 bg-white relative z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Mobile Menu Button - VISIBLE ONLY ON MOBILE */}
                    <div className="lg:hidden flex items-center mr-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg active:scale-95 transition-transform"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Left: Logo */}
                    <div className="w-32 md:w-64 flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center">
                            <img src={logo} alt="Dörtel Tedarik" className="h-8 md:h-12 w-auto object-contain" />
                        </Link>
                    </div>

                    {/* Middle: Main Nav - HIDDEN ON MOBILE */}
                    <nav className="hidden lg:flex flex-1 items-center justify-center gap-8 text-sm font-medium text-gray-700">
                        <Link to="/" className="hover:text-secondary transition-colors">ANA SAYFA</Link>
                        <Link to="/hakkimizda" className="hover:text-secondary transition-colors">HAKKIMIZDA</Link>
                        <Link
                            to="/ayni-gun-kargo"
                            className="font-black animate-gradient-x text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 hover:scale-110 transition-transform duration-300"
                            style={{ textShadow: '0 0 20px rgba(236, 72, 153, 0.3)' }}
                        >
                            AYNI GÜN KARGO
                        </Link>
                        <Link to="/iletisim" className="hover:text-secondary transition-colors">İLETİŞİM</Link>

                        {/* Campaigns Flyout */}

                    </nav>

                    {/* Right: Utilities */}
                    <div className="flex items-center gap-2 md:gap-4 text-xs font-medium text-gray-600">
                        <Link to="/blog" className="hidden xl:flex items-center gap-2 cursor-pointer hover:text-secondary">
                            <span>Blog</span>
                        </Link>
                        <div className="h-4 w-px bg-gray-300 hidden xl:block"></div>

                        <Link to="/iletisim" className="hidden xl:flex items-center gap-1 hover:text-secondary">
                            <Phone className="w-4 h-4" />
                            <span>Destek Hattı</span>
                        </Link>
                        {/* Order Tracking Group */}
                        <div className="relative group hidden xl:block">
                            <div className="flex items-center gap-1 hover:text-secondary py-2 cursor-pointer">
                                <Truck className="w-4 h-4" />
                                <span className="hidden xl:inline">Sipariş Takip</span>
                            </div>
                            {/* Order Tracking Dropdown */}
                            <div className="absolute right-0 top-full w-72 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 p-4">
                                <h4 className="font-bold text-gray-800 text-sm mb-2">Siparişimi Nerede?</h4>
                                <p className="text-xs text-gray-500 mb-3">Sipariş numaranızla durumunu sorgulayın.</p>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Sipariş No (Örn: DT12345)"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleTrackOrder()}
                                        className="w-full h-9 px-3 border border-gray-200 rounded text-sm focus:border-secondary focus:ring-1 focus:ring-secondary/20 outline-none"
                                    />
                                    <button
                                        onClick={() => handleTrackOrder()}
                                        className="w-full bg-secondary text-white font-bold text-sm h-9 rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Sorgula
                                    </button>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                                    {!currentUser && (
                                        <Link to="/giris" className="text-xs text-blue-600 font-medium hover:underline">Üye Girişi Yap</Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="h-4 w-px bg-gray-300 hidden xl:block"></div>

                        {/* Account Group */}
                        <div className="relative group hidden md:block">
                            <Link to={currentUser ? "/hesabim" : "/giris"} className="flex flex-col items-center hover:text-secondary py-2">
                                <User className="w-5 h-5 group-hover:text-secondary" />
                                <span className="hidden sm:inline">
                                    {currentUser ? currentUser.name.split(' ')[0] : 'Hesabım'}
                                </span>
                            </Link>
                            {/* Account Dropdown */}
                            <div className="absolute right-0 top-full w-64 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 p-5">
                                {currentUser ? (
                                    <div className="text-center">
                                        <div className="font-bold text-slate-800 mb-1">{currentUser.name}</div>
                                        <div className="text-xs text-slate-500 mb-3">{currentUser.email}</div>
                                        <hr className="my-2 border-slate-100" />
                                        <Link to="/hesabim" className="block w-full text-left py-2 hover:bg-slate-50 rounded px-2 text-sm text-slate-700">Hesabım</Link>
                                        <Link to="/hesabim?tab=orders" className="block w-full text-left py-2 hover:bg-slate-50 rounded px-2 text-sm text-slate-700">Siparişlerim</Link>
                                        <button
                                            onClick={logout}
                                            className="block w-full text-left py-2 hover:bg-red-50 rounded px-2 text-sm text-red-600 font-medium"
                                        >
                                            Çıkış Yap
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h4 className="font-bold text-gray-800 text-center mb-4">Giriş Yap</h4>
                                        <div className="space-y-3">
                                            <Link to="/giris" className="block w-full bg-secondary text-white font-bold text-sm py-2 rounded hover:bg-blue-700 transition-colors shadow-blue-100 shadow-lg text-center">
                                                Giriş Yap
                                            </Link>
                                            <Link to="/kayit" className="block w-full bg-slate-100 text-slate-700 font-bold text-sm py-2 rounded hover:bg-slate-200 transition-colors text-center">
                                                Kayıt Ol
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>


                        <Link to="/hesabim?tab=favorites" className="hidden md:flex flex-col items-center hover:text-secondary group relative">
                            <div className="relative">
                                <Heart className={`w-5 h-5 group-hover:text-secondary transition-colors ${favorites.length > 0 ? 'fill-secondary text-secondary' : ''}`} />
                                {favorites.length > 0 && (
                                    <span key={favorites.length} className="absolute -top-1 -right-2 bg-secondary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                                        {favorites.length}
                                    </span>
                                )}
                            </div>
                            <span className="hidden sm:inline">Favorilerim</span>
                        </Link>

                        <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>

                        {/* Cart Group with Hover Preview */}
                        <div className="relative group z-50">
                            <Link to="/sepet" className="flex items-center gap-2 hover:text-secondary pb-2 pt-2">
                                <div className="relative">
                                    <ShoppingCart className="w-6 h-6 group-hover:text-secondary" />
                                    {totalItems > 0 && (
                                        <span className="absolute -top-1 -right-2 bg-accent text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">{totalItems}</span>
                                    )}
                                </div>
                                <div className="hidden sm:flex flex-col items-end leading-tight">
                                    <span className="text-[10px] text-gray-500">Sepetim</span>
                                    <span className="font-bold text-secondary">{totalPrice.toLocaleString('tr-TR')} TL</span>
                                </div>
                            </Link>

                            {/* Cart Dropdown */}
                            <div className="absolute right-0 top-full w-80 bg-white rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 pointer-events-none group-hover:pointer-events-auto">
                                <div className="p-4">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                                        <span className="font-bold text-gray-800">Sepetim ({totalItems} Ürün)</span>
                                        <Link to="/sepet" className="text-secondary text-xs hover:underline font-medium">Sepete Git</Link>
                                    </div>

                                    {items.length > 0 ? (
                                        <>
                                            <div className="max-h-64 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-200">
                                                {items.map((item) => (
                                                    <div key={item.id} className="flex gap-3 items-center group/item hover:bg-gray-50 p-2 rounded transition-colors relative pr-6">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-xs font-medium text-gray-900 truncate">{item.name}</h4>
                                                            <div className="flex justify-between mt-1">
                                                                <span className="text-xs text-gray-500">{item.quantity} Adet</span>
                                                                <span className="text-xs font-bold text-blue-600">{item.price.toLocaleString('tr-TR')} TL</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                removeItem(item.id);
                                                            }}
                                                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover/item:opacity-100"
                                                            title="Sepetten Sil"
                                                        >
                                                            <Icons.Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="border-t border-gray-100 mt-3 pt-3">
                                                <div className="flex justify-between font-bold text-sm mb-3">
                                                    <span>Toplam Tutar:</span>
                                                    <span className="text-secondary text-lg">{totalPrice.toLocaleString('tr-TR')} TL</span>
                                                </div>
                                                <Link
                                                    to="/odeme"
                                                    className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-orange-100"
                                                >
                                                    Siparişi Tamamla
                                                </Link>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-8">
                                            <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                            <p className="text-sm text-gray-500 font-medium">Sepetinizde ürün bulunmamaktadır.</p>
                                            <Link
                                                to="/"
                                                className="mt-4 inline-block text-secondary text-xs font-bold hover:underline"
                                            >
                                                Alışverişe Başla
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Second Row: Search & Categories */}
            <div className="bg-primary/5 py-3 md:py-4 border-b border-gray-200 z-30 relative">
                <div className="container mx-auto px-4 flex items-center gap-4">
                    {/* Categories Dropdown - Hidden on Mobile */}
                    <div className="w-64 flex-shrink-0 hidden lg:block">
                        <CategoryDropdown />
                    </div>

                    {/* Search Input */}
                    <div className="flex-1 flex gap-3 relative" ref={searchRef}>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Ürün, kategori veya marka arayın..."
                                value={searchTerm}
                                onChange={handleSearchCheck}
                                onFocus={() => setShowSearch(true)}
                                className="w-full h-10 md:h-12 pl-4 pr-12 md:pr-32 rounded-lg border border-gray-300 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all shadow-sm text-sm"
                            />
                            <div className="absolute right-1 top-1 bottom-1 flex">
                                {searchTerm && (
                                    <button
                                        onClick={() => { setSearchTerm(''); setShowSearch(false); }}
                                        className="h-full px-2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                <button className="bg-secondary text-white px-3 md:px-6 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 my-0.5">
                                    <Search className="w-4 h-4" />
                                    <span className="hidden md:inline">ARA</span>
                                </button>
                            </div>

                            {/* Search Results Dropdown */}
                            {showSearch && searchTerm.length > 2 && (
                                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-lg shadow-[0_10px_40px_-5px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[100] animate-fadeIn">
                                    {searchResults.length > 0 ? (
                                        <>
                                            <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-500">SONUÇLAR ({searchResults.length})</span>
                                                <Link
                                                    to={`/ara?q=${searchTerm}`}
                                                    onClick={() => setShowSearch(false)}
                                                    className="text-xs text-blue-600 hover:underline cursor-pointer"
                                                >
                                                    Tümünü Gör
                                                </Link>
                                            </div>
                                            <div className="max-h-[350px] overflow-y-auto">
                                                {searchResults.map((product) => (
                                                    <Link
                                                        key={product.id}
                                                        to={`/${slugify(product.name)}`}
                                                        onClick={() => setShowSearch(false)}
                                                        className="flex items-center gap-4 p-3 hover:bg-blue-50/50 transition-colors border-b border-gray-50 last:border-0"
                                                    >
                                                        <div className="w-12 h-12 bg-white rounded border border-gray-100 p-1 flex-shrink-0">
                                                            <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-medium text-gray-900 truncate" dangerouslySetInnerHTML={{
                                                                __html: product.name.replace(
                                                                    new RegExp(searchTerm, 'gi'),
                                                                    (match) => `<span class="bg-yellow-100 text-yellow-800">${match}</span>`
                                                                )
                                                            }} />
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-gray-500">{product.badges[0] || 'Stokta'}</span>
                                                                {product.discount && product.discount > 0 && (
                                                                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded font-bold">%{product.discount}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <div className="text-sm font-bold text-secondary">{product.price.current.toLocaleString('tr-TR')} TL</div>
                                                            {product.price.original > product.price.current && (
                                                                <div className="text-xs text-gray-400 line-through">{product.price.original.toLocaleString('tr-TR')} TL</div>
                                                            )}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-8 text-center flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                <Search className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="text-gray-900 font-medium">Sonuç bulunamadı</p>
                                            <p className="text-sm text-gray-500 mt-1">"{searchTerm}" ile ilgili bir ürün bulamadık.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <Link to="/outlet" className="hidden xl:flex items-center justify-center px-8 h-12 bg-gradient-to-r from-red-700 to-red-500 text-white rounded-lg font-bold hover:from-red-800 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap tracking-wide border border-red-400/20">
                            OUTLET
                        </Link>
                        <Link to="/kampanyalar" className="hidden xl:flex items-center justify-center px-8 h-12 bg-gradient-to-r from-orange-600 to-orange-400 text-white rounded-lg font-bold hover:from-orange-700 hover:to-orange-500 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap tracking-wide border border-orange-300/20">
                            KAMPANYALAR
                        </Link>

                    </div>
                </div>
            </div>
            {/* Order Tracking Modal */}
            {/* Order Tracking Modal */}
            <OrderTrackingModal
                isOpen={isTrackModalOpen}
                onClose={() => setIsTrackModalOpen(false)}
                order={trackedOrder}
            />

        </header >
    );
};
