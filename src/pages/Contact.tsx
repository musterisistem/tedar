import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';

import { useSite } from '../context/SiteContext';
import { SEOHead, OrganizationSchema, BreadcrumbSchema } from '../components/seo';

const defaultContactInfo = {
    address: "İstoç Ticaret Merkezi, 24. Ada No:12 Bağcılar / İSTANBUL",
    phone: "+90 (212) 123 45 67",
    whatsapp: "+90 (555) 123 45 67",
    email: "info@dorteltedarik.com",
    supportEmail: "destek@dorteltedarik.com",
    workingHoursWeek: "Pazartesi - Cuma: 09:00 - 18:00",
    workingHoursWeekend: "Cumartesi: 09:00 - 14:00",
    mapEmbedUrl: ""
};

export const Contact: React.FC = () => {
    const { contactPage } = useSite();
    const contact = contactPage || defaultContactInfo;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate sending
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setSubmitted(false), 5000); // Hide success message after 5s
        }, 1500);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <SEOHead
                title="İletişim"
                description="Dörtel Tedarik iletişim bilgileri, adres, telefon ve mesaj formu. Bize ulaşın."
                url="/iletisim"
            />
            <OrganizationSchema />
            <BreadcrumbSchema items={[
                { name: 'Ana Sayfa', url: '/' },
                { name: 'İletişim', url: '/iletisim' }
            ]} />

            {/* Header */}
            <div className="bg-white border-b border-gray-200 py-12 mb-12">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">İletişim & Destek</h1>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        Sorularınız, önerileriniz veya kurumsal iş birlikleri için bizimle iletişime geçin. Ekibimiz en kısa sürede size dönüş yapacaktır.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Column: Support Form */}
                    <div className="order-2 lg:order-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Bize Mesaj Gönderin</h2>
                            </div>

                            {submitted ? (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-fade-in">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-green-800 mb-2">Mesajınız Alındı!</h3>
                                    <p className="text-green-600 font-medium">Teşekkür ederiz. En kısa sürede size geri dönüş yapacağız.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Adınız Soyadınız</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="Adınız Soyadınız"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">E-posta Adresiniz</label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="ornek@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Konu</label>
                                        <select
                                            name="subject"
                                            required
                                            value={formData.subject}
                                            onChange={handleChange} // Correct typing allows this
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">Konu Seçiniz</option>
                                            <option value="Sipariş Durumu">Sipariş Durumu</option>
                                            <option value="Ürün Bilgisi">Ürün Bilgisi</option>
                                            <option value="İade ve Değişim">İade ve Değişim</option>
                                            <option value="Kurumsal Teklif">Kurumsal Teklif</option>
                                            <option value="Diğer">Diğer</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mesajınız</label>
                                        <textarea
                                            name="message"
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                            placeholder="Size nasıl yardımcı olabiliriz?"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isSubmitting ? 'Gönderiliyor...' : 'Mesajı Gönder'}
                                        {!isSubmitting && <Send className="w-4 h-4" />}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Contact Info */}
                    <div className="order-1 lg:order-2 space-y-8">
                        {/* Info Cards */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg shrink-0">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Adresimiz</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                        {contact.address}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Telefon & Whatsapp</h3>
                                    <p className="text-gray-600 text-sm mb-1">{contact.phone}</p>
                                    <p className="text-gray-500 text-xs">{contact.workingHoursWeek}</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg shrink-0">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">E-Posta</h3>
                                    <p className="text-gray-600 text-sm">{contact.email}</p>
                                    <p className="text-gray-600 text-sm">{contact.supportEmail}</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Çalışma Saatleri</h3>
                                    <p className="text-gray-600 text-sm">{contact.workingHoursWeek}</p>
                                    <p className="text-gray-600 text-sm">{contact.workingHoursWeekend}</p>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm h-64 lg:h-80 overflow-hidden">
                            <iframe
                                src={contact.mapEmbedUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Google Maps"
                                className="rounded-lg"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
