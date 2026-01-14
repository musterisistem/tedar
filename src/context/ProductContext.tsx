import React, { createContext, useState, useContext, type ReactNode } from 'react';
import initialProducts from '../data/products.json';
import productSettings from '../data/productSettings.json';

export interface ProductPrice {
    current: number;
    original: number;
    currency: string;
}

export interface Review {
    user: string;
    comment: string;
    rating: number;
    date: string;
    hasPhoto: boolean;
}

export interface ProductSpecs {
    color: string;
    shippingType?: string;
    size: string;
}

export interface HomeCollection {
    id: string;
    title: string;
    productIds: (string | number)[];
    smartSettings?: {
        categoryId: string;
        count: number;
    };
}

export interface Brand {
    id: string;
    name: string;
    logo?: string;
}

export interface ProductShipping {
    cost: number;
    info: string;
}

export interface Product {
    id: string | number;
    name: string;
    code?: string;
    price: ProductPrice;
    discount?: number;
    description: string;
    image: string;
    images: string[];
    categories: string[];
    brand: string;
    stock: number;
    rating: number;
    reviews: number;
    badges: string[];
    tags?: string[];
    specs: ProductSpecs;
    shipping?: ProductShipping;
    isActive?: boolean;
    videoUrl?: string;
    relatedProductIds?: (string | number)[];
    sameDayShipping?: boolean; // Aynı gün kargo özelliği
    reviewItems?: Review[];
    createdAt?: string;
}

interface ProductContextType {
    products: Product[];
    addProduct: (product: Product) => void;
    addBulkProducts: (products: Product[]) => Promise<void>;
    updateProduct: (id: string | number, updatedProduct: Partial<Product>) => void;
    deleteProduct: (id: string | number) => void;
    deleteBulkProducts: (ids: (string | number)[]) => Promise<void>;
    outletProductIds: (string | number)[];
    campaignProductIds: (string | number)[];
    flashProductIds: (string | number)[];
    homeCollections: HomeCollection[];
    brands: Brand[];
    updateOutletProducts: (ids: (string | number)[]) => void;
    updateCampaignProducts: (ids: (string | number)[]) => void;
    updateFlashProducts: (ids: (string | number)[]) => void;
    updateHomeCollection: (id: string, updates: Partial<HomeCollection>) => void;
    updateBrands: (brands: Brand[]) => void;
    discountInCartProductIds: (string | number)[];
    basketDiscountRate: number;
    updateDiscountInCartProducts: (ids: (string | number)[]) => void;
    updateBasketDiscountRate: (rate: number) => void;
    saveProductSettings: () => Promise<{ success: boolean; message: string }>;
    addReview: (productId: string | number, review: Review) => void;
    deleteReview: (productId: string | number, reviewIndex: number) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);

    // Generic fetch cache to prevent double-requests in StrictMode
    const fetchCache = React.useRef<{ promise: Promise<Product[]> | null }>({ promise: null });

    // Fetch products on mount
    // Fetch products and settings on mount
    React.useEffect(() => {
        const fetchAllData = async () => {
            // 1. Fetch Products
            const fetchProducts = async () => {
                // Return cached data if available
                if (products.length > 0) return;

                // Prevent duplicate requests
                if (fetchCache.current.promise) {
                    const data = await fetchCache.current.promise;
                    setProducts(data);
                    return;
                }

                try {
                    const fetchPromise = (async () => {
                        let data;

                        try {
                            // Try MongoDB API first
                            const response = await fetch('/api/products');
                            if (response.ok) {
                                const result = await response.json();
                                data = result.data || [];
                                console.log('✅ Products loaded from MongoDB:', data.length);
                            } else {
                                throw new Error('API fetch failed');
                            }
                        } catch (apiError) {
                            // Fallback to static import
                            console.warn('⚠️ MongoDB API failed, using static data', apiError);
                            data = initialProducts;
                        }

                        // Load saved reviews from localStorage
                        const savedReviews = JSON.parse(localStorage.getItem('product_reviews') || '{}');

                        return (Array.isArray(data) ? data : []).map((p: any) => {
                            // Merge saved reviews if available
                            const productReviews = savedReviews[p.id] || p.reviewItems || [];
                            return {
                                ...p,
                                isActive: p.isActive ?? true,
                                reviewItems: productReviews.length > 0 ? productReviews : Array.from({ length: p.reviews || 0 }, () => ({
                                    user: `Ziyaretçi`,
                                    comment: 'Ürün gayet güzel, tavsiye ederim.',
                                    rating: p.rating || 5,
                                    date: new Date().toISOString(),
                                    hasPhoto: false
                                })),
                                reviews: productReviews.length > 0 ? productReviews.length : (p.reviews || 0),
                                rating: productReviews.length > 0
                                    ? Number((productReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / productReviews.length).toFixed(1))
                                    : (p.rating || 5)
                            };
                        });
                    })();

                    fetchCache.current.promise = fetchPromise;
                    const processedProducts = await fetchPromise;
                    setProducts(processedProducts);
                } catch (error) {
                    console.error('Error loading products:', error);
                    fetchCache.current.promise = null; // Reset on error
                }
            };

            // 2. Fetch Product Settings (Collections, Brands, etc.)
            const fetchSettings = async () => {
                try {
                    const response = await fetch('/api/settings/productSettings.json?t=' + Date.now());
                    if (response.ok) {
                        const result = await response.json();
                        const data = result.data || result;

                        if (data.outletProductIds) setOutletProductIds(data.outletProductIds);
                        if (data.campaignProductIds) setCampaignProductIds(data.campaignProductIds);
                        if (data.flashProductIds) setFlashProductIds(data.flashProductIds);
                        if (data.homeCollections) setHomeCollections(data.homeCollections);
                        if (data.brands) setBrands(data.brands);
                        if (data.discountInCartProductIds) setDiscountInCartProductIds(data.discountInCartProductIds);
                        if (data.basketDiscountRate) setBasketDiscountRate(data.basketDiscountRate);
                    }
                } catch (error) {
                    console.error('Product settings could not be loaded:', error);
                }
            };

            await Promise.all([fetchProducts(), fetchSettings()]);
        };

        fetchAllData();
    }, []);

    const addProduct = async (product: Product) => {
        try {
            // Add to MongoDB via API
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });

            if (response.ok) {
                const result = await response.json();
                setProducts([result.data, ...products]);
                console.log('✅ Product added to MongoDB');
            } else {
                throw new Error('Failed to add product');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            // Fallback: add to local state only
            setProducts([product, ...products]);
        }
    };

    const addBulkProducts = async (newProductsList: Product[]) => {
        try {
            // Add each product to MongoDB
            for (const product of newProductsList) {
                await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(product)
                });
            }
            setProducts([...newProductsList, ...products]);
            console.log(`✅ ${newProductsList.length} products added to MongoDB`);
        } catch (error) {
            console.error('Error bulk adding products:', error);
            setProducts([...newProductsList, ...products]);
        }
    };

    const updateProduct = async (id: string | number, updatedProduct: Partial<Product>) => {
        try {
            // Update in MongoDB
            const response = await fetch('/api/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updatedProduct })
            });

            if (response.ok) {
                const newProducts = products.map(p =>
                    p.id.toString() === id.toString() ? { ...p, ...updatedProduct } : p
                );
                setProducts(newProducts);
                console.log('✅ Product updated in MongoDB');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            // Fallback: update local state only
            const newProducts = products.map(p =>
                p.id.toString() === id.toString() ? { ...p, ...updatedProduct } : p
            );
            setProducts(newProducts);
        }
    };

    const addReview = async (productId: string | number, review: Review) => {
        const newProducts = products.map(p => {
            if (p.id.toString() === productId.toString()) {
                const currentReviews = p.reviewItems || [];
                const updatedReviews = [review, ...currentReviews];
                const totalRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
                const averageRating = updatedReviews.length > 0 ? totalRating / updatedReviews.length : 0;

                return {
                    ...p,
                    reviewItems: updatedReviews,
                    reviews: updatedReviews.length,
                    rating: Number(averageRating.toFixed(1))
                };
            }
            return p;
        });
        setProducts(newProducts);

        // Save reviews to localStorage as fallback
        const savedReviews = JSON.parse(localStorage.getItem('product_reviews') || '{}');
        const updatedProduct = newProducts.find(p => p.id.toString() === productId.toString());
        if (updatedProduct) {
            savedReviews[productId] = updatedProduct.reviewItems;
            localStorage.setItem('product_reviews', JSON.stringify(savedReviews));

            // Update in MongoDB
            try {
                await fetch('/api/products', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: productId,
                        reviewItems: updatedProduct.reviewItems,
                        reviews: updatedProduct.reviews,
                        rating: updatedProduct.rating
                    })
                });
            } catch (error) {
                console.error('Error updating review in MongoDB:', error);
            }
        }
    };

    const deleteReview = async (productId: string | number, reviewIndex: number) => {
        const newProducts = products.map(p => {
            if (p.id.toString() === productId.toString()) {
                const currentReviews = p.reviewItems || [];
                const updatedReviews = currentReviews.filter((_, index) => index !== reviewIndex);
                const totalRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
                const averageRating = updatedReviews.length > 0 ? totalRating / updatedReviews.length : 0;

                return {
                    ...p,
                    reviewItems: updatedReviews,
                    reviews: updatedReviews.length,
                    rating: Number(averageRating.toFixed(1))
                };
            }
            return p;
        });
        setProducts(newProducts);

        // Save reviews to localStorage as fallback
        const savedReviews = JSON.parse(localStorage.getItem('product_reviews') || '{}');
        const updatedProduct = newProducts.find(p => p.id.toString() === productId.toString());
        if (updatedProduct) {
            savedReviews[productId] = updatedProduct.reviewItems;
            localStorage.setItem('product_reviews', JSON.stringify(savedReviews));

            // Update in MongoDB
            try {
                await fetch('/api/products', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: productId,
                        reviewItems: updatedProduct.reviewItems,
                        reviews: updatedProduct.reviews,
                        rating: updatedProduct.rating
                    })
                });
            } catch (error) {
                console.error('Error updating review in MongoDB:', error);
            }
        }
    };

    const deleteProduct = async (id: string | number) => {
        try {
            // Delete from MongoDB
            const response = await fetch(`/api/products?id=${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const newProducts = products.filter(p => p.id.toString() !== id.toString());
                setProducts(newProducts);
                console.log('✅ Product deleted from MongoDB');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            // Fallback: remove from local state only
            const newProducts = products.filter(p => p.id.toString() !== id.toString());
            setProducts(newProducts);
        }
    };

    const deleteBulkProducts = async (ids: (string | number)[]) => {
        try {
            // Delete each from MongoDB
            for (const id of ids) {
                await fetch(`/api/products?id=${id}`, {
                    method: 'DELETE'
                });
            }
            const idsSet = new Set(ids.map(id => id.toString()));
            const newProducts = products.filter(p => !idsSet.has(p.id.toString()));
            setProducts(newProducts);
            console.log(`✅ ${ids.length} products deleted from MongoDB`);
        } catch (error) {
            console.error('Error bulk deleting products:', error);
            const idsSet = new Set(ids.map(id => id.toString()));
            const newProducts = products.filter(p => !idsSet.has(p.id.toString()));
            setProducts(newProducts);
        }
    };

    // Collection States
    const [outletProductIds, setOutletProductIds] = useState<(string | number)[]>(() => {
        const saved = localStorage.getItem('site_outlet_products');
        return saved ? JSON.parse(saved) : (productSettings.outletProductIds || []);
    });

    const [campaignProductIds, setCampaignProductIds] = useState<(string | number)[]>(() => {
        const saved = localStorage.getItem('site_campaign_products');
        return saved ? JSON.parse(saved) : (productSettings.campaignProductIds || []);
    });

    const [flashProductIds, setFlashProductIds] = useState<(string | number)[]>(() => {
        const saved = localStorage.getItem('site_flash_products');
        // Fallback to empty if not saved. Random/default population can be done elsewhere or via admin.
        return saved ? JSON.parse(saved) : (productSettings.flashProductIds || []);
    });

    const [homeCollections, setHomeCollections] = useState<HomeCollection[]>(() => {
        const saved = localStorage.getItem('site_home_collections');
        return saved ? JSON.parse(saved) : (productSettings.homeCollections || []);
    });

    const [brands, setBrands] = useState<Brand[]>(() => {
        const saved = localStorage.getItem('site_brands');
        return saved ? JSON.parse(saved) : (productSettings.brands || []);
    });

    const [discountInCartProductIds, setDiscountInCartProductIds] = useState<(string | number)[]>(() => {
        const saved = localStorage.getItem('site_discount_in_cart_products');
        return saved ? JSON.parse(saved) : (productSettings.discountInCartProductIds || []);
    });

    const [basketDiscountRate, setBasketDiscountRate] = useState<number>(() => {
        const saved = localStorage.getItem('site_basket_discount_rate');
        return saved ? JSON.parse(saved) : (productSettings.basketDiscountRate || 0);
    });

    const updateOutletProducts = (ids: (string | number)[]) => {
        setOutletProductIds(ids);
        localStorage.setItem('site_outlet_products', JSON.stringify(ids));
    };

    const updateCampaignProducts = (ids: (string | number)[]) => {
        setCampaignProductIds(ids);
        localStorage.setItem('site_campaign_products', JSON.stringify(ids));
    };

    const updateFlashProducts = (ids: (string | number)[]) => {
        setFlashProductIds(ids);
        localStorage.setItem('site_flash_products', JSON.stringify(ids));
    };

    const updateHomeCollection = (id: string, updates: Partial<HomeCollection>) => {
        setHomeCollections(prev => {
            const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
            localStorage.setItem('site_home_collections', JSON.stringify(next));
            return next;
        });
    };

    const updateBrands = (newBrands: Brand[]) => {
        setBrands(newBrands);
        localStorage.setItem('site_brands', JSON.stringify(newBrands));
    };

    const updateDiscountInCartProducts = (ids: (string | number)[]) => {
        setDiscountInCartProductIds(ids);
        localStorage.setItem('site_discount_in_cart_products', JSON.stringify(ids));
    };

    const updateBasketDiscountRate = (rate: number) => {
        setBasketDiscountRate(rate);
        localStorage.setItem('site_basket_discount_rate', JSON.stringify(rate));
    };

    const saveProductSettings = async () => {
        const settings = {
            filename: 'productSettings.json',
            outletProductIds,
            campaignProductIds,
            flashProductIds,
            homeCollections,
            brands,
            discountInCartProductIds,
            basketDiscountRate
        };

        try {
            const response = await fetch('/api/save-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Sunucuya bağlanılamadı.', error };
        }
    };

    const value = React.useMemo(() => ({
        products,
        addProduct,
        addBulkProducts,
        updateProduct,
        deleteProduct,
        deleteBulkProducts,
        outletProductIds,
        campaignProductIds,
        flashProductIds,
        homeCollections,
        brands,
        updateOutletProducts,
        updateCampaignProducts,
        updateFlashProducts,
        updateHomeCollection,
        updateBrands,
        discountInCartProductIds,
        basketDiscountRate,
        updateDiscountInCartProducts,
        updateBasketDiscountRate,
        saveProductSettings,
        addReview,
        deleteReview
    }), [
        products,
        outletProductIds,
        campaignProductIds,
        flashProductIds,
        homeCollections,
        brands,
        discountInCartProductIds,
        basketDiscountRate
    ]);

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};
