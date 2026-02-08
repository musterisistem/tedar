
import fs from 'fs';
import path from 'path';
import https from 'https';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';
import { CATEGORY_MAP } from './category_map.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const PROJECT_ROOT = path.resolve(__dirname, '../');
const CSV_PATH = path.resolve(PROJECT_ROOT, '../urunler.csv');
const PRODUCTS_JSON_PATH = path.resolve(PROJECT_ROOT, 'public/data/products.json');
const CATEGORIES_JSON_PATH = path.resolve(PROJECT_ROOT, 'src/data/categories.json');
const IMAGES_DIR = path.resolve(PROJECT_ROOT, 'public/product/images');

// Ensure image directory exists
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Helper to download image
const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        if (!url) {
            resolve(null);
            return;
        }

        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                response.resume();
                // console.warn(`Failed to download ${url}: Status Code ${response.statusCode}`);
                resolve(null);
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(filepath));
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            // console.error(`Error downloading ${url}: ${err.message}`);
            resolve(null);
        });
    });
};

// Helper for slugifying
const slugify = (text) => {
    return text.toString().toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

const importProducts = async () => {
    console.log('Starting product import with Category Refactoring...');

    // 1. Read CSV
    const csvFileContent = fs.readFileSync(CSV_PATH, 'utf8');
    const parseResult = Papa.parse(csvFileContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
    });

    if (parseResult.errors.length > 0) {
        console.error('CSV Parsing Errors:', parseResult.errors);
    }

    const csvData = parseResult.data;
    console.log(`Found ${csvData.length} products in CSV.`);

    // 2. Load Base Categories (to keep IDs and Icons)
    let categories = [];
    try {
        if (fs.existsSync(CATEGORIES_JSON_PATH)) {
            const raw = JSON.parse(fs.readFileSync(CATEGORIES_JSON_PATH, 'utf8'));
            categories = Array.isArray(raw) ? raw : raw.data || [];
        }
    } catch (error) {
        console.error('Error reading categories.json:', error);
    }

    // Reset subcategories for all main categories
    // We will populate them based on what we find in CSV
    const categorySubMap = new Map(); // MainCatID -> Set(SubCategoryNames)

    categories.forEach(c => {
        c.subcategories = []; // Clear existing
        categorySubMap.set(c.id, new Set());
    });

    // Ensure 'diger' exists
    if (!categorySubMap.has('diger')) {
        categorySubMap.set('diger', new Set());
        if (!categories.find(c => c.id === 'diger')) {
            categories.push({ id: 'diger', name: 'Diğer Ürünler', icon: 'Box', subcategories: [] });
        }
    }

    const products = [];
    const processedNames = new Set();

    // 3. Process Rows
    for (const row of csvData) {
        const productCode = row['Model Kodu'] || row['Barkod'] || row['Tedarikçi Stok Kodu'];
        const name = row['Ürün Adı'];

        if (!productCode || !name) continue;

        // Deduplication
        const normalizedName = name.trim();
        if (processedNames.has(normalizedName)) continue;
        processedNames.add(normalizedName);

        const description = row['Ürün Açıklaması'] || '';
        const priceCurrent = parseFloat(row['Trendyol\'da Satılacak Fiyat (KDV Dahil)']) || 0;
        const priceMarket = parseFloat(row['Piyasa Satış Fiyatı (KDV Dahil)']) || priceCurrent;
        const stock = parseInt(row['Ürün Stok Adedi']) || 0;

        // CSV Category
        const csvCategoryName = (row['Kategori İsmi'] || 'Diğer').trim();

        // Map to Main Category
        let mainCategoryId = CATEGORY_MAP[csvCategoryName];

        // Fallback if not found in map
        if (!mainCategoryId) {
            // Use the slugified CSV name as ID
            mainCategoryId = slugify(csvCategoryName);

            // Add to categories list if not exists
            if (!categories.find(c => c.id === mainCategoryId)) {
                categories.push({
                    id: mainCategoryId,
                    name: csvCategoryName,
                    icon: 'Box', // Default icon
                    subcategories: []
                });
                console.log(`Created new Main Category: ${csvCategoryName} (${mainCategoryId})`);
                // Initialize map entry for this new cat
                categorySubMap.set(mainCategoryId, new Set());
            }
        }

        // Add subcategory to the main category's set
        if (!categorySubMap.has(mainCategoryId)) {
            categorySubMap.set(mainCategoryId, new Set());
        }
        categorySubMap.get(mainCategoryId).add(csvCategoryName);

        // Image Management
        const images = [];
        const imageUrls = [
            row['Görsel 1'], row['Görsel 2'], row['Görsel 3'],
            row['Görsel 4'], row['Görsel 5'], row['Görsel 6']
        ].filter(url => url && typeof url === 'string' && url.trim() !== '');

        // Skipping rigorous download check for speed in this iteration, assuming files might be there or will fail gracefully
        // For production, uncomment download logic. For now, let's assume we want to TRY downloading if missing.

        for (let i = 0; i < imageUrls.length; i++) {
            const url = imageUrls[i];
            const ext = path.extname(url).split('?')[0] || '.jpg';
            const fileName = `${slugify(productCode)}-${i + 1}${ext}`;
            const filePathWeb = `/product/images/${fileName}`;
            const filePathDisk = path.join(IMAGES_DIR, fileName);

            if (!fs.existsSync(filePathDisk)) {
                try {
                    await downloadImage(url, filePathDisk);
                } catch (e) { }
            }
            if (fs.existsSync(filePathDisk)) {
                images.push(filePathWeb);
            }
        }

        // Product Object
        const newProduct = {
            id: productCode,
            name: name,
            code: productCode,
            price: { current: priceCurrent, original: priceMarket, currency: 'TL' },
            description: description,
            image: images[0] || '/placeholder.png',
            images: images,
            categories: [mainCategoryId, csvCategoryName], // Store both Main ID and Sub Name
            brand: row['Marka'] || 'Dörtel',
            stock: stock,
            rating: 5,
            reviews: 0,
            badges: stock < 5 ? ['Tükenmek Üzere'] : [],
            specs: {
                color: row['Ürün Rengi'] || 'Standart',
                size: row['Boyut/Ebat'] || 'Standart',
                shippingType: 'Standart'
            },
            createdAt: new Date().toISOString(),
            isActive: true
        };

        products.push(newProduct);
        if (products.length % 50 === 0) console.log(`Processed ${products.length} products...`);
    }

    // 4. Update Categories with collected subcategories
    let totalSubcategories = 0;
    categories.forEach(c => {
        if (categorySubMap.has(c.id)) {
            // Sort subcategories alphabetically
            const subs = Array.from(categorySubMap.get(c.id)).sort();
            c.subcategories = subs;
            totalSubcategories += subs.length;
        }
    });

    // 5. Save Files
    const finalProductsData = { data: products };
    fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(finalProductsData, null, 2), 'utf8');
    console.log(`Saved ${products.length} products to products.json`);

    fs.writeFileSync(CATEGORIES_JSON_PATH, JSON.stringify({ data: categories }, null, 2), 'utf8');
    console.log(`Saved categories.json with ${totalSubcategories} active subcategories.`);

    console.log('Import & Refactor completed successfully!');
};

importProducts().catch(err => console.error('Import failed:', err));
