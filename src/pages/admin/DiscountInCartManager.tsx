import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { useNotification } from '../../context/NotificationContext';
import { Save, Search, Plus, Trash2, Percent, LayoutList } from 'lucide-react';

export const DiscountInCartManager: React.FC = () => {
    const { products, discountInCartProductIds, basketDiscountRate, updateDiscountInCartProducts, updateBasketDiscountRate, saveProductSettings } = useProducts();
    const { showToast } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [localProductIds, setLocalProductIds] = useState<(string | number)[]>(discountInCartProductIds);
    const [localRate, setLocalRate] = useState<number>(basketDiscountRate);
    const [isSaving, setIsSaving] = useState(false);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toString().includes(searchTerm)
    );

    const selectedProducts = products.filter(p => localProductIds.includes(p.id));

    const toggleProduct = (id: string | number) => {
        setLocalProductIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        updateDiscountInCartProducts(localProductIds);
        updateBasketDiscountRate(localRate);
        const result = await saveProductSettings();
        setIsSaving(false);
        if (result.success) {
            showToast('Sepette İndirim ayarlar başarıyla kaydedildi.', 'success');
        } else {
            showToast('Hata: ' + result.message, 'error');
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <Percent className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Sepette İndirim Yönetimi</h1>
                        <p className="text-slate-500 font-medium">İndirimli ürünleri ve sepet indirim oranlarını yönetin.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                    {isSaving ? 'KAYDEDİLİYOR...' : <><Save className="w-5 h-5" /> DEĞİŞİKLİKLERİ KAYDET</>}
                </button>
            </div>

            {/* General Settings */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Percent className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg font-bold text-slate-800">İndirim Oranı Ayarları</h2>
                </div>
                <div className="max-w-xs">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Çoklu Alım İndirim Oranı (%)</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={localRate}
                            onChange={(e) => setLocalRate(Number(e.target.value))}
                            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-800"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Bu özellik kapsamındaki 2 veya daha fazla ürün sepete eklendiğinde uygulanacak ek indirim oranı.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Selection */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Search className="w-5 h-5 text-blue-500" />
                            <h2 className="text-lg font-semibold text-slate-800">Ürün Seçimi</h2>
                        </div>
                        <span className="text-xs font-bold text-slate-400">{filteredProducts.length} Ürün Bulundu</span>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Ürün adı veya kod ile ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {filteredProducts.map(product => {
                            const isSelected = localProductIds.includes(product.id);
                            return (
                                <div
                                    key={product.id}
                                    onClick={() => toggleProduct(product.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                        ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/5'
                                        : 'bg-white border-slate-100 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="w-12 h-12 bg-white rounded-lg p-1 border border-slate-100 flex-shrink-0">
                                        <img src={product.image} className="w-full h-full object-contain" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-800 truncate">{product.name}</h4>
                                        <p className="text-xs text-slate-400 font-medium">{product.price.current.toLocaleString('tr-TR')} TL</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300'
                                        }`}>
                                        <Plus className={`w-4 h-4 ${isSelected ? 'rotate-45' : ''} transition-transform`} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Products Preview */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <LayoutList className="w-5 h-5 text-green-500" />
                            <h2 className="text-lg font-semibold text-slate-800">Seçili Ürünler (Maks 5 Görünür)</h2>
                        </div>
                        <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-lg">{localProductIds.length} Ürün</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {selectedProducts.length > 0 ? (
                            selectedProducts.map(product => (
                                <div key={product.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group animate-in slide-in-from-right-4 duration-300">
                                    <div className="w-16 h-16 bg-white rounded-xl p-2 border border-slate-100 flex-shrink-0 shadow-sm">
                                        <img src={product.image} className="w-full h-full object-contain" alt="" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-slate-800">{product.name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Sepette İndirimli</span>
                                            <span className="text-xs font-bold text-slate-400">{product.price.current.toLocaleString('tr-TR')} TL</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleProduct(product.id)}
                                        className="p-2 bg-white text-red-500 rounded-xl hover:bg-red-50 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                                <LayoutList className="w-12 h-12 mb-4" />
                                <p className="text-sm font-bold">Henüz ürün seçilmedi</p>
                                <p className="text-xs mt-1">Sol listeden ürün ekleyebilirsiniz</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
