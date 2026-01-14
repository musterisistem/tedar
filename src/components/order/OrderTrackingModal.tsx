import React, { useEffect, useState } from 'react';
import { X, Truck, Package, Clock, CheckCircle, Search, Hash, Calendar, CreditCard, ExternalLink } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';

interface OrderTrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any; // Using any for site_orders compatibility
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose, order: initialOrder }) => {
    const { orders, refreshOrders } = useOrders();
    const [order, setOrder] = useState<any>(initialOrder);

    // Initial load and sync with context
    useEffect(() => {
        if (isOpen && initialOrder) {
            // Find the order in the fresh context data
            const freshOrder = orders.find(o => o.orderNo === initialOrder.orderNo) || initialOrder;
            setOrder(freshOrder);
        }
    }, [isOpen, initialOrder, orders]);

    // Poll for updates when modal is open
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isOpen) {
            // Initial refresh
            refreshOrders();

            // Poll every 5 seconds
            interval = setInterval(() => {
                refreshOrders();
            }, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOpen, refreshOrders]);


    if (!isOpen) return null;

    // Status timeline logic
    const statuses = [
        { key: 'Beklemede', label: 'Beklemede', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
        { key: 'işleme alındı', label: 'İşleme Alındı', icon: Search, color: 'text-blue-500', bg: 'bg-blue-50' },
        { key: 'Hazırlanıyor', label: 'Hazırlanıyor', icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' },
        { key: 'Kargoya Verildi', label: 'Kargoya Verildi', icon: Truck, color: 'text-green-500', bg: 'bg-green-50' }
    ];

    // Map order.status (case insensitive/admin values) to our timeline
    const getCurrentStatusIndex = () => {
        if (!order) return 0;
        const currentStatus = order.status?.toLowerCase();
        if (currentStatus === 'beklemede' || currentStatus === 'pending') return 0;
        if (currentStatus === 'işleme alındı') return 1;
        if (currentStatus === 'hazırlanıyor') return 2;
        if (currentStatus === 'kargoya verildi' || currentStatus === 'shipped') return 3;
        return 0;
    };

    const currentIndex = getCurrentStatusIndex();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-zoomIn">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary text-white rounded-xl flex items-center justify-center">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Sipariş Takibi</h2>
                            <p className="text-xs text-slate-500 font-medium">Siparişinizin güncel durumu {order ? `(#${order.orderNo})` : ''}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {!order ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Sipariş Bulunamadı</h3>
                        <p className="text-slate-500 text-sm mt-2">Lütfen sipariş numaranızı kontrol edip tekrar deneyin.</p>
                        <button onClick={onClose} className="mt-6 bg-slate-100 text-slate-700 px-6 py-2 rounded-xl font-bold hover:bg-slate-200 transition-colors">Kapat</button>
                    </div>
                ) : (
                    <div className="p-6 md:p-8 overflow-y-auto max-h-[80vh]">
                        {/* Order Identity Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Sipariş No</span>
                                <div className="flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-secondary" />
                                    <span className="font-semibold text-slate-800">{order.orderNo}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Tarih</span>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-secondary" />
                                    <span className="font-semibold text-slate-800">{order.date}</span>
                                </div>
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Sipariş Tutarı</span>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-secondary" />
                                    <span className="font-semibold text-blue-600">{order.amount?.toLocaleString('tr-TR')} TL</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Timeline */}
                        <div className="mb-10">
                            <h4 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Sipariş Durumu</h4>
                            <div className="relative">
                                {/* Connection Line */}
                                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100 md:left-0 md:right-0 md:top-6 md:h-0.5 md:w-auto"></div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                                    {statuses.map((status, index) => {
                                        const isCompleted = index <= currentIndex;
                                        const isCurrent = index === currentIndex;
                                        const Icon = status.icon;

                                        return (
                                            <div key={status.key} className="flex md:flex-col items-center gap-4 md:text-center group">
                                                <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isCompleted
                                                    ? `${status.bg} ${status.color} shadow-lg shadow-slate-200 scale-110`
                                                    : 'bg-white text-slate-300 border-2 border-slate-100'
                                                    } ${isCurrent ? 'ring-4 ring-offset-2 ring-blue-100 animate-pulse' : ''}`}>
                                                    <Icon className="w-6 h-6" />
                                                    {isCompleted && !isCurrent && index < currentIndex && (
                                                        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                                                            <CheckCircle className="w-3 h-3" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 md:mt-2">
                                                    <div className={`text-xs font-bold uppercase tracking-tight ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                                                        {status.label}
                                                    </div>
                                                    {isCurrent && (
                                                        <div className="text-[10px] text-blue-500 font-bold animate-pulse">Güncel Durum</div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary Preview */}
                        <div className="border-t border-slate-100 pt-8">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Sipariş Özeti</h4>
                                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{order.productCount} Ürün</span>
                            </div>

                            {/* Simple item list if available */}
                            {order.items && Array.isArray(order.items) && (
                                <div className="space-y-3 mb-6">
                                    {order.items.slice(0, 3).map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <img src={item.image} alt="" className="w-10 h-10 object-cover bg-white rounded-lg border border-slate-200 p-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-xs font-bold text-slate-800 truncate">{item.name}</h5>
                                                <p className="text-[10px] text-slate-500">{item.quantity} Adet x {item.price} TL</p>
                                            </div>
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <p className="text-[10px] text-slate-400 text-center font-bold">ve {order.items.length - 3} ürün daha...</p>
                                    )}
                                </div>
                            )}

                            {/* Alert Box */}
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-blue-900">Bilgilendirme</h5>
                                    <p className="text-xs text-blue-700/80 leading-relaxed">
                                        Siparişinizin durumundaki her değişiklikte size SMS ve e-posta ile bilgilendirme yapılacaktır.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Button */}
                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 bg-slate-100 text-slate-700 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Pencereyi Kapat
                            </button>
                            <button
                                className="flex-1 bg-secondary text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                                onClick={() => window.location.href = '/iletisim'}
                            >
                                Destek Al <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
