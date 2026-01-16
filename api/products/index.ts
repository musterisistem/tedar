import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../../src/lib/mongodb.js';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    try {
        const client = await clientPromise;
        const db = client.db('dortel-db');
        const collection = db.collection('products');

        if (req.method === 'GET') {
            // Get all products
            const products = await collection.find({}).toArray();
            return res.status(200).json({ success: true, data: products });
        }

        if (req.method === 'POST') {
            // Create new product
            const product = req.body;
            product.createdAt = new Date().toISOString();
            const result = await collection.insertOne(product);
            return res.status(201).json({
                success: true,
                data: { ...product, _id: result.insertedId }
            });
        }

        if (req.method === 'PUT') {
            // Update product
            const { id, ...updates } = req.body;
            await collection.updateOne(
                { id: id },
                { $set: updates }
            );
            return res.status(200).json({ success: true, message: 'Product updated' });
        }

        if (req.method === 'DELETE') {
            // Delete product
            const { id } = req.query;
            await collection.deleteOne({ id: id });
            return res.status(200).json({ success: true, message: 'Product deleted' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Products API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
