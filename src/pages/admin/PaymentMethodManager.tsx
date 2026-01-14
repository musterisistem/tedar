import React, { useState } from 'react';
import { useSite } from '../../context/SiteContext';
import { useNotification } from '../../context/NotificationContext';
import { type BankDetail } from '../../context/SiteContext';
import { CreditCard, Truck, Landmark, Plus, Trash2, Save, Check } from 'lucide-react';

export const PaymentMethodManager: React.FC = () => {
    const { paymentSettings, updatePaymentSettings, saveSiteSettings } = useSite();
    const { showToast } = useNotification();
    const [settings, setSettings] = useState(paymentSettings);
    const [paytrSettings, setPaytrSettings] = useState({ merchant_id: '', merchant_key: '', merchant_salt: '' });
    const [isSaving, setIsSaving] = useState(false);

    // Fetch PayTR Settings on Load (Client-side fetch from Admin API)
    React.useEffect(() => {
        const fetchPaytrSettings = async () => {
            try {
                const res = await fetch('/api/admin/paytr-settings');
                if (res.ok) {
                    const result = await res.json();
                    if (result.success && result.data) {
                        setPaytrSettings(result.data);
                    }
                }
            } catch (err) {
                console.error("Failed to load PayTR settings", err);
            }
        };
        fetchPaytrSettings();
    }, []);

    const handleToggle = (key: keyof typeof settings) => {
        if (typeof settings[key] === 'boolean') {
            setSettings({ ...settings, [key]: !settings[key] });
        }
    };

    const handleAddBank = () => {
        const newBank: BankDetail = {
            id: Date.now().toString(),
            bankName: '',
            accountHolder: '',
            iban: ''
        };
        setSettings({
            ...settings,
            bankDetails: [...settings.bankDetails, newBank]
        });
    };

    const handleRemoveBank = (id: string) => {
        setSettings({
            ...settings,
            bankDetails: settings.bankDetails.filter((b: BankDetail) => b.id !== id)
        });
    };

    const handleBankChange = (id: string, field: keyof BankDetail, value: string) => {
        setSettings({
            ...settings,
            bankDetails: settings.bankDetails.map((b: BankDetail) => b.id === id ? { ...b, [field]: value } : b)
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        updatePaymentSettings(settings); // Context update

        // Save Site Settings
        const siteResult = await saveSiteSettings();

        // Save PayTR Settings
        let paytrResult = { success: true, message: '' };
        if (settings.isCreditCardActive) {
            try {
                const res = await fetch('/api/admin/paytr-settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(paytrSettings)
                });
                paytrResult = await res.json();
            } catch (err) {
                paytrResult = { success: false, message: 'PayTR ayarları kaydedilemedi.' };
            }
        }

        setIsSaving(false);

        if (siteResult.success && paytrResult.success) {
            showToast('Tüm ayarlar başarıyla kaydedildi!', 'success');
        } else {
            showToast('Bir hata oluştu: ' + (siteResult.message || paytrResult.message), 'error');
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <CreditCard className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Ödeme Yöntemleri</h1>
                        <p className="text-slate-500 font-medium">Sitedeki ödeme ve teslimat seçeneklerini yönetin.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:bg-blue-300 shadow-lg shadow-blue-100"
                >
                    {isSaving ? 'KAYDEDİLİYOR...' : <><Save className="w-5 h-5" /> DEĞİŞİKLİKLERİ KAYDET</>}
                </button>
            </div>



            <div className="space-y-6">
                {/* Method Toggles */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Check className="w-5 h-5 text-blue-600" /> Aktif Ödeme Yöntemleri
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                        {/* Kredi Kartı */}
                        <div className={`p-6 rounded-2xl border-2 transition-all ${settings.isCreditCardActive ? 'border-blue-600 bg-white shadow-md' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${settings.isCreditCardActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <span className={`font-semibold text-lg ${settings.isCreditCardActive ? 'text-slate-800' : 'text-slate-400'}`}>Kredi Kartı</span>
                                </div>
                                <button
                                    onClick={() => handleToggle('isCreditCardActive')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${settings.isCreditCardActive ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}
                                >
                                    {settings.isCreditCardActive ? 'AKTİF' : 'PASİF YAP'}
                                </button>
                            </div>
                            {settings.isCreditCardActive && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-wider">Ödeme Açıklaması / Talimatlar</label>
                                        <textarea
                                            value={settings.creditCardDescription}
                                            onChange={(e) => setSettings({ ...settings, creditCardDescription: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm min-h-[80px]"
                                            placeholder="Kredi kartı ödemesi için talimatlar yazın..."
                                        />
                                    </div>

                                    {/* PayTR Credentials Section */}
                                    <div className="border-t border-dashed border-gray-200 pt-4 mt-4">
                                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-600"></div> PayTR Entegrasyon Bilgileri
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Merchant ID</label>
                                                <input
                                                    type="text"
                                                    value={paytrSettings.merchant_id}
                                                    onChange={(e) => setPaytrSettings({ ...paytrSettings, merchant_id: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none font-mono text-sm"
                                                    placeholder="Örn: 123456"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Merchant Key</label>
                                                <input
                                                    type="password"
                                                    value={paytrSettings.merchant_key}
                                                    onChange={(e) => setPaytrSettings({ ...paytrSettings, merchant_key: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none font-mono text-sm"
                                                    placeholder="Gizli Anahtar"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Merchant Salt</label>
                                                <input
                                                    type="password"
                                                    value={paytrSettings.merchant_salt}
                                                    onChange={(e) => setPaytrSettings({ ...paytrSettings, merchant_salt: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none font-mono text-sm"
                                                    placeholder="Gizli Tuz"
                                                />
                                            </div>
                                            <p className="text-xs text-blue-600 mt-1">
                                                * Bu bilgiler PayTR mağaza panelinden alınmalıdır.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Kapıda Ödeme */}
                        <div className={`p-6 rounded-2xl border-2 transition-all ${settings.isCashOnDeliveryActive ? 'border-blue-600 bg-white shadow-md' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${settings.isCashOnDeliveryActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                                        <Truck className="w-6 h-6" />
                                    </div>
                                    <span className={`font-bold text-lg ${settings.isCashOnDeliveryActive ? 'text-slate-800' : 'text-slate-400'}`}>Kapıda Ödeme</span>
                                </div>
                                <button
                                    onClick={() => handleToggle('isCashOnDeliveryActive')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${settings.isCashOnDeliveryActive ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}
                                >
                                    {settings.isCashOnDeliveryActive ? 'AKTİF' : 'PASİF YAP'}
                                </button>
                            </div>
                            {settings.isCashOnDeliveryActive && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-wider">Ödeme Açıklaması / Talimatlar</label>
                                        <textarea
                                            value={settings.cashOnDeliveryDescription}
                                            onChange={(e) => setSettings({ ...settings, cashOnDeliveryDescription: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm min-h-[80px]"
                                            placeholder="Kapıda ödeme için talimatlar yazın..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-wider">Hizmet Bedeli (TL)</label>
                                        <input
                                            type="number"
                                            value={settings.cashOnDeliveryFee}
                                            onChange={(e) => setSettings({ ...settings, cashOnDeliveryFee: Number(e.target.value) })}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
                                            placeholder="0"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">Kapıda ödeme seçildiğinde sipariş toplamına eklenecek tutar.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Havale / EFT */}
                        <div className={`p-6 rounded-2xl border-2 transition-all ${settings.isBankTransferActive ? 'border-blue-600 bg-white shadow-md' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${settings.isBankTransferActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                                        <Landmark className="w-6 h-6" />
                                    </div>
                                    <span className={`font-bold text-lg ${settings.isBankTransferActive ? 'text-slate-800' : 'text-slate-400'}`}>Havale / EFT</span>
                                </div>
                                <button
                                    onClick={() => handleToggle('isBankTransferActive')}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${settings.isBankTransferActive ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}
                                >
                                    {settings.isBankTransferActive ? 'AKTİF' : 'PASİF YAP'}
                                </button>
                            </div>
                            {settings.isBankTransferActive && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-wider">Ödeme Açıklaması / Talimatlar</label>
                                        <textarea
                                            value={settings.bankTransferDescription}
                                            onChange={(e) => setSettings({ ...settings, bankTransferDescription: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm min-h-[80px]"
                                            placeholder="Havale / EFT için talimatlar yazın..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bank Details Section */}
                {settings.isBankTransferActive && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Landmark className="w-5 h-5 text-blue-600" /> Banka Hesap Bilgileri
                            </h2>
                            <button
                                onClick={handleAddBank}
                                className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-100 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Banka Ekle
                            </button>
                        </div>

                        <div className="space-y-4">
                            {settings.bankDetails.map((bank) => (
                                <div key={bank.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 relative group">
                                    <button
                                        onClick={() => handleRemoveBank(bank.id)}
                                        className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Banka Adı</label>
                                            <input
                                                type="text"
                                                value={bank.bankName}
                                                onChange={(e) => handleBankChange(bank.id, 'bankName', e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none"
                                                placeholder="Örn: Ziraat Bankası"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Hesap Sahibi</label>
                                            <input
                                                type="text"
                                                value={bank.accountHolder}
                                                onChange={(e) => handleBankChange(bank.id, 'accountHolder', e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none"
                                                placeholder="Örn: Ahmet Yılmaz"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">IBAN Numarası</label>
                                            <input
                                                type="text"
                                                value={bank.iban}
                                                onChange={(e) => handleBankChange(bank.id, 'iban', e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none font-mono"
                                                placeholder="TR00 0000 0000 0000 0000 0000 00"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {settings.bankDetails.length === 0 && (
                                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <Landmark className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-400">Henüz eklenmiş bir banka hesabı yok.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
