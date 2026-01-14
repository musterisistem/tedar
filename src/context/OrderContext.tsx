import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import ordersData from '../data/orders.json';
import { emailService } from '../utils/emailService';

export interface OrderItem {
    id: string | number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface Order {
    id: string | number;
    orderNo: string;
    customer: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    date: string;
    amount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentType: string;
    items: OrderItem[];
    isActiveMember?: boolean;
    subtotal?: number;
    basketDiscount?: number;
    basketDiscountRate?: number;
    trackingNumber?: string;
    notes?: string;
    time?: string;
}

interface OrderContextType {
    orders: Order[];
    addOrder: (order: Omit<Order, 'id' | 'orderNo' | 'date'>) => Promise<Order>;
    updateOrder: (id: string | number, updatedOrder: Partial<Order>) => Promise<void>;
    deleteOrder: (id: string | number) => Promise<void>;
    refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [orders, setOrders] = useState<Order[]>([]);

    // Verileri sunucudan çekme fonksiyonu
    const refreshOrders = async () => {
        try {
            const response = await fetch('/api/settings/orders.json?t=' + Date.now());
            if (response.ok) {
                const result = await response.json();
                const data = result?.data || result;
                if (Array.isArray(data)) {
                    setOrders(data);
                }
            }
        } catch (error) {
            console.error('Siparişler çekilir olurken hata oluştu:', error);
        }
    };

    // İlk yüklemede ve statik veriden başlatma
    React.useEffect(() => {
        const data = (ordersData as any)?.data || ordersData;
        if (Array.isArray(data)) {
            setOrders(data);
        }
        refreshOrders();
    }, []);

    const saveOrdersToDisk = async (currentOrders: Order[]) => {
        try {
            await fetch('/api/save-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: 'orders.json',
                    data: currentOrders
                })
            });
        } catch (error) {
            console.error('Siparişler kaydedilirken hata oluştu:', error);
        }
    };

    const addOrder = async (order: Omit<Order, 'id' | 'orderNo' | 'date'>): Promise<Order> => {
        const newOrder: Order = {
            ...order,
            id: Date.now(),
            orderNo: `DT${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            status: order.status || 'pending'
        };
        const next = [newOrder, ...orders];
        setOrders(next);
        await saveOrdersToDisk(next);

        // Send Emails
        try {
            // Customer
            await emailService.sendOrderReceivedEmail(newOrder.email, newOrder);

            // Admin
            fetch('/api/settings/notificationSettings.json')
                .then(res => res.ok ? res.json() : null)
                .then(settings => {
                    if (settings?.adminEmails?.length > 0) {
                        emailService.sendAdminNewOrderNotification(settings.adminEmails, newOrder);
                    }
                })
                .catch(err => console.error("Error fetching admin emails", err));

        } catch (e) {
            console.error("Email error", e);
        }

        return newOrder;
    };

    const updateOrder = async (id: string | number, updatedOrder: Partial<Order>) => {
        const oldOrder = orders.find(o => o.id === id);
        const next = orders.map(order =>
            order.id === id ? { ...order, ...updatedOrder } : order
        );
        setOrders(next);
        await saveOrdersToDisk(next);

        // Status Email
        if (oldOrder && updatedOrder.status && updatedOrder.status !== oldOrder.status) {
            const finalOrder = next.find(o => o.id === id);
            if (finalOrder) {
                const statusMap: Record<string, string> = {
                    'pending': 'Beklemede',
                    'processing': 'Hazırlanıyor',
                    'shipped': 'Kargolandı',
                    'delivered': 'Teslim Edildi',
                    'cancelled': 'İptal Edildi'
                };

                // Use TR status if available or fallback
                const statusText = statusMap[finalOrder.status] || finalOrder.status;
                const orderWithTrStatus = { ...finalOrder, status: statusText };

                emailService.sendOrderStatusUpdate(finalOrder.email, orderWithTrStatus).catch(console.error);
            }
        }
    };

    const deleteOrder = async (id: string | number) => {
        const next = orders.filter(order => order.id !== id);
        setOrders(next);
        await saveOrdersToDisk(next);
    };

    return (
        <OrderContext.Provider value={{ orders, addOrder, updateOrder, deleteOrder, refreshOrders }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};
