import React, { useState } from 'react';
import { useProducts } from '../../../context/ProductContext';
import { useNotification } from '../../../context/NotificationContext';
import { Save, Search, Plus, X, Briefcase, AlertCircle } from 'lucide-react';

export const OfficeSupplyManager: React.FC = () => {
    const { products, homeCollections, updateHomeCollection, saveProductSettings } = useProducts();
    const { showToast } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');

    // Target only the "office" collection
    const activeCollectionId = 'office';
    const activeCollection = homeCollections.find(c => c.id === activeCollectionId);

    const [isSaving, setIsSaving] = useState(false);

    // Enforce 6 product limit
    const MAX_PRODUCTS = 6;

    const toggleProduct = (productId: string | number) => {
        if (!activeCollection) return;
        const isSelected = activeCollection.productIds.includes(productId);

        if (!isSelected && activeCollection.productIds.length >= MAX_PRODUCTS) {
            showToast(`En fazla ${MAX_PRODUCTS} ürün seçebilirsiniz. Mevcut ürünlerden birini çıkarınız.`, 'error');
            return;
        }

        const newIds = isSelected
            ? activeCollection.productIds.filter(id => id !== productId)
            : [...activeCollection.productIds, productId];

        updateHomeCollection(activeCollectionId, { productIds: newIds });
    };

    const handleUpdateTitle = (newTitle: string) => {
        updateHomeCollection(activeCollectionId, { title: newTitle });
    };

    const handleSaveToDisk = async () => {
        setIsSaving(true);
        const result = await saveProductSettings();
        setIsSaving(false);
        if (result.success) {
            showToast('Ofis ürünleri başarıyla kaydedildi!', 'success');
        } else {
            showToast('Hata: ' + result.message, 'error');
        }
    };

    const filteredProducts = products.filter(p => {
        const search = searchTerm.toLowerCase();
        return p.name.toLowerCase().includes(search) || p.code?.toLowerCase().includes(search);
    });

    if (!activeCollection) {
        return <div className="p-8 text-center">Ofis koleksiyonu bulunamadı.</div>;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Ofisiniz İçin Seçtik</h1>
                        <p className="text-slate-500 font-medium">Bu bölümde görüntülenecek {MAX_PRODUCTS} ürünü seçin.</p>
                    </div>
                </div>
                <button
                    onClick={handleSaveToDisk}
                    disabled={isSaving}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                    {isSaving ? 'KAYDEDİLİYOR...' : <><Save className="w-5 h-5" /> KAYDET</>}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Product Search & List */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Bölüm Başlığı</label>
                            <input
                                type="text"
                                value={activeCollection.title}
                                onChange={(e) => handleUpdateTitle(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-lg"
                            />
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Ürün ara (İsim veya Kod)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredProducts.map(p => {
                                const isSelected = activeCollection.productIds.includes(p.id);
                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => toggleProduct(p.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 group ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-slate-50 border-slate-100'}`}
                                    >
                                        <div className="w-12 h-12 bg-white border border-slate-200 rounded overflow-hidden flex-shrink-0">
                                            <img src={p.image} className="w-full h-full object-contain p-1" alt={p.name} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-400 truncate">{p.code}</p>
                                            <p className="text-sm font-semibold text-slate-700 truncate">{p.name}</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 text-transparent group-hover:border-indigo-400'}`}>
                                            <Plus className={`w-4 h-4 ${isSelected ? 'rotate-45' : ''}`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Selected Products */}
                <div className="lg:col-span-4 space-y-4">
                    <div className={`bg-white border rounded-xl shadow-sm flex flex-col h-auto min-h-[400px] ${activeCollection.productIds.length > MAX_PRODUCTS ? 'border-red-300' : 'border-slate-200'}`}>
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                Seçilen Ürünler
                                {activeCollection.productIds.length > MAX_PRODUCTS && (
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${activeCollection.productIds.length > MAX_PRODUCTS ? 'bg-red-100 text-red-600' : 'bg-indigo-600 text-white'}`}>
                                {activeCollection.productIds.length} / {MAX_PRODUCTS}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {activeCollection.productIds.map((id, index) => {
                                const p = products.find(prod => prod.id === id);
                                if (!p) return null;
                                return (
                                    <div key={id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg group border border-slate-100">
                                        <span className="text-xs font-bold text-slate-400 w-4">{index + 1}</span>
                                        <img src={p.image} className="w-10 h-10 object-contain bg-white rounded border border-slate-200" alt={p.name} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-slate-700 truncate">{p.name}</p>
                                        </div>
                                        <button onClick={() => toggleProduct(id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}

                            {activeCollection.productIds.length === 0 && (
                                <div className="text-center py-10 text-slate-400">
                                    <p className="text-sm">Henüz ürün seçilmedi.</p>
                                </div>
                            )}
                        </div>

                        {activeCollection.productIds.length > MAX_PRODUCTS && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs font-medium text-center border-t border-red-100">
                                Limit aşıldı! Lütfen {activeCollection.productIds.length - MAX_PRODUCTS} ürün çıkarın.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
};
