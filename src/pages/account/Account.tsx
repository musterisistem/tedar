import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUsers } from '../../context/UserContext';
import type { Address } from '../../context/UserContext';
import { locationData } from '../../data/locationData';
import { LogOut, Package, MapPin, User, Settings, Plus, Trash2, X, ChevronRight, Calendar, CreditCard, ChevronDown, Bell, ArrowRight, Heart } from 'lucide-react';
import { slugify } from '../../utils/slugify';
import { usePriceAlerts } from '../../context/PriceAlertContext';
import { useProducts } from '../../context/ProductContext';
import { ProductCard } from '../../components/common/ProductCard';
import { useLocation } from 'react-router-dom';
import { OrderTrackingModal } from '../../components/order/OrderTrackingModal';
import { useOrders } from '../../context/OrderContext';

export const Account: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, logout, updateUser, favorites, clearFavorites } = useUsers();
    const { products } = useProducts();
    const { alerts, deactivateAlert, clearUserAlerts } = usePriceAlerts();
    const { orders } = useOrders();

    // Filter user orders
    const userOrders = orders.filter(order =>
        order.userId === currentUser?.id ||
        order.email === currentUser?.email
    );

    // URL'den tab parametresini al veya varsayılan olarak 'profile' kullan
    const searchParams = new URLSearchParams(location.search);
    const urlTab = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'alerts' | 'favorites'>(
        (urlTab as 'profile' | 'orders' | 'addresses' | 'alerts' | 'favorites') || 'profile'
    );

    // Profile State
    const [name, setName] = useState(currentUser?.name || '');
    const [password, setPassword] = useState('');

    // Address State
    const [addressForm, setAddressForm] = useState<Partial<Address>>({
        title: '',
        city: '',
        district: '',
        neighborhood: '',
        zipCode: '',
        content: '',
        phone: currentUser?.phone || '',
        isCorporate: false,
        companyName: '',
        taxNo: '',
        taxOffice: ''
    });
    const [showAddressForm, setShowAddressForm] = useState(false);

    // Order Modal State
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    if (!currentUser) {
        navigate('/giris');
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser(currentUser.id, {
            name,
            password: password || currentUser.password
        });
        alert('Bilgileriniz güncellendi.');
        setPassword('');
    };

    const handleAddAddress = (e: React.FormEvent) => {
        e.preventDefault();
        const newAddress: Address = {
            ...addressForm as Address,
            id: Date.now()
        };
        updateUser(currentUser.id, {
            addresses: [...(currentUser.addresses || []), newAddress]
        });
        setAddressForm({
            title: '',
            city: '',
            district: '',
            neighborhood: '',
            zipCode: '',
            content: '',
            phone: currentUser?.phone || '',
            isCorporate: false,
            companyName: '',
            taxNo: '',
            taxOffice: ''
        });
        setShowAddressForm(false);
    };

    const handleDeleteAddress = (index: number) => {
        if (window.confirm('Bu adresi silmek istediğinize emin misiniz?')) {
            const newAddresses = [...currentUser.addresses];
            newAddresses.splice(index, 1);
            updateUser(currentUser.id, { addresses: newAddresses });
        }
    };

    const userAlerts = alerts.filter(a => a.userId === currentUser.id);
    const notificationCount = userAlerts.filter(alert => {
        const product = products.find(p => p.id.toString() === alert.productId);
        return product && product.price.current < alert.priceAtAlert;
    }).length;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold uppercase">
                            {currentUser.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">Merhaba, {currentUser.name}</h1>
                            <p className="text-slate-500">{currentUser.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Sidebar Nav */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <nav className="flex flex-col">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
                                >
                                    <Settings className="w-5 h-5" />
                                    Hesap Bilgileri
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === 'orders' ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
                                >
                                    <Package className="w-5 h-5" />
                                    Siparişlerim
                                </button>
                                <button
                                    onClick={() => setActiveTab('addresses')}
                                    className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === 'addresses' ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
                                >
                                    <MapPin className="w-5 h-5" />
                                    Adreslerim
                                </button>
                                <button
                                    onClick={() => setActiveTab('alerts')}
                                    className={`flex items-center justify-between px-4 py-3 text-left transition-colors ${activeTab === 'alerts' ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Bell className="w-5 h-5" />
                                        Fiyat Alarmları
                                    </div>
                                    {notificationCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                                            {notificationCount}
                                        </span>
                                    )}
                                    {notificationCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                                            {notificationCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('favorites')}
                                    className={`flex items-center justify-between px-4 py-3 text-left transition-colors ${activeTab === 'favorites' ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Heart className="w-5 h-5" />
                                        Favorilerim
                                    </div>
                                    {favorites.length > 0 && (
                                        <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                            {favorites.length}
                                        </span>
                                    )}
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px]">

                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className="animate-fadeIn">
                                    <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Hesap Ayarları
                                    </h2>
                                    <form onSubmit={handleUpdateProfile} className="max-w-md space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">E-Posta (Değiştirilemez)</label>
                                            <input
                                                type="email"
                                                value={currentUser.email}
                                                disabled
                                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg"
                                            />
                                        </div>
                                        <div className="pt-4 border-t border-slate-100">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Yeni Şifre</label>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Değiştirmek istemiyorsanız boş bırakın"
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                                            Güncelle
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Orders Tab */}
                            {activeTab === 'orders' && (
                                <div className="animate-fadeIn">
                                    <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                                        <Package className="w-5 h-5" />
                                        Sipariş Geçmişi
                                    </h2>
                                    {userOrders && userOrders.length > 0 ? (
                                        <div className="space-y-4">
                                            {userOrders.map((order, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-4 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                                                >
                                                    <div>
                                                        <div className="font-medium text-slate-800 text-lg flex items-center gap-2">
                                                            Sipariş No: <span className="text-blue-600">#{order.orderNo || order.id}</span>
                                                        </div>
                                                        <div className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {order.date}
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex items-center gap-4">
                                                        <div>
                                                            <div className="font-semibold text-slate-900 text-lg">{(order.total || order.amount || 0).toLocaleString('tr-TR')} TL</div>
                                                            <div className={`text-xs font-medium px-3 py-1 rounded-full mt-1 inline-block ${order.status === 'İptal' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                                {order.status}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedOrder(order);
                                                            }}
                                                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                                                        >
                                                            <Package className="w-4 h-4" />
                                                            Kargom Nerede?
                                                        </button>
                                                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-slate-500">
                                            <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                            Henüz bir siparişiniz bulunmuyor.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Addresses Tab */}
                            {activeTab === 'addresses' && (
                                <div className="animate-fadeIn">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            Adreslerim
                                        </h2>
                                        {!showAddressForm && (
                                            <button
                                                onClick={() => setShowAddressForm(true)}
                                                className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Yeni Adres Ekle
                                            </button>
                                        )}
                                    </div>

                                    {showAddressForm && (
                                        <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
                                            <h3 className="font-bold text-slate-800 mb-4">Yeni Adres Ekle</h3>
                                            <form onSubmit={handleAddAddress} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm text-slate-700 mb-1">Adres Başlığı</label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.title}
                                                            onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                                                            placeholder="Örn: Ev, İş"
                                                            required
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">İl</label>
                                                        <div className="relative">
                                                            <select
                                                                className="w-full h-10 border border-slate-300 rounded-lg px-3 appearance-none bg-white pr-10"
                                                                value={addressForm.city}
                                                                onChange={e => setAddressForm({ ...addressForm, city: e.target.value, district: '', neighborhood: '' })}
                                                                required
                                                            >
                                                                <option value="">Seçiniz</option>
                                                                {Object.keys(locationData).map(city => <option key={city} value={city}>{city}</option>)}
                                                            </select>
                                                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">İlçe</label>
                                                        <div className="relative">
                                                            <select
                                                                className="w-full h-10 border border-slate-300 rounded-lg px-3 appearance-none bg-white pr-10"
                                                                value={addressForm.district}
                                                                onChange={e => setAddressForm({ ...addressForm, district: e.target.value, neighborhood: '' })}
                                                                disabled={!addressForm.city}
                                                                required
                                                            >
                                                                <option value="">Seçiniz</option>
                                                                {addressForm.city && locationData[addressForm.city] && Object.keys(locationData[addressForm.city]).map(district => (
                                                                    <option key={district} value={district}>{district}</option>
                                                                ))}
                                                            </select>
                                                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                                                        </div>
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Mahalle</label>
                                                        <div className="relative">
                                                            <select
                                                                className="w-full h-10 border border-slate-300 rounded-lg px-3 appearance-none bg-white pr-10"
                                                                value={addressForm.neighborhood}
                                                                onChange={e => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                                                                disabled={!addressForm.district}
                                                                required
                                                            >
                                                                <option value="">Seçiniz</option>
                                                                {addressForm.city && addressForm.district && locationData[addressForm.city][addressForm.district] && locationData[addressForm.city][addressForm.district].map(neighborhood => (
                                                                    <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                                                                ))}
                                                            </select>
                                                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                                                        </div>
                                                    </div>

                                                    <div className="md:col-span-1">
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Posta Kodu (Opsiyonel)</label>
                                                        <input
                                                            type="text"
                                                            value={addressForm.zipCode}
                                                            onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                                                            placeholder="34000"
                                                            maxLength={5}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                        />
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Adres Detayı (Sokak, Bina No, Karşı Kapı vb.)</label>
                                                        <textarea
                                                            rows={2}
                                                            value={addressForm.content}
                                                            onChange={(e) => setAddressForm({ ...addressForm, content: e.target.value })}
                                                            placeholder="Moda cad. Lale sok. No:5 D:2"
                                                            required
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                                                        ></textarea>
                                                    </div>

                                                    <div className="md:col-span-2 py-2 border-t border-slate-100 flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id="isCorporate"
                                                            checked={addressForm.isCorporate}
                                                            onChange={e => setAddressForm({ ...addressForm, isCorporate: e.target.checked })}
                                                            className="w-4 h-4 text-blue-600 rounded"
                                                        />
                                                        <label htmlFor="isCorporate" className="text-sm font-medium text-slate-700">Bu bir kurumsal fatura adresidir</label>
                                                    </div>

                                                    {addressForm.isCorporate && (
                                                        <>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-sm font-medium text-slate-700 mb-1">Firma Ünvanı</label>
                                                                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={addressForm.companyName} onChange={e => setAddressForm({ ...addressForm, companyName: e.target.value })} required />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 mb-1">Vergi Dairesi</label>
                                                                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={addressForm.taxOffice} onChange={e => setAddressForm({ ...addressForm, taxOffice: e.target.value })} required />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 mb-1">Vergi No</label>
                                                                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={addressForm.taxNo} onChange={e => setAddressForm({ ...addressForm, taxNo: e.target.value })} required />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowAddressForm(false)}
                                                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                                                    >
                                                        İptal
                                                    </button>
                                                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                                                        Kaydet
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-4">
                                        {(currentUser.addresses || []).map((addr, index) => (
                                            <div key={index} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors relative group">
                                                <h3 className="font-semibold text-slate-800 mb-1">{addr.title}</h3>
                                                <p className="text-slate-600 text-sm">
                                                    {addr.content}
                                                    {(addr.city || addr.district) && (
                                                        <span className="block font-medium text-slate-500 mt-1">
                                                            {addr.district ? `${addr.district} / ` : ''}{addr.city} {addr.zipCode}
                                                        </span>
                                                    )}
                                                </p>
                                                <button
                                                    onClick={() => handleDeleteAddress(index)}
                                                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Sil"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {(!currentUser.addresses || currentUser.addresses.length === 0) && !showAddressForm && (
                                            <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                                                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                Kayıtlı adresiniz bulunmuyor.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Price Alerts Tab */}
                            {activeTab === 'alerts' && (
                                <div className="animate-fadeIn">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                            <Bell className="w-5 h-5" />
                                            Takip Ettiğim Ürünler
                                        </h2>
                                        {userAlerts.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Tüm fiyat alarmlarınızı silmek istediğinize emin misiniz?')) {
                                                        clearUserAlerts(currentUser.id);
                                                    }
                                                }}
                                                className="flex items-center gap-2 text-sm font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Tümünü Temizle
                                            </button>
                                        )}
                                    </div>
                                    {userAlerts.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {userAlerts.map((alert) => {
                                                const product = products.find(p => p.id.toString() === alert.productId.toString());
                                                const hasDropped = product && product.price.current < alert.priceAtAlert;
                                                const savings = product ? alert.priceAtAlert - product.price.current : 0;
                                                const priceDiffPercent = product ? Math.round(((alert.priceAtAlert - product.price.current) / alert.priceAtAlert) * 100) : 0;

                                                return (
                                                    <div key={alert.id} className={`group bg-white border-2 rounded-3xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${hasDropped ? 'border-orange-200 bg-gradient-to-br from-orange-50/50 to-white' : 'border-slate-100 hover:border-blue-100'}`}>
                                                        {/* Header: Badges & Trash */}
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex flex-wrap gap-2">
                                                                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                                    {alert.date}
                                                                </span>
                                                                {hasDropped && (
                                                                    <span className="px-3 py-1 bg-orange-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider animate-pulse">
                                                                        %{priceDiffPercent} İNDİRİM
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm('Bu ürünün fiyat takibini bırakmak istediğinize emin misiniz?')) {
                                                                        deactivateAlert(alert.productId, currentUser.id);
                                                                    }
                                                                }}
                                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                                title="Takibi Bırak"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>

                                                        {/* Body: Image & Info */}
                                                        <div className="flex gap-4 mb-6">
                                                            <div className="w-24 h-24 bg-white rounded-2xl border border-slate-100 p-2 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                                                                <img
                                                                    src={product?.image}
                                                                    alt={alert.productName}
                                                                    className="w-full h-full object-contain"
                                                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <Link
                                                                    to={`/${slugify(alert.productName)}`}
                                                                    className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors line-clamp-2 leading-tight mb-2"
                                                                >
                                                                    {alert.productName}
                                                                </Link>
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="flex items-center justify-between text-xs">
                                                                        <span className="text-slate-400 font-medium">Başlangıç:</span>
                                                                        <span className="text-slate-600 font-bold">{alert.priceAtAlert.toLocaleString('tr-TR')} TL</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <span className="text-slate-400 font-medium">Güncel:</span>
                                                                        <span className={`font-black ${hasDropped ? 'text-orange-600 text-lg' : 'text-slate-900'}`}>
                                                                            {product?.price.current.toLocaleString('tr-TR')} TL
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Footer: Savings & Action */}
                                                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                                            <div>
                                                                {hasDropped ? (
                                                                    <div className="text-orange-700 text-xs font-bold">
                                                                        {savings.toLocaleString('tr-TR')} TL Kazancınız var!
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-slate-400 text-[10px] font-medium flex items-center gap-1">
                                                                        <Bell className="w-3 h-3" /> Fiyat düşüşü bekleniyor
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <Link
                                                                to={`/${slugify(alert.productName)}`}
                                                                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-black rounded-xl hover:bg-blue-600 hover:text-white transition-all group/btn"
                                                            >
                                                                İNCELE
                                                                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                            <Bell className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                            <h3 className="text-slate-500 font-bold">Henüz alarm kurduğunuz bir ürün yok.</h3>
                                            <p className="text-slate-400 text-sm mt-1">İlgilendiğiniz ürünlerde fiyat alarmı kurarak fırsatları yakalayabilirsiniz.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Favorites Tab */}
                            {activeTab === 'favorites' && (
                                <div className="animate-fadeIn">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                            <Heart className="w-5 h-5" />
                                            Favori Ürünlerim
                                        </h2>
                                        {favorites.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Tüm favorilerinizi silmek istediğinize emin misiniz?')) {
                                                        clearFavorites();
                                                    }
                                                }}
                                                className="flex items-center gap-2 text-sm font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Tümünü Temizle
                                            </button>
                                        )}
                                    </div>
                                    {favorites.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {products
                                                .filter(p => favorites.map(f => f.toString()).includes(p.id.toString()))
                                                .map(product => (
                                                    <ProductCard
                                                        key={product.id}
                                                        id={product.id}
                                                        name={product.name}
                                                        price={{
                                                            current: product.price.current,
                                                            original: product.price.original,
                                                            currency: 'TL'
                                                        }}
                                                        image={product.image}
                                                        rating={product.rating}
                                                        reviews={product.reviews}
                                                    />
                                                ))
                                            }
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                            <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                            <h3 className="text-slate-500 font-bold">Henüz favori ürününüz yok.</h3>
                                            <p className="text-slate-400 text-sm mt-1">Beğendiğiniz ürünleri kalp ikonuna tıklayarak buraya ekleyebilirsiniz.</p>
                                            <button
                                                onClick={() => navigate('/')}
                                                className="mt-6 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Alışverişe Başla
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* Order Tracking Modal */}
            <OrderTrackingModal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                order={selectedOrder}
            />
        </div >
    );
};
