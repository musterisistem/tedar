export const adminData = {
    visitorStats: {
        todayUnique: 417,
        todayTotal: 2170,
        hourlyData: [
            { hour: '00:00', visitors: 120 },
            { hour: '04:00', visitors: 80 },
            { hour: '08:00', visitors: 200 },
            { hour: '12:00', visitors: 450 },
            { hour: '16:00', visitors: 380 },
            { hour: '20:00', visitors: 500 },
            { hour: '23:59', visitors: 200 },
        ]
    },
    realtime: {
        total: 34,
        members: 12
    },
    pendingOrders: 10,
    toShipOrders: 5,
    userGrowth: {
        total: 413,
        monthly: [
            { month: 'May', users: 20 },
            { month: 'Haz', users: 35 },
            { month: 'Tem', users: 25 },
            { month: 'Ağu', users: 45 },
            { month: 'Eyl', users: 50 },
            { month: 'Eki', users: 55 },
            { month: 'Kas', users: 60 },
            { month: 'Ara', users: 65 },
            { month: 'Oca', users: 70 },
            { month: 'Şub', users: 20 }, // Simulating current/partial month
            { month: 'Mar', users: 0 },
            { month: 'Nis', users: 0 },
        ]
    },
    kpi: {
        revenue: 896564.76,
        netProfit: 181161.04,
        approvedOrders: 304,
        soldItems: 844
    },
    monthlySales: [
        { month: 'Oca', sales: 120000 },
        { month: 'Şub', sales: 150000 },
        { month: 'Mar', sales: 180000 },
        { month: 'Nis', sales: 220000 },
        { month: 'May', sales: 190000 },
        { month: 'Haz', sales: 250000 },
        { month: 'Tem', sales: 280000 },
        { month: 'Ağu', sales: 300000 },
        { month: 'Eyl', sales: 270000 },
        { month: 'Eki', sales: 320000 },
        { month: 'Kas', sales: 350000 },
        { month: 'Ara', sales: 400000 },
    ],
    salesSummary: {
        daily: 7956.00,
        weekly: 42914.00,
        monthly: 194514.00,
        yearly: 896564.76
    },
    recentOrders: [
        { id: 1, customer: 'Sevan Alpay', location: 'İstanbul', status: 'pending', amount: 86.40 },
        { id: 2, customer: 'Mustafa Çelik', location: 'Ankara', status: 'shipped', amount: 956.00 },
        { id: 3, customer: 'Ayşe Yılmaz', location: 'İzmir', status: 'delivered', amount: 1250.50 },
        { id: 4, customer: 'Mehmet Demir', location: 'Bursa', status: 'processing', amount: 340.00 },
        { id: 5, customer: 'Zeynep Kaya', location: 'Antalya', status: 'pending', amount: 150.25 },
    ],
    // Expanded orders list for the Orders page
    orders: [
        { id: 1, orderNo: 'ORD-2024-001', customer: 'Sevan Alpay', isActiveMember: true, paymentType: 'Kredi Kartı', amount: 86.40, status: 'pending', date: '2024-03-10', items: 'Kalem Seti, Defter', productCount: 2 },
        { id: 2, orderNo: 'ORD-2024-002', customer: 'Mustafa Çelik', isActiveMember: false, paymentType: 'Havale/EFT', amount: 956.00, status: 'shipped', date: '2024-03-09', items: 'Ofis Sandalyesi', productCount: 1 },
        { id: 3, orderNo: 'ORD-2024-003', customer: 'Ayşe Yılmaz', isActiveMember: true, paymentType: 'Kredi Kartı', amount: 1250.50, status: 'delivered', date: '2024-03-08', items: 'Toner, Kağıt (A4)', productCount: 5 },
        { id: 4, orderNo: 'ORD-2024-004', customer: 'Mehmet Demir', isActiveMember: true, paymentType: 'Kapıda Ödeme', amount: 340.00, status: 'processing', date: '2024-03-08', items: 'Masa Lambası', productCount: 1 },
        { id: 5, orderNo: 'ORD-2024-005', customer: 'Zeynep Kaya', isActiveMember: false, paymentType: 'Kredi Kartı', amount: 150.25, status: 'pending', date: '2024-03-07', items: 'Silgi, Kalemtıraş, Cetvel', productCount: 3 },
        { id: 6, orderNo: 'ORD-2024-006', customer: 'Ali Veli', isActiveMember: true, paymentType: 'Kredi Kartı', amount: 2200.00, status: 'completed', date: '2024-03-05', items: 'Baskı Makinesi', productCount: 1 },
        { id: 7, orderNo: 'ORD-2024-007', customer: 'Fatma Şahin', isActiveMember: false, paymentType: 'Havale/EFT', amount: 450.00, status: 'cancelled', date: '2024-03-04', items: 'Dosya Dolabı', productCount: 1 },
        { id: 8, orderNo: 'ORD-2024-008', customer: 'Burak Öz', isActiveMember: true, paymentType: 'Kredi Kartı', amount: 125.00, status: 'shipped', date: '2024-03-03', items: 'USB Bellek', productCount: 1 },
        { id: 9, orderNo: 'ORD-2024-009', customer: 'Elif Demir', isActiveMember: true, paymentType: 'Kredi Kartı', amount: 890.00, status: 'delivered', date: '2024-03-02', items: 'Monitör Standı', productCount: 1 },
        { id: 10, orderNo: 'ORD-2024-010', customer: 'Can Yılmaz', isActiveMember: false, paymentType: 'Havale/EFT', amount: 65.00, status: 'pending', date: '2024-03-01', items: 'Not Kağıdı', productCount: 2 },
    ],
    products: [
        { id: 1, code: 'KRT-001', name: 'Fabriano A4 Fotokopi Kağıdı', category: 'Kırtasiye', price: 125.00, stock: 500, isActive: true, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200' },
        { id: 2, code: 'TKN-005', name: 'Logitech MX Master 3S', category: 'Teknoloji', price: 3450.00, stock: 25, isActive: true, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=200' },
        { id: 3, code: 'OF-012', name: 'Ergonomik Ofis Sandalyesi', category: 'Ofis Mobilyaları', price: 4200.00, stock: 10, isActive: true, image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=200' },
        { id: 4, code: 'KRT-003', name: 'Stabilo Boss Fosforlu Kalem Seti', category: 'Kırtasiye', price: 185.50, stock: 150, isActive: true, image: 'https://images.unsplash.com/photo-1515081775791-fd64716715ae?auto=format&fit=crop&q=80&w=200' },
        { id: 5, code: 'GDA-008', name: 'Çaykur Rize Turist Çayı 1kg', category: 'Gıda', price: 145.00, stock: 80, isActive: false, image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=200' },
        { id: 6, code: 'TKN-002', name: 'Samsung T7 Shield 1TB SSD', category: 'Teknoloji', price: 3890.00, stock: 30, isActive: true, image: 'https://images.unsplash.com/photo-1628151016209-66a7b77464d6?auto=format&fit=crop&q=80&w=200' },
        { id: 7, code: 'OF-004', name: 'Masaüstü Düzenleyici Set', category: 'Ofis Mobilyaları', price: 450.00, stock: 45, isActive: true, image: 'https://images.unsplash.com/photo-1497215842964-222b4bef9728?auto=format&fit=crop&q=80&w=200' },
        { id: 8, code: 'KRT-009', name: 'Moleskine Klasik Not Defteri', category: 'Kırtasiye', price: 650.00, stock: 60, isActive: true, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200' },
    ]
};
