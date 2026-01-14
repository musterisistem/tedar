import React, { useState, useRef } from 'react';
import { useSite } from "../../../context/SiteContext";
import type { Slide } from "../../../context/SiteContext";
import { useNotification } from "../../../context/NotificationContext";
import { Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Save, Pencil, X, Type } from 'lucide-react';

export const SliderManager: React.FC = () => {
    const { slides, updateSlides, saveSiteSettings } = useSite();
    const { showToast } = useNotification();
    const [isSaving, setIsSaving] = useState(false);
    // ... rest of the component
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newSlide, setNewSlide] = useState<Partial<Slide>>({
        image: '',
        title: '',
        description: '',
        link: '',
        showText: true
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewSlide({ ...newSlide, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddOrUpdateSlide = () => {
        if (!newSlide.image || !newSlide.title) {
            alert('Lütfen en az görsel yükleyiniz ve başlık giriniz.');
            return;
        }

        if (editingId !== null) {
            // Update existing slide
            const updatedSlides = slides.map(slide =>
                slide.id === editingId
                    ? { ...slide, ...newSlide, id: editingId, order: slide.order } as Slide
                    : slide
            );
            updateSlides(updatedSlides);
            setEditingId(null);
        } else {
            // Add new slide
            const slide: Slide = {
                id: Date.now(),
                image: newSlide.image,
                title: newSlide.title,
                description: newSlide.description || '',
                link: newSlide.link || '',
                order: slides.length + 1,
                showText: newSlide.showText
            };
            updateSlides([...slides, slide]);
        }

        // Reset form
        setNewSlide({ image: '', title: '', description: '', link: '', showText: true });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleEdit = (slide: Slide) => {
        setEditingId(slide.id);
        setNewSlide({
            image: slide.image,
            title: slide.title,
            description: slide.description,
            link: slide.link,
            showText: slide.showText
        });
        // Scroll to top to see the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNewSlide({ image: '', title: '', description: '', link: '', showText: true });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Bu slaytı silmek istediğinize emin misiniz?')) {
            updateSlides(slides.filter(s => s.id !== id));
            if (editingId === id) {
                handleCancelEdit();
            }
        }
    };

    const moveSlide = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === slides.length - 1)
        ) {
            return;
        }

        const newSlides = [...slides];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
        updateSlides(newSlides);
    };

    const handleSaveToDisk = async () => {
        setIsSaving(true);
        const result = await saveSiteSettings({ slides });
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
                        <ImageIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Slayt Yönetimi</h1>
                        <p className="text-slate-500 font-medium">Ana sayfa slider görsellerini ve içeriklerini düzenleyin.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <span className="text-slate-900 font-bold text-xl">{slides.length}</span>
                        <span className="text-slate-500 font-semibold text-sm">Slayt</span>
                    </div>
                    <button
                        onClick={handleSaveToDisk}
                        disabled={isSaving}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
                    >
                        {isSaving ? 'KAYDEDİLİYOR...' : <><Save className="w-5 h-5" /> DEĞİŞİKLİKLERİ KAYDET</>}
                    </button>
                </div>
            </div>

            {/* Add/Edit Slide Form */}
            <div className={`p-6 rounded-xl shadow-sm border transition-colors duration-300 ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${editingId ? 'text-blue-700' : 'text-slate-700'}`}>
                    {editingId ? (
                        <>
                            <Pencil className="w-5 h-5" /> Slaytı Düzenle
                        </>
                    ) : (
                        <>
                            <Plus className="w-5 h-5" /> Yeni Slayt Ekle
                        </>
                    )}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Görsel Yükle</label>
                        <div className="flex items-center gap-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            {newSlide.image && (
                                <img src={newSlide.image} alt="Önizleme" className="h-10 w-16 object-cover rounded border" />
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Başlık</label>
                        <input
                            type="text"
                            value={newSlide.title}
                            onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Slayt Başlığı"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                        <input
                            type="text"
                            value={newSlide.description}
                            onChange={(e) => setNewSlide({ ...newSlide, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Slayt Alt Açıklaması"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Link (Opsiyonel)</label>
                        <input
                            type="text"
                            value={newSlide.link}
                            onChange={(e) => setNewSlide({ ...newSlide, link: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Slayt Linki (Örn: /kategori/giyim)"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={newSlide.showText}
                                onChange={(e) => setNewSlide({ ...newSlide, showText: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-slate-700">Slayt Üzerinde Yazıları Göster</span>
                        </label>
                    </div>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                    {editingId && (
                        <button
                            onClick={handleCancelEdit}
                            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium"
                        >
                            <X className="w-4 h-4" />
                            İptal
                        </button>
                    )}
                    <button
                        onClick={handleAddOrUpdateSlide}
                        className={`${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium`}
                    >
                        <Save className="w-4 h-4" />
                        {editingId ? 'Güncelle' : 'Kaydet'}
                    </button>
                </div>
            </div>

            {/* List Slides */}
            <div className="space-y-4">
                {slides.map((slide, index) => (
                    <div key={slide.id} className={`p-4 rounded-xl shadow-sm border flex flex-col md:flex-row items-center gap-4 transition-all ${editingId === slide.id ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100' : 'bg-white border-slate-200'}`}>
                        <div className="w-full md:w-48 h-32 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden relative group">
                            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ImageIcon className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2 justify-center md:justify-start">
                                {slide.title}
                                {!slide.showText && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full border border-gray-200 flex items-center gap-1">
                                        <Type className="w-3 h-3" /> Gizli
                                    </span>
                                )}
                            </h3>
                            <p className="text-slate-600">{slide.description}</p>
                        </div>

                        <div className="flex items-center gap-2 border-l pl-4 border-slate-100">
                            <div className="flex flex-col gap-1 mr-2">
                                <button
                                    onClick={() => moveSlide(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 text-slate-600"
                                >
                                    <ArrowUp className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => moveSlide(index, 'down')}
                                    disabled={index === slides.length - 1}
                                    className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 text-slate-600"
                                >
                                    <ArrowDown className="w-5 h-5" />
                                </button>
                            </div>

                            <button
                                onClick={() => handleEdit(slide)}
                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                                title="Düzenle"
                            >
                                <Pencil className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => handleDelete(slide.id)}
                                className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                                title="Sil"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}

                {slides.length === 0 && (
                    <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Henüz slayt eklenmemiş.</p>
                    </div>
                )}
            </div>
        </div >
    );
};
