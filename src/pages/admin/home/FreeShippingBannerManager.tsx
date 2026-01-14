import React, { useState, useEffect } from 'react';
import { useSite } from '../../../context/SiteContext';
import { Save, Truck, AlertCircle, CheckCircle } from 'lucide-react';

export const FreeShippingBannerManager: React.FC = () => {
    const { freeShippingBanner, updateFreeShippingBanner, saveSiteSettings } = useSite();
    const [formData, setFormData] = useState(freeShippingBanner);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(freeShippingBanner);
    }, [freeShippingBanner]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setStatus({ type: null, message: '' });

        try {
            updateFreeShippingBanner(formData);
            await saveSiteSettings();
            setStatus({ type: 'success', message: 'Banner ayarları başarıyla kaydedildi.' });
        } catch (error) {
            setStatus({ type: 'error', message: 'Kaydetme sırasında bir hata oluştu.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setStatus({ type: null, message: '' }), 3000);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Ücretsiz Kargo Banner Yönetimi</h1>
                    <p className="text-gray-500 mt-1">Sitenin üst kısmındaki kargo kampanya bandını düzenleyin.</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <Truck className="w-8 h-8 text-orange-600" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                            <h3 className="font-medium text-gray-900">Banner Durumu</h3>
                            <p className="text-sm text-gray-500">Bannerı sitede göster veya gizle</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Threshold Text */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tutar Metni (Örn: 1500 TL)
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.thresholdText}
                                onChange={e => setFormData({ ...formData, thresholdText: e.target.value })}
                            />
                        </div>

                        {/* Message Text */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Açıklama Metni (Örn: ve Üzeri Siparişlerde)
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.messageText}
                                onChange={e => setFormData({ ...formData, messageText: e.target.value })}
                            />
                        </div>

                        {/* Highlight Text */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vurgulu Metin (Örn: KARGO BİZDEN!)
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.highlightText}
                                onChange={e => setFormData({ ...formData, highlightText: e.target.value })}
                            />
                            <p className="text-xs text-gray-400 mt-1">Bu metin animasyonlu olarak kayacaktır.</p>
                        </div>

                        {/* Button Text */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Buton Metni
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.buttonText}
                                onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                            />
                        </div>

                        {/* Link URL */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Yönlendirme Linki
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.linkUrl}
                                onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                                placeholder="/kampanyalar"
                            />
                        </div>
                    </div>

                    {/* Preview Box */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-8">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Önizleme</h4>
                        <div className="relative overflow-hidden rounded-xl shadow-lg shadow-orange-900/10 border-b-2 border-red-800/20 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 p-4">
                            <div className="flex flex-col md:flex-row items-center justify-between text-white gap-4">
                                <span className="font-bold flex items-center gap-2">
                                    <span className="text-xl">{formData.thresholdText}</span>
                                    <span className="opacity-90">{formData.messageText}</span>
                                </span>
                                <div className="bg-white/10 px-4 py-1 rounded border border-white/20">
                                    <span className="font-black tracking-widest uppercase">{formData.highlightText}</span>
                                </div>
                                <span className="bg-white text-red-600 px-4 py-1.5 rounded-full font-bold text-sm">
                                    {formData.buttonText} &gt;
                                </span>
                            </div>
                        </div>
                    </div>

                    {status.message && (
                        <div className={`p-4 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            {status.message}
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all transform hover:scale-[1.02] shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
