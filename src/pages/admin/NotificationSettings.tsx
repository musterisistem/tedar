import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Mail } from 'lucide-react';

interface NotificationSettings {
    adminEmails: string[];
}

export const NotificationSettings: React.FC = () => {
    const [settings, setSettings] = useState<NotificationSettings>({ adminEmails: [] });
    const [newEmail, setNewEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/notification-settings');
            if (res.ok) {
                const result = await res.json();
                if (result.success && result.data) {
                    setSettings({ adminEmails: result.data.adminEmails || [] });
                }
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Save to MongoDB (for Vercel compatibility)
            const res = await fetch('/api/notification-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi' });
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Ayarlar kaydedilirken bir hata oluştu' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const addEmail = () => {
        if (!newEmail || !newEmail.includes('@')) return;
        if (settings.adminEmails.includes(newEmail)) return;

        setSettings(prev => ({
            ...prev,
            adminEmails: [...prev.adminEmails, newEmail]
        }));
        setNewEmail('');
    };

    const removeEmail = (email: string) => {
        setSettings(prev => ({
            ...prev,
            adminEmails: prev.adminEmails.filter(e => e !== email)
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Bildirim Ayarları</h1>
                    <p className="text-gray-500">Sipariş bildirimlerinin gönderileceği e-posta adreslerini yönetin.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    <Save className="w-5 h-5" />
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    Admin E-posta Adresleri
                </h2>

                <div className="flex gap-2 mb-6">
                    <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="E-posta adresi ekle..."
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && addEmail()}
                    />
                    <button
                        onClick={addEmail}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Ekle
                    </button>
                </div>

                <div className="space-y-2">
                    {settings.adminEmails.length === 0 && (
                        <p className="text-gray-400 italic text-center py-4">Henüz e-posta adresi eklenmemiş.</p>
                    )}

                    {settings.adminEmails.map((email, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-gray-700">{email}</span>
                            <button
                                onClick={() => removeEmail(email)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <p className="mt-4 text-xs text-gray-500">
                    * Bu listeye eklenen tüm e-posta adreslerine, yeni bir sipariş oluşturulduğunda otomatik bildirim gönderilecektir.
                </p>
            </div>
        </div>
    );
};
