import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';
import { FreeShippingBanner } from '../components/layout/FreeShippingBanner';
import { SEOHead, ProductSchema, BreadcrumbSchema } from '../components/seo';
import { ProductGallery } from '../components/product/ProductGallery';
import { ProductInfo } from '../components/product/ProductInfo';
import { ProductFeatures } from '../components/product/ProductFeatures';
import { ProductTabs } from '../components/product/ProductTabs';
import { ProductSection } from '../components/home/ProductSection';
import { useProducts, type Review } from '../context/ProductContext';
import { slugify } from '../utils/slugify';
import categoriesData from '../data/categories.json';

export const ProductDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { products, addReview } = useProducts();
    const [activeTab, setActiveTab] = React.useState('desc');

    // Find product by slug
    const product = products.length > 0 ? products.find(p => slugify(p.name) === slug) : null;

    // Reviews from Context
    const reviews = product?.reviewItems || [];

    // Scroll to top on mount and tracking history
    useEffect(() => {
        window.scrollTo(0, 0);

        // Add to history
        if (product) {
            const history = JSON.parse(localStorage.getItem('visited_products') || '[]');
            const newHistory = [product.id, ...history.filter((id: string) => id !== product.id)].slice(0, 10);
            localStorage.setItem('visited_products', JSON.stringify(newHistory));
        }
    }, [slug, product]);

    // Use effect to handle navigation for non-existent products
    useEffect(() => {
        if (products.length > 0 && !product && slug) {
            navigate('/', { replace: true });
        }
    }, [products, product, slug, navigate]);

    // Randomize related products
    const relatedProducts = React.useMemo(() => {
        if (!product) return [];
        const filtered = products.filter(p =>
            p.id !== product.id &&
            p.categories?.some(c => product.categories?.includes(c))
        );
        // Shuffle array
        return filtered.sort(() => 0.5 - Math.random()).slice(0, 8);
    }, [products, product]);

    // Breadcrumb items for schema
    const breadcrumbItems = React.useMemo(() => {
        const items = [{ name: 'Ana Sayfa', url: '/' }];
        if (product?.categories && product.categories.length > 0) {
            const categoryId = product.categories[0];
            const categoriesArray = (categoriesData as any).data || categoriesData;
            const category = Array.isArray(categoriesArray) ? categoriesArray.find((c: any) => c.id === categoryId) : null;
            if (category) {
                items.push({ name: category.name, url: `/kategori/${category.id}` });
            }
        }
        items.push({ name: product?.name || '', url: `/${slug}` });
        return items;
    }, [product, slug]);

    const handleAddReview = (newReview: Review) => {
        if (product) {
            addReview(product.id, newReview);
        }
    };

    const handleReviewClick = () => {
        setActiveTab('reviews');
        // Wait for tab switch and render
        setTimeout(() => {
            const formElement = document.getElementById('review-form-section');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                const element = document.getElementById('product-reviews-section');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }, 100);
    };

    // If product is still not found or list is empty
    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Ürün bilgileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {product && (
                <>
                    {/* SEO Components */}
                    <SEOHead
                        title={product.name}
                        description={product.description?.slice(0, 160) || 'Ürün detay sayfası'}
                        image={product.image}
                        url={`/${slug}`}
                        type="product"
                    />
                    <ProductSchema product={product} url={`/${slug}`} />
                    <BreadcrumbSchema items={breadcrumbItems} />

                    <div className="min-h-screen flex flex-col">
                        <FreeShippingBanner />
                        {/* TOP SECTION: Dark Background */}
                        <div className="bg-gray-100 pb-12">
                            {/* Breadcrumbs */}
                            <div className="bg-gray-100 border-b border-gray-200 py-3 mb-8">
                                <div className="container mx-auto px-4 text-sm text-gray-500 flex items-center justify-between">
                                    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
                                        <Link to="/" className="hover:text-blue-600 flex items-center gap-1">
                                            <HomeIcon className="w-3 h-3" />
                                            <span>Ana Sayfa</span>
                                        </Link>
                                        <ChevronRight className="w-3 h-3" />

                                        {/* Dynamic Category Breadcrumb */}
                                        {product.categories && product.categories.length > 0 && (() => {
                                            const categoryId = product.categories[0];
                                            const categoriesArray = (categoriesData as any).data || categoriesData;
                                            const category = Array.isArray(categoriesArray) ? categoriesArray.find((c: any) => c.id === categoryId) : null;
                                            if (category) {
                                                return (
                                                    <>
                                                        <Link to={`/kategori/${slugify(category.name)}`} className="hover:text-blue-600">
                                                            {category.name}
                                                        </Link>
                                                        <ChevronRight className="w-3 h-3" />
                                                    </>
                                                );
                                            }
                                            return null;
                                        })()}

                                        <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="container mx-auto px-4">
                                {/* Main Grid - Wrapped in White Card */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        {/* Gallery - Sticky on desktop */}
                                        <div className="lg:col-span-5 lg:sticky lg:top-8 h-fit z-30 relative">
                                            <ProductGallery images={product.images || [product.image]} videoUrl={product.videoUrl} />
                                        </div>

                                        {/* Product Info */}
                                        <div className="lg:col-span-5">
                                            <ProductInfo
                                                product={product}
                                                onReviewClick={handleReviewClick}
                                                totalReviews={reviews.length}
                                            />
                                        </div>

                                        {/* Feature Boxes & History */}
                                        <div className="lg:col-span-2">
                                            <ProductFeatures currentProductId={product.id.toString()} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BOTTOM SECTION: White Background */}
                        <div className="bg-white py-12 flex-1">
                            <div className="container mx-auto px-4">
                                <div className="mb-16">
                                    <ProductSection
                                        title="İlgili Ürünler & Benzerleri"
                                        products={relatedProducts}
                                    />
                                </div>

                                {/* Tabs */}
                                <div className="border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                                    <ProductTabs
                                        activeTab={activeTab}
                                        setActiveTab={setActiveTab}
                                        product={product}
                                        reviews={reviews}
                                        onAddReview={handleAddReview}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};
