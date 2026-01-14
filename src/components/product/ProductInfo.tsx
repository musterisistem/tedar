import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, Share2, Minus, Plus, ShoppingCart, Settings, Percent, ChevronRight, Facebook, Mail, MessageCircle, Copy } from 'lucide-react';
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
    const isSepetteIndirim = discountInCartProductIds.map(d => d.toString()).includes(product.id.toString());
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

        if (isAlertActive(product.id.toString(), currentUser.id)) {
            showToast('Fiyat alarmı bu ürün için zaten aktif.', 'info');
            return;
        }

        setIsModalOpen(true);
    };

    const isFavorite = favorites.map(id => id.toString()).includes(product.id.toString());

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
                    <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
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

            {/* Popular Product Notification */}
            {(() => {
                // Deterministic random based on product ID
                const hashCode = (str: string) => {
                    let hash = 0;
                    for (let i = 0; i < str.length; i++) {
                        const char = str.charCodeAt(i);
                        hash = (hash << 5) - hash + char;
                        hash = hash & hash; // Convert to 32bit integer
                    }
                    return Math.abs(hash);
                };

                const productIdStr = product.id.toString();
                const hash = hashCode(productIdStr);

                // 20% chance to show (if hash % 5 === 0)
                const shouldShow = hash % 5 === 0;

                // Random count between 500-1500
                const viewCount = 500 + (hash % 1001);

                if (shouldShow) {
                    return (
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-lg animate-bounce">🔥</span>
                            <div className="text-sm text-gray-700">
                                <span className="font-bold text-orange-600">Popüler ürün!</span> Son 24 saatte <span className="font-bold text-red-600 inline-block animate-pulse">{viewCount}</span> kişi görüntüledi!
                            </div>
                        </div>
                    );
                }
                return null;
            })()}

            {/* Price Box */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-4">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2 flex-wrap">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl md:text-4xl font-bold text-blue-700">{product.price.current.toLocaleString('tr-TR')} TL</span>
                        {product.price.original > product.price.current && (
                            <span className="text-sm text-gray-400 line-through">{product.price.original.toLocaleString('tr-TR')} TL</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {isSepetteIndirim && (
                            <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                                <Percent className="w-3 h-3" /> Sepette İndirimli
                            </span>
                        )}
                        {/* Aynı Gün Kargo Bildirimi - Dikkat Çekici */}
                        {product.sameDayShipping && (() => {
                            const now = new Date();
                            const cutoffHour = 11;
                            const currentHour = now.getHours();
                            const currentMinute = now.getMinutes();
                            const isBeforeCutoff = currentHour < cutoffHour;

                            if (isBeforeCutoff) {
                                const hoursLeft = cutoffHour - currentHour - 1;
                                const minutesLeft = 60 - currentMinute;

                                return (
                                    <div className="w-full mt-3 bg-teal-50 border border-teal-200 rounded-lg px-4 py-2.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                                    </svg>
                                                </div>
                                                <div className="text-sm">
                                                    <div className="font-semibold text-teal-700">Bugün Kargoda</div>
                                                    <div className="text-teal-600 text-xs">Hemen sipariş ver, bugün gönderelim</div>
                                                </div>
                                            </div>
                                            <div className="text-right bg-teal-100 px-2 py-1 rounded-md">
                                                <div className="text-[10px] text-teal-500 uppercase tracking-wider">Kalan Süre</div>
                                                <div className="font-semibold text-sm text-teal-700 tabular-nums">
                                                    {hoursLeft > 0 ? `${hoursLeft} saat ${minutesLeft} dk` : `${minutesLeft} dakika`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="w-full mt-3 bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 text-slate-600 text-sm flex items-center gap-2">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Yarın saat <strong>11:00</strong>'e kadar sipariş ver, aynı gün kargoda</span>
                                    </div>
                                );
                            }
                        })()}
                    </div>
                </div>
            </div>

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
                        <span className="relative z-10 sm:hidden">SEPET</span>
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
                        <span className="relative z-10 uppercase tracking-wide sm:hidden">AL</span>
                    </button>
                    <style>{`
                        /* Özel smooth shadow */
                    `}</style>
                </div>
            </div>

            {/* Extra Actions */}
            <div className="grid grid-cols-3 gap-3 mb-8">
                <button
                    onClick={handleToggleFavorite}
                    className={`flex items-center justify-center gap-2 py-2 border rounded-lg text-xs font-semibold transition-colors ${isFavorite
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                        }`}
                >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'Listeden Çıkar' : 'Listeye Ekle'}
                </button>
                <button
                    onClick={onReviewClick}
                    className="flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                >
                    <Star className="w-3.5 h-3.5" />
                    Yorum Yap
                </button>
                <button
                    onClick={handleToggleAlert}
                    className={`flex items-center justify-center gap-2 py-2 border rounded-lg text-xs font-semibold transition-colors ${currentUser && isAlertActive(product.id.toString(), currentUser.id) ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}
                >
                    <div className="relative">
                        <span className={`absolute -top-1 -right-1 flex h-2 w-2 ${currentUser && isAlertActive(product.id.toString(), currentUser.id) ? '' : 'hidden'}`}>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <Settings className="w-3.5 h-3.5" />
                    </div>
                    Fiyat Alarmı
                </button>
            </div>

            {/* Technical Specs */}
            <div className="mt-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-xs border-b pb-2 uppercase tracking-wide">
                    <Settings className="w-3.5 h-3.5 text-blue-600" />
                    Teknik Detaylar
                </h4>
                <div className="grid grid-cols-3 gap-3">
                    <div className="group relative bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gray-700 to-gray-900"></div>
                        <div className="flex flex-col items-center justify-center text-center relative z-10 pl-1">
                            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold mb-1 group-hover:text-blue-600 transition-colors">Ürün Rengi</span>
                            <span className="font-bold text-gray-800 text-sm group-hover:scale-110 transition-transform origin-center">{product.specs?.color || "Standart"}</span>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 opacity-5 group-hover:opacity-10 rounded-full transition-opacity"></div>
                    </div>

                    <div className="group relative bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600"></div>
                        <div className="flex flex-col items-center justify-center text-center relative z-10 pl-1">
                            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold mb-1 group-hover:text-blue-600 transition-colors">Sevkiyat Tipi</span>
                            <span className="font-bold text-gray-800 text-sm group-hover:scale-110 transition-transform origin-center">{product.specs?.shippingType || "Standart"}</span>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 opacity-5 group-hover:opacity-10 rounded-full transition-opacity"></div>
                    </div>

                    <div className="group relative bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-purple-600"></div>
                        <div className="flex flex-col items-center justify-center text-center relative z-10 pl-1">
                            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold mb-1 group-hover:text-blue-600 transition-colors">Boyut / Ebat</span>
                            <span className="font-bold text-gray-800 text-sm group-hover:scale-110 transition-transform origin-center">{product.specs?.size || "Standart"}</span>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 opacity-5 group-hover:opacity-10 rounded-full transition-opacity"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
