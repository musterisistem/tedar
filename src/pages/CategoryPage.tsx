import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { slugify } from '../utils/slugify';
import { ProductFilterSidebar, type FilterState } from '../components/category/ProductFilterSidebar';
import { ProductCard } from '../components/common/ProductCard';
import { useCategories } from '../context/CategoryContext';
import { useProducts, type Product } from '../context/ProductContext';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { SEOHead, BreadcrumbSchema } from '../components/seo';

export const CategoryPage: React.FC = () => {
    const { slug, subSlug } = useParams();
    const { products } = useProducts();
    const { categories } = useCategories();

    // UI State
    const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter State
    const [filters, setFilters] = useState<FilterState>({
        minPrice: '',
        maxPrice: '',
        brands: [],
        rating: null
    });

    const [availableBrands, setAvailableBrands] = useState<string[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar toggle

    // Get category info
    const categoryInfo = categories.find(c => slugify(c.name) === slug || c.id === slug) || { id: '', name: 'Kategori Bulunamadı', icon: 'Box', subcategories: [] };

    // Determine title
    const subCategoryName = subSlug
        ? subSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        : null;

    const pageTitle = subCategoryName ? `${categoryInfo.name} > ${subCategoryName}` : categoryInfo.name;

    // Reset filters when category changes
    useEffect(() => {
        setFilters({
            minPrice: '',
            maxPrice: '',
            brands: [],
            rating: null
        });
    }, [slug, subSlug]);

    // Filtering Logic
    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);

        const timer = setTimeout(() => {
            const normalize = (str: string) => str.toLowerCase()
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ş/g, 's')
                .replace(/ı/g, 'i')
                .replace(/ö/g, 'o')
                .replace(/ç/g, 'c')
                .replace(/[^a-z0-9]/g, '');

            let currentCategoryProducts = products;

            // 1. Filter by Category / SubCategory
            if (slug) {
                const query = normalize(slug);
                const validKeywords = [query];

                if (categoryInfo.name !== 'Kategori Bulunamadı') {
                    validKeywords.push(normalize(categoryInfo.name));
                    validKeywords.push(normalize(categoryInfo.id));
                    if (categoryInfo.subcategories && Array.isArray(categoryInfo.subcategories)) {
                        categoryInfo.subcategories.forEach(sub => validKeywords.push(normalize(sub)));
                    }
                }

                currentCategoryProducts = currentCategoryProducts.filter(p => {
                    const productCats = (p.categories || []).map(c => normalize(c));
                    return productCats.some(pCat => validKeywords.some(k => pCat.includes(k) || k.includes(pCat)));
                });
            }

            if (subSlug) {
                const query = normalize(subSlug);
                currentCategoryProducts = currentCategoryProducts.filter(p =>
                    normalize(p.name).includes(query) ||
                    (p.categories || []).some(cat => normalize(cat).includes(query)) ||
                    normalize(p.description).includes(query)
                );
            }

            // 2. Extract Available Brands from CURRENT CATEGORY products (before sidebar filters)
            const brands = Array.from(new Set(currentCategoryProducts.map(p => p.brand).filter(Boolean)));
            setAvailableBrands(brands.sort()); // Sort alphabetically

            // 3. Apply Sidebar Filters (Price, Brand, Rating)
            let result = currentCategoryProducts;

            // Price Filter
            if (filters.minPrice) {
                result = result.filter(p => p.price.current >= Number(filters.minPrice));
            }
            if (filters.maxPrice) {
                result = result.filter(p => p.price.current <= Number(filters.maxPrice));
            }

            // Brand Filter
            if (filters.brands.length > 0) {
                result = result.filter(p => filters.brands.includes(p.brand));
            }

            // Rating Filter
            if (filters.rating) {
                result = result.filter(p => (p.rating || 0) >= filters.rating!);
            }

            // 4. URL Params (Discount)
            const params = new URLSearchParams(window.location.search);
            if (params.get('discount') === 'true') {
                result = result.filter(p => (p.discount || 0) > 0);
            }

            setDisplayedProducts(result);
            setLoading(false);
        }, 300); // Reduced delay for better UX

        return () => clearTimeout(timer);
    }, [slug, subSlug, window.location.search, products, categoryInfo, filters]);

    const breadcrumbItems = React.useMemo(() => {
        const items = [{ name: 'Ana Sayfa', url: '/' }];
        if (categoryInfo.name !== 'Kategori Bulunamadı') {
            items.push({ name: categoryInfo.name, url: `/kategori/${slug}` });
        }
        if (subCategoryName) {
            items.push({ name: subCategoryName, url: `/kategori/${slug}/${subSlug}` });
        }
        return items;
    }, [categoryInfo, slug, subCategoryName, subSlug]);

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <SEOHead
                title={pageTitle}
                description={`${pageTitle} kategorisinde en uygun fiyatlı ve kaliteli ürünler Dörtel Tedarik'te.`}
                url={subSlug ? `/kategori/${slug}/${subSlug}` : `/kategori/${slug}`}
                type="website"
            />
            <BreadcrumbSchema items={breadcrumbItems} />

            <div className="container mx-auto px-4">
                {/* Breadcrumb & Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link to="/" className="hover:text-blue-600">Anasayfa</Link>
                        <span>/</span>
                        <span className="font-semibold text-gray-900">{pageTitle}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
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
                    {/* Sidebar - Desktop */}
                    <div className="hidden lg:block">
                        <ProductFilterSidebar
                            availableBrands={availableBrands}
                            filters={filters}
                            setFilters={setFilters}
                        />
                    </div>

                    {/* Mobile Filter Button */}
                    <div className="lg:hidden w-full mb-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="w-full flex items-center justify-center gap-2 bg-white py-3 border border-gray-200 rounded-lg shadow-sm font-medium text-gray-700"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            {sidebarOpen ? 'Filtreleri Gizle' : 'Filtrele'}
                        </button>
                    </div>

                    {/* Sidebar - Mobile (CONDITIONAL) */}
                    {sidebarOpen && (
                        <div className="lg:hidden w-full mb-4">
                            <ProductFilterSidebar
                                availableBrands={availableBrands}
                                filters={filters}
                                setFilters={setFilters}
                            />
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className="flex-1">
                        {displayedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {displayedProducts.map((product) => (
                                    <div key={product.id}>
                                        <ProductCard
                                            id={product.id}
                                            name={product.name}
                                            price={product.price}
                                            image={product.image}
                                            rating={product.rating}
                                            reviews={product.reviews}
                                            badges={product.badges}
                                            discount={product.discount}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            !loading && (
                                <div className="py-12 text-center bg-white rounded-xl border border-gray-200 p-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <SlidersHorizontal className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Ürün Bulunamadı</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto">
                                        Seçtiğiniz kriterlere uygun ürün bulunmamaktadır. Filtreleri temizleyip tekrar deneyebilirsiniz.
                                    </p>
                                    <button
                                        onClick={() => setFilters({ minPrice: '', maxPrice: '', brands: [], rating: null })}
                                        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                                    >
                                        Filtreleri Temizle
                                    </button>
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
                    </div>
                </div>
            </div>
        </div>
    );
};
