import React from 'react';
import { DeferredContent } from '../components/common/DeferredContent';

import { HeroSlider } from '../components/home/HeroSlider';
import { CategoryQuickAccess } from '../components/home/CategoryQuickAccess';
import { ProductSection } from '../components/home/ProductSection';
import { HomeProductSection } from '../components/home/HomeProductSection';

import { StoryMenu } from '../components/home/StoryMenu';
import { VerticalProductScroller } from '../components/home/VerticalProductScroller';
import { FlashSaleSection } from '../components/home/FlashSaleSection';
import { SiteSidebar } from '../components/home/SiteSidebar';
import { ShieldCheck, Truck, RotateCcw, Headset } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { SEOHead, OrganizationSchema, WebSiteSchema } from '../components/seo';

export const Home: React.FC = () => {
    const { homeCollections, products } = useProducts();

    // Find dynamic collections info for titles
    const officeCol = homeCollections.find(c => c.id === 'office');
    const kirtasiyeCol = homeCollections.find(c => c.id === 'kirtasiye');
    const teknolojiCol = homeCollections.find(c => c.id === 'teknoloji'); // This is now "Defter Çeşitleri"
    const bestSellersCol = homeCollections.find(c => c.id === 'best-sellers');

    // Filter Best Seller products
    const bestSellerProducts = React.useMemo(() => {
        if (bestSellersCol && bestSellersCol.productIds) {
            return products.filter(p => bestSellersCol.productIds.includes(p.id));
        }
        return [];
    }, [products, bestSellersCol]);

    return (
        <div className="min-h-screen pb-12">
            <SEOHead
                title="Ana Sayfa"
                description="Dörtel Tedarik - Ofis ve kırtasiye malzemeleri, promosyon ürünleri ve daha fazlası. Uygun fiyatlar ve hızlı teslimat."
                url="/"
            />
            <OrganizationSchema />
            <WebSiteSchema />



            <div className="container mx-auto px-0 sm:px-4 pt-0 sm:pt-1 pb-0 sm:pb-2">
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-0 sm:gap-6 lg:h-auto lg:min-h-[500px]">
                    {/* Center Slider & Popular Categories */}
                    <div className="col-span-1 lg:col-span-8 flex flex-col gap-0 sm:gap-4">
                        <div className="flex-shrink-0 px-4 sm:px-0 pt-3 sm:pt-0">
                            <StoryMenu />
                        </div>
                        <div className="flex-1 min-h-[250px] sm:min-h-[400px]">
                            <HeroSlider />
                        </div>
                    </div>

                    {/* Right Vertical Scroller */}
                    <div className="hidden lg:block lg:col-span-2 h-full">
                        <VerticalProductScroller />
                    </div>
                </div>
            </div>

            {/* Quick Access */}
            <div className="hidden sm:block mt-0 sm:mt-8 relative z-10">
                <CategoryQuickAccess />
            </div>

            {/* Yeni Gelenler */}
            <DeferredContent height="400px">
                <div className="bg-gray-100/80 py-1 sm:py-2 rounded-xl my-2 sm:my-8 border border-gray-200 shadow-inner">
                    <HomeProductSection
                        type="new-arrivals"
                        title="Yeni Gelenler"
                        productCount={12}
                        columns={6}
                        shuffleDaily={true}
                        maxProducts={12}
                    />
                </div>
            </DeferredContent>

            {/* Flash Sale - Wrapped in DeferredContent */}
            <DeferredContent height="300px">
                <div className="container mx-auto px-4 mb-4 sm:mb-8">
                    <FlashSaleSection />
                </div>
            </DeferredContent>

            {/* Main Content */}
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-4">
                            <SiteSidebar />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="col-span-1 lg:col-span-9 space-y-8">
                        <DeferredContent height="600px">
                            <HomeProductSection
                                type="collection"
                                collectionId="office"
                                title={officeCol?.title || "Ofisiniz İçin Seçtik"}
                                productCount={12}
                                columns={4}
                                variant="banded"
                                headerClassName="bg-blue-900 bg-opacity-90 relative overflow-hidden"
                                headerStyle={{
                                    backgroundImage: 'url("/src/assets/office-bg.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundBlendMode: 'overlay'
                                }}
                                containerClassName="bg-indigo-50 p-4 border border-indigo-100"
                                shuffleDaily={true}
                                maxProducts={12}
                            />
                        </DeferredContent>

                        <DeferredContent height="400px">
                            <HomeProductSection
                                type="collection"
                                collectionId="kirtasiye"
                                title={kirtasiyeCol?.title || "Kırtasiye Dünyası"}
                                productCount={12}
                                columns={4}
                                viewAllLink="/kategori/ofis-kirtasiye-urunleri"
                                variant="banded"
                                headerClassName="bg-gradient-to-r from-orange-600 to-red-600"
                                containerClassName="bg-indigo-50 p-4 border border-indigo-100"
                                shuffleDaily={true}
                                maxProducts={12}
                            />
                        </DeferredContent>



                        <DeferredContent height="400px">
                            <HomeProductSection
                                type="collection"
                                collectionId="teknoloji"
                                title={teknolojiCol?.title || "Defter Çeşitleri"}
                                productCount={12}
                                columns={4}
                                viewAllLink="/kategori/not-kagitlari-ve-bloknot"
                                variant="banded"
                                headerClassName="bg-gradient-to-r from-cyan-600 to-blue-600"
                                containerClassName="bg-indigo-50 p-4 border border-indigo-100"
                                shuffleDaily={true}
                                maxProducts={12}
                            />
                        </DeferredContent>

                        <DeferredContent height="300px">
                            <ProductSection
                                title={bestSellersCol?.title || "En Çok Satanlar"}
                                products={bestSellerProducts.length > 0 ? bestSellerProducts : undefined}
                                linkUrl="/best-sellers"
                                className="bg-gradient-to-r from-amber-50 to-orange-50 border-orange-200"
                            />
                        </DeferredContent>

                        {/* Mid-page Banner */}
                        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between text-white shadow-lg">
                            <div className="mb-4 md:mb-0">
                                <h3 className="text-2xl font-bold mb-2">Kurumsal Satış Çözümleri</h3>
                                <p className="text-blue-100">İş yeriniz için toplu alımlarda özel fiyat teklifleri.</p>
                            </div>
                            <button className="bg-white text-blue-900 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                                Teklif İste
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust Indicators */}
            <div className="container mx-auto px-4 mt-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">Ücretsiz Kargo</h4>
                            <p className="text-xs text-gray-500">1500 TL üzeri siparişlerde</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <RotateCcw className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">Kolay İade</h4>
                            <p className="text-xs text-gray-500">14 gün içinde koşulsuz iade</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">Güvenli Ödeme</h4>
                            <p className="text-xs text-gray-500">256-bit SSL koruması</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Headset className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">7/24 Destek</h4>
                            <p className="text-xs text-gray-500">Müşteri hizmetleri hattı</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
