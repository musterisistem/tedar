import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../../src/lib/mongodb';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    try {
        const client = await clientPromise;
        const db = client.db('dortel-db');
        const collection = db.collection('price-alerts');

        if (req.method === 'GET') {
            const { userId } = req.query;
            const query = userId ? { userId: Number(userId) } : {};
            const alerts = await collection.find(query).toArray();
            return res.status(200).json({ success: true, data: alerts });
        }

        if (req.method === 'POST') {
            const alert = req.body;
            alert.createdAt = new Date().toISOString();
            const result = await collection.insertOne(alert);
            return res.status(201).json({
                success: true,
                data: { ...alert, _id: result.insertedId }
            });
        }

        if (req.method === 'DELETE') {
            const { productId, userId } = req.query;
            await collection.deleteOne({
                productId: productId as string,
                userId: Number(userId)
            });
            return res.status(200).json({ success: true, message: 'Alert deleted' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Price Alerts API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
