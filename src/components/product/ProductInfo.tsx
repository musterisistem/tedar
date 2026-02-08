import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, Share2, Minus, Plus, ShoppingCart, Settings, Bell, ChevronRight, Facebook, Mail, MessageCircle, Copy, Percent, Hourglass, TrendingDown, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { useUsers } from '../../context/UserContext';
import { usePriceAlerts } from '../../context/PriceAlertContext';
import { useNotification } from '../../context/NotificationContext';
import { PriceAlertModal } from './PriceAlertModal';

interface ProductInfoProps {
    product: any;
    onReviewClick: () => void;
    totalReviews?: number;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product, onReviewClick, totalReviews }) => {
    const [quantity, setQuantity] = useState(1);
    const { addItem, openDrawer } = useCart();
    const { brands, discountInCartProductIds } = useProducts();
    const { currentUser, favorites, toggleFavorite } = useUsers();
    const { activateAlert, isAlertActive } = usePriceAlerts();
    const { showToast } = useNotification();
    const [isFavAnimating, setIsFavAnimating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const shareRef = useRef<HTMLDivElement>(null);
    const [isSavingAlert, setIsSavingAlert] = useState(false);

    const navigate = useNavigate();

    // Close share menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
                setIsShareOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleShare = (platform: 'facebook' | 'whatsapp' | 'mail' | 'copy') => {
        const url = window.location.href;
        const text = `Harika bir ürün buldum: ${product.name} - ${product.price.current} TL`;

        switch (platform) {
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                break;
            case 'mail':
                window.open(`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(text + '\n\n' + url)}`);
                break;
            case 'copy':
                navigator.clipboard.writeText(url);
                showToast('Link kopyalandı!', 'success');
                break;
        }
        setIsShareOpen(false);
    };

    // Find product brand logo
    const productBrand = brands.find(b => b.name === product.brand);

    const handleToggleAlert = async () => {
        if (!currentUser) {
            setIsModalOpen(true);
            return;
        }

        if (product?.id && isAlertActive(product.id.toString(), currentUser.id)) {
            showToast('Fiyat alarmı bu ürün için zaten aktif.', 'info');
            return;
        }

        setIsModalOpen(true);
    };

    const isFavorite = product?.id ? favorites.map(id => id.toString()).includes(product.id.toString()) : false;

    const handleToggleFavorite = () => {
        toggleFavorite(product.id);
        setIsFavAnimating(true);
        setTimeout(() => setIsFavAnimating(false), 500);

        if (!isFavorite) {
            showToast('Ürün favorilere eklendi!', 'success');
        } else {
            showToast('Ürün favorilerden kaldırıldı.', 'info');
        }
    };

    const handleAcceptAlert = async () => {
        if (!currentUser) return;
        setIsSavingAlert(true);
        const result = await activateAlert({ id: product.id, name: product.name, price: product.price.current }, currentUser);
        setIsSavingAlert(false);
        setIsModalOpen(false);
        if (result.success) {
            showToast('Fiyat alarmı başarıyla kuruldu!', 'success');
        } else {
            showToast('Bir hata oluştu: ' + result.message, 'error');
        }
    };

    return (
        <div className="flex flex-col h-full font-sans">
            <PriceAlertModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAccept={handleAcceptAlert}
                isLoggedIn={!!currentUser}
                productName={product.name}
                isSaving={isSavingAlert}
            />
            {/* Brand & Badge */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col gap-1">
                    {productBrand?.logo ? (
                        <div className="h-10 bg-white border border-slate-100 rounded-lg p-1 px-2 shadow-sm">
                            <img src={productBrand.logo} alt={product.brand} className="h-full object-contain" />
                        </div>
                    ) : (
                        <span className="text-blue-600 font-bold text-sm tracking-wide bg-blue-50 px-2 py-1 rounded">
                            {product.brand || 'PREMIUM MARKA'}
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <div className="relative" ref={shareRef}>
                        <button
                            onClick={() => setIsShareOpen(!isShareOpen)}
                            className={`transition-colors ${isShareOpen ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600'} p-1 rounded-full`}
                        >
                            <Share2 className="w-5 h-5" />
                        </button>

                        {isShareOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 p-2 animate-fadeIn flex flex-col gap-1">
                                <button onClick={() => handleShare('whatsapp')} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors">
                                    <MessageCircle className="w-4 h-4" /> WhatsApp
                                </button>
                                <button onClick={() => handleShare('facebook')} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                                    <Facebook className="w-4 h-4" /> Facebook
                                </button>
                                <button onClick={() => handleShare('mail')} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
                                    <Mail className="w-4 h-4" /> E-Posta
                                </button>
                                <div className="h-px bg-slate-100 my-1"></div>
                                <button onClick={() => handleShare('copy')} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
                                    <Copy className="w-4 h-4" /> Linki Kopyala
                                </button>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleToggleFavorite}
                        className={`transition-colors ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''} ${isFavAnimating ? 'animate-ping' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
            </h1>

            {/* Rating */}
            {/* Rating & SKU */}
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mb-6">
                <div className="flex items-center gap-2">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => {
                            const reviewCount = totalReviews !== undefined ? totalReviews : (product.reviews || 0);
                            const effectiveRating = reviewCount > 0 ? product.rating : 0;
                            const isActive = i < Math.floor(effectiveRating);

                            return (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${isActive ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                                />
                            );
                        })}
                    </div>
                    <span
                        onClick={onReviewClick}
                        className="text-sm text-blue-600 font-medium hover:underline cursor-pointer"
                    >
                        {totalReviews !== undefined ? totalReviews : product.reviews} Değerlendirme
                    </span>
                </div>
                <span className="text-gray-300 hidden md:inline">|</span>
                <span className="text-sm text-gray-500">Kodu: {product.code || product.sku || 'TR-12345'}</span>
            </div>



            {/* Price Box - Compact Design */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl md:text-3xl font-bold text-blue-700">{product.price.current.toLocaleString('tr-TR')} TL</span>
                        {product.price.original > product.price.current && (
                            <span className="text-sm text-gray-400 line-through">{product.price.original.toLocaleString('tr-TR')} TL</span>
                        )}
                        <span className="text-[10px] text-gray-400 font-normal ml-1 self-end mb-1">KDV Dahil</span>
                    </div>

                    {/* Shipping Countdown */}
                    {(() => {
                        const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, isToday: false });

                        useEffect(() => {
                            const calculateTime = () => {
                                const now = new Date();
                                const target = new Date();
                                target.setHours(11, 0, 0, 0); // 11:00 AM

                                let isToday = true;
                                if (now > target) {
                                    target.setDate(target.getDate() + 1);
                                    isToday = false;
                                }

                                const diff = target.getTime() - now.getTime();
                                const hours = Math.floor(diff / (1000 * 60 * 60));
                                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                setTimeLeft({ hours, minutes, isToday });
                            };

                            calculateTime();
                            const timer = setInterval(calculateTime, 60000);
                            return () => clearInterval(timer);
                        }, []);

                        return (
                            <div className="flex items-center gap-3 bg-white border border-orange-100 rounded-lg px-6 py-2.5 shadow-sm relative overflow-hidden">
                                <div className="bg-orange-50 p-1.5 rounded-full ring-1 ring-orange-100 relative z-10">
                                    <Truck className="w-4 h-4 text-orange-600 animate-truck-delivery" />
                                </div>
                                <div className="flex flex-col relative z-10">
                                    <div className="text-[11px] text-gray-500 font-medium whitespace-nowrap flex items-center gap-1.5">
                                        <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-[10px] border border-orange-100">{timeLeft.hours} saat {timeLeft.minutes} dakika</span>
                                        <span>içinde sipariş ver</span>
                                    </div>
                                    <div className="text-xs font-bold text-gray-800 tracking-wide mt-0.5">
                                        {timeLeft.isToday ? 'BUGÜN KARGODA' : 'YARIN KARGODA'}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Active Campaigns - Animated Single Line */}
            {
                (() => {
                    const [currentCamp, setCurrentCamp] = useState(0);

                    const campaigns = [];
                    // 1. Sepette 2. Üründe İndirim
                    if (product?.id && discountInCartProductIds.map(d => d.toString()).includes(product.id.toString())) {
                        campaigns.push({ text: 'Sepette 2. Üründe İndirim', icon: <Percent className="w-5 h-5 text-orange-600" />, textCol: 'text-orange-600' });
                    }
                    // 2. Tükenmek Üzere
                    if ((product?.stock ?? 0) <= 3 && (product?.stock ?? 0) > 0) {
                        campaigns.push({ text: 'Tükenmek Üzere', icon: <Hourglass className="w-5 h-5 text-red-600" />, textCol: 'text-red-600' });
                    }
                    // 3. Avantajlı Fiyat Fırsatı
                    if (product.price.original > product.price.current) {
                        campaigns.push({ text: 'Avantajlı Fiyat Fırsatı', icon: <TrendingDown className="w-5 h-5 text-green-600" />, textCol: 'text-green-600' });
                    }


                    useEffect(() => {
                        if (campaigns.length <= 1) return;
                        const interval = setInterval(() => {
                            setCurrentCamp(prev => (prev + 1) % campaigns.length);
                        }, 3000);
                        return () => clearInterval(interval);
                    }, [campaigns.length]);

                    if (campaigns.length === 0) return null;

                    return (
                        <div className="mb-6 h-10 relative overflow-hidden bg-gray-50/50 rounded-lg border border-gray-100 flex items-center px-4">
                            <div key={currentCamp} className="animate-slide-up flex items-center gap-3 w-full">
                                {campaigns[Math.min(currentCamp, campaigns.length - 1)].icon}
                                <span className={`text-sm font-bold ${campaigns[Math.min(currentCamp, campaigns.length - 1)].textCol} tracking-tight`}>
                                    {campaigns[Math.min(currentCamp, campaigns.length - 1)].text}
                                </span>
                            </div>
                            <style>{`
                            @keyframes slide-up {
                                from { transform: translateY(100%); opacity: 0; }
                                to { transform: translateY(0); opacity: 1; }
                            }
                            .animate-slide-up {
                                animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                            }
                        `}</style>
                        </div>
                    );
                })()
            }



            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Qty */}
                <div className="flex items-center border border-gray-300 rounded-lg bg-white h-12 w-full md:w-auto justify-between md:justify-start px-2 md:px-0">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="flex-1 md:w-12 text-center font-semibold text-lg">{quantity}</span>
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-12 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* Buttons Wrapper */}
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                    {/* Add to Cart */}
                    <button
                        onClick={() => {
                            addItem({
                                id: product.id,
                                name: product.name,
                                price: product.price.current,
                                image: product.image,
                                quantity: quantity
                            });
                            openDrawer();
                        }}
                        className="group flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 active:scale-95 py-3.5 text-sm md:text-base overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out skew-y-12"></div>
                        <ShoppingCart className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
                        <span className="relative z-10 hidden sm:inline">SEPETE EKLE</span>
                        <span className="relative z-10 sm:hidden text-[13px] tracking-tighter">SEPETE EKLE</span>
                    </button>

                    {/* Buy Now - Hemen Al */}
                    <button
                        onClick={() => {
                            addItem({
                                id: product.id,
                                name: product.name,
                                price: product.price.current,
                                image: product.image,
                                quantity: quantity
                            });
                            navigate('/checkout');
                        }}
                        className="group flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:-translate-y-0.5 active:scale-95 py-3.5 text-sm md:text-base relative overflow-hidden"
                        title="Hemen Satın Al"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out skew-y-12"></div>
                        <span className="relative z-10 uppercase tracking-wide hidden sm:flex items-center gap-2">
                            Hemen Al <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <span className="relative z-10 uppercase tracking-tighter sm:hidden text-[13px]">HEMEN AL</span>
                    </button>
                    <style>{`
                        /* Özel smooth shadow */
                    `}</style>
                </div>
            </div>

            {/* Technical Specs */}
            <div className="mt-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-xs border-b pb-2 uppercase tracking-wide">
                    <Settings className="w-3.5 h-3.5 text-blue-600" />
                    Teknik Detaylar
                </h4>
                <div className="grid grid-cols-3 gap-3">
                    {/* Color - Gray/Dark Theme */}
                    <div className="group relative bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden hover:-translate-y-1">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gray-600 group-hover:bg-gray-800 transition-colors"></div>
                        <div className="flex flex-col items-center justify-center text-center relative z-10 pl-1">
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 group-hover:text-gray-800 transition-colors">Ürün Rengi</span>
                            <span className="font-bold text-gray-900 text-sm group-hover:scale-105 transition-transform origin-center">{product.specs?.color || "Standart"}</span>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-gray-100 rounded-full transition-transform group-hover:scale-150 z-0"></div>
                    </div>

                    {/* Shipping - Orange Theme */}
                    <div className="group relative bg-white p-3 rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden hover:-translate-y-1">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 group-hover:bg-orange-600 transition-colors"></div>
                        <div className="flex flex-col items-center justify-center text-center relative z-10 pl-1">
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 group-hover:text-orange-600 transition-colors">Sevkiyat Tipi</span>
                            <span className="font-bold text-gray-900 text-sm group-hover:scale-105 transition-transform origin-center">{product.specs?.shippingType || "Standart"}</span>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-orange-50 rounded-full transition-transform group-hover:scale-150 z-0"></div>
                    </div>

                    {/* Size - Blue Theme */}
                    <div className="group relative bg-white p-3 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden hover:-translate-y-1">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:bg-blue-600 transition-colors"></div>
                        <div className="flex flex-col items-center justify-center text-center relative z-10 pl-1">
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 group-hover:text-blue-600 transition-colors">Boyut / Ebat</span>
                            <span className="font-bold text-gray-900 text-sm group-hover:scale-105 transition-transform origin-center">{product.specs?.size || "Standart"}</span>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-blue-50 rounded-full transition-transform group-hover:scale-150 z-0"></div>
                    </div>
                </div>
            </div>

            {/* Extra Actions */}
            <div className="grid grid-cols-3 gap-3 mt-6">
                <button
                    onClick={handleToggleFavorite}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-200 bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-md"
                >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                    {isFavorite ? 'Listeden Çıkar' : 'Listeye Ekle'}
                </button>
                <button
                    onClick={onReviewClick}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-200 bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-md"
                >
                    <Star className="w-3.5 h-3.5" />
                    Yorum Yap
                </button>
                <button
                    onClick={handleToggleAlert}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-200 bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-md"
                >
                    <div className="relative">
                        <span className={`absolute -top-1 -right-1 flex h-2 w-2 ${currentUser && product?.id && isAlertActive(product.id.toString(), currentUser.id) ? '' : 'hidden'}`}>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        <Bell className={`w-3.5 h-3.5 ${currentUser && isAlertActive(product.id.toString(), currentUser.id) ? 'fill-current text-orange-500' : ''}`} />
                    </div>
                    {currentUser && product?.id && isAlertActive(product.id.toString(), currentUser.id) ? 'Alarm Aktif' : 'Fiyat Alarmı'}
                </button>
            </div>
        </div >
    );
};
