import React, { useMemo } from 'react';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/common/ProductCard';
import { ShoppingBag, Percent, AlertCircle, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductCollectionPageProps {
    type: 'outlet' | 'campaign' | 'same-day-shipping';
}

export const ProductCollectionPage: React.FC<ProductCollectionPageProps> = ({ type }) => {
    const { products, outletProductIds, campaignProductIds, discountInCartProductIds } = useProducts();

    const isOutlet = type === 'outlet';
    const isSameDay = type === 'same-day-shipping';

    let title = 'Kış Kampanyaları';
    let description = 'Sizin için seçtiğimiz özel kampanya ürünleri.';
    let Icon = Percent;
    let bannerColor = 'bg-gradient-to-r from-orange-500 to-orange-700';

    if (isOutlet) {
        title = 'Outlet Fırsatları';
        description = 'Sezon sonu ürünlerde büyük indirimler! Stoklar tükenmeden yakalayın.';
        Icon = ShoppingBag;
        bannerColor = 'bg-gradient-to-r from-red-600 to-red-800';
    } else if (isSameDay) {
        title = 'Aynı Gün Kargo';
        description = 'Saat 14:00\'e kadar verilen siparişlerde aynı gün kargo fırsatı!';
        Icon = Truck; // Will need import
        bannerColor = 'bg-gradient-to-r from-green-600 to-emerald-800';
    }

    const collectionProducts = useMemo(() => {
        if (isSameDay) {
            return products.filter(p => p.sameDayShipping);
        }

        if (!isOutlet) {
            // Campaign logic remains same
            return products.filter(p => campaignProductIds.includes(p.id));
        }

        // Expanded Outlet Logic:
        // 1. Manually selected outlet products
        // 2. Discount-in-cart products
        // 3. Products with price drops (original > current)
        return products.filter(p => {
            const isManualOutlet = outletProductIds.includes(p.id);
            const isSepetteIndirim = discountInCartProductIds.includes(p.id);
            const hasPriceDrop = p.price.original > p.price.current;

            return isManualOutlet || isSepetteIndirim || hasPriceDrop;
        });
    }, [products, outletProductIds, campaignProductIds, discountInCartProductIds, isOutlet]);

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Banner */}
            <div className={`${bannerColor} text-white py-12 mb-8`}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                            <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
                    </div>
                    <p className="text-white/80 text-lg max-w-2xl">{description}</p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
                    <Link to="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</Link>
                    <span>/</span>
                    <span className="text-gray-900">{title}</span>
                </div>

                {collectionProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {collectionProducts.map(product => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100 min-h-[400px]">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz Ürün Eklenmedi</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            Bu kategori için şuan aktif bir ürün bulunmamaktadır. Lütfen daha sonra tekrar kontrol ediniz.
                        </p>
                        <Link
                            to="/"
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                        >
                            Alışverişe Devam Et
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
