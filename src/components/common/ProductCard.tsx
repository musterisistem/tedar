import React from 'react';
import { Star, Heart, ShoppingCart, Percent, Hourglass, TrendingDown, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useProducts } from '../../context/ProductContext';
import { useUsers } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';
import { slugify } from '../../utils/slugify';

interface ProductProps {
    id: number | string;
    name: string;
    price: { current: number; original: number; currency: string };
    discount?: number;
    image: string;
    rating: number;
    reviews: number;
    badges?: string[];
    hideBadges?: boolean;
    buttonText?: string;
    limitedStock?: boolean;
}

export const ProductCard = React.memo<ProductProps>(({
    id, name, price, image, rating, reviews,
    // badges - unused

    buttonText,
    limitedStock,
}) => {

    const { discountInCartProductIds, products } = useProducts();
    const { favorites, toggleFavorite } = useUsers();
    const { addItem, openDrawer } = useCart();

    // Image switching state
    const productData = products.find(p => p.id.toString() === id.toString());
    const productImages = productData?.images && productData.images.length > 0 ? productData.images : [image];
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

    const isFavorite = favorites.map(f => f.toString()).includes(id.toString());
    const isSepetteIndirim = discountInCartProductIds.map(d => d.toString()).includes(id.toString());

    // Low Stock Logic (Threshold: 3)
    const isLowStock = (productData?.stock ?? 0) <= 3 && (productData?.stock ?? 0) > 0;



    // Handle image switching on hover move
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (productImages.length <= 1) return;

        const { left, width } = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - left;
        const index = Math.min(
            Math.floor((x / width) * productImages.length),
            productImages.length - 1
        );
        setCurrentImageIndex(index);
    };

    const handleMouseLeave = () => {
        setCurrentImageIndex(0);
    };

    return (
        <div className="group/card bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-2xl transition-shadow duration-300 relative flex flex-col h-full overflow-hidden">
            {/* Full Card Link overlay */}
            <Link to={`/${slugify(name)}`} className="absolute inset-0 z-0" aria-label={name} />

            {/* Action Buttons (Top Right) - Hover Only with Slide-in Animation */}
            <div className={`absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 translate-x-4 group-hover/card:opacity-100 group-hover/card:translate-x-0 transition-all duration-300 ease-out ${buttonText ? 'min-w-[140px]' : ''}`}>
                {/* Favorite Button */}
                <div className="relative group/btn">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(id);
                        }}
                        className={`p-2 rounded-full shadow-md transition-all duration-300 hover:scale-110 
                            ${buttonText
                                ? 'w-full flex items-center justify-center gap-2 !rounded-lg text-xs font-bold bg-white text-gray-600 hover:bg-gray-100 hover:text-red-500'
                                : `bg-white ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`
                            }`}
                    >
                        {buttonText ? (
                            <>
                                <span>Favorilere Ekle</span>
                                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                            </>
                        ) : (
                            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                        )}
                    </button>
                    {/* Tooltip - Hide if buttonText is present */}
                    {!buttonText && (
                        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                            Ürünü favorilerime ekle
                        </div>
                    )}
                </div>

                {/* Add to Cart Button */}
                <div className="relative group/btn">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem({
                                id: id.toString(),
                                name: name,
                                price: price.current,
                                image: image,
                                quantity: 1
                            });
                            openDrawer();
                        }}
                        className={`p-2 rounded-full shadow-md text-gray-400 hover:text-blue-600 transition-all duration-300 hover:scale-110 
                            ${buttonText
                                ? 'w-full flex items-center justify-center gap-2 !rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 hover:text-white'
                                : 'bg-white'
                            }`}
                    >
                        {buttonText ? (
                            <>
                                <span>{buttonText}</span>
                                <ShoppingCart className="w-4 h-4" />
                            </>
                        ) : (
                            <ShoppingCart className="w-5 h-5" />
                        )}
                    </button>
                    {/* Tooltip - Hide if buttonText is present */}
                    {!buttonText && (
                        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                            Sepete Ekle
                        </div>
                    )}
                </div>
            </div>

            {/* Image Area - Full Width */}
            <div
                className="relative aspect-[3/4] bg-white overflow-hidden"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <img
                    src={productImages[currentImageIndex] || image}
                    alt={name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500"
                />

                {/* Dynamic Notification Slider - Orange/Red Gradient */}
                {(() => {
                    const notifications = [];
                    // 1. Sepette 2. Üründe İndirim
                    if (isSepetteIndirim) notifications.push({ key: 'discount', text: 'Sepette 2. Üründe İndirim', icon: <Percent className="w-3 h-3" /> });
                    // 2. Tükenmek Üzere
                    if (isLowStock) notifications.push({ key: 'stock', text: 'Tükenmek Üzere', icon: <Hourglass className="w-3 h-3" /> });
                    // 3. Avantajlı Fiyat Fırsatı
                    if (price.original > price.current) notifications.push({ key: 'price', text: 'Avantajlı Fiyat Fırsatı', icon: <TrendingDown className="w-3 h-3" /> });


                    if (notifications.length === 0) return null;

                    const [currentNotif, setCurrentNotif] = React.useState(0);

                    React.useEffect(() => {
                        if (notifications.length <= 1) return;
                        const interval = setInterval(() => {
                            setCurrentNotif(prev => (prev + 1) % notifications.length);
                        }, 3000);
                        return () => clearInterval(interval);
                    }, [notifications.length]);

                    return (
                        <div className="absolute bottom-0 left-0 right-0 h-[22px] bg-gradient-to-r from-orange-500 to-red-600 z-10 overflow-hidden flex items-center justify-center">
                            <div key={notifications[currentNotif].key} className="animate-slide-up text-white text-[10px] font-medium tracking-wide px-2 text-center w-full flex items-center justify-center gap-1.5 h-full">
                                {notifications[currentNotif].icon}
                                <span className="pt-[1px]">{notifications[currentNotif].text}</span>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Content Area - With Padding */}
            <div className="flex-1 flex flex-col p-3 pointer-events-none relative z-10">






                {/* Product Name - Normal Weight */}
                <h3 className="text-sm font-normal text-gray-900 group-hover/card:text-blue-600 line-clamp-2 mb-2 leading-snug transition-colors">
                    {productData?.brand && <span className="font-semibold">{productData.brand} </span>}
                    {name}
                </h3>

                {/* Rating & Review Count */}
                <div className="flex flex-col gap-1 mb-2">
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => {
                                const reviewCount = productData?.reviewItems?.length ?? reviews ?? 0;
                                const effectiveRating = reviewCount > 0
                                    ? (productData?.reviewItems?.length
                                        ? (productData.reviewItems.reduce((a, b) => a + b.rating, 0) / productData.reviewItems.length)
                                        : (productData?.rating ?? rating ?? 0))
                                    : 0;

                                const isActive = i < Math.round(effectiveRating);

                                return (
                                    <Star
                                        key={i}
                                        className={`w-3 h-3 ${isActive ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                    />
                                );
                            })}
                        </div>
                        {/* Review Count Text - Smaller & Thinner */}
                        <span className="text-[9px] text-gray-400 font-light">
                            ({(productData?.reviewItems?.length ?? reviews) > 0 ? (productData?.reviewItems?.length ?? reviews) : 0} değerlendirme)
                        </span>
                    </div>

                    {/* Stock Bar for Limited Stock (Flash Sale) */}
                    {limitedStock && (
                        <div className="mt-1">
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-red-500 h-full rounded-full" style={{ width: `${Math.max(10, Math.min(90, (productData?.stock || 0) * 5))}%` }}></div>
                            </div>
                            <div className="text-[9px] text-gray-500 flex justify-between mt-0.5 font-medium">
                                <span>Stokta: {productData?.stock || 0}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Animated Fast Delivery Notification (Between Rating and Price) */}
                {(() => {
                    const now = new Date();
                    const currentHour = now.getHours();
                    const currentMinute = now.getMinutes();

                    // Show only between 00:01 and 10:59 (hide from 11:00 onwards)
                    const shouldShowFastDelivery = currentHour < 11 || (currentHour === 0 && currentMinute >= 1);

                    if (!shouldShowFastDelivery) return null;

                    return (
                        <div className="h-4 overflow-hidden relative mt-1 mb-0.5 w-full">
                            <div className="animate-slide-up-loop flex items-center justify-start gap-1.5 text-green-600 absolute inset-0 w-full">
                                <Truck className="w-3 h-3 text-green-600" />
                                <span className="text-[10px] font-bold leading-none pt-0.5 text-green-700">Hızlı Teslimat</span>
                            </div>
                        </div>
                    );
                })()}

                {/* Price Area - Below Rating */}
                <div className="mt-auto">
                    <div className="flex flex-col">
                        <div className="text-xl font-bold text-orange-600 tracking-tight leading-none flex items-baseline gap-1">
                            {price.current.toLocaleString('tr-TR')} <span className="text-sm font-semibold">{price.currency}</span>
                            {price.original > price.current && (
                                <span className="text-xs text-gray-400 line-through font-normal ml-1">
                                    {price.original.toLocaleString('tr-TR')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS Animation Styles */}
            <style>{`
                @keyframes slide-up-loop {
                    0% {
                        transform: translateY(100%);
                    }
                    10%, 90% {
                        transform: translateY(0);
                    }
                    100% {
                        transform: translateY(-100%);
                    }
                }
                .animate-slide-up-loop {
                    animation: slide-up-loop 3s ease-in-out infinite;
                }
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.5s ease-out forwards;
                }
            `}</style>
        </div >
    );
}); // End memo
