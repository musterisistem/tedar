
import fs from 'fs';
import path from 'path';
import https from 'https';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const PROJECT_ROOT = path.resolve(__dirname, '../');
const CSV_PATH = path.resolve(PROJECT_ROOT, '../urunler.csv'); // Assuming urunler.csv is in DORTEL TEDARIK root
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
                // Try to consume response data to free up memory
                response.resume();
                console.warn(`Failed to download ${url}: Status Code ${response.statusCode}`);
                resolve(null); // Resolve null on checking failure to not break the chain, just missing image
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(filepath));
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { }); // Delete the file async. (But we don't check the result)
            console.error(`Error downloading ${url}: ${err.message}`);
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
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

const importProducts = async () => {
    console.log('Starting product import...');

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

    // 2. Load Categories
    let categories = [];
    try {
        if (fs.existsSync(CATEGORIES_JSON_PATH)) {
            categories = JSON.parse(fs.readFileSync(CATEGORIES_JSON_PATH, 'utf8'));
        }
    } catch (error) {
        console.error('Error reading categories.json:', error);
    }

    const categoryMap = new Map(); // Name -> ID
    // Initialize map with existing (handling subcategories slightly loosely for now, focused on main categories or mapping flat)
    // Actually, the CSV has 'Kategori İsmi'. We will create Top Level categories for simplicity or check if it matches a subcategory.
    // For this prompt, let's treat "Kategori İsmi" as a top-level category if not found, or matches existing.

    // Flatten existing categories for simpler lookup by name
    const existingCategoryNames = new Map();
    categories.forEach(c => {
        existingCategoryNames.set(c.name, c.id);
        if (c.subcategories) {
            // We could map subcategories too, but CSV only has one 'Kategori İsmi' column usually.
            c.subcategories.forEach(sub => existingCategoryNames.set(sub, c.id));
        }
    });

    const products = [];
    let newCategoriesCount = 0;

    // 3. Process Rows
    const processedNames = new Set();

    for (const row of csvData) {
        // Essential fields
        const productCode = row['Model Kodu'] || row['Barkod'] || row['Tedarikçi Stok Kodu'];
        if (!productCode) {
            console.warn('Skipping row without product code:', row);
            continue;
        }

        const name = row['Ürün Adı'];
        if (!name) {
            console.warn('Skipping row without product name:', row);
            continue;
        }

        // DEDUPLICATION: Check if we already processed a product with this name
        // Normalizing name slightly to catch casing or minor whitespace diffs
        const normalizedName = name.trim();
        if (processedNames.has(normalizedName)) {
            // console.log(`Skipping duplicate product variant: ${name} (${productCode})`);
            continue;
        }
        processedNames.add(normalizedName);

        const description = row['Ürün Açıklaması'] || '';
        const priceCurrent = parseFloat(row['Trendyol\'da Satılacak Fiyat (KDV Dahil)']) || 0;
        const priceMarket = parseFloat(row['Piyasa Satış Fiyatı (KDV Dahil)']) || priceCurrent;
        const stock = parseInt(row['Ürün Stok Adedi']) || 0;
        const categoryName = row['Kategori İsmi'] || 'Genel';

        // Category Management
        let categoryId = existingCategoryNames.get(categoryName);
        if (!categoryId) {
            // Create new category
            categoryId = slugify(categoryName);
            const newCategory = {
                id: categoryId,
                name: categoryName,
                icon: 'Package', // Default icon
                subcategories: []
            };
            categories.push(newCategory);
            existingCategoryNames.set(categoryName, categoryId);
            newCategoriesCount++;
            console.log(`Created new category: ${categoryName} (${categoryId})`);
        }

        // Image Management
        const images = [];
        const imageUrls = [
            row['Görsel 1'], row['Görsel 2'], row['Görsel 3'],
            row['Görsel 4'], row['Görsel 5'], row['Görsel 6']
        ].filter(url => url && typeof url === 'string' && url.trim() !== '');

        console.log(`Processing images for ${productCode} (${imageUrls.length} found)`);

        for (let i = 0; i < imageUrls.length; i++) {
            const url = imageUrls[i];
            const ext = path.extname(url) || '.jpg';
            // Clean extension if it has query params
            const cleanExt = ext.split('?')[0];
            const fileName = `${slugify(productCode)}-${i + 1}${cleanExt}`;
            const filePathWeb = `/product/images/${fileName}`;
            const filePathDisk = path.join(IMAGES_DIR, fileName);

            // Check if file already exists to avoid re-downloading (optional, but good for speed)
            // But user might want fresh, let's download.
            // Actually, for speed in this context, let's check existence if we run multiple times.
            // User asked to wipe products, so likely wants fresh. Let's try downloading.

            // To be robust, let's catch download errors inside.
            // NOTE: Downloading sequentially inside loop to allow easy logging and avoid overwhelming network? 
            // Or parallel? Parallel is faster. Let's do parallel for a product's images.
            try {
                // Determine if we need to download.
                if (!fs.existsSync(filePathDisk)) {
                    await downloadImage(url, filePathDisk);
                }
                // Only add if file exists (downloaded or previous)
                if (fs.existsSync(filePathDisk)) {
                    images.push(filePathWeb);
                }
            } catch (e) {
                console.error(`Failed handling image ${i + 1} for ${productCode}`, e);
            }
        }

        // Product Object
        const newProduct = {
            id: productCode,
            name: name,
            code: productCode,
            price: {
                current: priceCurrent,
                original: priceMarket,
                currency: 'TL'
            },
            description: description,
            image: images[0] || '/placeholder.png', // Main image
            images: images,
            categories: [categoryId],
            brand: row['Marka'] || 'Dörtel',
            stock: stock,
            rating: 5, // Default
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

        // Log progress every 10 items
        if (products.length % 10 === 0) {
            console.log(`Processed ${products.length} products...`);
        }
    }

    // 4. Save Data files
    // Save Products
    // Wrap in the structure expected by ProductProvider (or standard json)
    // The current file seems to be just { data: [] } or array. Let's check format. 
    // The previous view_file showed standard JSON structure or wrapper. 
    // Let's use { data: products } to be safe and consistent with some patterns found, or just array.
    // Looking at previous tools, it was "{ data: [] }".

    const finalProductsData = { data: products };
    fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(finalProductsData, null, 2), 'utf8');
    console.log(`Saved ${products.length} products to products.json`);

    // Save Categories
    if (newCategoriesCount > 0) {
        fs.writeFileSync(CATEGORIES_JSON_PATH, JSON.stringify(categories, null, 2), 'utf8');
        console.log(`Saved ${categories.length} categories to categories.json (Added ${newCategoriesCount} new)`);
    } else {
        console.log('No new categories added.');
    }

    console.log('Import completed successfully!');
};

importProducts().catch(err => console.error('Import failed:', err));
