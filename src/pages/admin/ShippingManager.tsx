import React, { useState } from 'react';
import { useSite } from '../../context/SiteContext';
import { useNotification } from '../../context/NotificationContext';
import { Truck, Package, DollarSign, Save, TrendingUp } from 'lucide-react';

export const ShippingManager: React.FC = () => {
    const { deliverySettings, updateDeliverySettings, saveSiteSettings } = useSite();
    const { showToast } = useNotification();
    const [settings, setSettings] = useState(deliverySettings);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        updateDeliverySettings(settings);
        const result = await saveSiteSettings();
        setIsSaving(false);

        if (result.success) {
            showToast('Kargo ayarları başarıyla kaydedildi!', 'success');
        } else {
            showToast('Bir hata oluştu: ' + result.message, 'error');
        }
    };

    // Example calculations for preview
    const exampleAmounts = [500, 1000, 1500, 2000, 3000];

    const calculateShipping = (amount: number) => {
        if (!settings.isEnabled) return 0;
        if (amount >= settings.freeShippingThreshold) return 0;
        return settings.fixedShippingCost;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <Truck className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Kargo Yönetimi</h1>
                        <p className="text-slate-500 font-medium">Ücretsiz kargo limiti ve sabit kargo ücretini ayarlayın.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:bg-blue-300 shadow-lg shadow-blue-100"
                >
                    {isSaving ? 'KAYDEDİLİYOR...' : <><Save className="w-5 h-5" /> KAYDET</>}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Settings Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Enable/Disable Shipping */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-600" /> Kargo Ücreti Durumu
                        </h2>
                        <div className={`p-6 rounded-2xl border-2 transition-all ${settings.isEnabled ? 'border-blue-600 bg-white shadow-md' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${settings.isEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                                        <Truck className="w-6 h-6" />
                                    </div>
                                    <span className={`font-bold text-lg ${settings.isEnabled ? 'text-slate-800' : 'text-slate-400'}`}>
                                        Kargo Ücreti Sistemi
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, isEnabled: !settings.isEnabled })}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${settings.isEnabled ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}
                                >
                                    {settings.isEnabled ? 'AKTİF' : 'PASİF'}
                                </button>
                            </div>
                            <p className="text-sm text-slate-500">
                                {settings.isEnabled
                                    ? 'Kargo ücreti hesaplaması aktif. Sepet toplamına göre kargo ücreti eklenir.'
                                    : 'Kargo ücreti sistemi kapalı. Tüm siparişler ücretsiz kargo ile gönderilir.'}
                            </p>
                        </div>
                    </div>

                    {/* Shipping Settings */}
                    {settings.isEnabled && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-blue-600" /> Kargo Ücret Ayarları
                            </h2>

                            <div className="space-y-6">
                                {/* Free Shipping Threshold */}
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                                    <label className="block text-sm font-bold text-green-900 mb-2 uppercase tracking-wider">
                                        Ücretsiz Kargo Limiti (TL)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={settings.freeShippingThreshold}
                                            onChange={(e) => {
                                                const val = e.target.value === '' ? 0 : Number(e.target.value);
                                                setSettings({ ...settings, freeShippingThreshold: val });
                                            }}
                                            onFocus={(e) => e.target.select()}
                                            className="w-full px-4 py-3 rounded-lg border-2 border-green-300 focus:border-green-500 outline-none text-lg font-bold text-green-900"
                                            placeholder="1500"
                                            min="0"
                                            step="50"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-700 font-bold">TL</span>
                                    </div>
                                    <p className="text-xs text-green-700 mt-2">
                                        Bu tutarın üzerindeki siparişlerde kargo ücretsiz olacaktır.
                                    </p>
                                </div>

                                {/* Fixed Shipping Cost */}
                                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200">
                                    <label className="block text-sm font-bold text-orange-900 mb-2 uppercase tracking-wider">
                                        Sabit Kargo Ücreti (TL)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={settings.fixedShippingCost}
                                            onChange={(e) => {
                                                const val = e.target.value === '' ? 0 : Number(e.target.value);
                                                setSettings({ ...settings, fixedShippingCost: val });
                                            }}
                                            onFocus={(e) => e.target.select()}
                                            className="w-full px-4 py-3 rounded-lg border-2 border-orange-300 focus:border-orange-500 outline-none text-lg font-bold text-orange-900"
                                            placeholder="50"
                                            min="0"
                                            step="5"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-700 font-bold">TL</span>
                                    </div>
                                    <p className="text-xs text-orange-700 mt-2">
                                        Ücretsiz kargo limitinin altındaki siparişlere bu tutar eklenecektir.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6 sticky top-4">
                        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" /> Ön İzleme
                        </h3>
                        <p className="text-sm text-blue-700 mb-6">
                            Farklı sepet tutarları için kargo ücreti hesaplaması:
                        </p>

                        <div className="space-y-3">
                            {exampleAmounts.map((amount) => {
                                const shipping = calculateShipping(amount);
                                const total = amount + shipping;
                                const isFree = shipping === 0;

                                return (
                                    <div
                                        key={amount}
                                        className={`p-4 rounded-xl border-2 transition-all ${isFree
                                            ? 'bg-green-100 border-green-300'
                                            : 'bg-white border-blue-200'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold text-slate-700">
                                                Sepet: {amount.toLocaleString('tr-TR')} TL
                                            </span>
                                            {isFree && (
                                                <span className="text-xs font-black text-green-600 bg-green-200 px-2 py-0.5 rounded-full">
                                                    ÜCRETSİZ
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500">Kargo:</span>
                                            <span className={`font-bold ${isFree ? 'text-green-600' : 'text-orange-600'}`}>
                                                {isFree ? '0 TL' : `${shipping.toLocaleString('tr-TR')} TL`}
                                            </span>
                                        </div>
                                        <div className="border-t border-dashed border-slate-300 mt-2 pt-2 flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-600">Toplam:</span>
                                            <span className="text-sm font-black text-blue-600">
                                                {total.toLocaleString('tr-TR')} TL
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {!settings.isEnabled && (
                            <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                                <p className="text-xs text-gray-600 text-center">
                                    Kargo ücreti sistemi kapalı. Tüm siparişler ücretsiz kargo ile gönderilir.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
