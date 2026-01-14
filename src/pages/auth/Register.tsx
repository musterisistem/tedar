import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUsers } from '../../context/UserContext';
import { ChevronDown } from 'lucide-react';
import { locationData } from '../../data/locationData';



export const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useUsers();

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
            district: '' // Reset district when city changes
        });

        if (selectedCity && locationData[selectedCity]) {
            setAvailableDistricts(Object.keys(locationData[selectedCity]));
        } else {
            // If they select "Select City" properly, clear districts. 
            // If not in list (manual map extension needed), empty.
            setAvailableDistricts([]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert('Şifreler eşleşmiyor!');
            return;
        }

        register({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            district: formData.district,
            zipCode: formData.zipCode,
            address: formData.address,
            password: formData.password
        });

        navigate('/account');
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
            <div className="max-w-2xl w-full space-y-8 bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-100">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
                        Aramıza Katılın
                    </h2>
                    <p className="mt-3 text-lg text-slate-500">
                        Alışverişin en keyifli hali için hesabınızı oluşturun.
                    </p>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                        {/* Name */}
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Ad Soyad</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                placeholder="Adınız Soyadınız"
                            />
                        </div>

                        {/* Email */}
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">E-Posta Adresi</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                placeholder="ornek@email.com"
                            />
                        </div>

                        {/* Phone */}
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Telefon</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                placeholder="(555) 555 55 55"
                            />
                        </div>

                        {/* City Select */}
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Şehir</label>
                            <div className="relative">
                                <select
                                    name="city"
                                    required
                                    value={formData.city}
                                    onChange={handleCityChange}
                                    className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                                >
                                    <option value="">Seçiniz</option>
                                    {Object.keys(locationData).sort((a, b) => a.localeCompare(b, 'tr')).map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* District Select */}
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">İlçe</label>
                            <div className="relative">
                                <select
                                    name="district"
                                    required
                                    disabled={!formData.city}
                                    value={formData.district}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                >
                                    <option value="">{formData.city ? 'İlçe Seçiniz' : 'Önce Şehir Seçiniz'}</option>
                                    {availableDistricts.map(dist => (
                                        <option key={dist} value={dist}>{dist}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Zip Code */}
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Posta Kodu</label>
                            <input
                                type="text"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                                className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                placeholder="34000 (Opsiyonel)"
                                maxLength={5}
                            />
                        </div>

                        {/* Address - Full Width */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Açık Adres</label>
                            <textarea
                                name="address"
                                required
                                rows={3}
                                value={formData.address}
                                onChange={handleChange}
                                className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                                placeholder="Mahalle, Cadde, Sokak, Kapı No..."
                            />
                        </div>

                        {/* Passwords */}
                        <div className="col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Şifre</label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                placeholder="******"
                            />
                        </div>

                        <div className="col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Şifre Tekrar</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                placeholder="******"
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Hesabı Oluştur
                        </button>
                    </div>

                    <div className="mt-8 flex items-center justify-center space-x-1 text-sm text-slate-500">
                        <span>Zaten hesabınız var mı?</span>
                        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                            Giriş Yapın
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};
