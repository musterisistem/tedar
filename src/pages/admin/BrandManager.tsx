import React, { useState, useRef } from 'react';
import { useProducts, type Brand } from '../../context/ProductContext';
import { useNotification } from '../../context/NotificationContext';
import { Plus, Trash2, Upload, X, Search, Globe, Image as ImageIcon } from 'lucide-react';

export const BrandManager: React.FC = () => {
    const { brands, updateBrands, saveProductSettings } = useProducts();
    const { showToast } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // New Brand State
    const [newName, setNewName] = useState('');
    const [newLogo, setNewLogo] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                if (editingBrand) {
                    setEditingBrand({ ...editingBrand, logo: base64String });
                } else {
                    setNewLogo(base64String);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveNewBrand = async () => {
        if (!newName.trim()) return;
        setIsSaving(true);
        const brand: Brand = {
            id: Date.now().toString(),
            name: newName,
            logo: newLogo
        };
        updateBrands([...brands, brand]);
        const result = await saveProductSettings();
        setIsSaving(false);
        if (result.success) {
            showToast('Marka başarıyla kaydedildi!', 'success');
            resetForm();
        } else {
            showToast('Hata: ' + result.message, 'error');
        }
    };

    const handleUpdateBrand = async () => {
        if (!editingBrand || !editingBrand.name.trim()) return;
        setIsSaving(true);
        const updatedBrands = brands.map(b => b.id === editingBrand.id ? editingBrand : b);
        updateBrands(updatedBrands);
        const result = await saveProductSettings();
        setIsSaving(false);
        if (result.success) {
            showToast('Marka başarıyla güncellendi!', 'success');
            setEditingBrand(null);
        } else {
            showToast('Hata: ' + result.message, 'error');
        }
    };

    const handleDeleteBrand = async (id: string) => {
        if (window.confirm('Bu markayı silmek istediğinize emin misiniz?')) {
            setIsSaving(true);
            const nextBrands = brands.filter(b => b.id !== id);
            updateBrands(nextBrands);
            const result = await saveProductSettings();
            setIsSaving(false);
            if (result.success) {
                showToast('Marka silindi.', 'info');
            } else {
                showToast('Hata: ' + result.message, 'error');
            }
        }
    };

    const resetForm = () => {
        setNewName('');
        setNewLogo('');
        setIsAddModalOpen(false);
    };

    const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <Globe className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Marka Yönetimi</h1>
                        <p className="text-slate-500 font-medium">Ürünleriniz için markaları ve logolarını yönetin.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
                >
                    <Plus className="w-5 h-5" /> YENİ MARKA EKLE
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Marka ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none"
                />
            </div>

            {/* Brand Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredBrands.map((brand) => (
                    <div key={brand.id} className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-200 transition-all flex flex-col items-center text-center relative overflow-hidden">
                        <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 mb-4 overflow-hidden shadow-inner">
                            {brand.logo ? (
                                <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain p-2" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-slate-300" />
                            )}
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-1">{brand.name}</h3>

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-blue-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                onClick={() => setEditingBrand(brand)}
                                className="p-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
                                title="Düzenle"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleDeleteBrand(brand.id)}
                                className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-lg"
                                title="Sil"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredBrands.length === 0 && (
                <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-3xl">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Globe className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">Marka Bulunamadı</h3>
                    <p className="text-slate-500">Aramanızla eşleşen veya kayıtlı bir marka yok.</p>
                </div>
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800">Yeni Marka Ekle</h2>
                            <button onClick={resetForm} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Marka Adı</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    placeholder="Örn: Sony, Nike..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Marka Logosu</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
                                >
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                    {newLogo ? (
                                        <div className="relative inline-block">
                                            <img src={newLogo} className="h-24 mx-auto object-contain rounded-lg" />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setNewLogo(''); }}
                                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                <Upload className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-600">Logo yüklemek için tıklayın</p>
                                            <p className="text-xs text-slate-400 mt-1">PNG, SVG veya JPG (Max 2MB)</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button onClick={resetForm} className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-all">İptal</button>
                            <button onClick={handleSaveNewBrand} disabled={isSaving} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50">
                                {isSaving ? 'Kaydediliyor...' : 'Markayı Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal (Simpler version of Add Modal) */}
            {editingBrand && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800">Markayı Düzenle</h2>
                            <button onClick={() => setEditingBrand(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Marka Adı</label>
                                <input
                                    type="text"
                                    value={editingBrand.name}
                                    onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Marka Logosu</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                                >
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                    <div className="relative inline-block">
                                        {editingBrand.logo ? (
                                            <img src={editingBrand.logo} className="h-24 mx-auto object-contain rounded-lg" />
                                        ) : (
                                            <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center"><ImageIcon className="w-10 h-10 text-slate-300" /></div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                            <Upload className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-4 font-bold">Logoyu değiştirmek için tıklayın</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button onClick={() => setEditingBrand(null)} className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-all">İptal</button>
                            <button onClick={handleUpdateBrand} disabled={isSaving} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50">
                                {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
