import React from 'react';
import { ProductCard } from '../common/ProductCard';
import { useProducts, type Product } from '../../context/ProductContext';

export interface ProductGridProps {
    title: string;
    productCount: number;
    columns?: number;
    viewAllLink?: string;
    variant?: 'simple' | 'banded';
    headerClassName?: string;
    containerClassName?: string;
    headerStyle?: React.CSSProperties;
    products?: Product[]; // Optional prop to override context
}

export const ProductGrid: React.FC<ProductGridProps> = ({
    title,
    productCount,
    columns = 5,
    viewAllLink,
    variant = 'simple',
    headerClassName = "bg-blue-600",
    containerClassName = "",
    headerStyle,
    products: propProducts
}) => {
    const { products: contextProducts } = useProducts();
    const sourceProducts = propProducts || contextProducts;
    const displayProducts = sourceProducts.slice(0, productCount);

    const gridCols: { [key: number]: string } = {
        1: 'lg:grid-cols-1',
        2: 'lg:grid-cols-2',
        3: 'lg:grid-cols-3',
        4: 'lg:grid-cols-4',
        5: 'lg:grid-cols-5',
        6: 'lg:grid-cols-6',
        7: 'lg:grid-cols-7',
        8: 'lg:grid-cols-8',
        10: 'lg:grid-cols-10',
        12: 'lg:grid-cols-12',
    };

    const gridClass = gridCols[columns] || 'lg:grid-cols-4';

    if (variant === 'banded') {
        return (
            <section className={`rounded-xl overflow-hidden shadow-sm ${containerClassName}`}>
                {/* Band Header */}
                <div style={headerStyle} className={`${headerClassName} p-4 flex items-center justify-between shadow-md mb-6 -mx-4 -mt-4 sm:mx-0 sm:mt-0 sm:rounded-t-xl`}>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {title}
                    </h2>
                    {viewAllLink && (
                        <a href={viewAllLink} className="text-white/90 hover:text-white font-semibold text-sm transition-colors flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full hover:bg-white/20">
                            Tümünü Gör
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    )}
                </div>

                {/* Grid */}
                <div className={`grid grid-cols-2 md:grid-cols-3 ${gridClass} gap-6`}>
                    {displayProducts.map((product) => (
                        <div key={product.id} className="h-full">
                            <ProductCard {...product} />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        {title}
                        <div className="h-1 w-20 bg-blue-600 rounded-full ml-4 hidden sm:block"></div>
                    </h2>
                    {viewAllLink && (
                        <a href={viewAllLink} className="text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center gap-1">
                            Tümünü Gör
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    )}
                </div>

                {/* Grid */}
                <div className={`grid grid-cols-2 md:grid-cols-3 ${gridClass} gap-6`}>
                    {displayProducts.map((product) => (
                        <div key={product.id} className="h-full">
                            <ProductCard {...product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
