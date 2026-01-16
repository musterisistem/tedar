import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../../src/lib/mongodb.js';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    try {
        const client = await clientPromise;
        const db = client.db('dortel-db');
        const collection = db.collection('orders');

        if (req.method === 'GET') {
            const { orderNo } = req.query;
            if (!orderNo) {
                return res.status(400).json({ success: false, error: 'Order number is required' });
            }

            const searchStr = (orderNo as string).trim();
            // Case-insensitive search on both orderNo and orderNumber
            const order = await collection.findOne({
                $or: [
                    { orderNo: { $regex: new RegExp(`^${searchStr}$`, 'i') } },
                    { orderNumber: { $regex: new RegExp(`^${searchStr}$`, 'i') } }
                ]
            });

            if (!order) {
                return res.status(404).json({ success: false, error: 'Order not found' });
            }

            // Return limited info for privacy
            const safeOrder = {
                orderNo: order.orderNo,
                status: order.status,
                date: order.date,
                amount: order.amount,
                items: order.items,
                customer: order.customer.split(' ').map((n: string) => n[0] + '*'.repeat(n.length - 1)).join(' '),
                trackingNumber: order.trackingNumber
            };

            return res.status(200).json({ success: true, data: safeOrder });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Track Order API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
