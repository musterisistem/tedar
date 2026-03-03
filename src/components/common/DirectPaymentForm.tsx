import React, { useState } from 'react';
import { CreditCard, Lock, User, Calendar, Shield } from 'lucide-react';

interface CartItem {
    name: string;
    price: number;
    quantity: number;
}

interface DirectPaymentFormProps {
    orderData: {
        merchant_oid: string;
        email: string;
        payment_amount: number; // Kuruş cinsinden (100 TL = 10000)
        user_basket: CartItem[];
        user_name: string;
        user_address: string;
        user_phone: string;
    };
    guestUserData?: any;
    orderFullData?: any;
    onSuccess: () => void;
    onError: (msg: string) => void;
    onThreeDRedirect: (html: string) => void;
}

// Kart numarasını formatla: "4111 1111 1111 1111"
function formatCardNumber(value: string): string {
    const cleaned = value.replace(/\D/g, '').substring(0, 16);
    const parts = cleaned.match(/.{1,4}/g);
    return parts ? parts.join(' ') : cleaned;
}

// Son kullanma tarihini formatla: "MM/YY"
function formatExpiry(value: string): string {
    const cleaned = value.replace(/\D/g, '').substring(0, 4);
    if (cleaned.length >= 3) {
        return cleaned.substring(0, 2) + '/' + cleaned.substring(2);
    }
    return cleaned;
}

// Kart türünü belirle
function detectCardType(number: string): string {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    return '';
}

export const DirectPaymentForm: React.FC<DirectPaymentFormProps> = ({
    orderData, guestUserData, orderFullData, onSuccess, onError, onThreeDRedirect
}) => {
    const [cardData, setCardData] = useState({
        cc_owner: '',
        card_number: '',
        expiry_month: '',
        expiry_year: '',
        cvv: '',
        installment_count: '0'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [cardType, setCardType] = useState('');

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value);
        const type = detectCardType(formatted);
        setCardData(prev => ({ ...prev, card_number: formatted }));
        setCardType(type);
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatExpiry(e.target.value);
        const parts = formatted.split('/');
        setCardData(prev => ({
            ...prev,
            expiry_month: parts[0] || '',
            expiry_year: parts[1] || ''
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Validate
        const cleanCard = cardData.card_number.replace(/\s/g, '');
        if (cleanCard.length < 16) {
            onError('Kart numarası 16 haneli olmalıdır.');
            setIsLoading(false);
            return;
        }
        if (!cardData.expiry_month || !cardData.expiry_year || cardData.expiry_year.length < 2) {
            onError('Geçerli bir son kullanma tarihi girin.');
            setIsLoading(false);
            return;
        }
        if (cardData.cvv.length < 3) {
            onError('CVV/CVC kodu 3-4 haneli olmalıdır.');
            setIsLoading(false);
            return;
        }
        if (!cardData.cc_owner.trim()) {
            onError('Kart üzerindeki ismi girin.');
            setIsLoading(false);
            return;
        }

        try {
            const basketForApi = orderData.user_basket.map(item => [
                item.name,
                item.price.toFixed(2),
                item.quantity
            ]);

            const response = await fetch('/api/paytr/direct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchant_oid: orderData.merchant_oid,
                    email: orderData.email,
                    payment_amount: orderData.payment_amount.toString(),
                    user_basket: basketForApi,
                    user_name: orderData.user_name,
                    user_address: orderData.user_address,
                    user_phone: orderData.user_phone,
                    cc_owner: cardData.cc_owner,
                    card_number: cardData.card_number,
                    expiry_month: cardData.expiry_month.padStart(2, '0'),
                    expiry_year: cardData.expiry_year.length === 2
                        ? '20' + cardData.expiry_year  // YY -> YYYY
                        : cardData.expiry_year,
                    cvv: cardData.cvv,
                    installment_count: cardData.installment_count,
                    guestUserData: guestUserData,
                    orderFullData: orderFullData
                })
            });

            const result = await response.json();
            console.log('Direct API yanıtı:', result);

            if (result.status === 'success') {
                onSuccess();
            } else if (result.status === '3d_redirect' && result.redirect_url) {
                // Tam sayfa 3D yönlendirmesi
                window.location.href = result.redirect_url;
            } else if (result.status === '3d_form' && result.html) {
                // HTML form 3D yönlendirmesi
                onThreeDRedirect(result.html);
            } else {
                onError(result.reason || 'Ödeme işlemi başarısız oldu. Lütfen kart bilgilerinizi kontrol edin.');
            }
        } catch (err) {
            onError('Bağlantı hatası. Lütfen tekrar deneyiniz.');
        } finally {
            setIsLoading(false);
        }
    };

    const expiryDisplay = cardData.expiry_month
        ? cardData.expiry_month + (cardData.expiry_year ? '/' + cardData.expiry_year : '/')
        : '';

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {/* Güvenlik Rozeti */}
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-600" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-800">256-bit SSL ile güvenli ödeme</p>
                    <p className="text-xs text-gray-500">Kart bilgileriniz PayTR aracılığıyla güvenle işlenir</p>
                </div>
                {/* Kart logoları */}
                <div className="ml-auto flex items-center gap-2">
                    <img src="https://www.paytr.com/img/brand/visa.svg" alt="Visa" className="h-6 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <img src="https://www.paytr.com/img/brand/mastercard.svg" alt="Mastercard" className="h-6 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Kart Numarası */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                        KART NUMARASI
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <CreditCard className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            required
                            placeholder="0000 0000 0000 0000"
                            value={cardData.card_number}
                            onChange={handleCardNumberChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        />
                        {cardType && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium uppercase">
                                {cardType}
                            </span>
                        )}
                    </div>
                </div>

                {/* Kart Sahibi */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                        KART ÜZERİNDEKİ İSİM
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <User className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            autoComplete="cc-name"
                            required
                            placeholder="JOHN DOE"
                            value={cardData.cc_owner}
                            onChange={(e) => setCardData(prev => ({ ...prev, cc_owner: e.target.value.toUpperCase() }))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm uppercase font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Son Kullanma + CVV */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            SON KULLANMA TARİHİ
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="cc-exp"
                                required
                                placeholder="AA/YY"
                                value={expiryDisplay}
                                onChange={handleExpiryChange}
                                maxLength={5}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            CVV / CVC
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type="password"
                                inputMode="numeric"
                                autoComplete="cc-csc"
                                required
                                placeholder="•••"
                                value={cardData.cvv}
                                onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').substring(0, 4) }))}
                                maxLength={4}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Ödeme Butonu */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-all shadow-md hover:shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Ödeme İşleniyor...
                        </>
                    ) : (
                        <>
                            <Lock className="w-4 h-4" />
                            Güvenli Öde
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-2">
                    🔒 Ödemeniz PayTR 3D Secure ile korunmaktadır
                </p>
            </form>
        </div>
    );
};
