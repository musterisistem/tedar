/**
 * Sitemap Generator Script
 * Build sonrası çalıştırılarak sitemap.xml dosyası oluşturur.
 * 
 * Kullanım: node scripts/generateSitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://dorteltedarik.com';

// Kategorileri oku
const categoriesPath = path.join(__dirname, '../src/data/categories.json');
const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));

// Ürünleri oku
const productsPath = path.join(__dirname, '../src/data/products.json');
let products = [];
try {
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    // products.json yapısı { "data": [...] } şeklinde
    products = productsData.data || productsData.products || (Array.isArray(productsData) ? productsData : []);
} catch (e) {
    console.log('Ürünler dosyası okunamadı, boş liste kullanılıyor.');
}

// Slug oluşturma fonksiyonu
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[üÜ]/g, 'u')
        .replace(/[öÖ]/g, 'o')
        .replace(/[çÇ]/g, 'c')
        .replace(/[şŞ]/g, 's')
        .replace(/[ğĞ]/g, 'g')
        .replace(/[ıİ]/g, 'i')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}

// Statik sayfalar
const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/hakkimizda', priority: '0.8', changefreq: 'monthly' },
    { url: '/iletisim', priority: '0.8', changefreq: 'monthly' },
    { url: '/sepet', priority: '0.5', changefreq: 'weekly' },
    { url: '/urunler', priority: '0.9', changefreq: 'daily' },
];

// Kategori sayfaları
const categoryPages = (categories.data || categories).map(cat => ({
    url: `/kategori/${cat.id}`,
    priority: '0.8',
    changefreq: 'weekly'
}));

// Alt kategori sayfaları
const subcategoryPages = [];
(categories.data || categories).forEach(cat => {
    if (cat.subcategories) {
        cat.subcategories.forEach(subcat => {
            subcategoryPages.push({
                url: `/kategori/${cat.id}/${slugify(subcat)}`,
                priority: '0.7',
                changefreq: 'weekly'
            });
        });
    }
});

// Ürün sayfaları
const productPages = products.map(product => ({
    url: `/urun/${slugify(product.name)}`,
    priority: '0.6',
    changefreq: 'weekly'
}));

// Tüm sayfaları birleştir
const allPages = [...staticPages, ...categoryPages, ...subcategoryPages, ...productPages];

// XML oluştur
const today = new Date().toISOString().split('T')[0];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

// Dosyayı kaydet
const distPath = path.join(__dirname, '../dist/sitemap.xml');
const publicPath = path.join(__dirname, '../public/sitemap.xml');

// Public klasörüne kaydet (development için)
fs.writeFileSync(publicPath, sitemap, 'utf-8');
console.log(`✅ Sitemap oluşturuldu: ${publicPath}`);

// Dist klasörü varsa oraya da kaydet (production için)
if (fs.existsSync(path.join(__dirname, '../dist'))) {
    fs.writeFileSync(distPath, sitemap, 'utf-8');
    console.log(`✅ Sitemap oluşturuldu: ${distPath}`);
}

console.log(`📊 Toplam ${allPages.length} sayfa sitemap'e eklendi.`);
