import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../../src/lib/mongodb.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    try {
        const client = await clientPromise;
        const db = client.db('dortel-db');
        const collection = db.collection('users');

        // Register
        if (req.method === 'POST' && req.url?.includes('/register')) {
            const { email, password, name, phone } = req.body;

            // Check if user exists
            const existingUser = await collection.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Bu email adresi zaten kayıtlı' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = {
                email,
                password: hashedPassword,
                name,
                phone,
                role: 'customer',
                createdAt: new Date().toISOString(),
                addresses: [],
                orders: []
            };

            const result = await collection.insertOne(user);

            // Generate JWT token
            const token = jwt.sign(
                { userId: result.insertedId, email, role: user.role },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(201).json({
                success: true,
                token,
                user: {
                    id: result.insertedId,
                    email,
                    name,
                    role: user.role
                }
            });
        }

        // Login
        if (req.method === 'POST' && req.url?.includes('/login')) {
            const { email, password } = req.body;

            // Find user
            const user = await collection.findOne({ email });
            if (!user) {
                return res.status(401).json({ error: 'Email veya şifre hatalı' });
            }

            // Check password
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({ error: 'Email veya şifre hatalı' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(200).json({
                success: true,
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            });
        }

        // Get Profile (requires authentication)
        if (req.method === 'GET' && req.url?.includes('/profile')) {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({ error: 'Yetkisiz erişim' });
            }

            try {
                const decoded = jwt.verify(token, JWT_SECRET) as any;
                const user = await collection.findOne({ _id: decoded.userId });

                if (!user) {
                    return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
                }

                return res.status(200).json({
                    success: true,
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        phone: user.phone,
                        addresses: user.addresses,
                        role: user.role
                    }
                });
            } catch (err) {
                return res.status(401).json({ error: 'Geçersiz token' });
            }
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Users API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
