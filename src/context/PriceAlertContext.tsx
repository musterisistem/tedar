import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface PriceAlert {
    id: string;
    userId: number;
    email: string;
    userName: string;
    productId: string;
    productName: string;
    priceAtAlert: number;
    date: string;
}

interface PriceAlertContextType {
    alerts: PriceAlert[];
    activateAlert: (product: { id: string | number, name: string, price: number }, user: { id: number, name: string, email: string }) => Promise<{ success: boolean; message: string }>;
    deactivateAlert: (productId: string, userId: number) => Promise<{ success: boolean; message: string }>;
    isAlertActive: (productId: string, userId: number) => boolean;
    saveAlerts: (newAlerts: PriceAlert[]) => Promise<{ success: boolean; message: string }>;
    clearUserAlerts: (userId: number) => Promise<{ success: boolean; message: string }>;
}

const PriceAlertContext = createContext<PriceAlertContextType | undefined>(undefined);

export const PriceAlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);

    // Initial load
    useEffect(() => {
        const loadAlerts = async () => {
            try {
                const response = await fetch('/src/data/priceAlerts.json');
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setAlerts(data);
                    } else if (data && Array.isArray(data.data)) {
                        setAlerts(data.data);
                    }
                }
            } catch (error) {
                console.error('Error loading price alerts:', error);
            }
        };
        loadAlerts();
    }, []);

    const saveAlerts = async (newAlerts: PriceAlert[]) => {
        try {
            const response = await fetch('/api/save-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: 'priceAlerts.json',
                    data: newAlerts
                }),
            });

            if (response.ok) {
                setAlerts(newAlerts);
                return { success: true, message: 'Başarıyla kaydedildi.' };
            }
            return { success: false, message: 'Kaydedilemedi.' };
        } catch (error) {
            return { success: false, message: 'Bağlantı hatası.' };
        }
    };

    const activateAlert = useCallback(async (product: { id: string | number, name: string, price: number }, user: { id: number, name: string, email: string }) => {
        const productId = product.id.toString();
        if (alerts.some(a => a.productId === productId && a.userId === user.id)) {
            return { success: true, message: 'Zaten aktif.' };
        }

        const newAlert: PriceAlert = {
            id: Math.random().toString(36).substring(2, 9),
            userId: user.id,
            userName: user.name,
            email: user.email,
            productId: productId,
            productName: product.name,
            priceAtAlert: product.price,
            date: new Date().toISOString().split('T')[0]
        };

        const updatedAlerts = [...alerts, newAlert];
        return await saveAlerts(updatedAlerts);
    }, [alerts]);

    const deactivateAlert = useCallback(async (productId: string, userId: number) => {
        const updatedAlerts = alerts.filter(a => !(a.productId === productId && a.userId === userId));
        return await saveAlerts(updatedAlerts);
    }, [alerts]);

    const isAlertActive = useCallback((productId: string, userId: number) => {
        return alerts.some(a => a.productId === productId && a.userId === userId);
    }, [alerts]);

    const clearUserAlerts = useCallback(async (userId: number) => {
        const updatedAlerts = alerts.filter(a => a.userId !== userId);
        return await saveAlerts(updatedAlerts);
    }, [alerts]);

    return (
        <PriceAlertContext.Provider value={{ alerts, activateAlert, deactivateAlert, isAlertActive, saveAlerts, clearUserAlerts }}>
            {children}
        </PriceAlertContext.Provider>
    );
};

export const usePriceAlerts = () => {
    const context = useContext(PriceAlertContext);
    if (!context) {
        throw new Error('usePriceAlerts must be used within a PriceAlertProvider');
    }
    return context;
};
