import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, Loader, XCircle, Eye, EyeOff } from 'lucide-react';

export const ResetPassword: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Validate token on mount
    useEffect(() => {
        const validateToken = async () => {
            try {
                const response = await fetch(`/api/auth/validate-reset-token/${token}`);
                const data = await response.json();

                if (response.ok && data.valid) {
                    setTokenValid(true);
                } else {
                    setTokenValid(false);
                    setError(data.error || 'Geçersiz veya süresi dolmuş bağlantı');
                }
            } catch (err) {
                setTokenValid(false);
                setError('Bağlantı doğrulanamadı');
            } finally {
                setValidating(false);
            }
        };

        if (token) {
            validateToken();
        } else {
            setValidating(false);
            setTokenValid(false);
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return;
        }

        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    newPassword: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/giris');
                }, 3000);
            } else {
                setError(data.error || 'Şifre sıfırlanamadı');
            }
        } catch (err) {
            setError('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Bağlantı doğrulanıyor...</p>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Geçersiz Bağlantı</h2>
                    <p className="text-gray-600 mb-6">
                        {error || 'Bu şifre sıfırlama bağlantısının süresi dolmuş veya geçersiz.'}
                    </p>
                    <Link
                        to="/sifremi-unuttum"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    >
                        Yeni Bağlantı İste
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Şifre Değiştirildi!</h2>
                    <p className="text-gray-600 mb-6">
                        Şifreniz başarıyla değiştirildi. Giriş sayfasına yönlendiriliyorsunuz...
                    </p>
                    <Link
                        to="/giris"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    >
                        Giriş Yap
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Yeni Şifre Belirle</h1>
                    <p className="text-gray-500 text-sm mt-2">
                        Lütfen yeni şifrenizi belirleyin
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Yeni Şifre
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="En az 6 karakter"
                                minLength={6}
                                required
                            />
                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Şifre Tekrar
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Şifrenizi tekrar girin"
                                minLength={6}
                                required
                            />
                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {password && confirmPassword && password !== confirmPassword && (
                        <p className="text-red-600 text-sm">Şifreler eşleşmiyor</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || password !== confirmPassword}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Kaydediliyor...
                            </>
                        ) : (
                            'Şifreyi Değiştir'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
