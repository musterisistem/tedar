import React, { useState, useEffect } from 'react';
import { useSite, type TopCampaignItem } from '../../../context/SiteContext';
import { Save, AlertCircle, CheckCircle, Plus, Trash2, GripVertical, ExternalLink } from 'lucide-react';

export const TopCampaignManager: React.FC = () => {
    const { topCampaignBar, updateTopCampaignBar, saveSiteSettings } = useSite();
    const [isActive, setIsActive] = useState(topCampaignBar.isActive);
    const [items, setItems] = useState<TopCampaignItem[]>(topCampaignBar.items);

    // Form state for new item
    const [newItemText, setNewItemText] = useState('');
    const [newItemLink, setNewItemLink] = useState('');

    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setIsActive(topCampaignBar.isActive);
        setItems(topCampaignBar.items);
    }, [topCampaignBar]);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemText.trim()) return;

        const newItem: TopCampaignItem = {
            id: Date.now().toString(),
            text: newItemText,
            link: newItemLink || '#',
            isActive: true,
            order: items.length + 1
        };

        setItems([...items, newItem]);
        setNewItemText('');
        setNewItemLink('');
    };

    const handleDeleteItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleToggleItem = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, isActive: !item.isActive } : item
        ));
    };

    const handleUpdateItem = (id: string, field: keyof TopCampaignItem, value: any) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return;

        const newItems = [...items];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap orders
        const tempOrder = newItems[index].order;
        newItems[index].order = newItems[swapIndex].order;
        newItems[swapIndex].order = tempOrder;

        // Swap positions in array
        [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];

        setItems(newItems);
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        setStatus({ type: null, message: '' });

        try {
            const newSettings = {
                isActive,
                items
            };

            updateTopCampaignBar(newSettings);
            await saveSiteSettings();
            setStatus({ type: 'success', message: 'Kampanya bandı ayarları başarıyla kaydedildi.' });
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
                    <h1 className="text-2xl font-normal text-gray-800">Kampanya Bandı Yönetimi</h1>
                    <p className="text-gray-500 mt-1">Sitenin en üstündeki kayan yazı alanını yönetin.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Durum:</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isActive}
                                onChange={e => setIsActive(e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: List & Edit */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Add New Item */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-normal text-gray-800 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-blue-600" />
                            Yeni Kampanya Ekle
                        </h3>
                        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Metni</label>
                                <input
                                    type="text"
                                    placeholder="Örn: 1500 TL Üzeri Kargo Bedava"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newItemText}
                                    onChange={e => setNewItemText(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Yönlendirme Linki</label>
                                <input
                                    type="text"
                                    placeholder="Örn: /kampanyalar"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newItemLink}
                                    onChange={e => setNewItemLink(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-normal hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Ekle
                            </button>
                        </form>
                    </div>

                    {/* Items List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-normal text-gray-700">Aktif Kampanyalar ({items.length})</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {items.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    Henüz eklenmiş kampanya yok.
                                </div>
                            ) : (
                                items.map((item, index) => (
                                    <div key={item.id} className={`p-4 flex items-center gap-4 group ${!item.isActive ? 'bg-gray-50 opacity-75' : 'bg-white'}`}>
                                        <div className="flex flex-col gap-1 text-gray-400">
                                            <button
                                                onClick={() => moveItem(index, 'up')}
                                                disabled={index === 0}
                                                className="hover:text-blue-600 disabled:opacity-30"
                                            >
                                                ▲
                                            </button>
                                            <button
                                                onClick={() => moveItem(index, 'down')}
                                                disabled={index === items.length - 1}
                                                className="hover:text-blue-600 disabled:opacity-30"
                                            >
                                                ▼
                                            </button>
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                value={item.text}
                                                onChange={(e) => handleUpdateItem(item.id, 'text', e.target.value)}
                                                className="w-full px-3 py-1.5 rounded border border-gray-200 focus:border-blue-500 outline-none text-sm font-medium"
                                            />
                                            <div className="flex items-center gap-2">
                                                <ExternalLink className="w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={item.link}
                                                    onChange={(e) => handleUpdateItem(item.id, 'link', e.target.value)}
                                                    className="w-full px-3 py-1.5 rounded border border-gray-200 focus:border-blue-500 outline-none text-sm text-gray-600"
                                                    placeholder="#"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={item.isActive}
                                                    onChange={() => handleToggleItem(item.id)}
                                                />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>

                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview & Save */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
                        <h3 className="text-lg font-normal text-gray-800 mb-4">Önizleme</h3>

                        <div className="mb-6">
                            <p className="text-xs text-gray-500 mb-2">Sitede Görünüm:</p>
                            <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200 flex flex-col">
                                {isActive ? (
                                    <div className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 h-8 w-full flex items-center px-4 overflow-hidden relative">
                                        <div className="flex gap-8 whitespace-nowrap opacity-80">
                                            {items.filter(i => i.isActive).map((item, i) => (
                                                <div key={i} className="flex items-center text-white text-[10px]">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-2"></div>
                                                    {item.text}
                                                </div>
                                            ))}
                                            {items.filter(i => i.isActive).length === 0 && (
                                                <span className="text-white/50 text-xs italic">Aktif kampanya yok...</span>
                                            )}
                                        </div>
                                        {/* Fade effects */}
                                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-blue-900 to-transparent"></div>
                                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-blue-900 to-transparent"></div>
                                    </div>
                                ) : (
                                    <div className="h-8 bg-gray-200 w-full flex items-center justify-center text-[10px] text-gray-500 font-mono">
                                        [BANNER KAPALI]
                                    </div>
                                )}
                                <div className="flex-1 bg-white border-t border-gray-200">
                                    <div className="h-4 w-full border-b border-gray-100"></div>
                                    <div className="p-2 flex gap-4">
                                        <div className="w-20 h-full bg-gray-100 rounded"></div>
                                        <div className="flex-1 h-full bg-gray-50 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {status.message && (
                            <div className={`p-4 rounded-lg flex items-center gap-3 mb-4 text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {status.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {status.message}
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-normal hover:bg-blue-700 transition-all transform hover:scale-[1.02] shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
