import React, { useState } from 'react';
import { usePriceAlerts } from '../../context/PriceAlertContext';
import { useNotification } from '../../context/NotificationContext';
import { Bell, Mail, Search, Trash2, Send, LayoutList, Users } from 'lucide-react';

export const PriceAlertManager: React.FC = () => {
    const { alerts, deactivateAlert } = usePriceAlerts();
    const { showToast } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [mailTemplate, setMailTemplate] = useState({
        title: 'Özel İndirim Fırsatı!',
        content: 'Takip ettiğiniz ürünlerde büyük indirimler başladı. Hemen incelemek için tıklayın.'
    });

    const filteredAlerts = (Array.isArray(alerts) ? alerts : []).filter(alert =>
        alert.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBulkSend = async () => {
        if (alerts.length === 0) {
            showToast('Gönderilecek kayıt bulunamadı.', 'warning');
            return;
        }
        setIsSending(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSending(false);
        showToast(`${alerts.length} kişiye bildirim başarıyla gönderildi!`, 'success');
    };

    const handleDelete = async (productId: string, userId: number) => {
        if (window.confirm('Bu alarm kaydını silmek istediğinize emin misiniz?')) {
            const result = await deactivateAlert(productId, userId);
            if (result.success) {
                showToast('Kayıt başarıyla silindi.', 'success');
            }
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <Bell className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Fiyat Alarm Yönetimi</h1>
                        <p className="text-slate-500 font-medium">Takip listesindeki üyeleri yönetin ve bildirim gönderin.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <Users className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-900 font-bold text-xl">{alerts.length}</span>
                        <span className="text-slate-500 font-bold text-sm">Aktif Takipçi</span>
                    </div>
                    <button
                        onClick={handleBulkSend}
                        disabled={isSending}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-3 shadow-xl shadow-blue-100 disabled:opacity-50"
                    >
                        {isSending ? 'BİLDİRİMLER GÖNDERİLİYOR...' : (
                            <>
                                <Send className="w-5 h-5" />
                                TOPLU BİLDİRİM GÖNDER
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Mail Template Editor */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3 uppercase">
                            <Mail className="w-5 h-5 text-blue-600" />
                            Bildirim Şablonu
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">MESAJ BAŞLIĞI</label>
                                <input
                                    type="text"
                                    value={mailTemplate.title}
                                    onChange={(e) => setMailTemplate({ ...mailTemplate, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">MESAJ İÇERİĞİ (HTML DESTEKLİ)</label>
                                <textarea
                                    value={mailTemplate.content}
                                    onChange={(e) => setMailTemplate({ ...mailTemplate, content: e.target.value })}
                                    rows={8}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 resize-none"
                                ></textarea>
                            </div>
                            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                                <p className="text-xs text-orange-700 font-bold leading-relaxed">
                                    <span className="block mb-1">💡 İPUCU:</span>
                                    Bu şablon, fiyat alarmı kuran tüm üyelere anlık bildirim olarak gönderilecektir.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between gap-4">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3 uppercase shrink-0">
                                <LayoutList className="w-5 h-5 text-blue-600" />
                                Takip Listesi
                            </h2>
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Üye adı, ürün adı veya e-posta ile ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Üye Bilgileri</th>
                                        <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ürün Bilgisi</th>
                                        <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Alarm Fiyatı</th>
                                        <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tarih</th>
                                        <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredAlerts.length > 0 ? (
                                        filteredAlerts.map((alert) => (
                                            <tr key={alert.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                                                            {alert.userName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 uppercase text-sm">{alert.userName}</div>
                                                            <div className="text-xs text-slate-500 font-medium">{alert.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="font-bold text-slate-700 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                                        {alert.productName}
                                                        <span className="block text-[10px] text-blue-600 font-bold tracking-tighter mt-0.5">#{alert.productId}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center font-bold text-blue-600">
                                                    {alert.priceAtAlert ? `${alert.priceAtAlert.toLocaleString('tr-TR')} TL` : '-'}
                                                </td>
                                                <td className="px-8 py-6 font-bold text-slate-500 text-sm">
                                                    {alert.date}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => handleDelete(alert.productId, alert.userId)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold">
                                                Sonuç bulunamadı.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
