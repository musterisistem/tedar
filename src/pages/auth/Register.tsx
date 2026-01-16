
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUsers } from '../../context/UserContext';
import { Mail, Lock, User, Phone, MapPin, Building, AlertCircle } from 'lucide-react';
import { locationData } from '../../data/locationData'; // Assuming this exists for city/district

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useUsers();

    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
        passwordConfirm: '',
        phone: '',
        city: '',
        district: '',
        town: '',
        address: '',
        zipCode: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Filtered districts based on selected city
    // Filtered districts based on selected city
    const districts = formData.city ? (locationData[formData.city] ? Object.keys(locationData[formData.city]) : []) : [];
    // If you have town data, adjust here. Assuming simple city/district for now or based on your locationData structure.

    // Basit locationData yapısı varsayımı (Şehir -> İlçeler)
    // Eğer locationData yoksa, statik veya props ile alacağız. 
    // Kullanıcının attığı dosyalardan locationData.ts var olduğu biliniyor.

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Reset district if city changes
        if (name === 'city') {
            setFormData(prev => ({ ...prev, city: value, district: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.passwordConfirm) {
            setError('Şifreler eşleşmiyor!');
            return;
        }

        if (formData.password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        setLoading(true);

        const fullName = `${formData.name} ${formData.surname}`.trim();

        const result = await register({
            name: fullName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            city: formData.city,
            district: formData.district, // Note: You might need to update UserContext register type signature if it doesn't accept district separately or just append to address
            address: formData.address, // Combining explicitly or passing raw
            zipCode: formData.zipCode
        });

        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Kayıt işlemi başarısız.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8">

                {/* Sol Taraf - Görsel & Bilgi */}
                <div className="hidden md:flex flex-col justify-between w-1/3 bg-blue-600 rounded-xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-indigo-500 rounded-full opacity-50 blur-3xl"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">Aramıza Katılın!</h2>
                        <p className="text-blue-100 mb-6">
                            Dörtel Tedarik avantajlarından yararlanmak, kampanyalardan haberdar olmak ve hızlı alışveriş yapmak için hemen üye olun.
                        </p>
                        <ul className="space-y-3 text-sm text-blue-100">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full"></div> Hızlı Sipariş</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full"></div> Sipariş Takibi</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full"></div> Özel İndirimler</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full"></div> Favori Listeleri</li>
                        </ul>
                    </div>

                    <div className="relative z-10 text-xs text-blue-200 mt-auto pt-8">
                        © 2026 Dörtel Tedarik
                    </div>
                </div>

                {/* Sağ Taraf - Form */}
                <div className="flex-1">
                    <div className="text-center md:text-left mb-8">
                        <h3 className="text-2xl font-bold text-gray-900">Hesap Oluştur</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Zaten hesabınız var mı?{' '}
                            <Link to="/giris" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                Giriş Yap
                            </Link>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-100 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>

                        {/* Ad Soyad */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="relative">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">AD</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        placeholder="Adınız"
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">SOYAD</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="surname"
                                        required
                                        value={formData.surname}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        placeholder="Soyadınız"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* E-Posta & Telefon */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">E-POSTA</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        placeholder="ornek@email.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">TELEFON</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        placeholder="05XX XXX XX XX"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Şehir & İlçe */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">ŞEHİR</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <select
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none"
                                    >
                                        <option value="">Seçiniz</option>
                                        {Object.keys(locationData).sort().map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">İLÇE</label>
                                <div className="relative">
                                    <select
                                        name="district"
                                        required
                                        disabled={!formData.city}
                                        value={formData.district}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none disabled:bg-gray-100 disabled:text-gray-400"
                                    >
                                        <option value="">Seçiniz</option>
                                        {districts.sort().map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Adres */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">AÇIK ADRES</label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none">
                                    <Building className="h-4 w-4 text-gray-400" />
                                </div>
                                <textarea
                                    name="address"
                                    required
                                    rows={2}
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                                    placeholder="Mahalle, Sokak, Kapı No vb."
                                />
                            </div>
                        </div>

                        {/* Şifreler */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">ŞİFRE</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        placeholder="******"
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">ŞİFRE TEKRAR</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        name="passwordConfirm"
                                        required
                                        value={formData.passwordConfirm}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        placeholder="******"
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="flex items-center mb-4">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    required
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="terms" className="ml-2 block text-xs text-gray-600">
                                    <Link to="/sozlesme" className="text-blue-600 hover:underline">Üyelik Sözleşmesi</Link>'ni okudum ve kabul ediyorum.
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg shadow-blue-200 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Kayıt Yapılıyor...' : 'KAYDI TAMAMLA'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
