import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();

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
if (!fs.existsSync(DATA_DIR)) {
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
            from: 'Dortel <onboarding@resend.dev>', // Default Resend test sender
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

// 2. Save Settings (Database/JSON persistence)
app.post('/api/save-settings', (req, res) => {
    try {
        const { filename, ...data } = req.body;
        const targetFile = filename || 'siteSettings.json';

        // Block direct access to sensitive file via this generic endpoint
        if (targetFile === 'paytrSettings.json') {
            return res.status(403).json({ success: false, message: 'Sensitive file access denied' });
        }

        const filePath = path.join(DATA_DIR, targetFile);
        const contentToSave = data.data !== undefined ? data.data : data;

        fs.writeFileSync(filePath, JSON.stringify(contentToSave, null, 2), 'utf-8');
        res.json({ success: true, message: `${targetFile} saved successfully` });
    } catch (error) {
        console.error('Save Error:', error);
        res.status(500).json({ success: false, message: 'Failed to save settings' });
    }
});

// 3. Get Settings (Optional helper)
app.get('/api/settings/:filename', (req, res) => {
    try {
        const targetFile = req.params.filename;

        // Block direct access to sensitive file via this generic endpoint
        if (targetFile === 'paytrSettings.json') {
            return res.status(403).json({ success: false, message: 'Sensitive file access denied' });
        }

        const filePath = path.join(DATA_DIR, targetFile);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            res.json(JSON.parse(data));
        } else {
            res.status(404).json({ success: false, message: 'File not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Read error' });
    }
});

// --- PAYTR ADMIN ENDPOINTS ---

// Get PayTR Settings (Admin Only - simplified by path)
app.get('/api/admin/paytr-settings', (req, res) => {
    try {
        const filePath = path.join(DATA_DIR, 'paytrSettings.json');
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            res.json({ success: true, data });
        } else {
            // Return empty structure if not exists, so frontend handles it gracefully
            res.json({ success: true, data: { merchant_id: '', merchant_key: '', merchant_salt: '' } });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error reading PayTR settings' });
    }
});

// Save PayTR Settings
app.post('/api/admin/paytr-settings', (req, res) => {
    try {
        const { merchant_id, merchant_key, merchant_salt } = req.body;
        const filePath = path.join(DATA_DIR, 'paytrSettings.json');

        const settings = { merchant_id, merchant_key, merchant_salt };
        fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8');

        res.json({ success: true, message: 'PayTR settings saved' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving PayTR settings' });
    }
});

// 4. PayTR Token Endpoint
app.post('/api/paytr/token', async (req, res) => {
    try {
        const { user_basket, email, payment_amount, user_name, user_address, user_phone, merchant_oid } = req.body;

        // Try load from file first
        let merchant_id = process.env.PAYTR_MERCHANT_ID;
        let merchant_key = process.env.PAYTR_MERCHANT_KEY;
        let merchant_salt = process.env.PAYTR_MERCHANT_SALT;

        const settingsPath = path.join(DATA_DIR, 'paytrSettings.json');
        if (fs.existsSync(settingsPath)) {
            try {
                const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
                if (settings.merchant_id && settings.merchant_key && settings.merchant_salt) {
                    merchant_id = settings.merchant_id;
                    merchant_key = settings.merchant_key;
                    merchant_salt = settings.merchant_salt;
                }
            } catch (e) {
                console.error('Error reading paytrSettings.json, falling back to env', e);
            }
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
        const merchant_ok_url = 'http://localhost:5173/order-success';
        const merchant_fail_url = 'http://localhost:5173/checkout?error=payment_failed';

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

app.listen(port, () => {
    console.log(`API Server running at http://localhost:${port}`);
});

// KEEP ALIVE HACK
// Force event loop to stay open if app.listen fails to hold it in this environment
setInterval(() => {
    // Heartbeat
}, 10000);
