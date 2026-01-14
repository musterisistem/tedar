import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ProductCard } from '../common/ProductCard';
import { useProducts, type Product } from '../../context/ProductContext';

interface ProductSectionProps {
    title: string;
    linkText?: string;
    linkUrl?: string;
    className?: string; // Add optional className
    products?: Product[];
}

export const ProductSection: React.FC<ProductSectionProps> = ({ title, linkText = "Tümünü Gör", linkUrl = "#", className = "", products: propProducts }) => {
    const { products: contextProducts } = useProducts();

    // Optimize: Takes props OR slice of context products
    const displayProducts = React.useMemo(() => {
        if (propProducts) return propProducts;
        // If getting from context, take random 12
        return [...contextProducts]
            .sort(() => 0.5 - Math.random())
            .slice(0, 12);
    }, [propProducts, contextProducts]);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            const currentScroll = scrollContainerRef.current.scrollLeft;
            scrollContainerRef.current.scrollTo({
                left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Auto Scroll Logic
    React.useEffect(() => {
        const interval = setInterval(() => {
            if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

                // Reset if reached end
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                }
            }
        }, 5000); // Scroll every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <section className={`py-8 rounded-xl border border-gray-100 shadow-sm relative group overflow-hidden ${className || 'bg-white'}`}>
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        {title}
                        <div className="h-1 w-20 bg-blue-600 rounded-full ml-4 hidden sm:block"></div>
                    </h2>
                    <div className="flex items-center gap-4">
                        <a href={linkUrl} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 group/link">
                            {linkText} <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                        </a>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => scroll('left')} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors shadow-sm">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={() => scroll('right')} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors shadow-sm">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Carousel */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-6 overflow-x-auto -mx-4 px-4 scrollbar-hide snap-x"
                >
                    {displayProducts.map((product) => (
                        <div key={product.id} className="min-w-[240px] md:min-w-[280px] snap-start flex flex-col">
                            <ProductCard {...product} />
                        </div>
                    ))}
                    {displayProducts.length > 4 && displayProducts.map((product) => (
                        <div key={`${product.id}-dup`} className="min-w-[240px] md:min-w-[280px] snap-start flex flex-col">
                            <ProductCard {...product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
