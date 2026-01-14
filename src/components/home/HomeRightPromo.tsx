import React from 'react';
import { ArrowRight } from 'lucide-react';

export const HomeRightPromo: React.FC = () => {
    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Promo Card 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex-1 flex flex-col justify-center items-center text-center shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-gray-800 mb-2">Günün Fırsatı</h4>
                <img
                    src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400"
                    alt="iPad"
                    className="w-24 h-24 object-contain mb-3"
                />
                <div className="text-sm text-gray-500 line-through">12.000 TL</div>
                <div className="text-xl font-bold text-red-600 mb-3">10.499 TL</div>
                <button className="w-full bg-blue-600 text-white py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
                    Hemen Al
                </button>
            </div>

            {/* Promo Card 2 */}
            {/* Promo Card 2 - Premium Banner */}
            <div className="relative rounded-xl overflow-hidden flex-1 flex flex-col justify-center shadow-lg group">
                <img
                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800"
                    alt="Premium"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-800/80"></div>

                <div className="relative z-10 p-6 text-white text-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">👑</span>
                    </div>
                    <h4 className="font-bold text-xl mb-1">Premium Üyelik</h4>
                    <p className="text-indigo-100 text-sm mb-4">Kargo bedava ve size özel ekstra indirimler!</p>
                    <button className="w-full bg-white text-indigo-900 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors text-sm flex items-center justify-center gap-2">
                        Detaylı Bilgi <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
