import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
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
            const response = await fetch('/api/orders');
            if (response.ok) {
                const result = await response.json();
                if (result.success && Array.isArray(result.data)) {
                    setOrders(result.data);
                }
            }
        } catch (error) {
            console.error('Siparişler çekilirken hata oluştu:', error);
        }
    };

    // İlk yüklemede ve statik veriden başlatma
    React.useEffect(() => {
        refreshOrders();
    }, []);

    const addOrder = async (order: Omit<Order, 'id' | 'orderNo' | 'date'>): Promise<Order> => {
        const orderToSave = {
            ...order,
            orderNo: `DT${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            status: order.status || 'pending'
        };

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderToSave)
            });

            if (response.ok) {
                const result = await response.json();
                const newOrder = result.data;
                setOrders(prev => [newOrder, ...prev]);

                // Emails are sent from backend when order is created
                // (Customer confirmation + Admin notification)

                return newOrder;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || 'Order creation failed');
            }
        } catch (error) {
            console.error('Error adding order:', error);
            throw error;
        }
    };

    const updateOrder = async (id: string | number, updatedOrder: Partial<Order>) => {
        const oldOrder = orders.find(o => o.id === id || (o as any)._id === id);

        try {
            const response = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: oldOrder?.orderNo || id, ...updatedOrder })
            });

            if (response.ok) {
                const next = orders.map(order =>
                    (order.id === id || (order as any)._id === id) ? { ...order, ...updatedOrder } : order
                );
                setOrders(next);

                // Status Email
                if (oldOrder && updatedOrder.status && updatedOrder.status !== oldOrder.status) {
                    const finalOrder = next.find(o => o.id === id || (o as any)._id === id);
                    if (finalOrder) {
                        const statusMap: Record<string, string> = {
                            'pending': 'Beklemede',
                            'processing': 'Hazırlanıyor',
                            'shipped': 'Kargolandı',
                            'delivered': 'Teslim Edildi',
                            'cancelled': 'İptal Edildi'
                        };
                        const statusText = statusMap[finalOrder.status] || finalOrder.status;
                        emailService.sendOrderStatusUpdate(finalOrder.email, { ...finalOrder, status: statusText }).catch(console.error);
                    }
                }
            }
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    const deleteOrder = async (id: string | number) => {
        try {
            const response = await fetch(`/api/orders?id=${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setOrders(prev => prev.filter(order => order.id !== id && (order as any)._id !== id));
            }
        } catch (error) {
            console.error('Error deleting order:', error);
        }
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
