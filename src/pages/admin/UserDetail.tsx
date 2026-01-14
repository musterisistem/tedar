import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUsers, type User } from '../../context/UserContext';
import { Save, ArrowLeft, MapPin, Package, Key, User as UserIcon, Shield } from 'lucide-react';

export const UserDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { users, updateUser } = useUsers();
    const [user, setUser] = useState<User | null>(null);

    // Form States
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [password, setPassword] = useState(''); // Mock password change

    // Address State (Simple view for now, usually requires comprehensive address management)
    // We will sync addressContent with user.addresses[0].content for simplicity in this mock
    const [addressTitle, setAddressTitle] = useState('');
    const [addressContent, setAddressContent] = useState('');

    useEffect(() => {
        if (id && users.length > 0) {
            const foundUser = users.find(u => u.id === Number(id));
            if (foundUser) {
                setUser(foundUser);
                setName(foundUser.name);
                setUsername(foundUser.username);
                setEmail(foundUser.email);
                setPhone(foundUser.phone || '');
                setCity(foundUser.city || '');
                setDistrict(foundUser.district || '');

                if (foundUser.addresses.length > 0) {
                    setAddressTitle(foundUser.addresses[0].title);
                    setAddressContent(foundUser.addresses[0].content);
                }
            } else {
                navigate('/admin/users');
            }
        }
    }, [id, users, navigate]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            updateUser(user.id, {
                name,
                username,
                email,
                phone,
                city,
                district,
                // In a real app, password would be handled securely backend-side
                addresses: addressContent ? [{ title: addressTitle || 'Adres', content: addressContent }] : user.addresses
            });
            alert('Kullanıcı bilgileri güncellendi.');
        }
    };

    if (!user) return <div className="p-8">Yükleniyor...</div>;

    return (
        <div className="w-full mx-auto pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/users')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Kullanıcı Düzenle</h1>
                        <p className="text-slate-500 mt-1">#{user.id} - {user.name}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile & Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Public Profile */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-blue-500" />
                            Kişisel Bilgiler
                        </h2>
                        <form onSubmit={handleSave} className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Kullanıcı Adı</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">E-Posta</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Şehir</label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">İlçe</label>
                                    <input
                                        type="text"
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 mt-2">
                                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <Key className="w-4 h-4 text-orange-500" />
                                    Şifre Değiştir
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Yeni Şifre</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Değiştirmek istemiyorsanız boş bırakın"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Address Info */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-red-500" />
                            Fatura Adresi
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Adres Başlığı</label>
                                <input
                                    type="text"
                                    value={addressTitle}
                                    onChange={(e) => setAddressTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Açık Adres</label>
                                <textarea
                                    rows={3}
                                    value={addressContent}
                                    onChange={(e) => setAddressContent(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & History */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-500" />
                            Hesap Durumu
                        </h2>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-slate-500">Durum:</span>
                            <div className="flex items-center gap-2">
                                {user.isOnline ? (
                                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        Online
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                        Offline
                                    </span>
                                )}
                                {user.status === 'active' ? (
                                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">Aktif</span>
                                ) : (
                                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">Engelli</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-slate-500">Mevcut IP:</span>
                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-600">{user.ipAddress}</span>
                        </div>
                        {user.lastLogin && (
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-slate-500">Son Giriş:</span>
                                <span className="text-sm font-medium text-slate-800">{user.lastLogin}</span>
                            </div>
                        )}

                        {user.ipHistory && user.ipHistory.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Giriş Kayıtları (IP)</span>
                                <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                    {user.ipHistory.map((ip, idx) => (
                                        <div key={idx} className="flex justify-between text-xs text-slate-600 px-2 py-1 hover:bg-slate-50 rounded">
                                            <span className="font-mono">{ip}</span>
                                            <span className="text-[10px] text-slate-400">Arşiv</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                            <span className="text-sm text-slate-500">Kayıt Tarihi:</span>
                            <span className="text-sm font-medium">{user.registerDate}</span>
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-orange-500" />
                            Sipariş Geçmişi
                        </h2>
                        {user.orders.length > 0 ? (
                            <div className="space-y-3">
                                {user.orders.map(order => (
                                    <Link to={`/admin/orders/${order.id}`} key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-300 hover:shadow-sm transition-all group cursor-pointer">
                                        <div>
                                            <div className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{order.id}</div>
                                            <div className="text-[10px] text-slate-400">{order.date}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-slate-800">{order.total} TL</div>
                                            <div className="text-[10px] text-green-600 font-medium">{order.status}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">Henüz sipariş bulunmuyor.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
