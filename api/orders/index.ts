import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../../src/lib/mongodb';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    try {
        const client = await clientPromise;
        const db = client.db('dortel-db');
        const collection = db.collection('orders');

        if (req.method === 'GET') {
            // Get all orders (admin) or user's orders
            const { userId } = req.query;
            const query = userId ? { userId } : {};
            const orders = await collection.find(query).sort({ createdAt: -1 }).toArray();
            return res.status(200).json({ success: true, data: orders });
        }

        if (req.method === 'POST') {
            // Create new order
            const order = req.body;
            order.createdAt = new Date().toISOString();
            order.status = order.status || 'pending';
            order.orderNumber = `ORD-${Date.now()}`;

            const result = await collection.insertOne(order);
            return res.status(201).json({
                success: true,
                data: { ...order, _id: result.insertedId }
            });
        }

        if (req.method === 'PUT') {
            // Update order status
            const { orderId, status, trackingNumber } = req.body;
            const updates: any = { status };
            if (trackingNumber) updates.trackingNumber = trackingNumber;

            await collection.updateOne(
                { orderNumber: orderId },
                { $set: updates }
            );
            return res.status(200).json({ success: true, message: 'Order updated' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Orders API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
