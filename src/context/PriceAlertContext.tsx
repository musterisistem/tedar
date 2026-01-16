import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface PriceAlert {
    id: string;
    userId: string | number;
    email: string;
    userName: string;
    productId: string | number;
    productName: string;
    priceAtAlert: number;
    date: string;
}

interface PriceAlertContextType {
    alerts: PriceAlert[];
    activateAlert: (product: { id: string | number, name: string, price: number }, user: { id: string | number, name: string, email: string }) => Promise<{ success: boolean; message: string }>;
    deactivateAlert: (productId: string | number, userId: string | number) => Promise<{ success: boolean; message: string }>;
    isAlertActive: (productId: string | number, userId: string | number) => boolean;
    clearUserAlerts: (userId: string | number) => Promise<{ success: boolean; message: string }>;
}

const PriceAlertContext = createContext<PriceAlertContextType | undefined>(undefined);

export const PriceAlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);

    // Initial load
    useEffect(() => {
        const loadAlerts = async () => {
            try {
                const response = await fetch('/api/price-alerts');
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && Array.isArray(result.data)) {
                        setAlerts(result.data);
                    }
                }
            } catch (error) {
                console.error('Error loading price alerts:', error);
            }
        };
        loadAlerts();
    }, []);

    const activateAlert = useCallback(async (product: { id: string | number, name: string, price: number }, user: { id: string | number, name: string, email: string }) => {
        const productId = product.id.toString();
        const userId = user.id.toString();

        if (alerts.some(a => a.productId?.toString() === productId && a.userId?.toString() === userId)) {
            return { success: true, message: 'Zaten aktif.' };
        }

        const newAlert = {
            userId: user.id, // Store as is (string or number)
            userName: user.name,
            email: user.email,
            productId: productId,
            productName: product.name,
            priceAtAlert: Number(product.price),
            date: new Date().toISOString().split('T')[0]
        };

        try {
            const response = await fetch('/api/price-alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAlert),
            });

            if (response.ok) {
                const result = await response.json();
                setAlerts(prev => [...prev, result.data]);
                return { success: true, message: 'Başarıyla kuruldu.' };
            }

            // Try to parse error message
            let errorMessage = 'Sunucu hatası.';
            try {
                const errorData = await response.json();
                if (errorData.error) errorMessage = errorData.error;
                else if (errorData.message) errorMessage = errorData.message;
            } catch (e) {
                // If JSON parse fails, use status text or default
                errorMessage = response.statusText ? `Hata: ${response.status} ${response.statusText}` : 'Sunucu hatası.';
            }

            return { success: false, message: errorMessage };
        } catch (error) {
            return { success: false, message: 'Bağlantı hatası.' };
        }
    }, [alerts]);

    const deactivateAlert = useCallback(async (productId: string | number, userId: string | number) => {
        try {
            const response = await fetch(`/api/price-alerts?productId=${productId.toString()}&userId=${userId.toString()}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setAlerts(prev => prev.filter(a => !(a.productId?.toString() === productId.toString() && a.userId?.toString() === userId.toString())));
                return { success: true, message: 'İptal edildi.' };
            }
            return { success: false, message: 'Sunucu hatası.' };
        } catch (error) {
            return { success: false, message: 'Bağlantı hatası.' };
        }
    }, []);

    const isAlertActive = useCallback((productId: string | number, userId: string | number) => {
        if (!productId || !userId) return false;
        return alerts.some(a =>
            a.productId?.toString() === productId.toString() &&
            a.userId?.toString() === userId.toString()
        );
    }, [alerts]);

    const clearUserAlerts = useCallback(async (userId: string | number) => {
        // This could be implemented with a bulk delete in API if needed
        const userAlerts = alerts.filter(a => a.userId?.toString() === userId.toString());
        for (const alert of userAlerts) {
            await deactivateAlert(alert.productId, userId);
        }
        return { success: true, message: 'Temizlendi.' };
    }, [alerts, deactivateAlert]);

    return (
        <PriceAlertContext.Provider value={{ alerts, activateAlert, deactivateAlert, isAlertActive, clearUserAlerts }}>
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
