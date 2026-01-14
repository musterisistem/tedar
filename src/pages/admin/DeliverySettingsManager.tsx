import React, { useState } from 'react';
import { useSite } from '../../context/SiteContext';
import { Truck, Plus, Trash2, Save, CheckCircle, AlertCircle } from 'lucide-react';

export const DeliverySettingsManager: React.FC = () => {
    const { deliveryConditions, updateDeliveryConditions, saveSiteSettings } = useSite();
    const [conditions, setConditions] = useState<string[]>(deliveryConditions);
    const [newCondition, setNewCondition] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleAdd = () => {
        if (!newCondition.trim()) return;
        setConditions([...conditions, newCondition.trim()]);
        setNewCondition('');
    };

    const handleDelete = (index: number) => {
        setConditions(conditions.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        try {
            updateDeliveryConditions(conditions);
            const result = await saveSiteSettings();
            if (result.success) {
                setMessage({ type: 'success', text: 'Teslimat koşulları başarıyla güncellendi!' });
            } else {
                setMessage({ type: 'error', text: 'Kaydedilirken bir hata oluştu: ' + result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bağlantı hatası oluştu.' });
        }

        setTimeout(() => setMessage(null), 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Teslimat ve İade Ayarları</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sol Taraf: Liste */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-blue-600" />
                        Mevcut Koşullar
                    </h2>

                    <div className="space-y-3">
                        {conditions.map((condition, index) => (
                            <div key={index} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 group">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">
                                    {index + 1}
                                </span>
                                <p className="text-slate-700 text-sm flex-1">{condition}</p>
                                <button
                                    onClick={() => handleDelete(index)}
                                    className="text-slate-400 hover:text-red-500 transition-colors bg-white p-1 rounded border border-slate-200 hover:border-red-200"
                                    title="Sil"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {conditions.length === 0 && (
                            <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                Henüz hiç koşul eklenmemiş.
                            </div>
                        )}
                    </div>
                </div>

                {/* Sağ Taraf: Ekleme Formu */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-green-600" />
                            Yeni Koşul Ekle
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Koşul Metni
                                </label>
                                <textarea
                                    value={newCondition}
                                    onChange={(e) => setNewCondition(e.target.value)}
                                    placeholder="Örn: 1500 TL üzeri kargo ücretsizdir..."
                                    rows={4}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                />
                            </div>

                            <button
                                onClick={handleAdd}
                                disabled={!newCondition.trim()}
                                className="w-full bg-slate-800 text-white py-3 rounded-lg font-medium hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Listeye Ekle
                            </button>
                        </div>
                    </div>

                    {/* Kaydet Butonu */}
                    <button
                        onClick={handleSave}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-700/30 transition-all flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        Ayarları Kaydet
                    </button>

                    {/* Mesaj */}
                    {message && (
                        <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
