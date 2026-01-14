import React, { useState, useEffect } from 'react';
import { useSite } from '../../context/SiteContext';
import type { ContactPageData } from '../../context/SiteContext';
import { Save, RefreshCw, Phone, MapPin, Clock } from 'lucide-react';

const defaultContactData: ContactPageData = {
    address: "İstoç Ticaret Merkezi, 24. Ada No:12 Bağcılar / İSTANBUL",
    phone: "+90 (212) 123 45 67",
    whatsapp: "+90 (555) 123 45 67",
    email: "info@dorteltedarik.com",
    supportEmail: "destek@dorteltedarik.com",
    workingHoursWeek: "Pazartesi - Cuma: 09:00 - 18:00",
    workingHoursWeekend: "Cumartesi: 09:00 - 14:00",
    mapEmbedUrl: ""
};

export const ContactManager: React.FC = () => {
    const { contactPage, updateContactPage, saveSiteSettings } = useSite();
    const [formData, setFormData] = useState<ContactPageData>(contactPage || defaultContactData);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Sync state if context changes (e.g. initial load)
    useEffect(() => {
        if (contactPage) {
            setFormData(contactPage);
        }
    }, [contactPage]);

    if (!formData) {
        return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            updateContactPage(formData);
            const result = await saveSiteSettings();
            if (result.success) {
                setMessage({ type: 'success', text: 'İletişim sayfası başarıyla güncellendi.' });
            } else {
                setMessage({ type: 'error', text: 'Kaydedilirken bir hata oluştu: ' + result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Beklenmedik bir hata oluştu.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">İletişim Sayfası Yönetimi</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Contact Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6 text-blue-800 border-b pb-2">
                    <MapPin className="w-5 h-5" />
                    <h2 className="text-lg font-bold">Adres ve Konum</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Açık Adres</label>
                            <textarea
                                name="address"
                                value={formData.address || ''}
                                onChange={handleChange}
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed URL (iframe src)</label>
                            <input
                                type="text"
                                name="mapEmbedUrl"
                                value={formData.mapEmbedUrl || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Google Maps &gt; Paylaş &gt; Haritayı Yerleştir kısmındaki 'src' içindeki linki yapıştırın.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6 text-blue-800 border-b pb-2">
                    <Phone className="w-5 h-5" />
                    <h2 className="text-lg font-bold">İletişim Bilgileri</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Whatsapp Numarası</label>
                        <input
                            type="text"
                            name="whatsapp"
                            value={formData.whatsapp || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta (Genel)</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta (Destek)</label>
                        <input
                            type="email"
                            name="supportEmail"
                            value={formData.supportEmail || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6 text-blue-800 border-b pb-2">
                    <Clock className="w-5 h-5" />
                    <h2 className="text-lg font-bold">Çalışma Saatleri</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hafta İçi Mesai</label>
                        <input
                            type="text"
                            name="workingHoursWeek"
                            value={formData.workingHoursWeek || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Örn: Pazartesi - Cuma: 09:00 - 18:00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hafta Sonu Mesai</label>
                        <input
                            type="text"
                            name="workingHoursWeekend"
                            value={formData.workingHoursWeekend || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Örn: Cumartesi: 09:00 - 14:00"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
