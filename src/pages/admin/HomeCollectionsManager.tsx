import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { useNotification } from '../../context/NotificationContext';
import { Save, Search, Plus, X, PenLine, Shuffle } from 'lucide-react';
import categoriesData from '../../data/categories.json';

export const HomeCollectionsManager: React.FC = () => {
    const { products, homeCollections, updateHomeCollection, saveProductSettings } = useProducts();
    const { showToast } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCollectionId, setActiveCollectionId] = useState<string>('office');

    // Random Selection State
    // Random Selection State
    // We now derive these from the active collection, or default to empty/10
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [randomCount, setRandomCount] = useState<number>(10);

    // Sync local state with active collection when it changes
    React.useEffect(() => {
        if (activeCollection) {
            setSelectedCategoryId(activeCollection.smartSettings?.categoryId || '');
            setRandomCount(activeCollection.smartSettings?.count || 10);
        }
    }, [activeCollectionId, homeCollections]);

    const handleUpdateSettings = (categoryId: string, count: number) => {
        setSelectedCategoryId(categoryId);
        setRandomCount(count);
        // Auto-save these settings to the collection structure (in memory)
        updateHomeCollection(activeCollectionId, {
            smartSettings: { categoryId, count }
        });
    };

    const activeCollection = homeCollections.find(c => c.id === activeCollectionId);

    const handleUpdateTitle = (newTitle: string) => {
        updateHomeCollection(activeCollectionId, { title: newTitle });
    };

    const handleRandomize = () => {
        if (!activeCollection) return;

        let candidateProducts = products;

        // Filter by category if selected
        if (selectedCategoryId) {
            candidateProducts = products.filter(p => p.categories.includes(selectedCategoryId));
        }

        // Shuffle
        const shuffled = [...candidateProducts].sort(() => 0.5 - Math.random());

        // Slice
        const selected = shuffled.slice(0, randomCount);
        const newIds = selected.map(p => p.id);

        updateHomeCollection(activeCollectionId, { productIds: newIds });
        showToast(`${newIds.length} ürün rastgele seçildi.`, 'success');
    };

    const toggleProduct = (productId: string | number) => {
        if (!activeCollection) return;
        const isSelected = activeCollection.productIds.includes(productId);
        const newIds = isSelected
            ? activeCollection.productIds.filter(id => id !== productId)
            : [...activeCollection.productIds, productId];

        updateHomeCollection(activeCollectionId, { productIds: newIds });
    };

    const filteredProducts = products.filter(p => {
        const search = searchTerm.toLowerCase();
        return p.name.toLowerCase().includes(search) || p.code?.toLowerCase().includes(search);
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSaveToDisk = async () => {
        setIsSaving(true);
        const result = await saveProductSettings();
        setIsSaving(false);
        if (result.success) {
            showToast('Ayarlar başarıyla kaydedildi!', 'success');
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
                        <PenLine className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Ana Sayfa Ürün Grupları</h1>
                        <p className="text-slate-500 font-medium">Bölüm başlıklarını ve seçili ürün gruplarını yönetin.</p>
                    </div>
                </div>
                <button
                    onClick={handleSaveToDisk}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                    {isSaving ? 'KAYDEDİLİYOR...' : <><Save className="w-5 h-5" /> TÜMÜNÜ KAYDET</>}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
                {homeCollections.map(c => (
                    <button
                        key={c.id}
                        onClick={() => setActiveCollectionId(c.id)}
                        className={`pb-3 px-4 text-sm font-semibold transition-all ${activeCollectionId === c.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {c.title}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Editor */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <PenLine className="w-4 h-4 text-blue-600" />
                                Bölüm Başlığı
                            </label>
                            <input
                                type="text"
                                value={activeCollection?.title || ''}
                                onChange={(e) => handleUpdateTitle(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-lg"
                            />
                        </div>

                        {/* Random Selection Tools */}
                        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <Shuffle className="w-4 h-4 text-purple-600" />
                                Hızlı Ürün Seçimi
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <select
                                    value={selectedCategoryId}
                                    onChange={(e) => handleUpdateSettings(e.target.value, randomCount)}
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="">Tüm Kategoriler</option>
                                    {categoriesData.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500 whitespace-nowrap">Adet:</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={randomCount}
                                        onChange={(e) => handleUpdateSettings(selectedCategoryId, Number(e.target.value))}
                                        className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={handleRandomize}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                                >
                                    <Shuffle className="w-4 h-4" />
                                    Rastgele Listele
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                Dikkat: Bu işlem mevcut listeyi sıfırlar ve seçilen kriterlere göre yeni ürünler ekler.
                                Ayarlar "Tümünü Kaydet" dendiğinde hafızaya alınır.
                            </p>
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Ürün ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredProducts.map(p => {
                                const isSelected = activeCollection?.productIds.includes(p.id);
                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => toggleProduct(p.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 group ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50 border-slate-100'}`}
                                    >
                                        <div className="w-12 h-12 bg-white border border-slate-200 rounded overflow-hidden flex-shrink-0">
                                            <img src={p.image} className="w-full h-full object-contain p-1" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-400 truncate">{p.code}</p>
                                            <p className="text-sm font-semibold text-slate-700 truncate">{p.name}</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-transparent group-hover:border-blue-400'}`}>
                                            <Plus className={`w-4 h-4 ${isSelected ? 'rotate-45' : ''}`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Selection Summary */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-[700px]">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-700">Seçilen Ürünler</h3>
                            <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">{activeCollection?.productIds.length || 0}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {activeCollection?.productIds.map((id, index) => {
                                const p = products.find(prod => prod.id === id);
                                if (!p) return null;
                                return (
                                    <div key={id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg group">
                                        <span className="text-xs font-bold text-slate-400 w-4">{index + 1}</span>
                                        <img src={p.image} className="w-10 h-10 object-contain bg-white rounded border border-slate-200" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-slate-700 truncate">{p.name}</p>
                                        </div>
                                        <button onClick={() => toggleProduct(id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                            {(!activeCollection?.productIds.length) && (
                                <div className="text-center py-10 text-slate-400">
                                    <p className="text-sm">Henüz ürün seçilmedi.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <button onClick={handleSaveToDisk} disabled={isSaving} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50">
                                <Save className="w-5 h-5" />
                                {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Tamamla'}
                            </button>
                        </div>
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
