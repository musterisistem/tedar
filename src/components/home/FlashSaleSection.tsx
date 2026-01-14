import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { ProductCard } from '../common/ProductCard';
import { useProducts } from '../../context/ProductContext';

export const FlashSaleSection: React.FC = () => {
    const { products, flashProductIds } = useProducts();
    const [timeLeft, setTimeLeft] = useState({ days: 10, hours: 0, minutes: 0, seconds: 0 });
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(true);

    // Get selected flash products
    const flashProducts = products.filter(p => (flashProductIds || []).includes(p.id));
    const displayCount = flashProducts.length;
    const duplicatedProducts = displayCount > 0 ? [...flashProducts, ...flashProducts] : [];

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (isHovered) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => prev + 1);
        }, 3000);

        return () => clearInterval(interval);
    }, [isHovered]);

    useEffect(() => {
        if (currentIndex === displayCount) {
            const timeout = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(0);
            }, 500);
            return () => clearTimeout(timeout);
        }
        if (currentIndex === 0) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setIsTransitioning(true));
            });
        }
    }, [currentIndex]);

    if (flashProducts.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-red-600 to-orange-600 pt-4 pb-8 rounded-xl shadow-lg my-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2.5px)', backgroundSize: '20px 20px' }}></div>

            <div className="container mx-auto px-4 relative z-10 w-full overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 text-white">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm animate-pulse">
                            <Clock className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold uppercase tracking-wider">Flaş Ürünler</h3>
                            <p className="text-red-100 text-sm">Sınırlı Stok, Kaçırma!</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {[
                            { label: 'GÜN', value: timeLeft.days },
                            { label: 'SAAT', value: timeLeft.hours.toString().padStart(2, '0') },
                            { label: 'DAKİKA', value: timeLeft.minutes.toString().padStart(2, '0') },
                            { label: 'SANİYE', value: timeLeft.seconds.toString().padStart(2, '0') }
                        ].map((item, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div className="bg-white text-red-600 font-bold text-2xl w-16 h-16 rounded-lg flex items-center justify-center shadow-lg mb-1">
                                    {item.value}
                                </div>
                                <span className="text-[10px] font-bold text-red-100 uppercase tracking-widest">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    className="relative w-full overflow-hidden"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div
                        className="flex gap-4 transition-transform ease-in-out"
                        style={{
                            transform: `translateX(-${currentIndex * 196}px)`,
                            transitionDuration: isTransitioning ? '500ms' : '0ms'
                        }}
                    >
                        {duplicatedProducts.map((product, index) => (
                            <div
                                key={`${product.id}-${index}`}
                                className="w-[180px] flex-shrink-0 bg-white rounded-lg p-2 hover:shadow-xl transition-shadow duration-300"
                            >
                                <ProductCard
                                    {...product}
                                    hideBadges={true}
                                    buttonText="Fırsatı Yakala"
                                    limitedStock={true}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
