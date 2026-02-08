import React, { useState, useMemo } from 'react';
import { usePriceAlerts } from '../../context/PriceAlertContext';
import { useNotification } from '../../context/NotificationContext';
import { useUsers } from '../../context/UserContext';
import { Bell, Mail, Search, Trash2, Send, LayoutList, Users, CheckSquare, Square, CheckCircle2 } from 'lucide-react';

export const PriceAlertManager: React.FC = () => {
    const { users } = useUsers();
    const { alerts, deactivateAlert } = usePriceAlerts();
    const { showToast } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [targetAudience, setTargetAudience] = useState<'subscribers' | 'all'>('subscribers');
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [mailTemplate, setMailTemplate] = useState({
        title: 'Özel İndirim Fırsatı!',
        content: 'Takip ettiğiniz ürünlerde büyük indirimler başladı. Hemen incelemek için tıklayın.'
    });

    // Deduplicate alerts by email for the UI list
    const uniqueAlerts = useMemo(() => {
        const seen = new Set();
        return (Array.isArray(alerts) ? alerts : []).filter(alert => {
            const email = alert.email.toLowerCase().trim();
            const duplicate = seen.has(email);
            seen.add(email);
            return !duplicate;
        });
    }, [alerts]);

    // Combined list based on audience
    const displayList = useMemo(() => {
        if (targetAudience === 'subscribers') {
            return uniqueAlerts.map(alert => ({
                id: alert.id,
                name: alert.userName,
                email: alert.email,
                product: alert.productName,
                price: alert.priceAtAlert,
                date: alert.date,
                isSubscriber: true,
                productId: alert.productId,
                userId: alert.userId
            }));
        } else {
            return users.map(user => ({
                id: user.id || Math.random().toString(),
                name: user.name,
                email: user.email,
                product: 'Tüm Ürünler',
                price: null,
                date: user.registerDate || '2024-01-01',
                isSubscriber: uniqueAlerts.some(a => a.email.toLowerCase() === user.email.toLowerCase()),
                productId: null,
                userId: user.id
            }));
        }
    }, [targetAudience, uniqueAlerts, users]);

    const filteredList = useMemo(() => {
        return displayList.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.product && item.product.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [displayList, searchTerm]);

    const toggleSelectAll = () => {
        if (selectedEmails.length === filteredList.length && filteredList.length > 0) {
            setSelectedEmails([]);
        } else {
            setSelectedEmails(filteredList.map(item => item.email));
        }
    };

    const toggleSelect = (email: string) => {
        setSelectedEmails(prev =>
            prev.includes(email)
                ? prev.filter(e => e !== email)
                : [...prev, email]
        );
    };

    const handleBulkSend = async () => {
        const targets = selectedEmails.length > 0 ? selectedEmails : filteredList.map(item => item.email);

        if (targets.length === 0) {
            showToast('Lütfen en az bir alıcı seçin veya listeyi filtreleyin.', 'warning');
            return;
        }

        if (!window.confirm(`${targets.length} kişiye toplu bildirim gönderilecek. Onaylıyor musunuz?`)) {
            return;
        }

        setIsSending(true);

        try {
            const targets = selectedEmails.length > 0 ? selectedEmails : filteredList.map(item => item.email);

            if (targets.length === 0) {
                setIsSending(false);
                showToast('Lütfen en az bir alıcı seçin.', 'error');
                return;
            }

            const batchSize = 10;
            let successCount = 0;
            let failCount = 0;

            for (let i = 0; i < targets.length; i += batchSize) {
                const batch = targets.slice(i, i + batchSize);

                const promises = batch.map(email => {
                    const item = displayList.find(d => d.email === email);
                    const payload = {
                        type: 'price-alert',
                        to: email,
                        data: {
                            title: mailTemplate.title,
                            content: mailTemplate.content,
                            userName: item?.name || 'Değerli Müşterimiz'
                        }
                    };

                    return fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    }).then(async res => {
                        const data = await res.json();
                        if (!res.ok) {
                            console.error(`❌ Send failed to ${email}:`, data);
                            return { success: false, error: data };
                        }
                        return data;
                    });
                });

                const results = await Promise.allSettled(promises);
                results.forEach(result => {
                    if (result.status === 'fulfilled' && result.value.success) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                });

                if (i + batchSize < targets.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            setIsSending(false);
            showToast(`✅ ${successCount} başarılı${failCount > 0 ? `, ${failCount} başarısız` : ''}`, failCount === 0 ? 'success' : 'warning');
            setSelectedEmails([]);
        } catch (error) {
            console.error('Bulk send error:', error);
            setIsSending(false);
            showToast('Sistem hatası oluştu.', 'error');
        }
    };

    const handleDelete = async (productId: string, userId: number | string) => {
        if (window.confirm('Bu alarm kaydını silmek istediğinize emin misiniz?')) {
            const result = await deactivateAlert(productId, Number(userId));
            if (result.success) {
                showToast('Kayıt başarıyla silindi.', 'success');
            }
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <Bell className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-normal text-slate-900 tracking-tight uppercase">Bildirim Yönetimi</h1>
                        <p className="text-slate-500 font-medium">Hedef kitleyi seçin ve toplu mail gönderin.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <Users className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-900 font-normal text-xl">{selectedEmails.length > 0 ? selectedEmails.length : filteredList.length}</span>
                        <span className="text-slate-500 font-normal text-sm">{selectedEmails.length > 0 ? 'Seçili' : 'Toplam'} Alıcı</span>
                    </div>
                    <button
                        onClick={handleBulkSend}
                        disabled={isSending || (selectedEmails.length === 0 && filteredList.length === 0)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-normal transition-all flex items-center gap-3 shadow-xl shadow-blue-100 disabled:opacity-50"
                    >
                        {isSending ? 'BİLDİRİMLER GÖNDERİLİYOR...' : (
                            <>
                                <Send className="w-5 h-5" />
                                {selectedEmails.length > 0 ? 'SEÇİLİ KİŞİLERE GÖNDER' : 'TOPLU BİLDİRİM GÖNDER'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Mail Template Editor */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-normal text-slate-900 mb-6 flex items-center gap-3 uppercase">
                            <Mail className="w-5 h-5 text-blue-600" />
                            Bildirim Şablonu
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-normal text-slate-400 mb-2 uppercase tracking-wider">HEDEF KİTLE</label>
                                <div className="flex gap-2 p-1 bg-slate-50 border border-slate-100 rounded-xl">
                                    <button
                                        onClick={() => { setTargetAudience('subscribers'); setSelectedEmails([]); }}
                                        className={`flex-1 px-3 py-2 text-xs font-normal rounded-lg transition-all ${targetAudience === 'subscribers' ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Alarm Kuranlar
                                    </button>
                                    <button
                                        onClick={() => { setTargetAudience('all'); setSelectedEmails([]); }}
                                        className={`flex-1 px-3 py-2 text-xs font-normal rounded-lg transition-all ${targetAudience === 'all' ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Tüm Üyeler
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-normal text-slate-400 mb-2 uppercase tracking-wider">MESAJ BAŞLIĞI</label>
                                <input
                                    type="text"
                                    value={mailTemplate.title}
                                    onChange={(e) => setMailTemplate({ ...mailTemplate, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-normal text-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-normal text-slate-400 mb-2 uppercase tracking-wider">MESAJ İÇERİĞİ (HTML DESTEKLİ)</label>
                                <textarea
                                    value={mailTemplate.content}
                                    onChange={(e) => setMailTemplate({ ...mailTemplate, content: e.target.value })}
                                    rows={8}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-normal text-slate-700 resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between gap-4">
                            <h2 className="text-lg font-normal text-slate-900 flex items-center gap-3 uppercase shrink-0">
                                <LayoutList className="w-5 h-5 text-blue-600" />
                                {targetAudience === 'subscribers' ? 'Takip Listesi' : 'Kayıtlı Üyeler'}
                            </h2>
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Üye adı veya e-posta ile ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-normal text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 w-12 text-center">
                                            <button
                                                onClick={toggleSelectAll}
                                                className="text-slate-400 hover:text-blue-600 transition-colors"
                                                title="Hepsini Seç/Kaldır"
                                            >
                                                {selectedEmails.length === filteredList.length && filteredList.length > 0
                                                    ? <CheckSquare className="w-5 h-5 text-blue-600" />
                                                    : <Square className="w-5 h-5" />
                                                }
                                            </button>
                                        </th>
                                        <th className="px-6 py-4 text-xs font-normal text-slate-400 uppercase tracking-wider">Üye Bilgileri</th>
                                        <th className="px-6 py-4 text-xs font-normal text-slate-400 uppercase tracking-wider">İlgi Alanı</th>
                                        <th className="px-6 py-4 text-xs font-normal text-slate-400 uppercase tracking-wider">Tarih</th>
                                        {targetAudience === 'subscribers' && (
                                            <th className="px-6 py-4 text-xs font-normal text-slate-400 uppercase tracking-wider text-right">İşlem</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredList.length > 0 ? (
                                        filteredList.map((item) => (
                                            <tr
                                                key={`${item.email}-${item.productId || 'all'}`}
                                                className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${selectedEmails.includes(item.email) ? 'bg-blue-50/30' : ''}`}
                                                onClick={() => toggleSelect(item.email)}
                                            >
                                                <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <button onClick={() => toggleSelect(item.email)} className="text-slate-400 hover:text-blue-600 transition-colors">
                                                        {selectedEmails.includes(item.email) ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5" />}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-normal text-sm">
                                                            {item.name ? item.name.charAt(0) : '?'}
                                                        </div>
                                                        <div>
                                                            <div className="font-normal text-slate-900 uppercase text-sm flex items-center gap-2">
                                                                {item.name || 'İsimsiz Üye'}
                                                                {item.isSubscriber && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                                            </div>
                                                            <div className="text-xs text-slate-500 font-medium">{item.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-normal text-slate-700 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                                        {item.product}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-normal text-slate-500 text-sm">
                                                    {new Date(item.date).toLocaleDateString('tr-TR')}
                                                </td>
                                                {targetAudience === 'subscribers' && (
                                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => handleDelete(String(item.productId), item.userId)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-normal">
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
