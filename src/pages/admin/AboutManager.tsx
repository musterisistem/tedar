import React, { useState, useEffect } from 'react';
import { useSite, type AboutPageData } from '../../context/SiteContext';
import { Save, RefreshCw, Image as ImageIcon, Type, Target, Users, Award, TrendingUp } from 'lucide-react';

export const AboutManager: React.FC = () => {
    const { aboutPage, updateAboutPage, saveSiteSettings } = useSite();
    const [formData, setFormData] = useState<AboutPageData>(aboutPage);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Sync state if context changes (e.g. initial load)
    useEffect(() => {
        if (aboutPage) {
            // Ensure nested objects exist with defaults
            setFormData({
                ...aboutPage,
                stats: aboutPage.stats || { years: '', yearsLabel: '', customers: '', customersLabel: '' },
                values: aboutPage.values || []
            });
        }
    }, [aboutPage]);

    if (!formData || !formData.stats || !formData.values) {
        return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStatChange = (key: keyof AboutPageData['stats'], value: string) => {
        setFormData(prev => ({
            ...prev,
            stats: {
                ...prev.stats,
                [key]: value
            }
        }));
    };

    const handleValueChange = (index: number, field: 'title' | 'description', value: string) => {
        const newValues = [...formData.values];
        newValues[index] = { ...newValues[index], [field]: value };
        setFormData(prev => ({
            ...prev,
            values: newValues
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            updateAboutPage(formData);
            const result = await saveSiteSettings({ aboutPage: formData });
            if (result.success) {
                setMessage({ type: 'success', text: 'Hakkımızda sayfası başarıyla güncellendi.' });
            } else {
                setMessage({ type: 'error', text: 'Kaydedilirken bir hata oluştu: ' + result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Beklenmedik bir hata oluştu.' });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof AboutPageData) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setFormData(prev => ({
                    ...prev,
                    [field]: result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Hakkımızda Sayfası Yönetimi</h1>
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

            {/* Hero Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6 text-blue-800 border-b pb-2">
                    <ImageIcon className="w-5 h-5" />
                    <h2 className="text-lg font-bold">Hero (Üst) Bölümü</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                            <input
                                type="text"
                                name="heroTitle"
                                value={formData.heroTitle}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                            <textarea
                                name="heroDescription"
                                value={formData.heroDescription}
                                onChange={handleChange}
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Arkaplan Görseli</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'heroImage')}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
                        />
                        {formData.heroImage && (
                            <div className="h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                <img src={formData.heroImage} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">Mevcut görsel korunur. Değiştirmek için yeni dosya seçin.</p>
                    </div>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6 text-blue-800 border-b pb-2">
                    <Type className="w-5 h-5" />
                    <h2 className="text-lg font-bold">Misyon & İçerik</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Misyon Başlığı</label>
                        <input
                            type="text"
                            name="missionTitle"
                            value={formData.missionTitle}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Paragraf 1</label>
                            <textarea
                                name="missionText1"
                                value={formData.missionText1}
                                onChange={handleChange}
                                rows={6}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Paragraf 2</label>
                            <textarea
                                name="missionText2"
                                value={formData.missionText2}
                                onChange={handleChange}
                                rows={6}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats & Images */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6 text-blue-800 border-b pb-2">
                    <Target className="w-5 h-5" />
                    <h2 className="text-lg font-bold">İstatistikler ve Görseller</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700">İstatistikler</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Yıl Değeri</label>
                                <input
                                    type="text"
                                    value={formData.stats.years}
                                    onChange={(e) => handleStatChange('years', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Yıl Etiketi</label>
                                <input
                                    type="text"
                                    value={formData.stats.yearsLabel}
                                    onChange={(e) => handleStatChange('yearsLabel', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Müşteri Değeri</label>
                                <input
                                    type="text"
                                    value={formData.stats.customers}
                                    onChange={(e) => handleStatChange('customers', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Müşteri Etiketi</label>
                                <input
                                    type="text"
                                    value={formData.stats.customersLabel}
                                    onChange={(e) => handleStatChange('customersLabel', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700">Ofis Görselleri</h3>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Ana Ofis Görseli</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'officeImage')}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
                            />
                            {formData.officeImage && (
                                <div className="h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                    <img src={formData.officeImage} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Toplantı Görseli</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'meetingImage')}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
                            />
                            {formData.meetingImage && (
                                <div className="h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                    <img src={formData.meetingImage} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Values */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6 text-blue-800 border-b pb-2">
                    <Award className="w-5 h-5" />
                    <h2 className="text-lg font-bold">Değerlerimiz (Kartlar)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formData.values.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <h4 className="font-bold text-gray-700 mb-2">Başlık {index + 1}</h4>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => handleValueChange(index, 'title', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    placeholder="Başlık"
                                />
                                <textarea
                                    value={item.description}
                                    onChange={(e) => handleValueChange(index, 'description', e.target.value)}
                                    rows={2}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    placeholder="Açıklama"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
