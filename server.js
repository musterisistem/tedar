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

        let dbName = 'dortel-db';
        try {
            // Attempt to parse standard URI formats
            dbName = new URL(uri).pathname.substr(1) || 'dortel-db';
        } catch (e) {
            // Fallback for multi-node standard string (mongodb://host1,host2/dbName)
            const match = uri.match(/\/([^/?]+)(\?|$)/);
            if (match && match[1]) dbName = match[1];
        }

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

// Load Turkey Location Data (Legacy - for Neighborhoods)
let turkeyData = null;
const turkeyDataPath = path.join(DATA_DIR, 'turkiye.json');
try {
    if (fs.existsSync(turkeyDataPath)) {
        turkeyData = JSON.parse(fs.readFileSync(turkeyDataPath, 'utf-8'));
        console.log('✅ Loaded Turkey Location Data (Legacy)');
    } else {
        console.warn('⚠️ Turkey Location Data not found at:', turkeyDataPath);
    }
} catch (e) {
    console.error('❌ Failed to load Turkey Location Data:', e);
}

// Load Mernis Cities & Districts Data (New Source)
let mernisData = null;
const mernisDataPath = path.join(DATA_DIR, 'turkey_cities_districts.json');
try {
    if (fs.existsSync(mernisDataPath)) {
        mernisData = JSON.parse(fs.readFileSync(mernisDataPath, 'utf-8'));
        console.log('✅ Loaded Mernis Location Data (Cities & Districts)');
    } else {
        console.warn('⚠️ Mernis Data not found at:', mernisDataPath);
    }
} catch (e) {
    console.error('❌ Failed to load Mernis Data:', e);
}

// ----------------------------------------------------------------------
// Email Templates
// ----------------------------------------------------------------------

const getWelcomeTemplate = (name) => `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <!-- Header Banner -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: white; font-size: 32px; margin: 0 0 10px 0; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    🎉 Hoş Geldiniz!
                </h1>
                <p style="color: rgba(255,255,255,0.95); font-size: 16px; margin: 0;">
                    Dörtel Tedarik Ailesine Katıldınız
                </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
                <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px;">
                    <h2 style="color: #2d3748; font-size: 24px; margin: 0 0 15px 0;">
                        Merhaba <span style="color: #667eea;">${name}</span>! 👋
                    </h2>
                    <p style="color: #4a5568; line-height: 1.6; margin: 0; font-size: 15px;">
                        Aramıza katıldığınız için çok mutluyuz! Ofis ve kırtasiye ihtiyaçlarınız için en doğru adrestesiniz. 
                        Binlerce ürün, hızlı teslimat ve güvenilir hizmet sizleri bekliyor.
                    </p>
                </div>

                <!-- Features Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0;">
                    <div style="background: #f7fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #48bb78;">
                        <div style="font-size: 24px; margin-bottom: 8px;">🚚</div>
                        <div style="font-weight: 600; color: #2d3748; font-size: 14px; margin-bottom: 4px;">Hızlı Teslimat</div>
                        <div style="color: #718096; font-size: 12px;">Aynı gün kargo seçeneği</div>
                    </div>
                    
                    <div style="background: #f7fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #4299e1;">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-weight: 600; color: #2d3748; font-size: 14px; margin-bottom: 4px;">Özel İndirimler</div>
                        <div style="color: #718096; font-size: 12px;">Üyelere özel kampanyalar</div>
                    </div>
                    
                    <div style="background: #f7fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #ed8936;">
                        <div style="font-size: 24px; margin-bottom: 8px;">📦</div>
                        <div style="font-weight: 600; color: #2d3748; font-size: 14px; margin-bottom: 4px;">Geniş Ürün Yelpazesi</div>
                        <div style="color: #718096; font-size: 12px;">Binlerce ürün seçeneği</div>
                    </div>
                    
                    <div style="background: #f7fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #9f7aea;">
                        <div style="font-size: 24px; margin-bottom: 8px;">🎯</div>
                        <div style="font-weight: 600; color: #2d3748; font-size: 14px; margin-bottom: 4px;">Kolay İade</div>
                        <div style="color: #718096; font-size: 12px;">14 gün iade garantisi</div>
                    </div>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 35px 0 25px 0;">
                    <a href="${process.env.BASE_URL || 'https://dorteltedarik.com'}" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; 
                              font-weight: 700; font-size: 16px; box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
                              transition: transform 0.2s;">
                        🛒 Alışverişe Başla
                    </a>
                </div>

                <div style="background: #edf2f7; padding: 20px; border-radius: 10px; text-align: center;">
                    <p style="color: #4a5568; font-size: 13px; margin: 0; line-height: 1.5;">
                        💡 <strong>İpucu:</strong> Favori ürünlerinizi ekleyerek fiyat değişikliklerinden haberdar olabilirsiniz!
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #f7fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 12px; text-align: center; margin: 0 0 10px 0;">
                    Sorularınız için bizimle iletişime geçebilirsiniz
                </p>
                <p style="color: #a0aec0; font-size: 11px; text-align: center; margin: 0;">
                    © ${new Date().getFullYear()} Dörtel Tedarik. Tüm hakları saklıdır.
                </p>
            </div>
        </div>
    </div>
`;

const getResetPasswordTemplate = (link) => `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
            <div style="background: #2563eb; padding: 30px; text-align: center;">
                <div style="background: rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 30px;">🔐</span>
                </div>
                <h1 style="color: white; font-size: 24px; margin: 0; font-weight: 700;">Şifre Sıfırlama</h1>
            </div>
            
            <div style="padding: 40px 30px; text-align: center;">
                <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 15px;">Şifrenizi mi unuttunuz?</h2>
                <p style="color: #64748b; margin: 0 0 30px; line-height: 1.6;">
                    Bu e-posta, şifrenizi sıfırlama talebiniz üzerine gönderilmiştir. 
                    Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.
                </p>
                
                <a href="${link}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                    Şifremi Sıfırla
                </a>
                
                <p style="margin: 30px 0 0; font-size: 13px; color: #94a3b8;">
                    Bu bağlantı 24 saat süreyle geçerlidir. Eğer bu talebi siz yapmadıysanız, bu e-postayı dikkate almayınız.
                </p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} Dörtel Tedarik. Güvenliğiniz bizim için önemlidir.
                </p>
            </div>
        </div>
    </div>
`;

const getOrderReceivedTemplate = (order) => `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #f8f9fa; padding: 30px 15px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
            
            <!-- Success Banner -->
            <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 35px 30px; text-align: center;">
                <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <div style="font-size: 48px;">✓</div>
                </div>
                <h1 style="color: white; font-size: 28px; margin: 0 0 10px 0; font-weight: 700;">
                    Siparişiniz Alındı!
                </h1>
                <p style="color: rgba(255,255,255,0.95); font-size: 15px; margin: 0;">
                    Sipariş No: <strong>${order.orderNo}</strong>
                </p>
            </div>

            <!-- Order Status Timeline -->
            <div style="background: #f7fafc; padding: 30px; border-bottom: 2px solid #e2e8f0;">
                <h3 style="color: #2d3748; font-size: 16px; margin: 0 0 20px 0; text-align: center;">Sipariş Durumu</h3>
                <div style="display: flex; justify-content: space-between; align-items: center; position: relative; max-width: 500px; margin: 0 auto;">
                    <!-- Timeline Line -->
                    <div style="position: absolute; top: 15px; left: 0; right: 0; height: 2px; background: #e2e8f0; z-index: 0;"></div>
                    <div style="position: absolute; top: 15px; left: 0; width: 25%; height: 2px; background: #48bb78; z-index: 0;"></div>
                    
                    <!-- Step 1: Alındı (Active) -->
                    <div style="text-align: center; z-index: 1; flex: 1;">
                        <div style="background: #48bb78; width: 32px; height: 32px; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(72,187,120,0.3);">
                            <span style="color: white; font-size: 16px;">✓</span>
                        </div>
                        <div style="font-size: 11px; color: #2d3748; font-weight: 600;">Alındı</div>
                    </div>
                    
                    <!-- Step 2: Hazırlanıyor -->
                    <div style="text-align: center; z-index: 1; flex: 1;">
                        <div style="background: #e2e8f0; width: 32px; height: 32px; border-radius: 50%; margin: 0 auto 8px; border: 3px solid white;">
                            <div style="width: 100%; height: 100%; border-radius: 50%; border: 2px dashed #cbd5e0;"></div>
                        </div>
                        <div style="font-size: 11px; color: #a0aec0;">Hazırlanıyor</div>
                    </div>
                    
                    <!-- Step 3: Kargoda -->
                    <div style="text-align: center; z-index: 1; flex: 1;">
                        <div style="background: #e2e8f0; width: 32px; height: 32px; border-radius: 50%; margin: 0 auto 8px; border: 3px solid white;">
                            <div style="width: 100%; height: 100%; border-radius: 50%; border: 2px dashed #cbd5e0;"></div>
                        </div>
                        <div style="font-size: 11px; color: #a0aec0;">Kargoda</div>
                    </div>
                    
                    <!-- Step 4: Teslim Edildi -->
                    <div style="text-align: center; z-index: 1; flex: 1;">
                        <div style="background: #e2e8f0; width: 32px; height: 32px; border-radius: 50%; margin: 0 auto 8px; border: 3px solid white;">
                            <div style="width: 100%; height: 100%; border-radius: 50%; border: 2px dashed #cbd5e0;"></div>
                        </div>
                        <div style="font-size: 11px; color: #a0aec0;">Teslim</div>
                    </div>
                </div>
            </div>

            <!-- Customer & Order Info -->
            <div style="padding: 30px;">
                <div style="background: #f7fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                    <p style="color: #2d3748; font-size: 16px; margin: 0 0 5px 0;">
                        Sayın <strong style="color: #667eea;">${order.customer}</strong>,
                    </p>
                    <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                        Siparişiniz başarıyla alınmıştır. Kısa süre içinde hazırlanıp kargoya teslim edilecektir. 
                        Sipariş durumunuzu hesabınızdan takip edebilirsiniz.
                    </p>
                </div>

                <!-- Order Summary Table -->
                <div style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 25px;">
                    <div style="background: #f7fafc; padding: 15px 20px; border-bottom: 2px solid #e2e8f0;">
                        <h3 style="color: #2d3748; font-size: 16px; margin: 0; font-weight: 600;">Sipariş Özeti</h3>
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 15px 20px; border-bottom: 1px solid #f1f5f9; color: #718096; font-size: 14px;">Sipariş No</td>
                            <td style="padding: 15px 20px; border-bottom: 1px solid #f1f5f9; color: #2d3748; font-weight: 600; text-align: right;">${order.orderNo}</td>
                        </tr>
                        <tr>
                            <td style="padding: 15px 20px; border-bottom: 1px solid #f1f5f9; color: #718096; font-size: 14px;">Sipariş Tarihi</td>
                            <td style="padding: 15px 20px; border-bottom: 1px solid #f1f5f9; color: #2d3748; text-align: right;">${order.date}</td>
                        </tr>
                        <tr>
                            <td style="padding: 15px 20px; border-bottom: 1px solid #f1f5f9; color: #718096; font-size: 14px;">Ödeme Yöntemi</td>
                            <td style="padding: 15px 20px; border-bottom: 1px solid #f1f5f9; color: #2d3748; text-align: right;">${order.paymentMethod || 'Kredi Kartı'}</td>
                        </tr>
                        <tr style="background: #fef5e7;">
                            <td style="padding: 15px 20px; color: #2d3748; font-size: 16px; font-weight: 700;">Toplam Tutar</td>
                            <td style="padding: 15px 20px; color: #d97706; font-size: 20px; font-weight: 700; text-align: right;">${order.amount.toLocaleString('tr-TR')} TL</td>
                        </tr>
                    </table>
                </div>

                <!-- Order Items -->
                <div style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background: #f7fafc; padding: 15px 20px; border-bottom: 2px solid #e2e8f0;">
                        <h3 style="color: #2d3748; font-size: 16px; margin: 0; font-weight: 600;">Sipariş Detayları</h3>
                    </div>
                    <div style="padding: 10px;">
                        ${order.items.map((item, index) => `
                            <div style="padding: 15px; border-bottom: ${index < order.items.length - 1 ? '1px solid #f1f5f9' : 'none'}; display: flex; justify-content: space-between; align-items: center;">
                                <div style="flex: 1;">
                                    <div style="color: #2d3748; font-weight: 600; font-size: 14px; margin-bottom: 4px;">${item.name}</div>
                                    <div style="color: #718096; font-size: 12px;">Adet: ${item.quantity}</div>
                                </div>
                                <div style="color: #2d3748; font-weight: 600; font-size: 15px; text-align: right;">
                                    ${(item.price * item.quantity).toLocaleString('tr-TR')} TL
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 30px 0 20px;">
                    <a href="${process.env.BASE_URL || 'https://dorteltedarik.com'}/hesabim?tab=orders" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: white; padding: 14px 35px; text-decoration: none; border-radius: 50px; 
                              font-weight: 600; font-size: 15px; box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);">
                        📦 Siparişlerimi Görüntüle
                    </a>
                </div>

                <!-- Help Section -->
                <div style="background: #edf2f7; padding: 20px; border-radius: 10px; text-align: center;">
                    <p style="color: #4a5568; font-size: 13px; margin: 0 0 8px 0;">
                        <strong>Yardıma mı ihtiyacınız var?</strong>
                    </p>
                    <p style="color: #718096; font-size: 12px; margin: 0;">
                        Destek ekibimiz size yardımcı olmaktan mutluluk duyacaktır.
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #f7fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="color: #718096; font-size: 11px; margin: 0 0 5px 0;">
                    © ${new Date().getFullYear()} Dörtel Tedarik. Tüm hakları saklıdır.
                </p>
                <p style="color: #a0aec0; font-size: 10px; margin: 0;">
                    Bu e-posta ${order.email} adresine gönderilmiştir.
                </p>
            </div>
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
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #f8f9fa; padding: 30px 15px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
            
            <!-- Alert Banner -->
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 35px 30px; text-align: center;">
                <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <div style="font-size: 48px;">🛒</div>
                </div>
                <h1 style="color: white; font-size: 28px; margin: 0 0 10px 0; font-weight: 700;">
                    Yeni Sipariş Alındı!
                </h1>
                <p style="color: rgba(255,255,255,0.95); font-size: 15px; margin: 0;">
                    Sipariş No: <strong>${order.orderNo}</strong>
                </p>
            </div>

            <!-- Order Summary -->
            <div style="padding: 30px;">
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
                    <h2 style="color: #92400e; font-size: 18px; margin: 0 0 15px 0;">
                        💰 Sipariş Tutarı
                    </h2>
                    <div style="color: #78350f; font-size: 32px; font-weight: 700;">
                        ${order.amount?.toLocaleString('tr-TR') || '0'} TL
                    </div>
                </div>

                <!-- Customer Info -->
                <div style="background: #f7fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                    <h3 style="color: #2d3748; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">👤 Müşteri Bilgileri</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #718096; font-size: 14px; width: 30%;">Ad Soyad:</td>
                            <td style="padding: 8px 0; color: #2d3748; font-weight: 600;">${order.customer || 'Belirtilmemiş'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #718096; font-size: 14px;">E-posta:</td>
                            <td style="padding: 8px 0; color: #2d3748;">${order.email || '-'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #718096; font-size: 14px;">Telefon:</td>
                            <td style="padding: 8px 0; color: #2d3748;">${order.phone || '-'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #718096; font-size: 14px; vertical-align: top;">Adres:</td>
                            <td style="padding: 8px 0; color: #2d3748; line-height: 1.5;">${order.address || '-'}</td>
                        </tr>
                    </table>
                </div>

                <!-- Order Details -->
                <div style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 25px;">
                    <div style="background: #f7fafc; padding: 15px 20px; border-bottom: 2px solid #e2e8f0;">
                        <h3 style="color: #2d3748; font-size: 16px; margin: 0; font-weight: 600;">📦 Sipariş Detayları</h3>
                    </div>
                    <div style="padding: 15px 20px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #718096; font-size: 14px;">Sipariş Tarihi:</td>
                                <td style="padding: 8px 0; color: #2d3748; text-align: right; font-weight: 600;">${order.date || new Date().toLocaleDateString('tr-TR')}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #718096; font-size: 14px;">Ödeme Yöntemi:</td>
                                <td style="padding: 8px 0; color: #2d3748; text-align: right;">${order.paymentType || 'Belirtilmemiş'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #718096; font-size: 14px;">Ürün Sayısı:</td>
                                <td style="padding: 8px 0; color: #2d3748; text-align: right;">${order.items?.length || 0} adet</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- Products List -->
                ${order.items && order.items.length > 0 ? `
                <div style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 25px;">
                    <div style="background: #f7fafc; padding: 15px 20px; border-bottom: 2px solid #e2e8f0;">
                        <h3 style="color: #2d3748; font-size: 16px; margin: 0; font-weight: 600;">📋 Sipariş Edilen Ürünler</h3>
                    </div>
                    <div style="padding: 10px;">
                        ${order.items.map((item, index) => `
                            <div style="padding: 12px; border-bottom: ${index < order.items.length - 1 ? '1px solid #f1f5f9' : 'none'}; display: flex; justify-content: space-between; align-items: center;">
                                <div style="flex: 1;">
                                    <div style="color: #2d3748; font-weight: 600; font-size: 14px; margin-bottom: 4px;">${item.name}</div>
                                    <div style="color: #718096; font-size: 12px;">${item.quantity} adet × ${item.price?.toLocaleString('tr-TR')} TL</div>
                                </div>
                                <div style="color: #2d3748; font-weight: 600; font-size: 15px;">
                                    ${((item.price || 0) * (item.quantity || 0)).toLocaleString('tr-TR')} TL
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Action Buttons -->
                <div style="text-align: center; margin: 30px 0 20px;">
                    <a href="${process.env.BASE_URL || 'https://dorteltedarik.com'}/admin/orders" 
                       style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
                              color: white; padding: 14px 35px; text-decoration: none; border-radius: 50px; 
                              font-weight: 600; font-size: 15px; box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);">
                        🔧 Admin Paneline Git
                    </a>
                </div>

                <!-- Quick Actions -->
                <div style="background: #edf2f7; padding: 20px; border-radius: 10px; text-align: center;">
                    <p style="color: #4a5568; font-size: 13px; margin: 0 0 10px 0;">
                        <strong>Hızlı İşlemler</strong>
                    </p>
                    <p style="color: #718096; font-size: 12px; margin: 0; line-height: 1.5;">
                        Sipariş durumunu güncellemek ve müşteriyi bilgilendirmek için admin paneline giriş yapın.
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #f7fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="color: #718096; font-size: 11px; margin: 0 0 5px 0;">
                    © ${new Date().getFullYear()} Dörtel Tedarik Admin Panel
                </p>
                <p style="color: #a0aec0; font-size: 10px; margin: 0;">
                    Bu e-posta otomatik olarak gönderilmiştir.
                </p>
            </div>
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

const getPriceAlertTemplate = (data) => `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 20px;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <!-- Header Banner -->
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
                <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <div style="font-size: 48px;">🔔</div>
                </div>
                <h1 style="color: white; font-size: 32px; margin: 0 0 10px 0; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    ${data.title || 'Özel Fiyat Bildirimi'}
                </h1>
                <p style="color: rgba(255,255,255,0.95); font-size: 16px; margin: 0;">
                    Dörtel Tedarik'ten Sizin İçin Özel Fırsatlar
                </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
                    <h2 style="color: #92400e; font-size: 24px; margin: 0 0 15px 0;">
                        Merhaba <span style="color: #d97706;">${data.userName || 'Değerli Müşterimiz'}</span>! 👋
                    </h2>
                    <div style="color: #78350f; line-height: 1.8; margin: 0; font-size: 15px; white-space: pre-wrap;">
${data.content || 'Takip ettiğiniz ürünlerde özel indirimler başladı!'}
                    </div>
                </div>

                <!-- Features Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0;">
                    <div style="background: #f7fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #48bb78;">
                        <div style="font-size: 24px; margin-bottom: 8px;">🚚</div>
                        <div style="font-weight: 600; color: #2d3748; font-size: 14px; margin-bottom: 4px;">Hızlı Teslimat</div>
                        <div style="color: #718096; font-size: 12px;">Aynı gün kargo seçeneği</div>
                    </div>
                    
                    <div style="background: #f7fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #4299e1;">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="font-weight: 600; color: #2d3748; font-size: 14px; margin-bottom: 4px;">Özel İndirimler</div>
                        <div style="color: #718096; font-size: 12px;">Sizin için hazırlandı</div>
                    </div>
                    
                    <div style="background: #f7fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #ed8936;">
                        <div style="font-size: 24px; margin-bottom: 8px;">📦</div>
                        <div style="font-weight: 600; color: #2d3748; font-size: 14px; margin-bottom: 4px;">Geniş Ürün Yelpazesi</div>
                        <div style="color: #718096; font-size: 12px;">Binlerce ürün seçeneği</div>
                    </div>
                    
                    <div style="background: #f7fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #9f7aea;">
                        <div style="font-size: 24px; margin-bottom: 8px;">🎯</div>
                        <div style="font-weight: 600; color: #2d3748; font-size: 14px; margin-bottom: 4px;">Kolay İade</div>
                        <div style="color: #718096; font-size: 12px;">14 gün iade garantisi</div>
                    </div>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 35px 0 25px 0;">
                    <a href="${process.env.BASE_URL || 'https://dorteltedarik.com'}/hesabim?tab=alerts" 
                       style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
                              color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; 
                              font-weight: 700; font-size: 16px; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.4);
                              transition: transform 0.2s;">
                        🛒 Fırsatları İncele
                    </a>
                </div>

                <div style="background: #edf2f7; padding: 20px; border-radius: 10px; text-align: center;">
                    <p style="color: #4a5568; font-size: 13px; margin: 0; line-height: 1.5;">
                        💡 <strong>İpucu:</strong> Favori ürünlerinizi takip ederek fiyat değişikliklerinden anında haberdar olun!
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #f7fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 12px; text-align: center; margin: 0 0 10px 0;">
                    Bu e-posta fiyat takip listeniz için gönderilmiştir
                </p>
                <p style="color: #a0aec0; font-size: 11px; text-align: center; margin: 0;">
                    © ${new Date().getFullYear()} Dörtel Tedarik. Tüm hakları saklıdır.
                </p>
            </div>
        </div>
    </div>
`;

// ----------------------------------------------------------------------
// Routes
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// Location Routes
// ----------------------------------------------------------------------

app.get('/api/location/cities', (req, res) => {
    if (mernisData) {
        // Use new Mernis data if available
        const cities = Object.values(mernisData).map(c => c.province).sort((a, b) => a.localeCompare(b, 'tr'));
        return res.json(cities);
    }
    // Fallback to old data
    if (!turkeyData) return res.json([]);
    const cities = turkeyData.map(c => c.name).sort();
    res.json(cities);
});

app.get('/api/location/districts', (req, res) => {
    const { city } = req.query;
    if (!city) return res.json([]);

    if (mernisData) {
        // Find city in Mernis data
        const cityEntry = Object.values(mernisData).find(c => c.province === city);
        if (cityEntry) {
            const districts = cityEntry.districts.map(d => d.name).sort((a, b) => a.localeCompare(b, 'tr'));
            return res.json(districts);
        }
    }

    // Fallback
    if (!turkeyData) return res.json([]);
    const cityData = turkeyData.find(c => c.name === city);
    if (!cityData) return res.json([]);
    // In this JSON, 'counties' maps to Districts (İlçe)
    const districts = cityData.counties.map(c => c.name).sort();
    res.json(districts);
});

app.get('/api/location/neighborhoods', (req, res) => {
    const { city, district } = req.query;
    if (!turkeyData || !city || !district) return res.json([]);

    const cityData = turkeyData.find(c => c.name === city);
    if (!cityData) return res.json([]);

    const countyData = cityData.counties.find(d => d.name === district);
    if (!countyData) return res.json([]);

    // Collect neighborhoods from all sub-districts (semts/bucaks)
    let allNeighborhoods = [];
    if (countyData.districts) {
        countyData.districts.forEach(subDistrict => {
            if (subDistrict.neighborhoods) {
                allNeighborhoods.push(...subDistrict.neighborhoods.map(n => n.name));
            }
        });
    }

    // Unique and sort
    allNeighborhoods = [...new Set(allNeighborhoods)].sort();
    res.json(allNeighborhoods);
});

// 1. Send Email
app.post('/api/send-email', async (req, res) => {
    try {
        const { type, to, data } = req.body;
        const cleanType = type?.trim();

        console.log('📬 [EMAIL DEBUG] Full Request Body:', JSON.stringify(req.body, null, 2));

        if (!to || !cleanType) {
            console.error('❌ [EMAIL ERROR] Missing parameters:', { to: !!to, type: !!cleanType });
            return res.status(400).json({
                success: false,
                message: 'E-posta adresi veya gönderim tipi eksik.',
                received: { to, type: cleanType }
            });
        }

        let subject = '';
        let html = '';

        switch (cleanType) {
            case 'welcome':
                subject = 'Dörtel Tedarik\'e Hoş Geldiniz';
                html = getWelcomeTemplate(data?.name);
                break;
            case 'order-new':
                subject = `Sipariş Alındı: ${data?.orderNo}`;
                html = getOrderReceivedTemplate(data);
                break;
            case 'order-status':
                subject = `Sipariş Durumu Güncellemesi: ${data?.orderNo}`;
                html = getOrderStatusTemplate(data);
                break;
            case 'admin-alert':
                subject = `Yeni Sipariş: ${data?.orderNo} - ${data?.amount} TL`;
                html = getAdminNotificationTemplate(data);
                break;
            case 'price-alert':
                subject = data?.title || 'Özel Fiyat Bildirimi - Dörtel Tedarik';
                html = getPriceAlertTemplate(data);
                break;
            default:
                console.error('❌ Invalid email type:', cleanType);
                return res.status(400).json({
                    success: false,
                    message: `Invalid email type: ${cleanType}`
                });
        }

        /* 
           NOTE: If using free Resend account, you can only send to verified email.
           Ideally 'to' should be dynamic. 
        */

        if (!process.env.RESEND_API_KEY) {
            console.log('📢 [MOCK EMAIL] No API Key, simulated success:', { to, subject });
            return res.json({ success: true, message: 'Mock email sent (No API Key)' });
        }

        const response = await resend.emails.send({
            from: 'Dörtel Tedarik <siparis@dorteltedarik.com>',
            to: Array.isArray(to) ? to : [to],
            subject: subject,
            html: html,
        });

        if (response.error) {
            console.error('❌ [RESEND ERROR]:', response.error);
            return res.status(400).json({ success: false, error: response.error });
        }

        console.log('✅ [EMAIL SUCCESS] Resend Response:', response);
        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Email Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 1.1 List Users (Endpoint moved and refactored below at line 1343)

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


// Notification Settings
// Get notification settings
app.get('/api/notification-settings', async (req, res) => {
    try {
        const db = await connectDB();
        if (!db) return res.status(500).json({ error: 'Database connection failed' });

        const settings = await db.collection('notificationSettings').findOne({});

        if (settings) {
            res.json({ success: true, data: settings });
        } else {
            // Return empty settings
            res.json({ success: true, data: { adminEmails: [] } });
        }
    } catch (error) {
        console.error('Get notification settings error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Save notification settings
app.post('/api/notification-settings', async (req, res) => {
    try {
        const { adminEmails } = req.body;
        const db = await connectDB();
        if (!db) return res.status(500).json({ error: 'Database connection failed' });

        // Upsert (update or insert)
        const result = await db.collection('notificationSettings').updateOne(
            {}, // Match any document (we only have one settings doc)
            {
                $set: {
                    adminEmails: adminEmails || [],
                    updatedAt: new Date()
                }
            },
            { upsert: true } // Create if doesn't exist
        );

        console.log('✅ Notification settings saved to MongoDB:', adminEmails);

        res.json({ success: true, message: 'Settings saved successfully' });
    } catch (error) {
        console.error('Save notification settings error:', error);
        res.status(500).json({ error: error.message });
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

        // Send welcome email
        try {
            if (process.env.RESEND_API_KEY) {
                await resend.emails.send({
                    from: 'Dörtel Tedarik <info@dorteltedarik.com>',
                    to: email,
                    subject: 'Aramıza Hoş Geldiniz! 🎉',
                    html: getWelcomeTemplate(name),
                });
                console.log('Welcome email sent to:', email);
            }
        } catch (emailError) {
            // Don't fail registration if email fails
            console.error('Welcome email error:', emailError);
        }

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

// PASSWORD RESET ROUTES (JWT BASED)
// 1. Forgot Password Request
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { contactMethod, value } = req.body;
        const db = await connectDB();

        // Find user
        let user;
        if (contactMethod === 'email') {
            user = await db.collection('users').findOne({ email: value.toLowerCase() });
        } else {
            user = await db.collection('users').findOne({ phone: value });
        }

        if (!user) {
            // Return success even if user not found (security)
            console.log('Forgot password: User not found for', value);
            return res.status(200).json({ success: true, message: 'If user exists, reset link sent.' });
        }

        // Generate JWT Reset Token (valid for 24h)
        const resetToken = jwt.sign(
            { userId: user._id, type: 'reset' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send Email
        const resetLink = `${process.env.BASE_URL || 'https://dorteltedarik.com'}/sifre-sifirla/${resetToken}`;

        console.log(`🔐 Reset Link for ${user.email}: ${resetLink}`);

        if (contactMethod === 'email' && process.env.RESEND_API_KEY) {
            await resend.emails.send({
                from: 'Dörtel Tedarik <info@dorteltedarik.com>',
                to: user.email,
                subject: 'Şifre Sıfırlama Talebi 🔐',
                html: getResetPasswordTemplate(resetLink)
            });
            console.log('✅ Reset email sent to', user.email);
        }

        res.json({ success: true, message: 'Reset link sent' });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ error: 'İşlem başarısız' });
    }
});

// 2. Validate Token
app.get('/api/auth/validate-reset-token/:token', async (req, res) => {
    try {
        const { token } = req.params;

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            if (decoded.type !== 'reset') throw new Error('Invalid token type');

            // Check if user still exists
            const db = await connectDB();
            const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
            if (!user) throw new Error('User not found');

            res.json({ valid: true });
        } catch (err) {
            return res.status(400).json({ valid: false, error: 'Geçersiz veya süresi dolmuş bağlantı' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            if (decoded.type !== 'reset') throw new Error('Invalid token type');

            const db = await connectDB();

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update user password
            await db.collection('users').updateOne(
                { _id: new ObjectId(decoded.userId) },
                {
                    $set: {
                        password: hashedPassword,
                        lastLogin: new Date() // Optional: force re-login check or just update date
                    }
                }
            );

            console.log('✅ Password reset successful for user:', decoded.userId);
            res.json({ success: true, message: 'Şifre başarıyla güncellendi' });

        } catch (err) {
            return res.status(400).json({ success: false, error: 'Geçersiz veya süresi dolmuş bağlantı' });
        }
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ error: 'İşlem başarısız' });
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

// GET ALL USERS (ADMIN)
app.get('/api/users', async (req, res) => {
    try {
        // Ideally checking for admin role here from JWT token
        const db = await connectDB();
        if (!db) return res.status(500).json({ error: 'Database connection failed' });

        const users = await db.collection('users').find({}).toArray();
        // Remove passwords before sending to frontend
        const safeUsers = users.map(u => {
            const { password, ...safeUser } = u;
            return {
                ...safeUser,
                id: u._id,
                username: u.username || u.email.split('@')[0], // Fallback if username missing
                status: u.status || 'active',
                registerDate: u.createdAt || u.registerDate || new Date().toISOString()
            };
        });

        res.json({ success: true, data: safeUsers });
    } catch (error) {
        console.error('Fetch Users Error:', error);
        res.status(500).json({ error: 'Kullanıcılar getirilemedi: ' + error.message });
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
                    // Load admin emails from notification settings
                    let adminEmails = [];

                    console.log('🔍 Loading admin emails for notification...');

                    // Try MongoDB first (works on Vercel)
                    try {
                        const db = database || await connectDB();
                        if (db) {
                            // Check notificationSettings collection
                            const settingsDoc = await db.collection('notificationSettings').findOne({});
                            console.log('📊 NotificationSettings from MongoDB:', settingsDoc);

                            if (settingsDoc && Array.isArray(settingsDoc.adminEmails)) {
                                adminEmails.push(...settingsDoc.adminEmails);
                                console.log('✅ Loaded from notificationSettings collection:', adminEmails);
                            }

                            // Also check settings collection with key
                            if (adminEmails.length === 0) {
                                const settingsDoc2 = await db.collection('settings').findOne({ key: 'notificationSettings' });
                                if (settingsDoc2?.data?.adminEmails && Array.isArray(settingsDoc2.data.adminEmails)) {
                                    adminEmails.push(...settingsDoc2.data.adminEmails);
                                    console.log('✅ Loaded from settings collection:', adminEmails);
                                }
                            }
                        }
                    } catch (err) {
                        console.error('❌ Failed to load notification settings from MongoDB:', err);
                    }

                    // Try JSON file (works on localhost)
                    if (adminEmails.length === 0 && process.env.VERCEL !== '1') {
                        try {
                            const settingsPath = path.join(DATA_DIR, 'notificationSettings.json');
                            if (fs.existsSync(settingsPath)) {
                                const fileData = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
                                if (Array.isArray(fileData.adminEmails)) {
                                    adminEmails.push(...fileData.adminEmails);
                                    console.log('✅ Loaded from JSON file:', adminEmails);
                                }
                            }
                        } catch (err) {
                            console.log('⚠️ Could not load notification settings from file:', err.message);
                        }
                    }

                    // Fallback to default
                    if (adminEmails.length === 0) {
                        const envEmail = process.env.ADMIN_EMAIL || 'info@dorteltedarik.com';
                        adminEmails = [envEmail];
                        console.log('⚠️ Using fallback admin email:', envEmail);
                    }

                    // Remove duplicates and empty values
                    adminEmails = [...new Set(adminEmails.filter(email => email && email.includes('@')))];

                    console.log('📧 Final admin emails for notification:', adminEmails);

                    if (adminEmails.length > 0) {
                        await resend.emails.send({
                            from: 'Dörtel Tedarik <siparis@dorteltedarik.com>',
                            to: adminEmails,
                            subject: `🛒 Yeni Sipariş: ${order.orderNo} - ${order.amount?.toLocaleString('tr-TR')} TL`,
                            html: getAdminNotificationTemplate(order)
                        });
                        console.log(`✅ Admin email sent successfully to: ${adminEmails.join(', ')}`);
                    }
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

app.get('/api/orders/track', async (req, res) => {
    try {
        const { orderNo } = req.query;
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
            amount: order.amount || order.total,
            productCount: (order.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0),
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

        // Callbacks - Intelligent Base URL Detection
        // Priority: BASE_URL (explicit) > VERCEL_URL (auto) > localhost (dev)
        const getBaseUrl = () => {
            // 1. Explicit BASE_URL (set in Vercel env vars)
            if (process.env.BASE_URL) {
                console.log('💳 PayTR using BASE_URL:', process.env.BASE_URL);
                return process.env.BASE_URL;
            }

            // 2. Vercel automatic URL (always available in Vercel deployments)
            if (process.env.VERCEL_URL) {
                const url = `https://${process.env.VERCEL_URL}`;
                console.log('💳 PayTR using VERCEL_URL:', url);
                return url;
            }

            // 3. Local development fallback
            console.log('💳 PayTR using localhost (development mode)');
            return 'http://localhost:5173';
        };

        const baseUrl = getBaseUrl();
        const merchant_ok_url = `${baseUrl}/siparis-basarili`;
        const merchant_fail_url = `${baseUrl}/odeme?error=payment_failed`;

        console.log('💳 PayTR Callback URLs:', { merchant_ok_url, merchant_fail_url });

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


// -----------------------------------------------------------------------
// PayTR Direct API Endpoints (Site İçi Ödeme - iFrame Yok)
// -----------------------------------------------------------------------

// Helper: Load PayTR Credentials
async function getPayTRCredentials() {
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
        console.error('PayTR credential read error:', e);
    }
    return { merchant_id, merchant_key, merchant_salt };
}

// Helper: Get User IP from request
function getUserIp(req) {
    let user_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (Array.isArray(user_ip)) user_ip = user_ip[0];
    if (user_ip.includes(',')) user_ip = user_ip.split(',')[0].trim();
    if (user_ip === '::1') user_ip = '127.0.0.1';
    return user_ip;
}

// Helper: Determine base URL
function getBaseUrl() {
    if (process.env.BASE_URL) return process.env.BASE_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'http://localhost:5173';
}

// 5. PayTR Direct API - Step 1 (Direkt Kredi Kartı Ödeme)
app.post('/api/paytr/direct', async (req, res) => {
    try {
        const {
            merchant_oid, email, payment_amount, user_basket,
            user_name, user_address, user_phone,
            cc_owner, card_number, expiry_month, expiry_year, cvv,
            installment_count = '0', card_type = ''
        } = req.body;

        const { merchant_id, merchant_key, merchant_salt } = await getPayTRCredentials();
        if (!merchant_id || !merchant_key || !merchant_salt) {
            return res.status(500).json({ status: 'failed', reason: 'PayTR kimlik bilgileri eksik. Admin panelinden kontrol edin.' });
        }

        const user_ip = getUserIp(req);
        const currency = 'TL';
        const test_mode = '0'; // Canlı mod
        const non_3d = '0'; // 3D Secure aktif
        const payment_type = 'card';
        const no_installment = '0';
        const max_installment = '0';
        const debug_on = '1';
        const timeout_limit = '30';

        const baseUrl = getBaseUrl();
        // Since PayTR might POST to these URLs, we point them to our backend, which will then redirect natively to the frontend.
        const apiUrl = baseUrl.replace('5173', '3001').replace('5174', '3001').replace('5175', '3001');
        const merchant_ok_url = `${apiUrl}/api/paytr/success`;
        const merchant_fail_url = `${apiUrl}/api/paytr/fail`;
        const merchant_notification_url = `${apiUrl}/api/paytr/callback`;

        // Base64 encode the basket (Required by PayTR)
        const user_basket_json = JSON.stringify(user_basket);
        const user_basket_base64 = Buffer.from(user_basket_json).toString('base64');

        // IF this is a guest checkout, we store the registration data in a pending collection
        const { guestUserData, orderFullData } = req.body;
        if (guestUserData || orderFullData) {
            const db = await connectDB();
            if (db) {
                await db.collection('pending_orders').updateOne(
                    { merchant_oid: merchant_oid },
                    {
                        $set: {
                            merchant_oid,
                            guestUserData,
                            orderFullData,
                            createdAt: new Date()
                        }
                    },
                    { upsert: true }
                );
            }
        }

        // PayTR Direct API Hash
        // ADIM 1 imzası: merchant_id + user_ip + merchant_oid + email + payment_amount + payment_type + installment_count + currency + test_mode + non_3d
        const hash_str = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${payment_type}${installment_count}${currency}${test_mode}${non_3d}`;
        const paytr_token = crypto.createHmac('sha256', merchant_key)
            .update(hash_str + merchant_salt)
            .digest('base64');

        const params = new URLSearchParams();
        params.append('merchant_id', merchant_id);
        params.append('user_ip', user_ip);
        params.append('merchant_oid', merchant_oid);
        params.append('email', email);
        params.append('payment_amount', payment_amount);
        params.append('paytr_token', paytr_token);
        params.append('user_basket', user_basket_base64);
        params.append('debug_on', debug_on);
        params.append('no_installment', no_installment);
        params.append('max_installment', max_installment);
        params.append('user_name', user_name);
        params.append('user_address', user_address);
        params.append('user_phone', user_phone);
        params.append('merchant_ok_url', merchant_ok_url);
        params.append('merchant_fail_url', merchant_fail_url);
        params.append('merchant_notification_url', merchant_notification_url);
        params.append('timeout_limit', timeout_limit);
        params.append('currency', currency);
        params.append('test_mode', test_mode);
        params.append('payment_type', payment_type);
        params.append('installment_count', installment_count);
        params.append('non_3d', non_3d);
        params.append('card_type', card_type);
        // Card Details
        params.append('cc_owner', cc_owner);
        params.append('card_number', card_number.replace(/\s/g, ''));
        params.append('expiry_month', expiry_month);
        params.append('expiry_year', expiry_year);
        params.append('cvv', cvv);

        console.log('💳 PayTR Direct API isteği gönderiliyor:', { merchant_oid, email, payment_amount });

        const response = await fetch('https://www.paytr.com/odeme', {
            method: 'POST',
            body: params,
            redirect: 'manual' // 3D Secure yönlendirmesini yakala
        });

        // PayTR Direct API genellikle JSON veya HTML döner
        // 3D Secure durumunda bir yönlendirme URL'si veya HTML form döner
        const contentType = response.headers.get('content-type') || '';

        if (response.status === 302 || response.status === 301) {
            // 3D Yönlendirme
            const redirectUrl = response.headers.get('location');
            return res.json({ status: '3d_redirect', redirect_url: redirectUrl });
        }

        if (contentType.includes('application/json')) {
            const result = await response.json();
            console.log('💳 PayTR Direct API yanıtı:', result);

            if (result.status === 'success') {
                return res.json({ status: 'success', result });
            } else if (result.status === '3d') {
                return res.json({ status: '3d_redirect', redirect_url: result.url || result.redirect_url, html: result.html });
            } else {
                return res.status(400).json({ status: 'failed', reason: result.reason || result.error || 'Ödeme reddedildi.' });
            }
        } else {
            // HTML 3D Secure formu veya Hata mesajı
            const html = await response.text();
            if (html.includes('<form') || html.includes('form')) {
                return res.json({ status: '3d_form', html });
            }
            console.error('PayTR Beklenmeyen HTML Yanıtı:', html.substring(0, 1000));
            // Let's try to extract any plain text error from PayTR if it's not a form
            let errorMessage = 'Beklenmeyen yanıt formatı.';
            if (html.length > 0 && html.length < 500 && !html.includes('<html')) {
                errorMessage = html; // Sometimes PayTR just returns "Hash failed" or simple text strings
            }
            return res.status(400).json({ status: 'failed', reason: errorMessage, raw_html: html.substring(0, 200) });
        }

    } catch (error) {
        console.error('PayTR Direct API Hatası:', error);
        res.status(500).json({ status: 'failed', reason: error.message });
    }
});

// PayTR 3D Secure Success/Fail Redirect Handlers
// PayTR often POSTs to these URLs returning the user to the site. We need to catch POST and redirect as GET.
app.all('/api/paytr/success', (req, res) => {
    const baseUrl = getBaseUrl();
    res.redirect(`${baseUrl}/siparis-basarili`);
});

app.all('/api/paytr/fail', (req, res) => {
    const baseUrl = getBaseUrl();
    res.redirect(`${baseUrl}/odeme?error=payment_failed`);
});

// 6. PayTR EFT/Havale API - Step 1
app.post('/api/paytr/eft', async (req, res) => {
    try {
        const {
            merchant_oid, email, payment_amount, user_basket,
            user_name, user_address, user_phone
        } = req.body;

        const { merchant_id, merchant_key, merchant_salt } = await getPayTRCredentials();
        if (!merchant_id || !merchant_key || !merchant_salt) {
            return res.status(500).json({ status: 'failed', reason: 'PayTR kimlik bilgileri eksik.' });
        }

        const user_ip = getUserIp(req);
        const currency = 'TL';
        const test_mode = '0'; // Canlı mod
        const debug_on = '1';
        const timeout_limit = '30';

        const baseUrl = getBaseUrl();
        // Since PayTR might POST to these URLs, we point them to our backend, which will then redirect natively to the frontend.
        const apiUrl = baseUrl.replace('5173', '3001').replace('5174', '3001').replace('5175', '3001');
        const merchant_ok_url = `${apiUrl}/api/paytr/success`;
        const merchant_fail_url = `${apiUrl}/api/paytr/fail`;
        const merchant_notification_url = `${apiUrl}/api/paytr/callback`;

        // IF this is a guest checkout, we store the registration data in a pending collection
        const { guestUserData, orderFullData } = req.body;
        if (guestUserData || orderFullData) {
            const db = await connectDB();
            if (db) {
                await db.collection('pending_orders').updateOne(
                    { merchant_oid: merchant_oid },
                    {
                        $set: {
                            merchant_oid,
                            guestUserData,
                            orderFullData,
                            createdAt: new Date()
                        }
                    },
                    { upsert: true }
                );
            }
        }

        // EFT iframe için hash: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + currency + test_mode
        const user_basket_json = JSON.stringify(user_basket);
        const user_basket_base64 = Buffer.from(user_basket_json).toString('base64');

        const hash_str = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket_json}${currency}${test_mode}`;
        const paytr_token = crypto.createHmac('sha256', merchant_key)
            .update(hash_str + merchant_salt)
            .digest('base64');

        const params = new URLSearchParams();
        params.append('merchant_id', merchant_id);
        params.append('user_ip', user_ip);
        params.append('merchant_oid', merchant_oid);
        params.append('email', email);
        params.append('payment_amount', payment_amount);
        params.append('paytr_token', paytr_token);
        params.append('user_basket', user_basket_base64);
        params.append('user_phone', user_phone);
        params.append('merchant_ok_url', merchant_ok_url);
        params.append('merchant_fail_url', merchant_fail_url);
        params.append('merchant_notification_url', merchant_notification_url);
        params.append('timeout_limit', timeout_limit);
        params.append('currency', currency);
        params.append('test_mode', test_mode);

        console.log('🏦 PayTR EFT API isteği gönderiliyor:', { merchant_oid, email, payment_amount });

        const response = await fetch('https://www.paytr.com/odeme/havale/api/get-token', {
            method: 'POST',
            body: params
        });

        const result = await response.json();
        console.log('🏦 PayTR EFT API yanıtı:', result);

        if (result.status === 'success') {
            res.json({ status: 'success', token: result.token });
        } else {
            console.error('PayTR EFT Hatası:', result);
            res.status(400).json({ status: 'failed', reason: result.reason || 'EFT başlatılamadı.' });
        }

    } catch (error) {
        console.error('PayTR EFT API Hatası:', error);
        res.status(500).json({ status: 'failed', reason: error.message });
    }
});

// 7. PayTR Callback / Bildirim URL (Step 2 - PayTR'den gelen bildirim)
app.post('/api/paytr/callback', express.urlencoded({ extended: false }), async (req, res) => {
    try {
        const post = req.body;
        console.log('📩 PayTR Callback alındı:', post);

        const { merchant_id, merchant_key, merchant_salt } = await getPayTRCredentials();
        if (!merchant_id || !merchant_key || !merchant_salt) {
            console.error('PayTR callback: kimlik bilgileri eksik');
            return res.send('OK');
        }

        // Hash doğrulaması
        const { hash, merchant_oid, status, total_amount } = post;

        // Doğrulama: merchant_oid + merchant_salt + status + total_amount
        const hash_str = `${merchant_oid}${merchant_salt}${status}${total_amount}`;
        const calculated_hash = crypto.createHmac('sha256', merchant_key)
            .update(hash_str)
            .digest('base64');

        if (calculated_hash !== hash) {
            console.error('❌ PayTR callback hash doğrulaması başarısız!', { calculated_hash, received: hash });
            return res.send('PAYTR notification failed: bad hash');
        }

        console.log('✅ PayTR callback hash doğrulandı');

        const database = await connectDB();
        if (!database) {
            return res.send('OK');
        }

        if (status === 'success') {
            const pendingOrder = await database.collection('pending_orders').findOne({ merchant_oid: merchant_oid });

            if (pendingOrder && !pendingOrder.processed) {
                console.log('📦 Pending order bulundu, üyelik ve sipariş oluşturuluyor...');

                let finalUserId = pendingOrder.orderFullData?.userId;

                // 1. Ziyaretçi ise Üyelik Aç (Eğer henüz yoksa)
                if (pendingOrder.guestUserData) {
                    const guest = pendingOrder.guestUserData;
                    const existingUser = await database.collection('users').findOne({ email: guest.email });

                    if (!existingUser) {
                        const hashedPassword = await bcrypt.hash(guest.password, 10);
                        const newUser = {
                            id: Date.now(),
                            name: guest.name,
                            email: guest.email,
                            password: hashedPassword,
                            phone: guest.phone,
                            city: guest.city,
                            district: guest.district,
                            zipCode: guest.zipCode,
                            addresses: [{
                                title: 'Ev',
                                content: guest.address,
                                city: guest.city,
                                district: guest.district,
                                phone: guest.phone
                            }],
                            role: 'user',
                            createdAt: new Date().toISOString()
                        };
                        await database.collection('users').insertOne(newUser);
                        finalUserId = newUser.id;
                        console.log('👤 Yeni kullanıcı oluşturuldu:', guest.email);
                    } else {
                        finalUserId = existingUser.id;
                    }
                }

                // 2. Gerçek Siparişi Oluştur
                if (pendingOrder.orderFullData) {
                    const finalOrder = {
                        ...pendingOrder.orderFullData,
                        userId: finalUserId,
                        status: 'processing',
                        paymentStatus: 'paid',
                        paymentReference: post.payment_id || merchant_oid,
                        paidAt: new Date().toISOString(),
                        paytrData: post,
                        createdAt: new Date()
                    };
                    delete finalOrder._id; // MongoDB ID'sini temizle

                    // Önce mevcut sipariş var mı bak (tekilleştirme)
                    const existingOrder = await database.collection('orders').findOne({ orderNo: merchant_oid });
                    if (!existingOrder) {
                        await database.collection('orders').insertOne(finalOrder);
                        console.log('✅ Gerçek sipariş oluşturuldu:', merchant_oid);
                    }
                }

                // 3. Mark as processed
                await database.collection('pending_orders').updateOne(
                    { merchant_oid: merchant_oid },
                    { $set: { processed: true, processedAt: new Date() } }
                );
            } else {
                // Eğer pending order yoksa (eski sistem veya zaten kayıtlı kullanıcı)
                // Siparişi başarılı olarak güncelle
                const updateResult = await database.collection('orders').updateOne(
                    { orderNo: merchant_oid },
                    {
                        $set: {
                            status: 'processing',
                            paymentStatus: 'paid',
                            paymentReference: post.payment_id || merchant_oid,
                            paidAt: new Date().toISOString(),
                            paytrData: post
                        }
                    }
                );
                console.log(`✅ Sipariş ${merchant_oid} güncellendi. Result:`, updateResult);
            }
        } else {
            // Başarısız ödeme - siparişi iptal et veya işaretle
            await database.collection('orders').updateOne(
                { orderNo: merchant_oid },
                {
                    $set: {
                        status: 'cancelled',
                        paymentStatus: 'failed',
                        paymentFailReason: post.failed_reason_code || 'PayTR ödeme reddedildi',
                        paytrData: post
                    }
                }
            );
            console.log(`❌ Sipariş ${merchant_oid} ödeme başarısız.`);
        }

        // PayTR her zaman "OK" beklir
        res.send('OK');

    } catch (error) {
        console.error('PayTR Callback Hatası:', error);
        res.send('OK'); // Her zaman OK gönder yoksa PayTR tekrar tekrar dener
    }
});

// ----------------------------------------------------------------------
// Product Management Routes
// ----------------------------------------------------------------------

// GET All Products
app.get('/api/products', async (req, res) => {
    try {
        const database = await connectDB();
        if (!database) return res.status(500).json({ error: 'Database connection failed' });
        const products = await database.collection('products').find({}).toArray();
        res.json({ success: true, data: products });
    } catch (error) {
        console.error('Get Products Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ADD Product
app.post('/api/products', async (req, res) => {
    try {
        const product = req.body;
        const database = await connectDB();
        if (!database) return res.status(500).json({ error: 'Database connection failed' });

        product.createdAt = new Date().toISOString();
        if (!product.id) product.id = Date.now().toString();

        const result = await database.collection('products').insertOne(product);
        res.status(201).json({ success: true, data: { ...product, _id: result.insertedId } });
    } catch (error) {
        console.error('Add Product Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// UPDATE Product
app.put('/api/products', async (req, res) => {
    try {
        const { id, ...updates } = req.body;
        if (!id) return res.status(400).json({ success: false, message: 'ID is required' });

        const database = await connectDB();
        if (!database) return res.status(500).json({ error: 'Database connection failed' });

        const productsCollection = database.collection('products');

        let query;
        try {
            query = { $or: [{ _id: new ObjectId(id) }, { id: id }, { id: parseInt(id) }, { id: id.toString() }] };
        } catch (e) {
            query = { $or: [{ id: id }, { id: parseInt(id) }, { id: id.toString() }] };
        }

        const result = await productsCollection.updateOne(query, { $set: updates });

        if (result.matchedCount > 0) {
            res.json({ success: true, message: 'Product updated' });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        console.error('Update Product Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE Product
app.delete('/api/products', async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const db = await connectDB();
        if (!db) {
            return res.status(500).json({ success: false, message: 'Database connection failed' });
        }

        const productsCollection = db.collection('products');

        // Try to delete by ObjectId first, then by string id
        let result;
        try {
            result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
        } catch (e) {
            // If ObjectId fails, try as string or number
            result = await productsCollection.deleteOne({
                $or: [
                    { id: id },
                    { id: parseInt(id) },
                    { id: id.toString() }
                ]
            });
        }

        if (result.deletedCount > 0) {
            res.json({ success: true, message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        console.error('Delete Product Error:', error);
        res.status(500).json({ success: false, message: error.message });
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
