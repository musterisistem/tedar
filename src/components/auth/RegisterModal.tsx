import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, ChevronDown } from 'lucide-react';
import { useUsers } from '../../context/UserContext';
import { locationData } from '../../data/locationData';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginClick: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onLoginClick }) => {
    const { register } = useUsers();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        city: '',
        district: '',
        zipCode: '',
        address: ''
    });

    const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCity = e.target.value;
        setFormData({
            ...formData,
            city: selectedCity,
            district: ''
        });

        if (selectedCity && locationData[selectedCity]) {
            setAvailableDistricts(Object.keys(locationData[selectedCity]));
        } else {
            setAvailableDistricts([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler eşleşmiyor!');
            return;
        }

        setIsLoading(true);

        try {
            const result = await register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                city: formData.city,
                district: formData.district,
                zipCode: formData.zipCode,
                address: formData.address,
                password: formData.password
            });

            if (result.success) {
                onClose();
            } else {
                setError(result.error || 'Kayıt sırasında bir hata oluştu.');
            }
        } catch (err) {
            setError('Sunucu hatası veya bağlantı sorunu.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slideUp max-h-[90vh] flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-6 text-white shrink-0">
                    <h2 className="text-2xl font-bold mb-1">Aramıza Katılın</h2>
                    <p className="text-blue-100 text-sm">Yeni bir hesap oluşturun</p>
                </div>

                <div className="p-8 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ad Soyad</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                                        placeholder="Adınız Soyadınız"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">E-Posta</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                                        placeholder="ornek@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Telefon</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                                        placeholder="05xx xxx xx xx"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Şehir</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleCityChange}
                                        className="w-full h-11 pl-10 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all appearance-none bg-white"
                                    >
                                        <option value="">Seçiniz</option>
                                        {Object.keys(locationData).sort((a, b) => a.localeCompare(b, 'tr')).map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">İlçe</label>
                                <div className="relative">
                                    <select
                                        name="district"
                                        required
                                        disabled={!formData.city}
                                        value={formData.district}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all appearance-none bg-white disabled:bg-gray-50"
                                    >
                                        <option value="">İlçe Seçiniz</option>
                                        {availableDistricts.map(dist => (
                                            <option key={dist} value={dist}>{dist}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Posta Kodu</label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                                    placeholder="34000"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Açık Adres</label>
                                <textarea
                                    name="address"
                                    required
                                    rows={2}
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all resize-none"
                                    placeholder="Mahalle, Cadde, Sokak, Kapı No..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Şifre</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                                            placeholder="Şifre"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                                            placeholder="Şifre Tekrar"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-75"
                        >
                            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Kayıt Ol'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-gray-600">
                            Zaten hesabınız var mı?{' '}
                            <button onClick={onLoginClick} className="text-blue-600 font-bold hover:underline">Giriş Yap</button>
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 shrink-0">
                    <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">Dörtel Mağazacılık ve Tedarik - Güvenli Kayıt</p>
                </div>
            </div>
        </div>
    );
};
