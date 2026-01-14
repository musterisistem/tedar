import React, { useState } from 'react';
import { useSite } from '../../context/SiteContext';
import { useNotification } from '../../context/NotificationContext';
import type { PopularCategoryItem } from '../../context/SiteContext';
import { categories as allCategories } from '../../data/mockData';
import { Tag, Save, Check, ChevronDown, ChevronRight, Hash, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PopularCategoryManager: React.FC = () => {
    const { popularCategories, updatePopularCategories, saveSiteSettings } = useSite();
    const { showToast } = useNotification();
    const [selectedItems, setSelectedItems] = useState<PopularCategoryItem[]>(popularCategories);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<string[]>(allCategories.map(c => c.id));

    const toggleExpand = (id: string) => {
        setExpandedCategories(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const isItemSelected = (id: string, type: 'category' | 'subcategory', parentId?: string) => {
        return selectedItems.some(item =>
            item.id === id && item.type === type && (type === 'category' || item.parentId === parentId)
        );
    };

    const handleToggle = (item: PopularCategoryItem) => {
        if (isItemSelected(item.id, item.type, item.parentId)) {
            setSelectedItems(selectedItems.filter(i =>
                !(i.id === item.id && i.type === item.type && i.parentId === item.parentId)
            ));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        updatePopularCategories(selectedItems);
        const result = await saveSiteSettings();
        setIsSaving(false);
        if (result.success) {
            setIsSaved(true);
            showToast('Ayarlar başarıyla kaydedildi!', 'success');
            setTimeout(() => setIsSaved(false), 2000);
        } else {
            showToast('Hata: ' + result.message, 'error');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 text-slate-500 px-4">
                <Link to="/admin/dashboard" className="hover:text-blue-600 transition-colors">Admin</Link>
                <span>/</span>
                <span>Ana Sayfa</span>
                <span>/</span>
                <span className="text-slate-900 font-medium">Popüler Kategoriler</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <Tag className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Popüler Kategoriler</h1>
                        <p className="text-slate-500 font-medium">Ana sayfada listelenecek kategorileri yönetin.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${isSaved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isSaved ? (
                        <Check className="w-5 h-5" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {isSaving ? 'KAYDEDİLİYOR...' : isSaved ? 'KAYDEDİLDİ' : 'DEĞİŞİKLİKLERİ KAYDET'}
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-blue-600" /> Ana Sayfada Gösterilecek Kategoriler
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Ana sayfanın en üst kısmında, "Popüler Kategoriler" bölümünde listelenecek kategorileri buradan seçebilirsiniz.
                    </p>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        {allCategories.map((category) => {
                            const isExpanded = expandedCategories.includes(category.id);
                            const isCatSelected = isItemSelected(category.id, 'category');

                            return (
                                <div key={category.id} className="border border-slate-100 rounded-2xl overflow-hidden">
                                    <div
                                        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isCatSelected ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center gap-3 flex-1" onClick={() => toggleExpand(category.id)}>
                                            {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                            <span className="font-bold text-slate-800">{category.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleToggle({ id: category.id, name: category.name, type: 'category' })}
                                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border-2 transition-all text-xs font-bold ${isCatSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                        >
                                            {isCatSelected ? <Check className="w-3.5 h-3.5" /> : null}
                                            {isCatSelected ? 'SEÇİLDİ' : 'ANA KATEGORİYİ SEÇ'}
                                        </button>
                                    </div>

                                    {isExpanded && category.subcategories && (
                                        <div className="p-4 bg-slate-50/50 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {category.subcategories.map((sub, idx) => {
                                                const isSubSelected = isItemSelected(sub, 'subcategory', category.id);
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleToggle({ id: sub, name: sub, type: 'subcategory', parentId: category.id })}
                                                        className={`flex items-center justify-between p-2.5 rounded-xl border-2 transition-all ${isSubSelected ? 'border-blue-400 bg-white text-blue-600 shadow-sm' : 'border-dashed border-slate-200 bg-transparent text-slate-500 hover:border-slate-300 hover:bg-white'}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Hash className="w-3 h-3 text-slate-300" />
                                                            <span className="text-xs font-medium">{sub}</span>
                                                        </div>
                                                        {isSubSelected && <Check className="w-3 h-3" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <Check className="w-5 h-5" /> Seçili Popüler Öğeler ({selectedItems.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                    {selectedItems.map((item, idx) => (
                        <div key={idx} className="bg-white px-3 py-1.5 rounded-lg border border-blue-200 text-xs font-bold text-blue-600 shadow-sm flex items-center gap-2">
                            {item.type === 'subcategory' && <span className="text-[10px] text-slate-400 font-normal uppercase">{item.parentId} / </span>}
                            {item.name}
                            <button onClick={() => handleToggle(item)} className="ml-1 hover:text-red-500">
                                <Plus className="w-3 h-3 rotate-45" />
                            </button>
                        </div>
                    ))}
                    {selectedItems.length === 0 && (
                        <p className="text-sm text-blue-600 italic">Henüz bir seçim yapılmadı. Ana sayfada gösterilecek kategori veya alt kategorileri seçin.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
