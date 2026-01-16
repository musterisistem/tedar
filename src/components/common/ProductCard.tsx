import React from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { useUsers } from '../../context/UserContext';
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
    id, name, price, image, rating, reviews, badges,
    hideBadges = false,
    buttonText = "Sepete Ekle",
    limitedStock = false
}) => {
    const { addItem, openDrawer } = useCart();
    const { discountInCartProductIds, products } = useProducts();
    const { favorites, toggleFavorite } = useUsers();

    const isFavorite = favorites.map(f => f.toString()).includes(id.toString());

    const isSepetteIndirim = discountInCartProductIds.map(d => d.toString()).includes(id.toString());
    const productData = products.find(p => p.id.toString() === id.toString());
    const isSameDayShipping = productData?.sameDayShipping ?? false;

    return (
        <div className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full">
            {/* Full Card Link overlay */}
            <Link to={`/${slugify(name)}`} className="absolute inset-0 z-0" aria-label={name} />

            {/* Badges */}
            {!hideBadges && (
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {badges?.map((badge, index) => (
                        <span key={index} className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {badge.toUpperCase()}
                        </span>
                    ))}
                    {isSepetteIndirim && (
                        <span className="bg-green-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                            SEPETTE İNDİRİMLİ
                        </span>
                    )}
                </div>
            )}

            {/* Image */}
            <div className="block mb-4 overflow-hidden rounded-md relative aspect-square">
                <img
                    src={image}
                    alt={name}
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {/* Bugün Kargoda Badge */}
                {isSameDayShipping && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-600 to-emerald-500 text-white text-[10px] font-semibold py-1.5 text-center flex items-center justify-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Bugün Kargoda
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col pointer-events-none">
                {/* Limited Stock Label */}
                {limitedStock && (
                    <div className="mb-2 pointer-events-auto">
                        <span className="inline-block bg-red-100 text-red-600 text-[10px] font-extrabold px-2 py-1 rounded animate-pulse border border-red-200 uppercase tracking-wider">
                            🔥 Sınırlı Stok
                        </span>
                    </div>
                )}

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => {
                            const reviewCount = productData?.reviewItems?.length ?? reviews ?? 0;

                            const effectiveRating = reviewCount > 0
                                ? (productData?.reviewItems?.length
                                    ? (productData.reviewItems.reduce((a, b) => a + b.rating, 0) / productData.reviewItems.length)
                                    : (productData?.rating ?? rating ?? 0))
                                : 0; // Force 0 if no reviews

                            const isActive = i < Math.round(effectiveRating);

                            return (
                                <Star
                                    key={i}
                                    className={`w-3 h-3 ${isActive ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                />
                            );
                        })}
                    </div>
                    <span className="text-xs text-gray-400">({productData?.reviewItems?.length ?? reviews})</span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 line-clamp-2 mb-3 bg-white flex-grow transition-colors">
                    {name}
                </h3>

                {/* Price */}
                <div className="mt-auto flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            {price.original > price.current && (
                                <div className="text-xs text-gray-400 line-through">
                                    {price.original.toLocaleString('tr-TR')} {price.currency}
                                </div>
                            )}
                            <span className="text-xs text-gray-400 font-medium">KDV Dahil</span>
                        </div>
                        <div className="text-xl font-bold text-blue-700">
                            {price.current.toLocaleString('tr-TR')} <span className="text-sm font-normal">{price.currency}</span>
                        </div>
                    </div>
                    {/* Heart Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(id);
                        }}
                        className={`p-2 rounded-full shadow-sm transition-colors relative z-10 pointer-events-auto ${isFavorite
                            ? 'bg-red-50 text-red-500 hover:bg-red-100'
                            : 'bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50'
                            }`}
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                </div>

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // Stop propagation to prevent navigation
                        addItem({ id: id.toString(), name, price: price.current, image, quantity: 1 });
                        openDrawer();
                    }}
                    className={`w-full mt-3 ${limitedStock
                        ? 'bg-red-600 hover:bg-red-700 shadow-red-100'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                        } text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 relative z-10 pointer-events-auto`}>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{buttonText}</span>
                </button>
            </div>
        </div >
    );
}); // End memo
