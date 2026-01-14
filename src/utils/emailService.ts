export const emailService = {
    sendWelcomeEmail: async (to: string, name: string) => {
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'welcome',
                    to,
                    data: { name }
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to send welcome email', error);
            return { success: false, error };
        }
    },

    sendOrderReceivedEmail: async (to: string, order: any) => {
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'order-new',
                    to,
                    data: order
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to send order email', error);
            return { success: false, error };
        }
    },

    sendOrderStatusUpdate: async (to: string, order: any) => {
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'order-status',
                    to,
                    data: order
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to send status email', error);
            return { success: false, error };
        }
    },

    sendAdminNewOrderNotification: async (adminEmails: string[], order: any) => {
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'admin-alert',
                    to: adminEmails,
                    data: order
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to send admin alert', error);
            return { success: false, error };
        }
    }
};
