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
            {/* Promo Box Banner */}
            <div className={`relative overflow-hidden ${promoBox?.bgColor || 'bg-blue-600'} rounded-2xl p-6 text-center shadow-xl shadow-blue-900/10 group`}>
                {/* Decorative Circles */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 rounded-full blur-3xl group-hover:bg-black/20 transition-all duration-700"></div>

                <div className="relative z-10">
                    <div className={`${promoBox?.iconBgColor || 'bg-white/20'} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner rotate-3 group-hover:rotate-6 transition-transform duration-500`}>
                        <Icon className={`w-9 h-9 ${promoBox?.textColor || 'text-white'}`} />
                    </div>

                    <h4 className={`font-black ${promoBox?.textColor || 'text-white'} text-xl mb-2 tracking-tight`}>
                        {promoBox?.title || 'Fırsat'}
                    </h4>

                    <p className={`text-sm ${promoBox?.textColor || 'text-white'} opacity-90 mb-6 font-medium leading-relaxed`}>
                        {promoBox?.description}
                    </p>

                    <div className={`${promoBox?.btnBgColor || 'bg-white'} ${promoBox?.btnTextColor || 'text-blue-600'} text-sm font-black py-3 px-6 rounded-xl inline-block shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all cursor-pointer`}>
                        {promoBox?.buttonText || 'İncele'}
                    </div>
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
