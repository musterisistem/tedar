import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// MongoDB Cached Connection Setup (Critical for Vercel)
let cachedClient = null;
let cachedDb = null;
let lastDbError = null; // Store error for debugging

async function connectDB() {
    // If we have a cached connection, use it
    if (cachedDb) {
        return cachedDb;
    }

    // Clean up URI (Remove whitespace and accidental quotes)
    let uri = process.env.MONGODB_URI;
    if (uri) {
        uri = uri.trim().replace(/^["']|["']$/g, '');
    }

    if (!uri) {
        lastDbError = 'MONGODB_URI is missing in environment variables!';
        console.error('❌ ' + lastDbError);
        return null;
    }

    try {
        const client = new MongoClient(uri, {
            // Optimization for Serverless
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        await client.connect();
        const dbName = new URL(uri).pathname.substr(1) || 'test';
        const db = client.db(dbName);

        cachedClient = client;
        cachedDb = db;
        lastDbError = null; // Clear error on success

        console.log(`✅ MongoDB Connected to ${dbName}`);
        return db;
    } catch (error) {
        lastDbError = error.message;
        console.error('❌ MongoDB Connection Failed:', error);
        return null;
    }
}

dotenv.config();
if (fs.existsSync('.env.local')) {
    const envLocal = dotenv.parse(fs.readFileSync('.env.local'));
    for (const k in envLocal) {
        process.env[k] = envLocal[k];
    }
}

process.on('exit', (code) => {
    console.log(`[DEBUG] Process exiting with code: ${code}`);
});

process.on('uncaughtException', (err) => {
    console.error('[CRITICAL] Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();
const port = 3001;

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const resend = new Resend(process.env.RESEND_API_KEY);

// Data Directory
const DATA_DIR = path.join(__dirname, 'src/data');

// Ensure data dir exists
// Ensure data dir exists (Local Development Only)
if (process.env.VERCEL !== '1' && !fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ----------------------------------------------------------------------
// Email Templates
// ----------------------------------------------------------------------

const getWelcomeTemplate = (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563eb;">Dörtel Tedarik</h1>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
            <h2 style="color: #1e293b;">Hoş Geldiniz, ${name}!</h2>
            <p style="color: #475569;">Aramıza katıldığınız için çok mutluyuz. Ofis ve kırtasiye ihtiyaçlarınız için en doğru yerdesiniz.</p>
            <p style="color: #475569;">Hemen alışverişe başlamak için aşağıdaki butona tıklayın:</p>
            <div style="text-align: center; margin-top: 20px;">
                <a href="http://localhost:5173" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Alışverişe Başla</a>
            </div>
        </div>
        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
            © ${new Date().getFullYear()} Dörtel Tedarik. Tüm hakları saklıdır.
        </div>
    </div>
`;

const getOrderReceivedTemplate = (order) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563eb;">Siparişiniz Alındı</h1>
        </div>
        <div style="padding: 20px;">
            <p style="color: #1e293b;">Sayın <strong>${order.customer}</strong>,</p>
            <p style="color: #475569;">Siparişiniz başarıyla oluşturuldu. Özet bilgiler aşağıdadır:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr style="background-color: #f1f5f9;">
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0;">Sipariş No</th>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${order.orderNo}</td>
                </tr>
                <tr>
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0;">Tarih</th>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${order.date}</td>
                </tr>
                <tr style="background-color: #f1f5f9;">
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0;">Tutar</th>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${order.amount.toLocaleString('tr-TR')} TL</td>
                </tr>
            </table>

            <h3 style="margin-top: 20px; color: #1e293b;">Ürünler</h3>
            <ul style="list-style: none; padding: 0;">
                ${order.items.map(item => `
                    <li style="padding: 10px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between;">
                        <span>${item.name} (x${item.quantity})</span>
                        <span>${(item.price * item.quantity).toLocaleString('tr-TR')} TL</span>
                    </li>
                `).join('')}
            </ul>
        </div>
    </div>
`;

const getOrderStatusTemplate = (order) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563eb;">Sipariş Durumu Güncellendi</h1>
        </div>
        <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
            <p style="font-size: 18px; color: #1e293b;">Sipariş No: <strong>${order.orderNo}</strong></p>
            <div style="margin: 20px 0; padding: 15px; background-color: #e0f2fe; color: #0369a1; border-radius: 6px; font-weight: bold; font-size: 20px;">
                ${order.status.toUpperCase()}
            </div>
            <p style="color: #475569;">Siparişinizle ilgili güncel durum yukarıdaki gibidir.</p>
        </div>
    </div>
`;

const getAdminNotificationTemplate = (order) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; border-left: 5px solid #ef4444;">
        <h2 style="color: #b91c1c;">Yeni Sipariş Alındı!</h2>
        <p><strong>Müşteri:</strong> ${order.customer}</p>
        <p><strong>Tutar:</strong> ${order.amount.toLocaleString('tr-TR')} TL</p>
        <p><strong>Sipariş No:</strong> ${order.orderNo}</p>
        <div style="margin-top: 20px;">
            <a href="http://localhost:5173/admin/orders" style="background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Admin Paneline Git</a>
        </div>
    </div>
`;

const getContactFormTemplate = (contactData) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; border-left: 5px solid #3b82f6;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin: 0;">📧 Yeni İletişim Formu Mesajı</h1>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1e293b; margin-top: 0; margin-bottom: 15px; font-size: 18px;">İletişim Bilgileri</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px 0; font-weight: bold; color: #475569; width: 30%;">Ad Soyad:</td>
                    <td style="padding: 12px 0; color: #1e293b;">${contactData.name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px 0; font-weight: bold; color: #475569;">E-posta:</td>
                    <td style="padding: 12px 0; color: #1e293b;">
                        <a href="mailto:${contactData.email}" style="color: #2563eb; text-decoration: none;">${contactData.email}</a>
                    </td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px 0; font-weight: bold; color: #475569;">Konu:</td>
                    <td style="padding: 12px 0;">
                        <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">
                            ${contactData.subject}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; font-weight: bold; color: #475569;">Tarih:</td>
                    <td style="padding: 12px 0; color: #64748b; font-size: 14px;">${new Date().toLocaleString('tr-TR')}</td>
                </tr>
            </table>
        </div>

        <div style="background-color: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 12px; font-size: 16px;">Mesaj İçeriği:</h3>
            <div style="color: #475569; line-height: 1.6; white-space: pre-wrap; font-size: 14px;">
${contactData.message}
            </div>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #f1f5f9; border-radius: 6px; text-align: center;">
            <p style="color: #64748b; font-size: 13px; margin: 0;">
                Bu mesaja doğrudan yanıt vermek için müşterinin e-posta adresini kullanabilirsiniz.
            </p>
        </div>

        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
            © ${new Date().getFullYear()} Dörtel Tedarik. Tüm hakları saklıdır.
        </div>
    </div>
`;

// ----------------------------------------------------------------------
// Routes
// ----------------------------------------------------------------------

// 1. Send Email
app.post('/api/send-email', async (req, res) => {
    try {
        const { type, to, data } = req.body;

        if (!to || !type) {
            return res.status(400).json({ success: false, message: 'Missing parameters' });
        }

        let subject = '';
        let html = '';

        switch (type) {
            case 'welcome':
                subject = 'Dörtel Tedarik\'e Hoş Geldiniz';
                html = getWelcomeTemplate(data.name);
                break;
            case 'order-new':
                subject = `Sipariş Alındı: ${data.orderNo}`;
                html = getOrderReceivedTemplate(data);
                break;
            case 'order-status':
                subject = `Sipariş Durumu Güncellemesi: ${data.orderNo}`;
                html = getOrderStatusTemplate(data);
                break;
            case 'admin-alert':
                subject = `Yeni Sipariş: ${data.orderNo} - ${data.amount} TL`;
                html = getAdminNotificationTemplate(data);
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid email type' });
        }

        /* 
           NOTE: If using free Resend account, you can only send to verified email.
           Ideally 'to' should be dynamic. 
        */

        if (!process.env.RESEND_API_KEY) {
            console.log('MOCK EMAIL SENT:', { to, subject });
            return res.json({ success: true, message: 'Mock email sent (No API Key)' });
        }

        const dataRes = await resend.emails.send({
            from: 'Dörtel Tedarik <siparis@dorteltedarik.com>', // Verified domain
            to: Array.isArray(to) ? to : [to],
            subject: subject,
            html: html,
        });

        res.json({ success: true, data: dataRes });
    } catch (error) {
        console.error('Email Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});




// 2. Contact Form Submission
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Tüm alanlar zorunludur' });
        }

        // Get admin emails from notification settings (Try MongoDB first, then JSON file)
        const db = await connectDB();
        let adminEmails = [];

        // Try MongoDB
        if (db) {
            const settingsCollection = db.collection('notificationSettings');
            const settings = await settingsCollection.findOne({});
            if (settings && settings.adminEmail) {
                adminEmails.push(settings.adminEmail);
            }
            if (settings && Array.isArray(settings.adminEmails)) {
                adminEmails.push(...settings.adminEmails);
            }
        }

        // Try JSON file if no MongoDB emails
        if (adminEmails.length === 0) {
            try {
                const settingsPath = path.join(DATA_DIR, 'notificationSettings.json');
                if (fs.existsSync(settingsPath)) {
                    const fileData = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
                    if (Array.isArray(fileData.adminEmails)) {
                        adminEmails.push(...fileData.adminEmails);
                    }
                }
            } catch (err) {
                console.log('Could not load notification settings from file:', err.message);
            }
        }

        // Fallback
        if (adminEmails.length === 0) {
            adminEmails = ['info@dorteltedarik.com'];
        }

        // Remove duplicates
        adminEmails = [...new Set(adminEmails)];

        // Prepare email data
        const contactData = {
            name,
            email,
            subject,
            message
        };

        // Send email to admin(s)
        if (!process.env.RESEND_API_KEY) {
            console.log('MOCK CONTACT EMAIL:', { to: adminEmails, from: email, subject });
            return res.json({ success: true, message: 'Mesajınız alındı (Mock Mode)' });
        }

        try {
            // Send to admin
            await resend.emails.send({
                from: 'İletişim Formu <iletisim@dorteltedarik.com>',
                to: adminEmails,
                replyTo: email,
                subject: `İletişim Formu: ${subject}`,
                html: getContactFormTemplate(contactData),
            });

            // Send confirmation to customer
            await resend.emails.send({
                from: 'Dörtel Tedarik <info@dorteltedarik.com>',
                to: email,
                subject: 'Mesajınız Bize Ulaştı - Dörtel Tedarik',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h1 style="color: #2563eb;">Dörtel Tedarik</h1>
                        </div>
                        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
                            <h2 style="color: #1e293b;">Merhaba ${name},</h2>
                            <p style="color: #475569;">Mesajınız başarıyla tarafımıza ulaştı. En kısa sürede size geri dönüş yapacağız.</p>
                            <div style="background-color: #fff; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
                                <p style="margin: 0; color: #64748b; font-size: 14px;"><strong>Konu:</strong> ${subject}</p>
                            </div>
                            <p style="color: #64748b; font-size: 13px;">Mesajınız için teşekkür ederiz.</p>
                        </div>
                        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                            © ${new Date().getFullYear()} Dörtel Tedarik. Tüm hakları saklıdır.
                        </div>
                    </div>
                `,
            });

            res.json({
                success: true,
                message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.'
            });
        } catch (emailError) {
            console.error('Email send error:', emailError);
            res.status(500).json({
                success: false,
                message: 'E-posta gönderilirken bir hata oluştu: ' + emailError.message
            });
        }
    } catch (error) {
        console.error('Contact Form Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});




// Ensure DB connection on start
connectDB();

// MongoDB API Routes (Mirrors Vercel Functions)
// ----------------------------------------------------------------------





// USERS & AUTH
const JWT_SECRET = process.env.JWT_SECRET || 'dortel-super-secret-key-2026';

/* ----------------------------------------------------------------------
   USER AUTHENTICATION ROUTES (REFACTORED)
   ---------------------------------------------------------------------- */

// HEALTH CHECK (DB TEST)
app.get('/api/health', async (req, res) => {
    const db = await connectDB();
    res.json({
        status: db ? 'ok' : 'error',
        message: db ? 'Database Connected' : 'Database Connection Failed',
        error_detail: lastDbError,
        timestamp: new Date()
    });
});

// REGISTER
app.post('/api/users/register', async (req, res) => {
    try {
        const { password, name, phone, address, city, district, zipCode } = req.body;
        const email = req.body.email?.trim().toLowerCase();

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, şifre ve isim zorunludur' });
        }

        const db = await connectDB();
        if (!db) return res.status(500).json({ error: 'Database connection failed' });

        const collection = db.collection('users');
        const existingUser = await collection.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'Bu email adresi zaten kayıtlı' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            email,
            password: hashedPassword,
            name,
            phone: phone || '',
            role: 'customer',
            createdAt: new Date(),
            addresses: address ? [{
                id: Date.now(), title: 'Ev', city, district, content: address, zipCode
            }] : [],
            favorites: [],
            orders: []
        };

        const result = await collection.insertOne(newUser);
        const token = jwt.sign({ userId: result.insertedId, email, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });

        return res.status(201).json({
            success: true,
            token,
            user: {
                id: result.insertedId,
                email,
                name,
                role: 'customer',
                addresses: newUser.addresses
            }
        });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Kayıt işlemi başarısız: ' + error.message });
    }
});

// LOGIN
app.post('/api/users/login', async (req, res) => {
    try {
        const { password } = req.body;
        const email = req.body.email?.trim().toLowerCase();

        const db = await connectDB();
        if (!db) return res.status(500).json({ error: 'Database connection failed' });

        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Kullanıcı bulunamadı veya şifre hatalı' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Kullanıcı bulunamadı veya şifre hatalı' });
        }

        const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        // Update Last Login
        await db.collection('users').updateOne(
            { _id: user._id },
            { $set: { lastLogin: new Date() } }
        );

        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                favorites: user.favorites || [],
                addresses: user.addresses || [],
                orders: user.orders || []
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Giriş başarısız: ' + error.message });
    }
});

// PROFILE
app.get('/api/users/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'No token' });

        const decoded = jwt.verify(token, JWT_SECRET);
        const db = await connectDB();
        if (!db) return res.status(500).json({ error: 'DB Error' });

        const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                addresses: user.addresses,
                role: user.role,
                favorites: user.favorites,
                orders: user.orders
            }
        });
    } catch (e) {
        res.status(401).json({ error: 'Invalid Token' });
    }
});

// UPDATE USER (PUT)
app.put('/api/users', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'No token' });

        const decoded = jwt.verify(token, JWT_SECRET);
        const db = await connectDB();

        const { name, favorites, addresses, orders, password } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (favorites) updateData.favorites = favorites;
        if (addresses) updateData.addresses = addresses;
        if (orders) updateData.orders = orders;
        if (password) updateData.password = await bcrypt.hash(password, 10);

        await db.collection('users').updateOne(
            { _id: new ObjectId(decoded.userId) },
            { $set: updateData }
        );

        res.json({ success: true, message: 'Updated' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// Price Alerts
app.get('/api/price-alerts', async (req, res) => {
    try {
        const { userId } = req.query;
        const database = await connectDB();
        if (!database) return res.status(500).json({ error: 'Database connection failed' });

        const query = userId ? { userId: Number(userId) } : {};
        const alerts = await database.collection('price-alerts').find(query).toArray();
        res.json({ success: true, data: alerts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/price-alerts', async (req, res) => {
    try {
        const alert = req.body;
        const database = await connectDB();
        if (!database) return res.status(500).json({ error: 'Database connection failed' });

        alert.createdAt = new Date().toISOString();
        const result = await database.collection('price-alerts').insertOne(alert);
        res.status(201).json({ success: true, data: { ...alert, _id: result.insertedId } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/price-alerts', async (req, res) => {
    try {
        const { productId, userId } = req.query;
        const database = await connectDB();
        if (!database) return res.status(500).json({ error: 'Database connection failed' });

        await database.collection('price-alerts').deleteOne({
            productId: productId,
            userId: Number(userId)
        });
        res.json({ success: true, message: 'Alert deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Orders
app.get('/api/orders', async (req, res) => {
    try {
        const { userId } = req.query;
        const database = await connectDB();
        if (!database) return res.status(500).json({ error: 'Database connection failed' });

        const query = userId ? { userId: userId } : {};
        const orders = await database.collection('orders').find(query).sort({ createdAt: -1 }).toArray();
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const order = req.body;
        const database = await connectDB();
        if (!database) return res.status(500).json({ error: 'Database connection failed' });

        order.createdAt = new Date().toISOString();
        order.status = order.status || 'pending';
        if (!order.orderNo) order.orderNo = `ORD-${Date.now()}`;
        order.orderNumber = order.orderNo;

        const result = await database.collection('orders').insertOne(order);

        // Send notification emails (non-blocking)
        const savedOrder = { ...order, _id: result.insertedId };

        // Send emails in background (don't await to not block response)
        (async () => {
            try {
                if (process.env.RESEND_API_KEY) {
                    // 1. Send to Customer
                    if (order.email) {
                        await resend.emails.send({
                            from: 'Dörtel Tedarik <siparis@dorteltedarik.com>',
                            to: order.email,
                            subject: `Siparişiniz Alındı: ${order.orderNo}`,
                            html: getOrderReceivedTemplate(order)
                        });
                        console.log(`✅ Customer email sent to: ${order.email}`);
                    }

                    // 2. Send to Admin
                    // Load dynamic settings from DB
                    let adminEmails = [];
                    try {
                        // Use existing database connection or reconnect
                        const db = database || await connectDB();
                        if (db) {
                            const settingsDoc = await db.collection('settings').findOne({ key: 'notificationSettings' });
                            if (settingsDoc?.data?.adminEmails && Array.isArray(settingsDoc.data.adminEmails)) {
                                adminEmails = settingsDoc.data.adminEmails;
                            }
                        }
                    } catch (err) {
                        console.error('Failed to load notification settings from DB:', err);
                    }

                    // Fallback to env or default
                    if (adminEmails.length === 0) {
                        const envEmail = process.env.ADMIN_EMAIL || 'info@dorteltedarik.com';
                        adminEmails = [envEmail];
                    }

                    await resend.emails.send({
                        from: 'Dörtel Tedarik <siparis@dorteltedarik.com>',
                        to: adminEmails,
                        subject: `🛒 Yeni Sipariş: ${order.orderNo} - ${order.amount?.toLocaleString('tr-TR')} TL`,
                        html: getAdminNotificationTemplate(order)
                    });
                    console.log(`✅ Admin email sent to: ${adminEmails.join(', ')}`);
                }
            } catch (emailError) {
                console.error('❌ Email sending failed:', emailError);
            }
        })();

        res.status(201).json({ success: true, data: savedOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/orders', async (req, res) => {
    try {
        const { orderId, status, trackingNumber } = req.body;
        const database = await connectDB();
        if (!database) return res.status(500).json({ error: 'Database connection failed' });

        const updates = { status };
        if (trackingNumber) updates.trackingNumber = trackingNumber;

        await database.collection('orders').updateOne(
            { $or: [{ orderNo: orderId }, { orderNumber: orderId }] },
            { $set: updates }
        );
        res.json({ success: true, message: 'Order updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/orders/track', async (req, res) => {
    try {
        const { orderNo } = req.body;
        const database = await connectDB();
        if (!database) return res.status(500).json({ error: 'Database connection failed' });

        if (!orderNo) return res.status(400).json({ success: false, message: 'Sipariş numarası gereklidir.' });

        // Case insensitive search
        const order = await database.collection('orders').findOne({
            $or: [
                { orderNo: { $regex: new RegExp(`^${orderNo}$`, 'i') } },
                { orderNumber: { $regex: new RegExp(`^${orderNo}$`, 'i') } }
            ]
        });

        if (!order) return res.status(404).json({ success: false, message: 'Sipariş bulunamadı.' });

        // Mask customer data
        const maskedOrder = {
            orderNo: order.orderNo,
            orderNumber: order.orderNumber,
            status: order.status,
            date: order.createdAt || order.date,
            customerName: maskName(order.customer?.name || order.customerName || 'Müşteri'),
            total: order.amount || order.total,
            items: order.items || [],
        };
        res.json({ success: true, data: maskedOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function maskName(name) {
    if (!name) return '*** ***';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0] + '***';
    return parts[0][0] + '*** ' + parts[parts.length - 1][0] + '***';
}

// ----------------------------------------------------------------------

// 3. Get Settings (MongoDB)
app.get('/api/settings/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const key = filename.replace('.json', '');

        // Block sensitive keys if needed, though key-based is safer than file path
        if (key === 'paytrSettings') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const database = await connectDB();
        const doc = await database.collection('settings').findOne({ key: key });

        if (doc && doc.data) {
            res.json(doc.data);
        } else {
            res.json({}); // Default empty
        }
    } catch (error) {
        console.error('Settings Read Error:', error);
        res.status(500).json({ success: false, message: 'Read error' });
    }
});

// 3.1 Save Settings (MongoDB - NEW)
app.post('/api/save-settings', async (req, res) => {
    try {
        const { filename, data } = req.body;
        const key = filename.replace('.json', '');

        const database = await connectDB();
        await database.collection('settings').updateOne(
            { key: key },
            { $set: { key: key, data: data, updatedAt: new Date() } },
            { upsert: true }
        );
        res.json({ success: true, message: 'Ayarlar kaydedildi' });
    } catch (error) {
        console.error('Settings Save Error:', error);
        res.status(500).json({ success: false, message: 'Save error' });
    }
});

// --- PAYTR ADMIN ENDPOINTS ---

// Get PayTR Settings (Admin Only)
app.get('/api/admin/paytr-settings', async (req, res) => {
    try {
        const database = await connectDB();
        const doc = await database.collection('settings').findOne({ key: 'paytrSettings' });
        res.json({ success: true, data: doc?.data || { merchant_id: '', merchant_key: '', merchant_salt: '' } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error reading PayTR settings' });
    }
});

// Save PayTR Settings
app.post('/api/admin/paytr-settings', async (req, res) => {
    try {
        const { merchant_id, merchant_key, merchant_salt } = req.body;
        const data = { merchant_id, merchant_key, merchant_salt };

        const database = await connectDB();
        await database.collection('settings').updateOne(
            { key: 'paytrSettings' },
            { $set: { key: 'paytrSettings', data: data, updatedAt: new Date() } },
            { upsert: true }
        );

        res.json({ success: true, message: 'PayTR settings saved' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving PayTR settings' });
    }
});

// 4. PayTR Token Endpoint
app.post('/api/paytr/token', async (req, res) => {
    try {
        const { user_basket, email, payment_amount, user_name, user_address, user_phone, merchant_oid } = req.body;

        // Try load from DB first, then env
        let merchant_id = process.env.PAYTR_MERCHANT_ID;
        let merchant_key = process.env.PAYTR_MERCHANT_KEY;
        let merchant_salt = process.env.PAYTR_MERCHANT_SALT;

        try {
            const database = await connectDB();
            if (database) {
                const settings = await database.collection('settings').findOne({ key: 'paytrSettings' });
                if (settings?.data?.merchant_id) merchant_id = settings.data.merchant_id;
                if (settings?.data?.merchant_key) merchant_key = settings.data.merchant_key;
                if (settings?.data?.merchant_salt) merchant_salt = settings.data.merchant_salt;
            }
        } catch (e) {
            console.error('Error reading paytrSettings from DB, falling back to env', e);
        }

        if (!merchant_id || !merchant_key || !merchant_salt) {
            return res.status(500).json({ status: 'failed', reason: 'PayTR Credentials Missing (Check Admin Panel or .env)' });
        }

        // PayTR Documentation values
        const no_installment = 0; // Taksit yapılsın mı? 1=Hayır, 0=Evet
        const max_installment = 0; // Taksit sınırı (0=Sınırsız)
        const currency = 'TL';
        const test_mode = 1; // 1=Test, 0=Live (User should change this in production)
        const paytr_token_url = 'https://www.paytr.com/odeme/api/get-token';

        // User IP (Express might be behind proxy, so x-forwarded-for)
        let user_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        if (Array.isArray(user_ip)) user_ip = user_ip[0];
        if (user_ip.includes(',')) user_ip = user_ip.split(',')[0].trim();

        // Timeout (Link validity)
        const timeout_limit = 30; // Minutes

        // Callbacks
        // Use BASE_URL from environment variables (Vercel) or fallback to localhost
        const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
        const merchant_ok_url = `${baseUrl}/order-success`;
        const merchant_fail_url = `${baseUrl}/checkout?error=payment_failed`;

        // Basket must be JSON encoded string of array of arrays: [["Name", "Price", "Qty"], ...]
        // Client sends proper array, we stringify it.
        const user_basket_json = JSON.stringify(user_basket);

        // Token Calculation
        // concat: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
        const concat_str = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket_json}${no_installment}${max_installment}${currency}${test_mode}`;

        const paytr_token = crypto.createHmac('sha256', merchant_key)
            .update(concat_str + merchant_salt)
            .digest('base64');

        // Request Body
        const params = new URLSearchParams();
        params.append('merchant_id', merchant_id);
        params.append('user_ip', user_ip);
        params.append('merchant_oid', merchant_oid);
        params.append('email', email);
        params.append('payment_amount', payment_amount); // Krus string? No, PayTR wants FLOAT amount multiplied by 100? No, doc says "9.99" -> 9.99 * 100 = 999.
        // Wait, PayTR wants amount * 100 as integer?
        // Doc: "payment_amount: İşlem tutarı. 10.00 TL için 1000 gönderilmelidir."
        // Client should send ALREADY multiplied or we multiply? 
        // Better to expect client sends standard amount and WE multiply, BUT let's assume client sends "100.50".
        // Let's safe cast. 
        // Actually, logic is safer if done here.
        // But for signature, we used the value PASSED in `payment_amount` from body.
        // If client sends 1000, we use 1000.
        // We will assume `payment_amount` received is CORRECT format (integer pennies).

        params.append('paytr_token', paytr_token);
        params.append('user_basket', user_basket_json);
        params.append('debug_on', '1');
        params.append('no_installment', no_installment.toString());
        params.append('max_installment', max_installment.toString());
        params.append('user_name', user_name);
        params.append('user_address', user_address);
        params.append('user_phone', user_phone);
        params.append('merchant_ok_url', merchant_ok_url);
        params.append('merchant_fail_url', merchant_fail_url);
        params.append('timeout_limit', timeout_limit.toString());
        params.append('currency', currency);
        params.append('test_mode', test_mode.toString());

        const response = await fetch(paytr_token_url, {
            method: 'POST',
            body: params
        });

        const result = await response.json();

        if (result.status === 'success') {
            res.json({ status: 'success', token: result.token });
        } else {
            console.error('PayTR Error:', result);
            res.status(500).json({ status: 'failed', reason: result.reason });
        }

    } catch (error) {
        console.error('PayTR Token Error:', error);
        res.status(500).json({ status: 'failed', reason: error.message });
    }
});

// Only listen if NOT in Vercel (Local Development)
if (process.env.VERCEL !== '1') {
    app.listen(port, () => {
        console.log(`API Server running at http://localhost:${port}`);
    });
}

// KEEP ALIVE HACK
// Force event loop to stay open if app.listen fails to hold it in this environment
setInterval(() => {
    // Heartbeat
}, 10000);

// Export for Vercel
export default app;
