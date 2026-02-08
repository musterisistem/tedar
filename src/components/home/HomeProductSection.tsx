import React, { useMemo } from 'react';
import { ProductGrid, type ProductGridProps } from './ProductGrid';
import { useProducts, type Product } from '../../context/ProductContext';

// We need to extend ProductGridProps but exclude 'products' from required (though it is optional there)
// and add our own configuration
interface HomeProductSectionProps extends Omit<ProductGridProps, 'products'> {
    type: 'new-arrivals' | 'collection';
    collectionId?: string;
    shuffle?: boolean;
    shuffleDaily?: boolean; // New prop for 24h rotation
    maxProducts?: number; // Limit number of products displayed
    products?: Product[]; // Allow override
}

export const HomeProductSection: React.FC<HomeProductSectionProps> = ({
    type,
    collectionId,
    shuffle = false,
    shuffleDaily = false,
    maxProducts,
    products: propProducts,
    ...gridProps
}) => {
    const { products, homeCollections } = useProducts();

    const displayProducts = useMemo(() => {
        if (propProducts) return propProducts;

        let result: Product[] = [];

        if (type === 'new-arrivals') {
            const tenDaysAgo = new Date();
            tenDaysAgo.setDate(tenDaysAgo.getDate() - 30); // Extended to 30 days to ensure enough products

            const recentProducts = products.filter(p => {
                if (!p.createdAt) return false;
                return new Date(p.createdAt) > tenDaysAgo;
            });
            // If not enough new products, take latest added
            result = recentProducts.length >= 10 ? recentProducts : [...products].sort((a, b) => {
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            }).slice(0, 20);
        }
        else if (type === 'collection' && collectionId) {
            const col = homeCollections.find(c => c.id === collectionId);
            if (col && col.productIds) {
                result = products.filter(p => col.productIds?.includes(p.id));
            }
        }

        // Shuffle logic
        if (shuffleDaily) {
            // Seed based on YYYY-MM-DD
            const today = new Date().toISOString().slice(0, 10);
            let seed = Array.from(today).reduce((acc, char) => acc + char.charCodeAt(0), 0);

            // Simple fast PRNG (Mulberry32 or similar simple version)
            const random = () => {
                var t = seed += 0x6D2B79F5;
                t = Math.imul(t ^ t >>> 15, t | 1);
                t ^= t + Math.imul(t ^ t >>> 7, t | 61);
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            };

            result = [...result].sort(() => 0.5 - random());
        } else if (shuffle) {
            result = [...result].sort(() => 0.5 - Math.random());
        }

        // Apply maxProducts limit after shuffling
        if (maxProducts && result.length > maxProducts) {
            result = result.slice(0, maxProducts);
        }

        return result;
    }, [products, type, collectionId, homeCollections, propProducts, shuffle, shuffleDaily, maxProducts]);

    return (
        <ProductGrid
            {...gridProps}
            products={displayProducts}
        />
    );
};
