import React, { useState, useEffect } from 'react';
import { useProducts } from '../../context/ProductContext';
import { useNotification } from '../../context/NotificationContext';
import { Save, Search, Plus, X, AlertCircle, ShoppingBag, Percent, Clock } from 'lucide-react';

interface CollectionManagerProps {
    type: 'outlet' | 'campaign' | 'flash';
}

export const CollectionManager: React.FC<CollectionManagerProps> = ({ type }) => {
    const {
        products,
        outletProductIds,
        campaignProductIds,
        flashProductIds,
        updateOutletProducts,
        updateCampaignProducts,
        updateFlashProducts,
        saveProductSettings
    } = useProducts();
    const { showToast } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const isOutlet = type === 'outlet';
    const isFlash = type === 'flash';

    const title = isFlash ? 'Flaş Ürünler Yönetimi' : (isOutlet ? 'Outlet Ürünleri Yönetimi' : 'Kampanya Ürünleri Yönetimi');
    const description = isFlash
        ? 'Ana sayfadaki flaşlı ürünler bölümünde gösterilecek ürünleri seçin.'
        : (isOutlet ? 'Outlet bölümünde gösterilecek ürünleri seçin.' : 'Kampanyalar bölümünde gösterilecek ürünleri seçin.');
    const Icon = isFlash ? Clock : (isOutlet ? ShoppingBag : Percent);

    // Load initial state from context
    useEffect(() => {
        if (isFlash) {
            setSelectedIds(flashProductIds);
        } else if (isOutlet) {
            setSelectedIds(outletProductIds);
        } else {
            setSelectedIds(campaignProductIds);
        }
    }, [isOutlet, isFlash, outletProductIds, campaignProductIds, flashProductIds]);

    const handleSave = async () => {
        setIsSaving(true);
        if (isFlash) {
            updateFlashProducts(selectedIds);
        } else if (isOutlet) {
            updateOutletProducts(selectedIds);
        } else {
            updateCampaignProducts(selectedIds);
        }

        const result = await saveProductSettings();
        setIsSaving(false);
        if (result.success) {
            showToast('Ayarlar başarıyla kaydedildi!', 'success');
        } else {
            showToast('Hata: ' + result.message, 'error');
        }
    };

    const handleSelect = (id: string | number) => {
        if (!selectedIds.includes(id)) {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleRemove = (id: string | number) => {
        setSelectedIds(selectedIds.filter((sid: string | number) => sid !== id));
    };

    const toggleSelection = (id: string | number) => {
        if (selectedIds.includes(id)) {
            handleRemove(id);
        } else {
            handleSelect(id);
        }
    };

    // Filter products for search results
    const filteredProducts = products.filter(p => {
        const search = searchTerm.toLowerCase();
        return (
            p.name.toLowerCase().includes(search) ||
            p.code?.toLowerCase().includes(search) ||
            p.brand.toLowerCase().includes(search)
        );
    });

    const selectedProductsInfo = products.filter(p => selectedIds.includes(p.id));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">{title}</h1>
                        <p className="text-slate-500 font-medium">{description}</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                    {isSaving ? 'KAYDEDİLİYOR...' : <><Save className="w-5 h-5" /> KAYDET</>}
                </button>
            </div>

            <div className="flex gap-6 h-full overflow-hidden">
                {/* Available Products (Search & Select) */}
                <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ürün ara (Kod, İsim, Marka)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                            />
                            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                                {filteredProducts.map(product => {
                                    const isSelected = selectedIds.includes(product.id);
                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => toggleSelection(product.id)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all flex gap-3 items-center group
                                                ${isSelected
                                                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                                                    : 'bg-white border-slate-100 hover:border-blue-300 hover:bg-slate-50'}`}
                                        >
                                            <div className="w-12 h-12 bg-white border border-slate-200 rounded-md overflow-hidden flex-shrink-0">
                                                <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold text-slate-400 mb-0.5">{product.code || 'KOD YOK'}</div>
                                                <div className="font-semibold text-slate-700 text-sm truncate">{product.name}</div>
                                                <div className="text-blue-600 font-bold text-xs">{product.price.current} TL</div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors
                                                ${isSelected
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : 'border-slate-300 text-transparent group-hover:border-blue-400'}`}>
                                                <Plus className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-45' : ''}`} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <Search className="w-8 h-8 mb-2 opacity-50" />
                                <p>Ürün bulunamadı.</p>
                            </div>
                        )}
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-400 text-center">
                        Toplam {products.length} ürün arasından {filteredProducts.length} tanesi gösteriliyor.
                    </div>
                </div>

                {/* Selected Products List */}
                <div className="w-96 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-700">Seçilen Ürünler</h3>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                            {selectedIds.length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {selectedProductsInfo.length > 0 ? (
                            selectedProductsInfo.map((p, idx) => (
                                <div key={p.id} className="flex gap-3 p-3 bg-white border border-slate-100 rounded-lg group hover:border-red-200 hover:bg-red-50/20 transition-colors">
                                    <div className="font-mono text-xs font-bold text-slate-300 w-5 flex items-center justify-center">{idx + 1}</div>
                                    <div className="w-10 h-10 bg-white border border-slate-200 rounded flex-shrink-0">
                                        <img src={p.image} alt={p.name} className="w-full h-full object-contain p-0.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-slate-700 truncate">{p.name}</div>
                                        <div className="text-xs text-slate-400">{p.code}</div>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(p.id)}
                                        className="text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-sm">Henüz ürün seçilmedi.</p>
                                <p className="text-xs mt-2 opacity-75">Sol taraftan ürün arayıp üzerine tıklayarak ekleyebilirsiniz.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8;
                }
            `}</style>
        </div>
    );
};
