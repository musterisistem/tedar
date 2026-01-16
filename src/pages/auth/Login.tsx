import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUsers } from '../../context/UserContext';
import { Mail, Lock, AlertCircle, LogIn, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useUsers();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Giriş yapılamadı!');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row h-[600px]">

                {/* Sol Taraf - Görsel */}
                <div className="hidden md:flex md:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative relative overflow-hidden group">
                    {/* Abstract Background Shapes */}
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-all duration-700"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-3xl group-hover:bg-indigo-600/30 transition-all duration-700"></div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center mb-8">
                            <LogIn className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4 leading-tight">Tekrar Hoşgeldiniz!</h2>
                        <p className="text-slate-300 text-lg font-light leading-relaxed">
                            Siparişlerinizi takip etmek, özel tekliflerden yararlanmak ve hesabınızı yönetmek için giriş yapın.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <p className="text-sm text-slate-400 mb-6 font-medium uppercase tracking-wider">Henüz hesabınız yok mu?</p>
                        <Link to="/kayit" className="inline-flex items-center gap-2 text-white font-bold hover:gap-4 transition-all duration-300 group/link">
                            Hemen Kayıt Olun <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1" />
                        </Link>
                    </div>
                </div>

                {/* Sağ Taraf - Form */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white">
                    <div className="flex flex-col items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Giriş Yap</h2>
                        <p className="text-sm text-gray-500 mt-2">Lütfen hesabınıza giriş yapın</p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-100 flex items-start gap-3 animate-fadeIn">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">E-POSTA ADRESİ</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    placeholder="ornek@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1 ml-1">
                                <label className="block text-xs font-semibold text-gray-700">ŞİFRE</label>
                                <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500">
                                    Şifremi unuttum?
                                </a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center mb-2">
                            <input
                                id="remember_me"
                                name="remember_me"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
                                Beni hatırla
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-200 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin -ml-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Giriş Yapılıyor...
                                </span>
                            ) : 'GİRİŞ YAP'}
                        </button>

                        <div className="mt-6 md:hidden text-center">
                            <p className="text-sm text-gray-600">
                                Henüz hesabınız yok mu?{' '}
                                <Link to="/kayit" className="font-medium text-blue-600 hover:text-blue-500">
                                    Kayıt Ol
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

