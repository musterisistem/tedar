import React from 'react';
import { Truck, Percent, Zap, Shield, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import { useProducts } from '../../context/ProductContext';
import { slugify } from '../../utils/slugify';

export const SiteSidebar: React.FC = () => {
    const { promoBox } = useSite();
    const { products, discountInCartProductIds } = useProducts();
    const navigate = useNavigate();

    // Filter managed products and limit to 5
    const discountProducts = (products || [])
        .filter(p => (discountInCartProductIds || []).includes(p.id))
        .slice(0, 5);

    const iconMap = {
        Truck,
        Zap,
        Shield,
        Star
    };

    const Icon = (promoBox && iconMap[promoBox.icon as keyof typeof iconMap]) ? iconMap[promoBox.icon as keyof typeof iconMap] : Truck;

    return (
        <div className="space-y-6">
            {/* Promo Box Banner - Modern Redesign */}
            <div className={`relative overflow-hidden ${promoBox?.bgColor || 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800'} rounded-3xl shadow-2xl group`}>
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
                        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-yellow-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
                    </div>
                </div>

                {/* Optional Image Section */}
                {promoBox?.image && (
                    <div className="relative h-40 overflow-hidden">
                        <img
                            src={promoBox.image}
                            alt={promoBox.title}
                            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/50"></div>
                    </div>
                )}

                {/* Content Section */}
                <div className="relative z-10 p-6 text-center">
                    {/* Icon with Animated Ring */}
                    <div className="relative inline-block mb-5">
                        <div className={`${promoBox?.iconBgColor || 'bg-white/20'} backdrop-blur-sm w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-500`}>
                            <Icon className={`w-10 h-10 ${promoBox?.textColor || 'text-white'} drop-shadow-lg`} />
                        </div>
                        {/* Animated Ring */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-ping"></div>
                    </div>

                    {/* Title */}
                    <h4 className={`font-black ${promoBox?.textColor || 'text-white'} text-2xl mb-3 tracking-tight drop-shadow-lg`}>
                        {promoBox?.title || 'Fırsat'}
                    </h4>

                    {/* Description */}
                    <p className={`text-base ${promoBox?.textColor || 'text-white'} opacity-95 mb-6 font-semibold leading-relaxed max-w-sm mx-auto drop-shadow-md`}>
                        {promoBox?.description}
                    </p>

                    {/* Premium Button */}
                    <button
                        onClick={() => navigate('/ayni-gun-kargo')}
                        className={`${promoBox?.btnBgColor || 'bg-white'} ${promoBox?.btnTextColor || 'text-blue-600'} text-base font-black py-4 px-8 rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95 transition-all duration-300`}
                    >
                        {promoBox?.buttonText || 'İncele'}
                    </button>

                    {/* Decorative Elements */}
                    <div className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-400/20 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl"></div>
                </div>
            </div>

            {/* Discount In Cart Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white flex items-center gap-2">
                    <Percent className="w-5 h-5" />
                    <span className="font-bold">Sepette İndirim</span>
                </div>
                <div className="p-4 space-y-4">
                    {discountProducts.length > 0 ? (
                        discountProducts.map((product) => (
                            <div key={product.id} className="flex gap-3 group cursor-pointer border-b border-gray-50 last:border-0 pb-3 last:pb-0" onClick={() => navigate(`/${slugify(product.name)}`)}>
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 bg-white p-1">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="flex-1">
                                    <h5 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
                                        {product.name}
                                    </h5>
                                    <div className="text-xs text-green-600 font-bold bg-green-50 inline-block px-1.5 py-0.5 rounded mb-1">
                                        Sepette İndirimli
                                    </div>
                                    <div className="font-bold text-red-600">
                                        {product.price.current.toLocaleString('tr-TR')} TL
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 py-4 text-sm">Ürün bulunamadı.</p>
                    )}
                </div>

                {/* See All Button */}
                <div className="p-4 pt-0">
                    <button
                        onClick={() => navigate('/outlet')}
                        className="w-full py-2.5 bg-slate-50 text-slate-600 text-sm font-bold rounded-lg border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                    >
                        Tüm İndirimli Ürünleri Gör
                    </button>
                </div>
            </div>
        </div>
    );
};
