import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useOrders } from '../../context/OrderContext';

export const Orders: React.FC = () => {
    const { orders, deleteOrder } = useOrders();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter Logic
    const filteredOrders = orders.filter((order: any) => {
        const matchesSearch =
            (order.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.orderNo || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="w-full pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Sipariş Yönetimi</h1>
                    <p className="text-slate-500 text-sm mt-1">Sistemdeki tüm siparişlerin takibi.</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-slate-100 text-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-200 transition-colors">
                        Excel İndir
                    </button>
                    <button className="bg-blue-700 text-white px-4 py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                        Yeni Sipariş
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-50 p-4 border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <input
                    type="text"
                    placeholder="Sipariş no veya müşteri ara..."
                    className="flex-1 bg-white border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="bg-white border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 min-w-[200px]"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">Tüm Durumlar</option>
                    <option value="Beklemede">Beklemede</option>
                    <option value="İşleme Alındı">İşleme Alındı</option>
                    <option value="Hazırlanıyor">Hazırlanıyor</option>
                    <option value="Kargoya Verildi">Kargoya Verildi</option>
                    <option value="Teslim Edildi">Teslim Edildi</option>
                    <option value="İptal Edildi">İptal Edildi</option>
                </select>
            </div>

            {/* Simple Table */}
            <div className="bg-white border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">Sipariş No</th>
                            <th className="px-4 py-3">Müşteri</th>
                            <th className="px-4 py-3">Tarih</th>
                            <th className="px-4 py-3">Tutar</th>
                            <th className="px-4 py-3">Ödeme</th>
                            <th className="px-4 py-3">Durum</th>
                            <th className="px-4 py-3 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentOrders.map((order: any) => {
                            const statusMap: { [key: string]: string } = {
                                'delivered': 'Teslim Edildi',
                                'shipped': 'Kargolandı', // Legacy support
                                'cancelled': 'İptal Edildi',
                                'processing': 'Hazırlanıyor',
                                'pending': 'Beklemede',
                                'Kargolandı': 'Kargoya Verildi' // Map old to new if needed
                            };
                            // If status is already Turkish (e.g. "İşleme Alındı"), use it directly
                            const displayStatus = statusMap[order.status.toLowerCase()] || order.status;

                            const getStatusColor = (s: string) => {
                                if (s === 'Teslim Edildi') return 'bg-green-50 text-green-700 border-green-200';
                                if (s === 'Kargoya Verildi' || s === 'Kargolandı') return 'bg-blue-50 text-blue-700 border-blue-200';
                                if (s === 'İptal' || s === 'İptal Edildi') return 'bg-red-50 text-red-700 border-red-200';
                                if (s === 'Hazırlanıyor') return 'bg-purple-50 text-purple-700 border-purple-200';
                                if (s === 'İşleme Alındı') return 'bg-blue-50 text-blue-600 border-blue-100';
                                return 'bg-orange-50 text-orange-700 border-orange-200'; // Beklemede etc.
                            };

                            return (
                                <tr
                                    key={order.id}
                                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                                    onClick={() => window.location.href = `/admin/orders/${order.id}`}
                                >
                                    <td className="px-4 py-3 font-mono text-slate-800">
                                        {order.orderNo}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-700">{order.customer}</div>
                                        {order.isActiveMember && <span className="text-[10px] text-blue-600">(Üye)</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        {order.date}
                                    </td>
                                    <td className="px-4 py-3 font-bold text-slate-800">
                                        {order.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                                    </td>
                                    <td className="px-4 py-3">
                                        {order.paymentType || 'Kredi Kartı'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-bold border ${getStatusColor(displayStatus)}`}>
                                            {displayStatus}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <Link to={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline">Detay</Link>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Bu siparişi silmek istediğinize emin misiniz?')) {
                                                    deleteOrder(order.id);
                                                }
                                            }}
                                            className="text-red-600 hover:underline"
                                        >
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {currentOrders.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        Sipariş bulunamadı.
                    </div>
                )}
            </div>

            {/* Simple Pagination */}
            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-slate-500">
                    Toplam {filteredOrders.length} siparişten {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredOrders.length)} arası gösteriliyor
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-sm"
                    >
                        Önceki
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 border text-sm ${currentPage === page ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-300 hover:bg-slate-50'}`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-sm"
                    >
                        Sonraki
                    </button>
                </div>
            </div>
        </div>
    );
};
