import React, { useState, useEffect } from 'react';
import { useSite, type PolicyPages, type PolicyPage } from '../../context/SiteContext';
import { Save, RefreshCw, FileText } from 'lucide-react';

export const PolicyManager: React.FC = () => {
    const { policyPages, updatePolicyPages, saveSiteSettings } = useSite();
    const [formData, setFormData] = useState<PolicyPages>({
        distanceSalesAgreement: { title: '', content: '' },
        returnConditions: { title: '', content: '' },
        membershipAgreement: { title: '', content: '' }
    });
    const [selectedPage, setSelectedPage] = useState<keyof PolicyPages>('distanceSalesAgreement');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (policyPages) {
            // Merge allows robust updates if new keys added later
            setFormData(prev => ({
                ...prev,
                ...policyPages
            }));
        }
    }, [policyPages]);

    const handleChange = (field: keyof PolicyPage, value: string) => {
        setFormData(prev => ({
            ...prev,
            [selectedPage]: {
                ...prev[selectedPage],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            updatePolicyPages(formData);
            const result = await saveSiteSettings({ policyPages: formData });
            if (result.success) {
                setMessage({ type: 'success', text: 'Sözleşme sayfaları başarıyla güncellendi.' });
            } else {
                setMessage({ type: 'error', text: 'Kaydedilirken bir hata oluştu: ' + result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Beklenmedik bir hata oluştu.' });
        } finally {
            setSaving(false);
        }
    };

    const pages = [
        { key: 'distanceSalesAgreement', label: 'Mesafeli Satış Sözleşmesi' },
        { key: 'returnConditions', label: 'İade ve Kargo Şartları' },
        { key: 'membershipAgreement', label: 'Üyelik Sözleşmesi' },
    ];

    return (
        <div className="space-y-6 pb-24">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Sözleşme Sayfaları Yönetimi</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
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

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg mb-8 overflow-x-auto">
                    {pages.map(page => (
                        <button
                            key={page.key}
                            onClick={() => setSelectedPage(page.key as keyof PolicyPages)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all whitespace-nowrap ${selectedPage === page.key
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            {page.label}
                        </button>
                    ))}
                </div>

                {/* Editor Content */}
                <div className="space-y-6 animate-fadeIn">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sayfa Başlığı</label>
                        <input
                            type="text"
                            value={formData[selectedPage]?.title || ''}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                            placeholder="Sayfa başlığı..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">İçerik (HTML)</label>
                        <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
                            <textarea
                                value={formData[selectedPage]?.content || ''}
                                onChange={(e) => handleChange('content', e.target.value)}
                                rows={20}
                                className="w-full p-4 outline-none font-mono text-sm bg-gray-50"
                                placeholder="<p>Buraya HTML içeriği girebilirsiniz...</p>"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Not: Buraya HTML etiketleri (p, strong, ul, li vb.) kullanarak içerik girebilirsiniz.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
