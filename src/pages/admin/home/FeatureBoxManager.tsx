import React, { useState } from 'react';
import { useSite, type FeatureBox, type PromoBox } from '../../../context/SiteContext';
import { useNotification } from '../../../context/NotificationContext';
import { Save, Truck, Shield, CheckCircle, Info, Zap, Star, Layout } from 'lucide-react';

export const FeatureBoxManager: React.FC = () => {
    const { featureBoxes, updateFeatureBoxes, promoBox, updatePromoBox, saveSiteSettings } = useSite();
    const { showToast } = useNotification();
    const [localBoxes, setLocalBoxes] = useState<FeatureBox[]>(featureBoxes);
    const [localPromo, setLocalPromo] = useState<PromoBox>(promoBox);

    const handleUpdate = (id: number, field: keyof FeatureBox, value: string) => {
        setLocalBoxes(prev => prev.map(box => box.id === id ? { ...box, [field]: value } : box));
    };

    const handlePromoUpdate = (field: keyof PromoBox, value: string) => {
        setLocalPromo(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        updateFeatureBoxes(localBoxes);
        updatePromoBox(localPromo);

        const result = await saveSiteSettings();
        if (result.success) {
            showToast('Ayarlar başarıyla kaydedildi!', 'success');
        } else {
            showToast('Hata: ' + result.message, 'error');
        }
    };

    const iconMap = {
        Truck,
        Shield,
        CheckCircle,
        Zap,
        Star
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
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Bilgi Kutuları Yönetimi</h1>
                        <p className="text-slate-500 font-medium">Site genelindeki bilgi ve promosyon kutularını düzenleyin.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
                >
                    <Save className="w-5 h-5" /> TÜMÜNÜ KAYDET
                </button>
            </div>

            {/* Sidebar Promo Box Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
                    <Layout className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-bold text-slate-800">Ana Sayfa Yan Menü Kutusu</h2>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Preview */}
                        <div className="lg:col-span-4">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Canlı Önizleme</label>
                            <div className={`relative overflow-hidden ${localPromo.bgColor} rounded-3xl p-8 text-center shadow-2xl shadow-blue-900/10`}>
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="relative z-10">
                                    <div className={`${localPromo.iconBgColor} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner`}>
                                        {React.createElement(iconMap[localPromo.icon as keyof typeof iconMap] || Info, { className: `w-9 h-9 ${localPromo.textColor}` })}
                                    </div>
                                    <h4 className={`font-black ${localPromo.textColor} text-xl mb-2 tracking-tight`}>{localPromo.title}</h4>
                                    <p className={`text-sm ${localPromo.textColor} opacity-90 mb-6 font-medium leading-relaxed`}>{localPromo.description}</p>
                                    <div className={`${localPromo.btnBgColor} ${localPromo.btnTextColor} text-sm font-black py-3 px-6 rounded-xl inline-block shadow-lg`}>{localPromo.buttonText}</div>
                                </div>
                            </div>
                        </div>

                        {/* Edit Form */}
                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Başlık</label>
                                <input type="text" value={localPromo.title} onChange={(e) => handlePromoUpdate('title', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Açıklama</label>
                                <textarea rows={2} value={localPromo.description} onChange={(e) => handlePromoUpdate('description', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Buton Metni</label>
                                <input type="text" value={localPromo.buttonText} onChange={(e) => handlePromoUpdate('buttonText', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Simge</label>
                                <select value={localPromo.icon} onChange={(e) => handlePromoUpdate('icon', e.target.value as any)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500">
                                    <option value="Truck">Kamyon</option>
                                    <option value="Zap">Şimşek</option>
                                    <option value="Shield">Kalkan</option>
                                    <option value="Star">Yıldız</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Arka Plan Rengi</label>
                                <input type="text" value={localPromo.bgColor} onChange={(e) => handlePromoUpdate('bgColor', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Simge Arka Planı</label>
                                <input type="text" value={localPromo.iconBgColor} onChange={(e) => handlePromoUpdate('iconBgColor', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Buton Arka Planı</label>
                                <input type="text" value={localPromo.btnBgColor} onChange={(e) => handlePromoUpdate('btnBgColor', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Buton Yazı Rengi</label>
                                <input type="text" value={localPromo.btnTextColor} onChange={(e) => handlePromoUpdate('btnTextColor', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Detail Boxes Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
                    <Layout className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-bold text-slate-800">Ürün Detay Sayfası Kutuları</h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {localBoxes.map((box) => {
                        const Icon = iconMap[box.icon as keyof typeof iconMap] || Info;
                        return (
                            <div key={box.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Preview */}
                                    <div className="md:w-1/3">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Görünüm Önizleme</label>
                                        <div className={`${box.bgColor} ${box.borderColor} border-2 rounded-2xl p-6 flex items-start gap-4`}>
                                            <div className={`${box.iconColor} flex-shrink-0 mt-1`}>
                                                <Icon className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg mb-1">{box.title}</h4>
                                                <p className="text-sm text-gray-600">{box.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Başlık</label>
                                            <input
                                                type="text"
                                                value={box.title}
                                                onChange={(e) => handleUpdate(box.id, 'title', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Açıklama</label>
                                            <input
                                                type="text"
                                                value={box.description}
                                                onChange={(e) => handleUpdate(box.id, 'description', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Simge</label>
                                            <select
                                                value={box.icon}
                                                onChange={(e) => handleUpdate(box.id, 'icon', e.target.value as any)}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                            >
                                                <option value="Truck">Kamyon (Truck)</option>
                                                <option value="Shield">Kalkan (Shield)</option>
                                                <option value="CheckCircle">Onay İşareti (CheckCircle)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Arka Plan Rengi (Tailwind)</label>
                                            <input
                                                type="text"
                                                value={box.bgColor}
                                                onChange={(e) => handleUpdate(box.id, 'bgColor', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Simge Rengi (Tailwind)</label>
                                            <input
                                                type="text"
                                                value={box.iconColor}
                                                onChange={(e) => handleUpdate(box.id, 'iconColor', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Kenarlık Rengi (Tailwind)</label>
                                            <input
                                                type="text"
                                                value={box.borderColor}
                                                onChange={(e) => handleUpdate(box.id, 'borderColor', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

