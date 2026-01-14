import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { ArrowLeft, Printer, FileText, CheckCircle, Truck, XCircle, Clock, MapPin, User, CreditCard, Package, Search } from 'lucide-react';
import logo from '../../assets/logo.png';
import { slugify } from '../../utils/slugify';

export const OrderDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { orders, updateOrder } = useOrders();
    const [order, setOrder] = useState<any | null>(null);
    const [status, setStatus] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const foundOrder = orders.find((o: any) => o.id.toString() === id?.toString());
        if (foundOrder) {
            setOrder(foundOrder);
            setStatus(foundOrder.status);
            setTrackingNumber(foundOrder.trackingNumber || '');
            setNotes(foundOrder.notes || '');
        }
    }, [id, orders]);

    const handleSaveStatus = async () => {
        if (order) {
            await updateOrder(order.id, {
                status: status as any,
                trackingNumber: trackingNumber,
                notes: notes
            });
            const updatedOrder = { ...order, status, trackingNumber, notes };
            setOrder(updatedOrder);
            setIsDirty(false);
            alert(`Sipariş durumu "${getStatusLabel(status)}" olarak güncellendi.`);
        }
    };


    if (!order) {
        return (
            <div className="p-8 text-center">
                <p className="text-slate-500 mb-4">Sipariş bulunamadı veya yükleniyor...</p>
                <button onClick={() => navigate('/admin/orders')} className="text-blue-600 font-bold hover:underline">Listeye Dön</button>
            </div>
        );
    }

    const statusMap: { [key: string]: { label: string, color: string, icon: any } } = {
        'delivered': { label: 'Teslim Edildi', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
        'shipped': { label: 'Kargolandı', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Truck },
        'cancelled': { label: 'İptal Edildi', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
        'processing': { label: 'Hazırlanıyor', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Package },
        'pending': { label: 'Beklemede', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock },
        'Beklemede': { label: 'Beklemede', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock },
        'İşleme Alındı': { label: 'İşleme Alındı', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Search },
        'Hazırlanıyor': { label: 'Hazırlanıyor', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Package },
        'Kargoya Verildi': { label: 'Kargoya Verildi', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Truck },
        'Teslim Edildi': { label: 'Teslim Edildi', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
        'İptal Edildi': { label: 'İptal Edildi', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    };

    const getStatusLabel = (s: string) => {
        const key = Object.keys(statusMap).find(k => k.toLowerCase() === s.toLowerCase()) || s;
        return statusMap[key]?.label || s;
    };

    // Current status info
    const statusInfo = statusMap[order.status.toLowerCase()] || statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: Clock };
    const StatusIcon = statusInfo.icon;

    // Gerçek sipariş ürünleri - order.items'tan alınıyor
    const orderItems = order.items || [];

    return (
        <>
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-receipt, #printable-receipt * {
                        visibility: visible;
                    }
                    #printable-receipt {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                        background: white;
                        padding: 20px;
                        z-index: 9999;
                    }
                    @page {
                        margin: 0;
                        size: auto;
                    }
                }
            `}</style>

            <div className="max-w-6xl mx-auto pb-24 print:hidden">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/orders')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-slate-800">Sipariş #{order.orderNo}</h1>
                                {/* Status Configurator */}
                                <div className="flex items-center gap-2">
                                    <select
                                        value={status}
                                        onChange={(e) => {
                                            setStatus(e.target.value);
                                            setIsDirty(true);
                                        }}
                                        className={`text-xs font-bold px-2 py-1 rounded border outline-none cursor-pointer ${statusInfo.color}`}
                                    >
                                        <option value="Beklemede">Beklemede</option>
                                        <option value="İşleme Alındı">İşleme Alındı</option>
                                        <option value="Hazırlanıyor">Hazırlanıyor</option>
                                        <option value="Kargoya Verildi">Kargoya Verildi</option>
                                        <option value="delivered">Teslim Edildi</option>
                                        <option value="cancelled">İptal Edildi</option>
                                    </select>
                                    {isDirty && (
                                        <button
                                            onClick={handleSaveStatus}
                                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-bold hover:bg-blue-700 transition-colors animate-fadeIn"
                                        >
                                            Kaydet
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm mt-1">
                                {order.date} {order.time && `saat ${order.time}`} tarihinde oluşturuldu
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <Printer className="w-4 h-4" />
                            Yazdır
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                            <FileText className="w-4 h-4" />
                            Fatura Oluştur
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-500" />
                                    Sipariş İçeriği
                                </h2>
                                <span className="text-xs font-medium text-slate-500">{orderItems.length} Ürün</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {orderItems.map((item: any) => (
                                    <Link
                                        to={`/${slugify(item.name)}`}
                                        target="_blank"
                                        key={item.id}
                                        className="p-4 flex gap-4 hover:bg-blue-50 transition-colors group cursor-pointer"
                                        title="Ürünü yeni sekmede görüntüle"
                                    >
                                        <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group-hover:border-blue-200 transition-colors">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{item.name}</h3>
                                            <div className="text-xs text-slate-500 mt-1">Stok Kodu: STK-{item.id}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-slate-800">{(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</div>
                                            <div className="text-xs text-slate-500">{item.quantity} Adet x {item.price.toLocaleString('tr-TR')} TL</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-100">
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="text-slate-500">Ara Toplam</span>
                                    <span className="font-medium text-slate-700">{(order.amount * 0.82).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                                </div>
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="text-slate-500">KDV (%18)</span>
                                    <span className="font-medium text-slate-700">{(order.amount * 0.18).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                                </div>
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="text-slate-500">Kargo</span>
                                    <span className="font-medium text-green-600">Ücretsiz</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-3">
                                    <span className="font-bold text-lg text-slate-800">Genel Toplam</span>
                                    <span className="font-bold text-xl text-blue-600">{order.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Customer & Shipping Info */}
                    <div className="space-y-6">
                        {/* Customer Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-500" />
                                Müşteri Bilgileri
                            </h3>
                            <div className="flex items-center gap-3 mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                <div className="w-10 h-10 bg-white text-indigo-600 rounded-full flex items-center justify-center font-bold shadow-sm">
                                    {order.customer.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-indigo-900 text-sm">{order.customer}</div>
                                    <div className="text-xs text-indigo-600">Müşteri</div>
                                </div>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-1 border-b border-slate-50">
                                    <span className="text-slate-500">E-Posta:</span>
                                    <span className="font-medium text-slate-800">{order.email || 'Belirtilmemiş'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-50">
                                    <span className="text-slate-500">Telefon:</span>
                                    <span className="font-medium text-slate-800">{order.phone || 'Belirtilmemiş'}</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                                <button className="flex-1 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors">Mesaj Gönder</button>
                                <Link to="/admin/users" className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors text-center">Profile Git</Link>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-red-500" />
                                Teslimat Adresi
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                                {order.address || 'Adres belirtilmemiş'}<br />
                                {order.district && order.city ? `${order.district} / ${order.city}` : ''}
                            </p>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-emerald-500" />
                                Ödeme Bilgileri
                            </h3>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-500">Ödeme Yöntemi:</span>
                                <span className="text-sm font-bold text-slate-800">{order.paymentMethod || 'Kredi Kartı'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Durum:</span>
                                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">Ödendi</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Printable Receipt */}
            <div id="printable-receipt" className="hidden">
                <div className="text-center mb-8">
                    <img src={logo} alt="Logo" className="h-12 w-auto mx-auto mb-2 opacity-50 grayscale" />
                    <h2 className="text-xl font-bold text-black uppercase tracking-widest">Sipariş Fişi</h2>
                    <p className="text-xs text-gray-500 mt-1">#{order.orderNo} - {order.date}</p>
                </div>

                <div className="border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold">Müşteri:</span>
                        <span>{order.customer}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold">Ödeme:</span>
                        <span>{order.paymentMethod || 'Kredi Kartı'}</span>
                    </div>
                    <div className="mt-2 text-sm">
                        <span className="font-bold block mb-1">Teslimat Adresi:</span>
                        <span className="block text-xs leading-tight text-gray-600">
                            Atatürk Mah. Çiçek Sok. No:5 Daire:12<br />
                            Kadıköy / İstanbul
                        </span>
                    </div>
                </div>

                <table className="w-full text-xs mb-6">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="text-left py-1">Ürün</th>
                            <th className="text-right py-1">Adet</th>
                            <th className="text-right py-1">Tutar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed divide-gray-300">
                        {orderItems.map((item: any) => (
                            <tr key={item.id}>
                                <td className="py-2">{item.name}</td>
                                <td className="text-right py-2">{item.quantity}</td>
                                <td className="text-right py-2">{(item.price * item.quantity).toLocaleString('tr-TR')} TL</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="border-t-2 border-dashed border-gray-300 pt-4">
                    <div className="flex justify-between text-sm font-bold mb-2">
                        <span>TOPLAM:</span>
                        <span>{order.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                    </div>
                    <div className="text-[10px] text-center text-gray-500 mt-8">
                        Teşekkür Ederiz<br />
                        www.dorteltedarik.com
                    </div>
                </div>
            </div>
        </>
    );
};
