import React, { useMemo } from 'react';
import { ProductGrid, type ProductGridProps } from './ProductGrid';
import { useProducts, type Product } from '../../context/ProductContext';

// We need to extend ProductGridProps but exclude 'products' from required (though it is optional there)
// and add our own configuration
interface HomeProductSectionProps extends Omit<ProductGridProps, 'products'> {
    type: 'new-arrivals' | 'collection';
    collectionId?: string;
    shuffle?: boolean;
    products?: Product[]; // Allow override
}

export const HomeProductSection: React.FC<HomeProductSectionProps> = ({
    type,
    collectionId,
    shuffle = false,
    products: propProducts,
    ...gridProps
}) => {
    const { products, homeCollections } = useProducts();

    const displayProducts = useMemo(() => {
        if (propProducts) return propProducts;

        let result: Product[] = [];

        if (type === 'new-arrivals') {
            const tenDaysAgo = new Date();
            tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

            const recentProducts = products.filter(p => {
                if (!p.createdAt) return false;
                return new Date(p.createdAt) > tenDaysAgo;
            });
            result = recentProducts;
        }
        else if (type === 'collection' && collectionId) {
            const col = homeCollections.find(c => c.id === collectionId);
            if (col && col.productIds) {
                result = products.filter(p => col.productIds?.includes(p.id));
            }
        }

        // Shuffle logic
        if (shuffle) {
            result = [...result].sort(() => 0.5 - Math.random());
        }

        // Slice is handled by ProductGrid?
        // ProductGrid does slice(0, productCount).
        // But if we shuffle, we must shuffle BEFORE passing to ProductGrid (which slices first N).
        // ProductGrid implementation: const displayProducts = sourceProducts.slice(0, productCount);
        // So passing full shuffled array is fine.

        return result;
    }, [products, type, collectionId, homeCollections, propProducts, shuffle]);

    return (
        <ProductGrid
            {...gridProps}
            products={displayProducts}
        />
    );
};
