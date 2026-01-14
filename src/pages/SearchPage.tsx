import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductFilterSidebar } from '../components/category/ProductFilterSidebar';
import { ProductCard } from '../components/common/ProductCard';
import { products } from '../data/mockData';
import { SlidersHorizontal, ChevronDown, Search } from 'lucide-react';

export const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    // Filter products by query
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase())
    );

    const [displayedProducts, setDisplayedProducts] = useState<typeof products>([]);
    const page = useRef(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);

    // Initial Load
    const loadProducts = useCallback((pageNum: number, isReset: boolean = false) => {
        setLoading(true);

        setTimeout(() => {
            const itemsPerPage = 20;
            const startIndex = (pageNum - 1) * itemsPerPage;

            // Duplicate filtered products to simulate more results if needed
            // For search, we might just repeat the matches to show infinite scroll feature
            let results = [...filteredProducts];
            if (results.length > 0 && results.length < 10) {
                // Multiplying results only if few, for demo purposes
                results = [...results, ...results, ...results, ...results];
            }
            // If still too few, maybe just duplicate broadly? 
            // Let's stick to logic similar to CategoryPage but using filteredProducts as base.
            // If filteredProducts is empty, we show empty state.

            let sourceData = results.length > 0 ? results : [];
            // To simulate "Infinite" scroll on limited mock data matches, we can loop them
            if (sourceData.length > 0) {
                sourceData = [...sourceData, ...sourceData, ...sourceData, ...sourceData];
            }

            const newItems = sourceData.slice(startIndex, startIndex + itemsPerPage).map((p, idx) => ({
                ...p,
                id: `${p.id}-${pageNum}-${idx}`
            }));

            if (isReset) {
                setDisplayedProducts(newItems);
            } else {
                setDisplayedProducts(prev => [...prev, ...newItems]);
            }

            if (sourceData.length <= startIndex + itemsPerPage) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            setLoading(false);
        }, 800);
    }, [filteredProducts]); // Re-create if query changes (implied by content change)

    // Reset and Load when query changes
    // Reset and Load when query changes
    useEffect(() => {
        window.scrollTo(0, 0);
        page.current = 1;
        setLoading(true);
        setDisplayedProducts([]);

        // setHasMore(true); // Can set here safely if we want, but better to handle inside logic

        let shouldLoad = true;

        if (filteredProducts.length === 0 && query) {
            // Empty state
            setHasMore(false);
            setLoading(false);
        } else {
            setHasMore(true);
            // Load initial products logic simulated here for clarity vs calling loadProducts directly causing dep loops
            // Or we can just call loadProducts(1, true) but wrapped in timeout or cleaned up

            // Simplest fix: Just call loadProducts(1, true) but ensuring loadProducts doesn't create loop
            loadProducts(1, true);
            // loadProducts handles setLoading(true) start but we already set it.
        }

        return () => { shouldLoad = false; }
    }, [query]); // Only trigger on query change (which updates filteredProducts in strict mode or real app)

    // Infinite Scroll Observer
    const lastProductElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                const nextPage = page.current + 1;
                page.current = nextPage;
                loadProducts(nextPage);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadProducts]);

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4">
                {/* Breadcrumb & Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <span>Anasayfa</span>
                        <span>/</span>
                        <span>Arama Sonuçları</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-900">"{query}"</h1>
                            <span className="text-gray-500 text-lg">için arama sonuçları</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-500 text-sm hidden md:inline">{displayedProducts.length} ürün listeleniyor</span>
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors">
                                <span className="text-sm font-medium text-gray-700">Sıralama: Önerilen</span>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Sidebar */}
                    <div className="hidden lg:block">
                        <ProductFilterSidebar />
                    </div>

                    {/* Mobile Filter */}
                    <div className="lg:hidden w-full mb-4">
                        <button className="w-full flex items-center justify-center gap-2 bg-white py-3 border border-gray-200 rounded-lg shadow-sm font-medium text-gray-700">
                            <SlidersHorizontal className="w-4 h-4" />
                            Filtrele
                        </button>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {displayedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {displayedProducts.map((product, index) => {
                                    if (displayedProducts.length === index + 1) {
                                        return (
                                            <div ref={lastProductElementRef} key={product.id}>
                                                <ProductCard
                                                    id={product.id.split('-')[0]} // use original ID for link
                                                    name={product.name}
                                                    price={product.price}
                                                    image={product.image}
                                                    rating={product.rating}
                                                    reviews={product.reviews}
                                                    badges={product.badges}
                                                    discount={product.discount}
                                                />
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div key={product.id}>
                                                <ProductCard
                                                    id={product.id.split('-')[0]}
                                                    name={product.name}
                                                    price={product.price}
                                                    image={product.image}
                                                    rating={product.rating}
                                                    reviews={product.reviews}
                                                    badges={product.badges}
                                                    discount={product.discount}
                                                />
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        ) : (
                            !loading && (
                                <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Sonuç Bulunamadı</h2>
                                    <p className="text-gray-500">"{query}" araması için uygun ürün bulamadık.</p>
                                    <p className="text-gray-400 text-sm mt-4">Lütfen farklı anahtar kelimelerle tekrar deneyin.</p>
                                </div>
                            )
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="py-12 flex justify-center">
                                <div className="flex items-center gap-2 text-secondary font-medium">
                                    <div className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-secondary rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}

                        {/* End of results */}
                        {!hasMore && !loading && displayedProducts.length > 0 && (
                            <div className="py-12 text-center text-gray-400 text-sm">
                                Tüm sonuçları görüntülediniz.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
