import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, ArrowLeft, CheckCircle, Loader } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
    const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contactMethod,
                    value
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.error || 'Bir hata oluştu');
            }
        } catch (err) {
            setError('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">E-posta Gönderildi!</h2>
                    <p className="text-gray-600 mb-6">
                        Şifre sıfırlama bağlantısı {contactMethod === 'email' ? 'e-posta adresinize' : 'kayıtlı e-posta adresinize'} gönderildi.
                        Lütfen gelen kutunuzu kontrol edin.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Bu bağlantı <strong>24 saat</strong> geçerlidir.
                    </p>
                    <Link
                        to="/giris"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Giriş sayfasına dön
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="mb-8">
                    <Link to="/giris" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Geri
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Şifremi Unuttum</h1>
                    <p className="text-gray-500 text-sm mt-2">
                        E-posta adresinizi veya telefon numaranızı girin, size şifre sıfırlama bağlantısı gönderelim.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contact Method Selection */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => { setContactMethod('email'); setValue(''); }}
                            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${contactMethod === 'email'
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            <Mail className="w-5 h-5 mx-auto mb-1" />
                            <span className="text-xs">E-posta</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setContactMethod('phone'); setValue(''); }}
                            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${contactMethod === 'phone'
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            <Phone className="w-5 h-5 mx-auto mb-1" />
                            <span className="text-xs">Telefon</span>
                        </button>
                    </div>

                    {/* Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {contactMethod === 'email' ? 'E-posta Adresi' : 'Telefon Numarası'}
                        </label>
                        <div className="relative">
                            <input
                                type={contactMethod === 'email' ? 'email' : 'tel'}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder={contactMethod === 'email' ? 'ornek@email.com' : '05__ ___ __ __'}
                                required
                            />
                            {contactMethod === 'email' ? (
                                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            ) : (
                                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Gönderiliyor...
                            </>
                        ) : (
                            'Sıfırlama Bağlantısı Gönder'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Şifrenizi hatırladınız mı?{' '}
                    <Link to="/giris" className="text-blue-600 hover:text-blue-700 font-medium">
                        Giriş yapın
                    </Link>
                </div>
            </div>
        </div>
    );
};
