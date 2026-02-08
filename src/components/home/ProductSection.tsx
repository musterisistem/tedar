import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ProductCard } from '../common/ProductCard';
import { useProducts, type Product } from '../../context/ProductContext';

interface ProductSectionProps {
    title: string;
    linkText?: string;
    linkUrl?: string;
    className?: string;
    products?: Product[];
    columns?: number;
}

export const ProductSection: React.FC<ProductSectionProps> = ({ title, linkText = "Tümünü Gör", linkUrl = "#", className = "", products: propProducts, columns = 4 }) => {
    const { products: contextProducts } = useProducts();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isTransitioning, setIsTransitioning] = useState(true);

    // Get display products
    const baseProducts = React.useMemo(() => {
        if (propProducts) return propProducts;
        return [...contextProducts]
            .sort(() => 0.5 - Math.random())
            .slice(0, 12);
    }, [propProducts, contextProducts]);

    // Duplicate products for infinite scroll
    const displayProducts = React.useMemo(() => {
        if (baseProducts.length === 0) return [];
        return [...baseProducts, ...baseProducts, ...baseProducts];
    }, [baseProducts]);

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

    // Infinite scroll logic
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || baseProducts.length === 0) return;

        const handleScroll = () => {
            const { scrollLeft, scrollWidth } = container;
            const sectionWidth = scrollWidth / 3;

            // If scrolled to end of second section, jump to start of second section
            if (scrollLeft >= sectionWidth * 2 - 10) {
                setIsTransitioning(false);
                container.scrollLeft = sectionWidth;
                requestAnimationFrame(() => {
                    setIsTransitioning(true);
                });
            }
            // If scrolled before first section, jump to end of first section
            else if (scrollLeft <= 10) {
                setIsTransitioning(false);
                container.scrollLeft = sectionWidth;
                requestAnimationFrame(() => {
                    setIsTransitioning(true);
                });
            }
        };

        container.addEventListener('scroll', handleScroll);
        // Start in the middle section
        container.scrollLeft = container.scrollWidth / 3;

        return () => container.removeEventListener('scroll', handleScroll);
    }, [baseProducts]);

    // Auto scroll
    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    if (baseProducts.length === 0) return null;

    return (
        <section className={`py-8 rounded-xl border border-gray-100 shadow-sm relative group/section overflow-hidden ${className || 'bg-white'}`}>
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
                        <div className="flex gap-2">
                            <button onClick={() => scroll('left')} className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={() => scroll('right')} className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Carousel */}
                <div
                    ref={scrollContainerRef}
                    className={`flex gap-4 overflow-x-auto -mx-4 px-4 scrollbar-hide ${isTransitioning ? 'scroll-smooth' : ''}`}
                    style={{ scrollBehavior: isTransitioning ? 'smooth' : 'auto' }}
                >
                    {displayProducts.map((product, index) => (
                        <div
                            key={`${product.id}-${index}`}
                            className="flex-shrink-0 w-[180px] xs:w-[200px] sm:w-[240px] md:w-[280px] lg:w-auto"
                            style={{
                                width: window.innerWidth >= 1024 ? `calc((100% - ${(columns - 1) * 16}px) / ${columns})` : undefined
                            }}
                        >
                            <ProductCard {...product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
