import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ShoppingBag, User, Calendar, Hash, CreditCard, ChevronRight, FileText, Printer } from 'lucide-react';

const printStyles = `
@media print {
    body * {
        visibility: hidden;
    }
    #invoice-card, #invoice-card * {
        visibility: visible;
    }
    #invoice-card {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        margin: 0;
        padding: 0;
        box-shadow: none;
        border: none;
    }
    .no-print {
        display: none !important;
    }
    @page {
        margin: 1cm;
        size: auto;
    }
}
`;

export const OrderSuccess: React.FC = () => {
    const location = useLocation();
    const order = location.state?.order;

    // If no order data, redirect to home or show minimal success
    if (!order) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-bold mb-4">Siparişiniz Alınmıştır!</h1>
                <p className="text-gray-500 mb-8">Siparişiniz başarıyla oluşturuldu.</p>
                <Link to="/" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                    Alışverişe Devam Et
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 md:py-20 font-sans">
            <style>{printStyles}</style>
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Status Hero */}
                <div className="text-center mb-12 animate-fadeIn no-print">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-200">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">Siparişiniz Alınmıştır!</h1>
                    <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                        Sayın <span className="font-bold text-slate-700">{order.customer}</span>, siparişiniz başarıyla oluşturuldu.
                        Detaylı bilgiler e-posta adresinize gönderilmiştir.
                    </p>
                </div>

                {/* Navigation Actions */}
                <div className="flex flex-col md:flex-row justify-center gap-4 mb-12 no-print">
                    <Link
                        to="/account"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm group"
                    >
                        <User className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                        Hesabımı İncele
                    </Link>
                    <Link
                        to="/"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center group"
                    >
                        <ShoppingBag className="w-5 h-5 group-hover:animate-bounce" />
                        Alışverişe Devam Et
                    </Link>
                </div>

                {/* Invoice Style Summary Card */}
                <div id="invoice-card" className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100 animate-slideUp">
                    {/* Invoice Header */}
                    <div className="bg-slate-900 px-8 py-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Sipariş Bilgileri</h3>
                                <p className="text-white/60 text-xs">Dörtel Mağazacılık ve Tedarik</p>
                            </div>
                        </div>
                        <button onClick={() => window.print()} className="flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors no-print">
                            <Printer className="w-4 h-4" /> YAZDIR
                        </button>
                    </div>

                    <div className="p-8">
                        {/* Order Metadata Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 pb-8 border-b border-slate-100">
                            <div>
                                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Sipariş No</span>
                                <div className="flex items-center gap-2">
                                    <Hash className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="font-bold text-slate-800 text-sm">{order.orderNo}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Tarih</span>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="font-bold text-slate-800 text-sm">{new Date(order.date).toLocaleDateString('tr-TR')}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Ödeme</span>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="font-bold text-slate-800 text-sm">{order.paymentType}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Durum</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                    <span className="font-bold text-orange-600 text-sm">Bekleniyor</span>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-10">
                            <h4 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-wider">Satın Alınan Ürünler</h4>
                            <div className="space-y-4">
                                {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors">
                                        <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 p-1 flex-shrink-0">
                                            <img src={item.image} alt="" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h5 className="text-sm font-bold text-slate-800 truncate">{item.name}</h5>
                                            <p className="text-xs text-slate-500">{item.quantity} Adet x {item.price.toLocaleString('tr-TR')} TL</p>
                                        </div>
                                        <div className="text-sm font-black text-slate-900 whitespace-nowrap">
                                            {(item.price * item.quantity).toLocaleString('tr-TR')} TL
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Subtotal & Totals Grid */}
                        <div className="flex flex-col md:flex-row justify-end gap-6 md:gap-12 pt-8 border-t border-slate-100">
                            <div className="space-y-3 min-w-[240px]">
                                <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                                    <span>Ara Toplam</span>
                                    <span>{order.subtotal.toLocaleString('tr-TR')} TL</span>
                                </div>

                                {order.basketDiscount > 0 && (
                                    <div className="flex justify-between items-center text-sm font-bold text-green-600 bg-green-50 px-3 py-2 rounded-xl">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center">
                                                <Hash className="w-3 h-3" />
                                            </div>
                                            <span>Sepette İndirim (%{order.basketDiscountRate})</span>
                                        </div>
                                        <span>-{order.basketDiscount.toLocaleString('tr-TR')} TL</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                                    <span>Kargo Ücreti</span>
                                    <span className="text-green-600">ÜCRETSİZ</span>
                                </div>

                                <div className="h-px bg-slate-100 my-2"></div>

                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-black text-slate-900 uppercase tracking-tighter">Genel Toplam</span>
                                    <span className="text-2xl font-black text-blue-600">{order.amount.toLocaleString('tr-TR')} TL</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Help */}
                        <div className="mt-12 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-4 no-print">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h5 className="text-sm font-bold text-blue-900">Hesabım Üzerinden Takip Edin</h5>
                                <p className="text-xs text-blue-700/80 leading-relaxed">
                                    Siparişinizin durumunu dilediğiniz zaman hesabınızdaki "Siparişlerim" bölümünden kontrol edebilirsiniz.
                                </p>
                            </div>
                            <Link to="/account" className="ml-auto w-10 h-10 bg-white border border-blue-200 rounded-xl flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
