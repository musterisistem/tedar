const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = 'mongodb+srv://musterisistem_db_user:DELAmPBdqrDHI4k1@dorteltedarik.ysqtiqi.mongodb.net/dortel-db?retryWrites=true&w=majority';

async function migrateData() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ MongoDB bağlantısı başarılı!');

        const db = client.db('dortel-db');

        // 1. Migrate Products
        console.log('\n📦 Ürünler yükleniyor...');
        const productsPath = path.join(__dirname, '../src/data/products.json');
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

        if (products.length > 0) {
            await db.collection('products').deleteMany({}); // Clear existing
            await db.collection('products').insertMany(products);
            console.log(`✅ ${products.length} ürün yüklendi!`);
        }

        // 2. Migrate Product Settings
        console.log('\n⚙️ Ürün ayarları yükleniyor...');
        const settingsPath = path.join(__dirname, '../src/data/productSettings.json');
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

        await db.collection('settings').updateOne(
            { type: 'product-settings' },
            { $set: { ...settings, type: 'product-settings' } },
            { upsert: true }
        );
        console.log('✅ Ürün ayarları yüklendi!');

        // 3. Migrate Categories
        console.log('\n📁 Kategoriler yükleniyor...');
        const categoriesPath = path.join(__dirname, '../src/data/categories.json');
        const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

        if (categories.length > 0) {
            await db.collection('categories').deleteMany({});
            await db.collection('categories').insertMany(categories);
            console.log(`✅ ${categories.length} kategori yüklendi!`);
        }

        // 4. Migrate Orders (if exists)
        console.log('\n📋 Siparişler yükleniyor...');
        const ordersPath = path.join(__dirname, '../src/data/orders.json');
        if (fs.existsSync(ordersPath)) {
            const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
            if (orders.length > 0) {
                await db.collection('orders').deleteMany({});
                await db.collection('orders').insertMany(orders);
                console.log(`✅ ${orders.length} sipariş yüklendi!`);
            }
        }

        // 5. Migrate Site Settings
        console.log('\n🌐 Site ayarları yükleniyor...');
        const siteSettingsPath = path.join(__dirname, '../src/data/siteSettings.json');
        if (fs.existsSync(siteSettingsPath)) {
            const siteSettings = JSON.parse(fs.readFileSync(siteSettingsPath, 'utf8'));
            await db.collection('settings').updateOne(
                { type: 'site-settings' },
                { $set: { ...siteSettings, type: 'site-settings' } },
                { upsert: true }
            );
            console.log('✅ Site ayarları yüklendi!');
        }

        // 6. Create Admin User
        console.log('\n👤 Admin kullanıcısı oluşturuluyor...');
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await db.collection('users').updateOne(
            { email: 'admin@dortel.com' },
            {
                $set: {
                    email: 'admin@dortel.com',
                    password: hashedPassword,
                    name: 'Admin',
                    role: 'admin',
                    createdAt: new Date().toISOString()
                }
            },
            { upsert: true }
        );
        console.log('✅ Admin kullanıcısı oluşturuldu!');
        console.log('   Email: admin@dortel.com');
        console.log('   Şifre: admin123');

        console.log('\n🎉 Tüm veriler başarıyla MongoDB\'ye aktarıldı!');

    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await client.close();
    }
}

migrateData();
