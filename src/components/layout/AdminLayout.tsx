import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
// Using safe, standard icons to avoid version incompatibility crashes
import { LayoutDashboard, Users, ShoppingBag, Settings, LogOut, Package, ChevronDown, Plus, List, Folder, Percent, Layout, Image, Clock, CreditCard, Tag, Bell, Truck, Upload, Briefcase } from 'lucide-react';

export const AdminLayout: React.FC = () => {
    const location = useLocation();
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        {
            // Using standard 'Layout' icon instead of potentially missing 'LayoutTemplate'
            icon: Layout,
            label: 'Ana Sayfa Düzen',
            path: '#',
            id: 'home-layout',
            subItems: [
                { string_icon: Image, label: 'Slayt Yönetimi', path: '/admin/home/slider' },
                { string_icon: Image, label: 'Banner Yönetimi', path: '/admin/home/banners' },
                { string_icon: Truck, label: 'Kargo Bantı', path: '/admin/home/free-shipping-banner' },
                { string_icon: Image, label: 'Ana Sayfa Ürün Grubu', path: '/admin/home/collections' },
                { string_icon: Tag, label: 'Popüler Kategoriler', path: '/admin/home/popular-categories' },
                { string_icon: Image, label: 'Ürün Detay Kutuları', path: '/admin/home/features' },
                { string_icon: Briefcase, label: 'Ofis Seçtikleri', path: '/admin/settings/office' },
                { string_icon: Image, label: 'Hakkımızda', path: '/admin/settings/about' },
                { string_icon: Users, label: 'İletişim', path: '/admin/settings/contact' }
            ]
        },
        {
            icon: Package,
            label: 'Ürün İşlemleri',
            path: '#',
            id: 'products',
            subItems: [
                { string_icon: Plus, label: 'Ürün Ekle', path: '/admin/products/add' },
                { string_icon: Upload, label: 'Toplu Ürün Ekle', path: '/admin/products/import' },
                { string_icon: List, label: 'Ürün Listesi', path: '/admin/products/list' },
                { string_icon: Folder, label: 'Ürün Kategorileri', path: '/admin/categories' },
                { string_icon: ShoppingBag, label: 'Outlet Yönetimi', path: '/admin/products/outlet' },
                { string_icon: Percent, label: 'Kampanya Yönetimi', path: '/admin/products/campaigns' },
                { string_icon: Clock, label: 'Flaş Ürünler', path: '/admin/products/flash' },
                { string_icon: Folder, label: 'Marka Yönetimi', path: '/admin/products/brands' },
                { string_icon: Percent, label: 'Sepette İndirim Yönetimi', path: '/admin/products/discount-in-cart' }
            ]
        },
        { icon: ShoppingBag, label: 'Siparişler', path: '/admin/orders' },
        { icon: Users, label: 'Kullanıcılar', path: '/admin/users' },
        { icon: Bell, label: 'Fiyat Alarmları', path: '/admin/price-alerts' },
        {
            icon: Settings,
            label: 'Ayarlar',
            path: '#',
            id: 'settings',
            subItems: [
                { string_icon: CreditCard, label: 'Ödeme Yöntemleri', path: '/admin/settings/payments' },
                { string_icon: Truck, label: 'Teslimat Ayarları', path: '/admin/settings/delivery' },
                { string_icon: Bell, label: 'Bildirim Ayarları', path: '/admin/settings/notifications' },
                { string_icon: Users, label: 'İletişim Bilgileri', path: '/admin/settings/contact' }
            ]
        },
    ];

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-10 transition-all duration-300">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-semibold text-white tracking-tight uppercase">Dörtel Panel</h2>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item: any) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.subItems && item.subItems.some((sub: any) => location.pathname === sub.path));

                        return (
                            <div key={item.label} className="group">
                                {item.subItems ? (
                                    <div className="relative">
                                        <button
                                            onClick={() => setOpenSubmenu(openSubmenu === item.id ? null : item.id)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5" />
                                                {item.label}
                                            </div>
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openSubmenu === item.id ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Submenu */}
                                        <div className={`mt-1 ml-4 space-y-1 overflow-hidden transition-all duration-300 ${openSubmenu === item.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                            {item.subItems.map((sub: any) => {
                                                const SubIcon = sub.string_icon;
                                                const isSubActive = location.pathname === sub.path;
                                                return (
                                                    <Link
                                                        key={sub.path}
                                                        to={sub.path}
                                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${isSubActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                                                    >
                                                        <SubIcon className="w-4 h-4" />
                                                        {sub.label}
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Çıkış Yap
                    </Link>

                    {/* SEO Backlink */}
                    <div className="mt-4 text-center text-xs text-slate-500">
                        WebCode: <a
                            href="https://bursawebtasarimhizmeti.com.tr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Bursa Web Tasarım
                        </a>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 bg-slate-100">
                <div className="p-8 w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
