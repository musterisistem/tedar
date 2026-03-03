import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useUsers } from '../context/UserContext';
import { useSite } from '../context/SiteContext';
import { useOrders } from '../context/OrderContext';
import { useLocation } from '../hooks/useLocation';
import { CheckCircle, CreditCard, Truck, User, Lock, MapPin, Home, Phone, Mail, ChevronDown, Plus, Landmark, Copy, Info } from 'lucide-react';
import { slugify } from '../utils/slugify';
import { formatPhoneNumber } from '../utils/formatPhone';
import { DirectPaymentForm } from '../components/common/DirectPaymentForm';

export const CheckoutPage: React.FC = () => {
    const {
        totalPrice, clearCart, items, subtotal,
        basketDiscount, shippingCost, finalTotal
    } = useCart();
    const { basketDiscountRate } = useProducts();
    const { currentUser, updateUser } = useUsers();
    const { paymentSettings } = useSite();
    const { addOrder } = useOrders();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useUsers();

    const [cities, setCities] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);

    // Address Selection State
    const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(
        currentUser && currentUser.addresses && currentUser.addresses.length > 0 ? 0 : null
    );
    const [useNewAddress, setUseNewAddress] = useState(
        !currentUser || !currentUser.addresses || currentUser.addresses.length === 0
    );

    // Get default payment method based on settings
    const getDefaultPaymentMethod = () => {
        if (paymentSettings.isCreditCardActive) return 'Kredi Kartı';
        if (paymentSettings.isBankTransferActive) return 'Havale / EFT';
        if (paymentSettings.isCashOnDeliveryActive) return 'Kapıda Ödeme';
        return 'Kredi Kartı';
    };

    const [paymentMethod, setPaymentMethod] = useState(getDefaultPaymentMethod());
    const [showDirectForm, setShowDirectForm] = useState(false);
    const [show3DForm, setShow3DForm] = useState(false);
    const [threeD_html, setThreeD_html] = useState('');
    const [pendingOrderData, setPendingOrderData] = useState<any>(null);
    const [guestUserData, setGuestUserData] = useState<any>(null);

    // Detailed Address Form State
    const [addressForm, setAddressForm] = useState({
        title: 'Ev',
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        password: '',
        city: '',
        district: '',
        neighborhood: '',
        street: '',
        detail: '', // Apartment, floor, etc.
        zipCode: '',
        phone: currentUser?.phone || '',
        note: ''
    });

    // Location Hook (only for initial cities now, districts are fetched dynamically)
    const { cities: initialCities } = useLocation();

    const [isBillingSame, setIsBillingSame] = useState(true);
    const [billingAddressForm, setBillingAddressForm] = useState({
        title: 'Fatura Adresi',
        city: '',
        district: '',
        neighborhood: '',
        street: '',
        detail: '',
        zipCode: '',
        phone: currentUser?.phone || '',
        isCorporate: false,
        companyName: '',
        taxNo: '',
        taxOffice: ''
    });

    // Initialize cities
    useEffect(() => {
        setCities(initialCities);
    }, [initialCities]);

    // Pre-fill phone if available
    useEffect(() => {
        if (currentUser) {
            setAddressForm(prev => ({
                ...prev,
                phone: currentUser.phone || '',
                name: currentUser.name || '',
                email: currentUser.email || ''
            }));
        }
    }, [currentUser]);

    // Handle Location Changes
    const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const city = e.target.value;
        setAddressForm({ ...addressForm, city, district: '', neighborhood: '' });

        if (city) {
            try {
                const response = await fetch(`/api/location/districts?city=${encodeURIComponent(city)}`);
                if (!response.ok) throw new Error('İlçeler yüklenemedi');
                const data = await response.json();
                if (Array.isArray(data)) {
                    setDistricts(data);
                } else {
                    setDistricts([]);
                }
            } catch (error) {
                console.error('Error fetching districts:', error);
                setDistricts([]);
            }
        } else {
            setDistricts([]);
        }
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAddressForm(prev => ({
            ...prev,
            district: e.target.value,
            neighborhood: ''
        }));
    };

    // 1. Removed Mandatory Login Check to allow guest checkout
    // if (!currentUser) { ... }

    // const [tempOrder, setTempOrder] = useState<any>(null);

    // 2. Order Placement & Address Saving Logic
    const handlePayment = async () => {
        setIsLoading(true);

        // Determine final address data

        let shippingAddress: any;
        // let billingAddress: any;
        let activeUser = currentUser;

        if (currentUser && !useNewAddress && selectedAddressIndex !== null) {
            // Use selected stored address
            const selectedAddr = currentUser.addresses[selectedAddressIndex];
            shippingAddress = { ...selectedAddr };
        } else {
            // Construct from form
            shippingAddress = {
                title: addressForm.title,
                city: addressForm.city,
                district: addressForm.district,
                neighborhood: addressForm.neighborhood,
                zipCode: addressForm.zipCode,
                content: `${addressForm.neighborhood} ${addressForm.street} Sok. ${addressForm.detail} ${addressForm.district}/${addressForm.city}`,
                phone: addressForm.phone,
                street: addressForm.street,
                detail: addressForm.detail
            };
        }

        if (isBillingSame) {
            // billingAddress = { ...shippingAddress };
        } else {
            // billingAddress = { ...billingAddressForm ... };
        }

        // Guest Registration flow - DEFERRED
        if (!activeUser) {
            if (!addressForm.name || !addressForm.email || !addressForm.phone || !addressForm.password || !addressForm.city || !addressForm.district || !addressForm.neighborhood || !addressForm.street || !addressForm.detail) {
                alert('Lütfen teslimat ve üyelik bilgilerini eksiksiz doldurun.');
                setIsLoading(false);
                return;
            }

            // We don't register yet. We just prepare the data.
            setGuestUserData({
                name: addressForm.name,
                email: addressForm.email,
                phone: addressForm.phone,
                password: addressForm.password,
                city: addressForm.city,
                district: addressForm.district,
                neighborhood: addressForm.neighborhood,
                zipCode: addressForm.zipCode,
                address: shippingAddress.content
            });
        } else {
            setGuestUserData(null);
        }

        // Create Order Object
        const orderData = {
            userId: activeUser?.id || null, // Might be null for new guests
            customer: activeUser?.name || addressForm.name,
            email: activeUser?.email || addressForm.email,
            phone: shippingAddress.phone || addressForm.phone,
            address: shippingAddress.content,
            city: shippingAddress.city,
            district: shippingAddress.district,
            amount: totalPrice,
            status: 'pending' as const,
            paymentType: paymentMethod,
            items: items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image || ''
            })),
            isActiveMember: true,
            subtotal: subtotal,
            basketDiscount: basketDiscount,
            basketDiscountRate: basketDiscountRate,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            id: Date.now(),
            orderNo: `SP${Date.now()}` // PayTR requires alphanumeric only
        };

        if (paymentMethod === 'Kredi Kartı') {
            // DEFERRED: We don't call addOrder here anymore.
            // We just trigger the form with all required data for the backend to handle it on success.
            setPendingOrderData(orderData);
            setShowDirectForm(true);
            setIsLoading(false);
            return;
        }

        // For non-gateway methods (Cash on Delivery), register guest immediately
        let finalActiveUser = activeUser;
        if (!finalActiveUser) {
            try {
                const regResult = await register({
                    name: addressForm.name,
                    email: addressForm.email,
                    phone: addressForm.phone,
                    password: addressForm.password,
                    city: addressForm.city,
                    district: addressForm.district,
                    zipCode: addressForm.zipCode,
                    address: shippingAddress.content
                });
                if (regResult.success && regResult.user) {
                    finalActiveUser = regResult.user;
                } else {
                    alert('Üyelik oluşturulurken hata: ' + (regResult.error || 'Bilinmeyen hata'));
                    setIsLoading(false);
                    return;
                }
            } catch (err) {
                console.error(err);
                setIsLoading(false);
                return;
            }
        }

        // Standard Logic for Other Methods (COD etc)
        setTimeout(async () => {
            try {
                const savedOrder = await addOrder({ ...orderData, userId: finalActiveUser?.id });

                // Update User
                let updatedAddresses = (finalActiveUser as any)?.addresses || [];
                if (useNewAddress || !currentUser) { // If guest, they just used a new address
                    const newAddressObj = { ...shippingAddress, id: Date.now() };
                    const addressExists = updatedAddresses.some((addr: any) =>
                        addr.content === shippingAddress.content &&
                        addr.city === shippingAddress.city &&
                        addr.district === shippingAddress.district
                    );
                    if (!addressExists) {
                        updatedAddresses = [...updatedAddresses, newAddressObj];
                    }
                }

                if (finalActiveUser) {
                    updateUser(finalActiveUser.id, {
                        orders: [savedOrder, ...(Array.isArray((finalActiveUser as any).orders) ? (finalActiveUser as any).orders : [])],
                        addresses: updatedAddresses
                    });
                }

                clearCart();
                navigate('/siparis-basarili', { state: { order: savedOrder } });

            } catch (error: any) {
                console.error('Error saving order:', error);
                alert('Sipariş kaydedilirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
            } finally {
                setIsLoading(false);
            }
        }, 2000);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Steps Header */}
            <div className="flex justify-center mb-12">
                <div className="flex items-center">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>1</div>
                        <span>Teslimat</span>
                    </div>
                    <div className={`w-16 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>2</div>
                        <span>Ödeme</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Area */}
                <div className="lg:col-span-2">
                    {step === 1 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                                <User className="w-5 h-5 text-blue-600" /> Teslimat Bilgileri
                            </h2>

                            {!currentUser && (
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-full shadow-sm text-blue-600">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-blue-900">Zaten üye misiniz?</h3>
                                            <p className="text-sm text-blue-700">Giriş yaparak kayıtlı adreslerinizi kullanabilirsiniz.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/giris', { state: { from: '/odeme' } })}
                                        className="bg-white text-blue-600 font-bold py-2 px-6 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors whitespace-nowrap"
                                    >
                                        Giriş Yap
                                    </button>
                                </div>
                            )}

                            {currentUser && (
                                <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start gap-3 border border-blue-100">
                                    <div className="p-1 bg-blue-100 rounded-full">
                                        <Home className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-800 font-medium">
                                            Sayın <span className="font-bold">{currentUser.name}</span>,
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Siparişinizin güvenli teslimatı için lütfen bilgilerinizi kontrol ediniz.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ------------ GLOBAL CONTACT INFO (ALWAYS VISIBLE) ------------ */}
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600">1</span>
                                    İletişim Bilgileri
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                                    <div className="relative">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Ad Soyad <span className="text-red-500">*</span></label>
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 text-gray-400 absolute left-3" />
                                            <input
                                                type="text"
                                                value={addressForm.name}
                                                onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                                                readOnly={!!currentUser}
                                                placeholder="Örn: Ahmet Yılmaz"
                                                required
                                                className={`w-full h-10 border border-gray-200 rounded pl-10 pr-3 focus:outline-none focus:border-blue-500 text-sm ${currentUser ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">E-Posta <span className="text-red-500">*</span></label>
                                        <div className="flex items-center">
                                            <Mail className="w-4 h-4 text-gray-400 absolute left-3" />
                                            <input
                                                type="email"
                                                value={addressForm.email}
                                                onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                                                readOnly={!!currentUser}
                                                placeholder="Örn: ahmet@ornek.com"
                                                required
                                                className={`w-full h-10 border border-gray-200 rounded pl-10 pr-3 focus:outline-none focus:border-blue-500 text-sm ${currentUser ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                                            />
                                        </div>
                                    </div>
                                    {!currentUser && (
                                        <div className="relative md:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Hesap Şifresi Belirleyin <span className="text-red-500">*</span></label>
                                            <div className="flex items-center">
                                                <Lock className="w-4 h-4 text-gray-400 absolute left-3" />
                                                <input
                                                    type="password"
                                                    required
                                                    placeholder="En az 6 karakter"
                                                    className="w-full h-10 border border-gray-300 rounded pl-10 pr-3 focus:outline-none focus:border-blue-500 text-sm transition-all shadow-sm"
                                                    value={addressForm.password}
                                                    onChange={(e) => setAddressForm({ ...addressForm, password: e.target.value })}
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1">Siparişinizi takip edebilmeniz için şifre gereklidir. Üyeliğiniz sipariş tamamlandığında aktif olur.</p>
                                        </div>
                                    )}
                                    <div className="relative md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Cep Telefonu <span className="text-red-500">*</span></label>
                                        <div className="flex items-center">
                                            <Phone className="w-4 h-4 text-gray-400 absolute left-3" />
                                            <input
                                                type="tel"
                                                required
                                                placeholder="05__ ___ __ __"
                                                className="w-full h-10 border border-gray-300 rounded pl-10 pr-3 focus:outline-none focus:border-blue-500 text-sm transition-all shadow-sm"
                                                value={addressForm.phone}
                                                onChange={(e) => {
                                                    const formatted = formatPhoneNumber(e.target.value);
                                                    if (formatted.length <= 17) {
                                                        setAddressForm({ ...addressForm, phone: formatted });
                                                    }
                                                }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">Sipariş durumu hakkında SMS ile bilgilendirileceksiniz.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 my-6"></div>

                            {/* ------------ ADDRESS SELECTION AND FORM ------------ */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600">2</span>
                                    Teslimat Adresi
                                </h3>

                                <div className="pl-0 md:pl-8">
                                    {/* Saved Address Selection */}
                                    {currentUser && currentUser.addresses && currentUser.addresses.length > 0 && (
                                        <div className="mb-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {currentUser.addresses.map((addr, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => { setSelectedAddressIndex(index); setUseNewAddress(false); }}
                                                        className={`p-4 border rounded-xl cursor-pointer transition-all relative ${!useNewAddress && selectedAddressIndex === index ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200 hover:border-blue-300'}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                                {addr.title}
                                                            </h4>
                                                            {!useNewAddress && selectedAddressIndex === index && (
                                                                <CheckCircle className="w-5 h-5 text-blue-600" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 line-clamp-2">{addr.content}</p>
                                                    </div>
                                                ))}
                                                <div
                                                    onClick={() => setUseNewAddress(true)}
                                                    className={`p-4 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center text-gray-500 transition-all ${useNewAddress ? 'bg-gray-100 border-gray-400 text-gray-700 shadow-inner' : ''}`}
                                                >
                                                    <Plus className="w-6 h-6 mb-2" />
                                                    <span className="font-medium text-sm">Yeni Adres Ekle</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* New Address Form */}
                                    {useNewAddress && (
                                        <form className="animate-fadeIn" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
                                                <div className="md:col-span-2 mb-2">
                                                    <h4 className="font-bold text-gray-800 text-sm">Yeni Adres Bilgileri</h4>
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Adres Başlığı <span className="text-red-500">*</span></label>
                                                    <div className="flex gap-4">
                                                        {['Ev', 'İş', 'Diğer'].map((title) => (
                                                            <button
                                                                key={title}
                                                                type="button"
                                                                onClick={() => setAddressForm({ ...addressForm, title })}
                                                                className={`flex-1 py-2 text-sm rounded border transition-all ${addressForm.title === title ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                                                            >
                                                                {title}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">İl <span className="text-red-500">*</span></label>
                                                    <div className="relative">
                                                        <select
                                                            className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:border-blue-500 text-sm shadow-sm appearance-none bg-white cursor-pointer"
                                                            value={addressForm.city}
                                                            onChange={handleCityChange}
                                                            required
                                                        >
                                                            <option value="">İl Seçiniz</option>
                                                            {cities.sort().map(city => (
                                                                <option key={city} value={city}>{city}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">İlçe <span className="text-red-500">*</span></label>
                                                    <div className="relative">
                                                        <select
                                                            className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:border-blue-500 text-sm shadow-sm appearance-none bg-white cursor-pointer"
                                                            value={addressForm.district}
                                                            onChange={handleDistrictChange}
                                                            disabled={!addressForm.city}
                                                            required
                                                        >
                                                            <option value="">{addressForm.city ? 'İlçe Seçiniz' : 'Önce İl Seçin'}</option>
                                                            {districts.map(district => (
                                                                <option key={district} value={district}>{district}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Mahalle <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Örn: Caferağa Mahallesi"
                                                        className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:border-blue-500 text-sm shadow-sm"
                                                        value={addressForm.neighborhood}
                                                        onChange={(e) => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                                                    />
                                                </div>

                                                <div className="md:col-span-1">
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Cadde / Sokak <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Örn: Moda Cad."
                                                        className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:border-blue-500 text-sm shadow-sm"
                                                        value={addressForm.street}
                                                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                                    />
                                                </div>
                                                <div className="md:col-span-1">
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Bina No / Daire vb. <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Örn: No: 4, Daire: 5"
                                                        className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:border-blue-500 text-sm shadow-sm"
                                                        value={addressForm.detail}
                                                        onChange={(e) => setAddressForm({ ...addressForm, detail: e.target.value })}
                                                    />
                                                </div>

                                                <div className="md:col-span-1">
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Posta Kodu (Opsiyonel)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="34000"
                                                        maxLength={5}
                                                        className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:border-blue-500 text-sm shadow-sm"
                                                        value={addressForm.zipCode}
                                                        onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Adres Tarifi / Not (Opsiyonel)</label>
                                                    <textarea
                                                        rows={2}
                                                        className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-blue-500 text-sm shadow-sm"
                                                        placeholder="Kurye için ek notlar, zil bozuk vb."
                                                        value={addressForm.note}
                                                        onChange={(e) => setAddressForm({ ...addressForm, note: e.target.value })}
                                                    ></textarea>
                                                </div>

                                                <div className="md:col-span-2 space-y-4">
                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-gray-100">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isBillingSame ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                                <CreditCard className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h5 className="font-bold text-slate-800 text-sm tracking-tight">{isBillingSame ? 'Fatura Adresi Aynı' : 'Farklı Fatura Adresi'}</h5>
                                                                <p className="text-[11px] text-gray-500">{isBillingSame ? 'Fatura teslimat adresiyle aynı kesilecektir.' : 'Fatura bilgileri ayrıca girilmiştir.'}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsBillingSame(!isBillingSame)}
                                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${isBillingSame ? 'bg-white border-blue-600 text-blue-600 hover:bg-blue-50' : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'}`}
                                                        >
                                                            {isBillingSame ? 'FARKLI FATURA ADRESİ EKLE' : 'TESLİMAT ADRESİYLE AYNI YAP'}
                                                        </button>
                                                    </div>

                                                    {!isBillingSame && (
                                                        <div className="p-4 border border-blue-100 bg-blue-50/30 rounded-xl space-y-4 animate-fadeIn">
                                                            <h5 className="font-bold text-sm text-blue-900">Fatura Adresi Bilgileri</h5>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Fatura Tipi</label>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setBillingAddressForm({ ...billingAddressForm, isCorporate: false })}
                                                                            className={`flex-1 py-1.5 text-xs rounded border transition-all ${!billingAddressForm.isCorporate ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}
                                                                        >Bireysel</button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setBillingAddressForm({ ...billingAddressForm, isCorporate: true })}
                                                                            className={`flex-1 py-1.5 text-xs rounded border transition-all ${billingAddressForm.isCorporate ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}
                                                                        >Kurumsal</button>
                                                                    </div>
                                                                </div>
                                                                {billingAddressForm.isCorporate && (
                                                                    <>
                                                                        <div className="md:col-span-2">
                                                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Firma Ünvanı</label>
                                                                            <input type="text" className="w-full h-9 border border-gray-300 rounded px-3 text-sm" value={billingAddressForm.companyName} onChange={e => setBillingAddressForm({ ...billingAddressForm, companyName: e.target.value })} />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Vergi Dairesi</label>
                                                                            <input type="text" className="w-full h-9 border border-gray-300 rounded px-3 text-sm" value={billingAddressForm.taxOffice} onChange={e => setBillingAddressForm({ ...billingAddressForm, taxOffice: e.target.value })} />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Vergi No</label>
                                                                            <input type="text" className="w-full h-9 border border-gray-300 rounded px-3 text-sm" value={billingAddressForm.taxNo} onChange={e => setBillingAddressForm({ ...billingAddressForm, taxNo: e.target.value })} />
                                                                        </div>
                                                                    </>
                                                                )}
                                                                <div className="md:col-span-2">
                                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Fatura Adresi</label>
                                                                    <textarea rows={2} className="w-full border border-gray-300 rounded p-2 text-sm" value={billingAddressForm.street} onChange={e => setBillingAddressForm({ ...billingAddressForm, street: e.target.value })} placeholder="Adres detayları..."></textarea>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="md:col-span-2 mt-4 flex justify-end">
                                                    <button type="submit" className="w-full md:w-auto px-8 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                                                        Ödeme Adımına İlerle
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    )}

                                    {/* Continue Button for Saved Address */}
                                    {!useNewAddress && selectedAddressIndex !== null && (
                                        <div className="mt-8 flex justify-end">
                                            <button
                                                onClick={() => setStep(2)}
                                                className="w-full md:w-auto px-8 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                                            >
                                                Seçili Adres ile Devam Et
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-600" /> Ödeme Yöntemi
                            </h2>

                            <div className="mb-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {paymentSettings.isCreditCardActive && (
                                        <button
                                            onClick={() => setPaymentMethod('Kredi Kartı')}
                                            className={`p-4 rounded-xl flex flex-col items-center gap-2 font-bold transition-all shadow-sm ${paymentMethod === 'Kredi Kartı' ? 'bg-blue-600 border-2 border-blue-600 text-white shadow-blue-100' : 'bg-white border border-gray-100 text-gray-500 hover:border-blue-300 hover:text-blue-600'}`}
                                        >
                                            <CreditCard className="w-6 h-6" />
                                            Kredi Kartı
                                        </button>
                                    )}
                                    {paymentSettings.isBankTransferActive && (
                                        <button
                                            onClick={() => setPaymentMethod('Havale / EFT')}
                                            className={`p-4 rounded-xl flex flex-col items-center gap-2 font-bold transition-all shadow-sm ${paymentMethod === 'Havale / EFT' ? 'bg-blue-600 border-2 border-blue-600 text-white shadow-blue-100' : 'bg-white border border-gray-100 text-gray-500 hover:border-blue-300 hover:text-blue-600'}`}
                                        >
                                            <Landmark className="w-6 h-6" />
                                            Havale / EFT
                                        </button>
                                    )}
                                    {paymentSettings.isCashOnDeliveryActive && (
                                        <button
                                            onClick={() => setPaymentMethod('Kapıda Ödeme')}
                                            className={`p-4 rounded-xl flex flex-col items-center gap-2 font-bold transition-all shadow-sm ${paymentMethod === 'Kapıda Ödeme' ? 'bg-blue-600 border-2 border-blue-600 text-white shadow-blue-100' : 'bg-white border border-gray-100 text-gray-500 hover:border-blue-300 hover:text-blue-600'}`}
                                        >
                                            <Truck className="w-6 h-6" />
                                            Kapıda Ödeme
                                        </button>
                                    )}
                                </div>
                            </div>

                            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
                                {paymentMethod === 'Kredi Kartı' && (
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm flex gap-3 animate-fadeIn">
                                        <Info className="w-5 h-5 shrink-0" />
                                        <div>
                                            <p className="font-semibold mb-1">Güvenli Kart ile Ödeme</p>
                                            <p>Siparişi Tamamla butonuna bastıktan sonra güvenli kart bilgilerini girebilirsiniz. Ödemeniz PayTR altyapısı üzerinden 3D Secure ile korunmaktadır.</p>
                                        </div>
                                    </div>
                                )}


                                {paymentMethod === 'Havale / EFT' && (
                                    <div className="space-y-4 animate-fadeIn">
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm flex gap-3">
                                            <Info className="w-5 h-5 shrink-0" />
                                            <p>{paymentSettings.bankTransferDescription}</p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {paymentSettings.bankDetails.map((bank) => (
                                                <div key={bank.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all group">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">{bank.bankName}</h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(bank.iban);
                                                                alert('IBAN kopyalandı');
                                                            }}
                                                            className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-200 group-hover:scale-110 transition-transform"
                                                        >
                                                            <Copy className="w-3 h-3" /> KOPYALA
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mb-1">{bank.accountHolder}</p>
                                                    <p className="font-mono text-sm font-bold text-slate-700 select-all">{bank.iban}</p>
                                                </div>
                                            ))}
                                            {paymentSettings.bankDetails.length === 0 && (
                                                <p className="text-center text-sm text-gray-500 py-4 italic">Banka bilgisi bulunamadı. Lütfen destek ile iletişime geçin.</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'Kapıda Ödeme' && (
                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-orange-800 text-sm animate-fadeIn">
                                        <p className="font-bold mb-1">Bilgilendirme</p>
                                        <p>{paymentSettings.cashOnDeliveryDescription}</p>
                                        {paymentSettings.cashOnDeliveryFee > 0 && (
                                            <p className="mt-2 font-bold text-orange-900 border-t border-orange-200 pt-2">
                                                Hizmet Bedeli: +{paymentSettings.cashOnDeliveryFee.toLocaleString('tr-TR')} TL
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                                    >
                                        {isLoading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                Siparişi Tamamla ({(paymentMethod === 'Kapıda Ödeme' ? totalPrice + paymentSettings.cashOnDeliveryFee : totalPrice).toLocaleString('tr-TR')} TL)
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-4">
                        <h3 className="font-bold mb-4 text-lg">Sipariş Özeti</h3>
                        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
                            {items.map((item) => (
                                <Link to={`/${slugify(item.name)}`} key={item.id} className="flex gap-3 text-sm group hover:bg-gray-100 p-2 rounded transition-colors">
                                    <div className="w-12 h-12 bg-white rounded border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                        <img src={item.image} alt="" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">{item.name}</p>
                                        <p className="text-gray-500 text-xs">{item.quantity} adet x {item.price.toLocaleString('tr-TR')} TL</p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 pt-4 space-y-2">
                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>Ara Toplam</span>
                                <span>{subtotal.toLocaleString('tr-TR')} TL</span>
                            </div>
                            {basketDiscount > 0 && (
                                <div className="flex justify-between text-green-600 font-bold text-sm">
                                    <span>Sepette İndirim (%{basketDiscountRate})</span>
                                    <span>-{basketDiscount.toLocaleString('tr-TR')} TL</span>
                                </div>
                            )}
                            {shippingCost > 0 ? (
                                <div className="flex justify-between text-orange-600 text-sm font-medium">
                                    <span>Kargo Ücreti</span>
                                    <span>{shippingCost.toLocaleString('tr-TR')} TL</span>
                                </div>
                            ) : (
                                <div className="flex justify-between text-green-600 text-sm font-bold">
                                    <span>Kargo</span>
                                    <span>ÜCRETSİZ</span>
                                </div>
                            )}
                            {paymentMethod === 'Kapıda Ödeme' && paymentSettings.cashOnDeliveryFee > 0 && (
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Kapıda Ödeme Hizmet Bedeli</span>
                                    <span>+{paymentSettings.cashOnDeliveryFee.toLocaleString('tr-TR')} TL</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                                <span className="font-bold text-lg text-gray-800">Toplam</span>
                                <span className="font-bold text-xl text-blue-600">
                                    {(finalTotal + (paymentMethod === 'Kapıda Ödeme' ? paymentSettings.cashOnDeliveryFee : 0)).toLocaleString('tr-TR')} TL
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 justify-center">
                            <Lock className="w-3 h-3" />
                            <span>256-bit SSL Güvenli Ödeme</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3D Secure HTML Form (tam sayfa kaplayan overlay) */}
            {show3DForm && threeD_html && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-white w-full max-w-lg rounded-xl overflow-hidden shadow-2xl">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h2 className="font-bold text-gray-800">3D Güvenli Doğrulama</h2>
                        </div>
                        <div
                            className="p-4"
                            dangerouslySetInnerHTML={{ __html: threeD_html }}
                            ref={(el) => {
                                if (el) {
                                    const forms = el.getElementsByTagName('form');
                                    if (forms.length > 0) forms[0].submit();
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Direkt Kart Formu - Kart bilgisi alma overlay */}
            {showDirectForm && pendingOrderData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" style={{ backdropFilter: 'blur(4px)' }}>
                    <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-800 text-lg">Kart Bilgileri</h2>
                            <button
                                onClick={() => setShowDirectForm(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-lg font-bold transition-colors"
                            >×</button>
                        </div>
                        <div className="p-5">
                            <DirectPaymentForm
                                orderData={{
                                    merchant_oid: pendingOrderData.orderNo,
                                    email: pendingOrderData.email,
                                    payment_amount: Math.round(pendingOrderData.amount * 100),
                                    user_basket: pendingOrderData.items.map((i: any) => ({
                                        name: i.name,
                                        price: i.price,
                                        quantity: i.quantity
                                    })),
                                    user_name: pendingOrderData.customer,
                                    user_address: pendingOrderData.address,
                                    user_phone: pendingOrderData.phone
                                }}
                                guestUserData={guestUserData}
                                orderFullData={pendingOrderData}
                                onSuccess={() => {
                                    setShowDirectForm(false);
                                    clearCart();
                                    navigate('/siparis-basarili');
                                }}
                                onError={(msg) => {
                                    alert(msg);
                                }}
                                onThreeDRedirect={(html) => {
                                    setShowDirectForm(false);
                                    setThreeD_html(html);
                                    setShow3DForm(true);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
