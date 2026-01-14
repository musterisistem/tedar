import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    MoreHorizontal, Users, CreditCard,
    TrendingUp, Clock, CheckCircle, Truck, Package
} from 'lucide-react';
// Lazy Load Charts to prevent bundle crash
const DashboardCharts = React.lazy(() => import('../../components/admin/DashboardCharts'));
import { useProducts } from '../../context/ProductContext';
import { useUsers } from '../../context/UserContext';
import { useOrders } from '../../context/OrderContext';

export const Dashboard: React.FC = () => {
    const { products } = useProducts();
    const { users } = useUsers();
    const { orders, refreshOrders } = useOrders();
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [activeVisitors, setActiveVisitors] = useState(0);
    const prevOrderCountRef = useRef(orders.length);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Bildirim sesi
    useEffect(() => {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audioRef.current.volume = 0.5;
    }, []);

    // Sipariş artışında sesli bildirim
    useEffect(() => {
        if (orders.length > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
            audioRef.current?.play().catch(() => console.warn('Audio play failed'));
        }
        prevOrderCountRef.current = orders.length;
    }, [orders.length]);

    // Aktif ziyaretçi sayısını çek
    const fetchActiveVisitors = async () => {
        try {
            const response = await fetch('/src/data/active_visitors.json?t=' + Date.now());
            if (response.ok) {
                const data = await response.json();
                const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
                const active = (data.visitors || []).filter((v: any) => v.lastSeen > fiveMinutesAgo);
                setActiveVisitors(active.length);
            }
        } catch (error) {
            console.warn('Active visitors fetch error:', error);
        }
    };

    // Auto-refresh simulation
    useEffect(() => {
        fetchActiveVisitors();
        const timer = setInterval(() => {
            setLastUpdate(new Date());
            refreshOrders();
            fetchActiveVisitors();
        }, 15000);
        return () => clearInterval(timer);
    }, [refreshOrders]);

    // Derived Statistics
    const stats = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const toShipOrders = orders.filter(o => o.status === 'processing' || o.status === 'shipped').length;
        const approvedOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'pending').length;
        const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.amount, 0);

        const todayOrders = orders.filter(o => o.date === todayStr);
        const dailyRevenue = todayOrders.reduce((sum, o) => sum + o.amount, 0);

        const soldItemsCount = orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + (o.items?.reduce((iSum, item) => iSum + item.quantity, 0) || 0), 0);

        // Kategori Bazlı Satış Analizi (Son 30 Gün)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const lastMonthOrders = orders.filter(o => new Date(o.date) >= thirtyDaysAgo && o.status !== 'cancelled');

        const categoryCounts: { [key: string]: number } = {};
        lastMonthOrders.forEach(order => {
            order.items?.forEach((item: any) => {
                const product = products.find(p => p.id.toString() === item.id.toString());
                const category = product?.categories?.[0] || 'Diğer';
                categoryCounts[category] = (categoryCounts[category] || 0) + item.quantity;
            });
        });

        const categoryData = Object.entries(categoryCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

        // Son 7 günün günlük ziyaretçi verileri
        const dailyVisitors = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const shortDate = date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
            const fullDate = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
            // Mock data with seed
            const seed = date.getDate() + date.getMonth() * 31;
            const visitors = 50 + (seed * 17) % 150;
            dailyVisitors.push({ date: shortDate, fullDate, visitors });
        }

        return {
            pendingOrders,
            toShipOrders,
            approvedOrders,
            totalRevenue,
            dailyRevenue,
            soldItemsCount,
            totalUsers: users.length,
            activeUsers: users.filter(u => u.isOnline).length,
            totalProducts: products.length,
            recentOrders: orders.slice(0, 5),
            dailyVisitors,
            categoryData,
            COLORS
        };
    }, [orders, users, products]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Dashboard</h1>
                    <p className="text-slate-500 font-medium">Hoşgeldiniz, işletmenizin anlık durumu.</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-100 uppercase">
                        SON GÜNCELLEME: {lastUpdate.toLocaleTimeString('tr-TR')}
                    </span>
                </div>
            </div>

            {/* ROW 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* A) Ziyaretçi Sayıları */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-end">
                            <span className="text-slate-500 text-sm font-semibold">Toplam Kullanıcı</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-slate-800">{stats.totalUsers}</span>
                            </div>
                        </div>
                        <div className="w-full bg-slate-50 h-px"></div>
                        <div className="flex justify-between items-end">
                            <span className="text-slate-500 text-sm font-semibold">Aktif (Çevrimiçi)</span>
                            <span className="text-xl font-bold text-green-600">{activeVisitors}</span>
                        </div>
                    </div>
                    <div className="h-28 w-full opacity-80 group-hover:opacity-100 transition-opacity">
                        <React.Suspense fallback={<div className="flex items-center justify-center h-full text-xs text-slate-400">Grafik yükleniyor...</div>}>
                            <DashboardCharts type="visitors" data={stats.dailyVisitors} />
                        </React.Suspense>
                    </div>
                </div>

                {/* B) Kategori Dağılımı (PieChart) */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex flex-col">
                            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Satış Analizi</h3>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Son 30 Gün / Kategoriler</span>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                        </div>
                    </div>

                    <div className="flex-1 min-h-[220px] relative">
                        <React.Suspense fallback={<div className="flex items-center justify-center h-full text-xs text-slate-400">Grafik yükleniyor...</div>}>
                            <DashboardCharts type="categories" data={stats.categoryData} colors={stats.COLORS} />
                        </React.Suspense>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center bg-slate-50/50 p-3 rounded-xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toplam Satış Kalemi</span>
                        <span className="text-sm font-black text-slate-800">{stats.categoryData.reduce((acc, curr) => acc + curr.value, 0)}</span>
                    </div>
                </div>

                {/* Sağ Bölüm */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group cursor-pointer border border-transparent hover:border-orange-100">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                </div>
                            </div>
                            <div>
                                <span className="text-3xl font-bold text-slate-800 block mb-1">{stats.pendingOrders}</span>
                                <span className="text-xs font-bold text-slate-500">Onay Bekleyen</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group cursor-pointer border border-transparent hover:border-blue-100">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <Truck className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <div>
                                <span className="text-3xl font-bold text-slate-800 block mb-1">{stats.toShipOrders}</span>
                                <span className="text-xs font-bold text-slate-500">Gönderilecek</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex flex-col">
                                <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Katalog Durumu</h3>
                            </div>
                            <span className="text-2xl font-bold text-slate-800">{stats.totalProducts}</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <span className="text-xs text-slate-400 font-medium">Toplam Aktif Ürün</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2 - KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-50 rounded-xl">
                            <CreditCard className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                    <div>
                        <span className="text-slate-500 text-sm font-medium block mb-1">Toplam Ciro</span>
                        <div className="text-2xl font-black text-slate-800">{stats.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div>
                        <span className="text-slate-500 text-sm font-medium block mb-1">Bugünkü Ciro</span>
                        <div className="text-2xl font-black text-slate-800">{stats.dailyRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <div>
                        <span className="text-slate-500 text-sm font-medium block mb-1">Onaylı Sipariş</span>
                        <div className="text-2xl font-black text-slate-800">{stats.approvedOrders}</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <Package className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <div>
                        <span className="text-slate-500 text-sm font-medium block mb-1">Satılan Ürün</span>
                        <div className="text-2xl font-black text-slate-800">{stats.soldItemsCount}</div>
                    </div>
                </div>
            </div>

            {/* ROW 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Son Siparişler */}
                <div className="lg:col-span-12 bg-white rounded-2xl p-6 shadow-sm border border-transparent flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight">Son Siparişler</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-slate-500 bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3">Müşteri</th>
                                    <th className="px-4 py-3">Tarih</th>
                                    <th className="px-4 py-3">Tutar</th>
                                    <th className="px-4 py-3">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {stats.recentOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                                        onClick={() => window.location.href = `/admin/orders/${order.id}`}
                                    >
                                        <td className="px-4 py-3 font-bold text-slate-800">{order.customer}</td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {order.date} {order.time && <span className="text-slate-400 text-xs">({order.time})</span>}
                                        </td>
                                        <td className="px-4 py-3 font-black text-slate-900">{order.amount.toLocaleString('tr-TR')} TL</td>
                                        <td className="px-4 py-3">
                                            {(() => {
                                                const statusMap: { [key: string]: { label: string; bg: string; text: string } } = {
                                                    'pending': { label: 'Beklemede', bg: 'bg-orange-50', text: 'text-orange-600' },
                                                    'processing': { label: 'Hazırlanıyor', bg: 'bg-yellow-50', text: 'text-yellow-600' },
                                                    'shipped': { label: 'Kargolandı', bg: 'bg-blue-50', text: 'text-blue-600' },
                                                    'delivered': { label: 'Teslim Edildi', bg: 'bg-green-50', text: 'text-green-600' },
                                                    'cancelled': { label: 'İptal', bg: 'bg-red-50', text: 'text-red-600' }
                                                };
                                                const s = statusMap[order.status] || { label: order.status, bg: 'bg-gray-50', text: 'text-gray-600' };
                                                return (
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${s.bg} ${s.text}`}>
                                                        {s.label}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                    </tr>
                                ))}
                                {stats.recentOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">Henüz sipariş bulunmuyor.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
