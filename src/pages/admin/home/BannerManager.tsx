import React, { useState, useRef } from 'react';
import { useSite } from "../../../context/SiteContext";
import type { Banner, Campaign } from "../../../context/SiteContext";
import { useNotification } from "../../../context/NotificationContext";
import { Plus, Trash2, Save, Pencil, Megaphone, Layout } from 'lucide-react';

export const BannerManager: React.FC = () => {
    const { banners, updateBanners, campaigns, updateCampaigns, saveSiteSettings } = useSite();
    const { showToast } = useNotification();
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<'banners' | 'campaigns'>('banners');

    // State for Banners
    const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
    const [newBanner, setNewBanner] = useState<Partial<Banner>>({ image: '', title: '', link: '' });

    // State for Campaigns
    const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);
    const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
        image: '', title: '', subtitle: '', buttonText: '', link: '', showText: true
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'campaign') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (type === 'banner') {
                    setNewBanner(prev => ({ ...prev, image: result }));
                } else {
                    setNewCampaign(prev => ({ ...prev, image: result }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Banner Handlers ---
    const handleSaveBanner = () => {
        if (!newBanner.image) return showToast('Görsel seçiniz.', 'warning');

        if (editingBannerId !== null) {
            updateBanners(banners.map(b => b.id === editingBannerId ? { ...b, ...newBanner, id: editingBannerId, order: b.order } as Banner : b));
            setEditingBannerId(null);
        } else {
            updateBanners([...banners, { ...newBanner, id: Date.now(), order: banners.length + 1 } as Banner]);
        }
        setNewBanner({ image: '', title: '', link: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleEditBanner = (b: Banner) => {
        setEditingBannerId(b.id);
        setNewBanner({ image: b.image, title: b.title, link: b.link });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteBanner = (id: number) => {
        if (confirm('Silmek istediğinize emin misiniz?')) updateBanners(banners.filter(b => b.id !== id));
    };

    // --- Campaign Handlers ---
    const handleSaveCampaign = () => {
        if (!newCampaign.image) return showToast('Görsel seçiniz.', 'warning');

        if (editingCampaignId !== null) {
            updateCampaigns(campaigns.map(c => c.id === editingCampaignId ? { ...c, ...newCampaign, id: editingCampaignId, order: c.order } as Campaign : c));
            setEditingCampaignId(null);
        } else {
            updateCampaigns([...campaigns, { ...newCampaign, id: Date.now(), order: campaigns.length + 1 } as Campaign]);
        }
        setNewCampaign({ image: '', title: '', subtitle: '', buttonText: '', link: '', showText: true });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleEditCampaign = (c: Campaign) => {
        setEditingCampaignId(c.id);
        setNewCampaign({ image: c.image, title: c.title, subtitle: c.subtitle, buttonText: c.buttonText, link: c.link, showText: c.showText });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteCampaign = (id: number) => {
        if (confirm('Silmek istediğinize emin misiniz?')) updateCampaigns(campaigns.filter(c => c.id !== id));
    };

    const handleSaveToDisk = async () => {
        setIsSaving(true);
        const result = await saveSiteSettings();
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
                        <Layout className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Banner ve Kampanyalar</h1>
                        <p className="text-slate-500 font-medium">Reklam alanlarını ve kampanya kutularını yönetin.</p>
                    </div>
                </div>
                <button
                    onClick={handleSaveToDisk}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                    {isSaving ? 'KAYDEDİLİYOR...' : <><Save className="w-5 h-5" /> DEĞİŞİKLİKLERİ KAYDET</>}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-1 rounded-2xl border border-slate-100 max-w-lg mx-auto">
                <button
                    onClick={() => setActiveTab('banners')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'banners' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Layout className="w-4 h-4" /> REKLAM BANNERLARI
                </button>
                <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'campaigns' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Megaphone className="w-4 h-4" /> KAMPANYA KUTULARI
                </button>
            </div>

            {activeTab === 'banners' ? (
                // --- Banners Section ---
                <div className="space-y-6 animate-fadeIn">
                    <div className={`p-6 rounded-xl border ${editingBannerId ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            {editingBannerId ? <><Pencil className="w-5 h-5" /> Düzenle</> : <><Plus className="w-5 h-5" /> Yeni Ekle</>}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Görsel</label>
                                <div className="flex items-center gap-4">
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                    {newBanner.image && <img src={newBanner.image} className="h-12 w-20 object-cover rounded border" />}
                                </div>
                            </div>
                            <input type="text" placeholder="Link (Örn: /category/kirtasiye)" value={newBanner.link} onChange={e => setNewBanner({ ...newBanner, link: e.target.value })} className="border p-2 rounded" />
                            <input type="text" placeholder="Başlık (Opsiyonel)" value={newBanner.title} onChange={e => setNewBanner({ ...newBanner, title: e.target.value })} className="border p-2 rounded" />
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            {editingBannerId && <button onClick={() => { setEditingBannerId(null); setNewBanner({}); }} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">İptal</button>}
                            <button onClick={handleSaveBanner} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"><Save className="w-4 h-4" /> Kaydet</button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {banners.map((b) => (
                            <div key={b.id} className="flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm">
                                <img src={b.image} className="w-24 h-16 object-cover rounded bg-gray-100" />
                                <div className="flex-1">
                                    <h3 className="font-bold">{b.title || 'İsimsiz'}</h3>
                                    <p className="text-xs text-gray-500">{b.link}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditBanner(b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteBanner(b.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // --- Campaigns Section ---
                <div className="space-y-6 animate-fadeIn">
                    <div className={`p-6 rounded-xl border ${editingCampaignId ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-800">
                            {editingCampaignId ? <><Pencil className="w-5 h-5" /> Kampanyayı Düzenle</> : <><Plus className="w-5 h-5" /> Yeni Kampanya Ekle</>}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Kampanya Görseli</label>
                                <div className="flex items-center gap-4">
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'campaign')} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                                    {newCampaign.image && <img src={newCampaign.image} className="h-12 w-20 object-cover rounded border" />}
                                </div>
                            </div>
                            <input type="text" placeholder="Başlık (Örn: Büyük Yaz İndirimi)" value={newCampaign.title} onChange={e => setNewCampaign({ ...newCampaign, title: e.target.value })} className="border p-2 rounded" />
                            <input type="text" placeholder="Alt Başlık (Örn: %50 İndirim)" value={newCampaign.subtitle} onChange={e => setNewCampaign({ ...newCampaign, subtitle: e.target.value })} className="border p-2 rounded" />
                            <input type="text" placeholder="Buton Metni (Örn: İncele)" value={newCampaign.buttonText} onChange={e => setNewCampaign({ ...newCampaign, buttonText: e.target.value })} className="border p-2 rounded" />
                            <input type="text" placeholder="Link (Örn: /campaigns)" value={newCampaign.link} onChange={e => setNewCampaign({ ...newCampaign, link: e.target.value })} className="border p-2 rounded" />

                            <div className="flex items-center gap-2 md:col-span-2 mt-2">
                                <input
                                    type="checkbox"
                                    id="showText"
                                    checked={newCampaign.showText !== false}
                                    onChange={(e) => setNewCampaign({ ...newCampaign, showText: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="showText" className="text-sm font-medium text-gray-700">Banner Üzerindeki Yazıları Göster</label>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            {editingCampaignId && <button onClick={() => { setEditingCampaignId(null); setNewCampaign({}); }} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">İptal</button>}
                            <button onClick={handleSaveCampaign} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-2"><Save className="w-4 h-4" /> Kaydet</button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {campaigns.map((c) => (
                            <div key={c.id} className="flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm">
                                <img src={c.image} className="w-24 h-16 object-cover rounded bg-gray-100" />
                                <div className="flex-1">
                                    <h3 className="font-bold">{c.title}</h3>
                                    <p className="text-xs text-gray-500">{c.subtitle}</p>
                                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded mt-1 inline-block">{c.buttonText}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditCampaign(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteCampaign(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                        {campaigns.length === 0 && <p className="text-center text-gray-500 py-4">Henüz kampanya eklenmemiş.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};
