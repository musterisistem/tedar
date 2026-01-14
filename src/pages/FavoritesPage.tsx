import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { AlertCircle, Plus, ArrowRightLeft, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FavoritesPage: React.FC = () => {
    const { favorites, removeFromFavorites } = useFavorites();

    // Helper to get product by favorite index
    const getProduct = (index: number) => favorites[index];

    const specsList = [
        { key: 'brand', label: 'Marka' },
        { key: 'category', label: 'Kategori' },
        { key: 'stock', label: 'Stok Durumu' },
        { key: 'rating', label: 'Puan' },
        { key: 'warranty', label: 'Garanti' },
        { key: 'origin', label: 'Menşei' },
    ];

    // Mock specs filler since our products might not have full details structure yet
    const getSpec = (prod: any, key: string) => {
        if (!prod) return '-';
        if (key === 'brand') return 'Dörtel'; // Mock
        if (key === 'category') return 'Ofis'; // Mock
        if (key === 'stock') return 'Stokta Var';
        if (key === 'rating') return '4.5/5';
        if (key === 'warranty') return '2 Yıl';
        if (key === 'origin') return 'Türkiye';
        return '-';
    };

    if (favorites.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <ArrowRightLeft className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Karşılaştırma Listeniz Boş</h2>
                <p className="text-gray-500 mb-8 max-w-md">Karşılaştırmak istediğiniz ürünleri favorilerinize ekleyerek teknik özelliklerini detaylıca inceleyebilirsiniz.</p>
                <Link to="/" className="bg-secondary text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-1">
                    Ürünleri İncele
                </Link>
            </div>
        );
    }

    const item1 = getProduct(0);
    const item2 = getProduct(1);

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
                        Ürün <span className="text-secondary">Karşılaştırma</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Seçtiğiniz ürünlerin teknik özelliklerini yan yana inceleyin.</p>
                </div>

                {/* Comparison Stage */}
                <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 relative">

                    {/* Floating VS Badge */}
                    <div className="absolute top-48 left-1/2 -translate-x-1/2 z-20">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-gray-50 font-black text-xl text-gray-800 italic">
                            VS
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">

                        {/* Left Side - Product 1 */}
                        <div className="p-6 md:p-10 relative group">
                            {item1 ? (
                                <div className="space-y-6">
                                    <div className="relative aspect-square rounded-2xl bg-gray-50 p-8 mb-6 group-hover:bg-blue-50/50 transition-colors duration-500">
                                        <img src={item1.image} alt={item1.name} className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm group-hover:scale-110 transition-transform duration-500" />
                                        <button
                                            onClick={() => removeFromFavorites(item1.id)}
                                            className="absolute top-4 right-4 p-2 bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-sm transition-colors"
                                            title="Listeden Çıkar"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item1.name}</h3>
                                        <div className="text-2xl font-black text-secondary">{item1.price.toLocaleString('tr-TR')} TL</div>
                                    </div>

                                    {/* Specs List */}
                                    <div className="mt-8 space-y-4">
                                        {specsList.map(spec => (
                                            <div key={spec.key} className="flex justify-between items-center py-3 border-b border-gray-50">
                                                <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">{spec.label}</span>
                                                <span className="text-sm font-bold text-gray-700">{getSpec(item1, spec.key)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8">
                                        <button className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
                                            Sepete Ekle
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // No item should ideally happen if list is empty, but just in case
                                <div />
                            )}
                        </div>

                        {/* Right Side - Product 2 or Placeholder */}
                        <div className="p-6 md:p-10 bg-gray-50/30">
                            {item2 ? (
                                <div className="space-y-6">
                                    <div className="relative aspect-square rounded-2xl bg-white p-8 mb-6 shadow-sm group hover:shadow-md transition-shadow">
                                        <img src={item2.image} alt={item2.name} className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm group-hover:scale-110 transition-transform duration-500" />
                                        <button
                                            onClick={() => removeFromFavorites(item2.id)}
                                            className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            title="Listeden Çıkar"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item2.name}</h3>
                                        <div className="text-2xl font-black text-secondary">{item2.price.toLocaleString('tr-TR')} TL</div>
                                    </div>

                                    {/* Specs List */}
                                    <div className="mt-8 space-y-4">
                                        {specsList.map(spec => (
                                            <div key={spec.key} className="flex justify-between items-center py-3 border-b border-gray-100">
                                                <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">{spec.label}</span>
                                                <span className="text-sm font-bold text-gray-700">{getSpec(item2, spec.key)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8">
                                        <button className="w-full py-4 bg-secondary text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
                                            Sepete Ekle
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Placeholder State */
                                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 border-2 border-dashed border-gray-200">
                                        <Plus className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Karşılaştırma Yapın</h3>
                                    <p className="text-gray-500 text-sm mb-8 max-w-xs">İkinci bir ürün ekleyerek özellikleri yan yana kıyaslayın.</p>
                                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 max-w-sm">
                                        <div className="flex items-start gap-3 text-left">
                                            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-orange-800 text-sm">Karşılaştırmak için bir ürün daha ekleyin</h4>
                                                <p className="text-xs text-orange-600 mt-1">Sitemizdeki ürünlerden birini favorilere ekleyerek buraya getirebilirsiniz.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Link to="/" className="mt-8 text-secondary font-bold hover:underline">
                                        Ürünlere Göz At
                                    </Link>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* If there are more than 2 items, show a strip at bottom */}
                    {favorites.length > 2 && (
                        <div className="bg-gray-50 border-t border-gray-100 p-6">
                            <h4 className="text-sm font-bold text-gray-600 mb-4">Diğer Favorileriniz</h4>
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {favorites.slice(2).map(item => (
                                    <div key={item.id} className="w-24 flex-shrink-0 bg-white p-2 rounded-lg border border-gray-200 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" title="Kıyaslamaya Al">
                                        <img src={item.image} className="w-full h-20 object-contain mb-2" />
                                        <div className="text-[10px] font-bold truncate">{item.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
