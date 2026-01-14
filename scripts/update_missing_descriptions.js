
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const PROJECT_ROOT = path.resolve(__dirname, '../');
const CSV_PATH = path.resolve(PROJECT_ROOT, '../urunler.csv');
const PRODUCTS_JSON_PATH = path.resolve(PROJECT_ROOT, 'src/data/products.json');

const updateDescriptions = async () => {
    console.log('Starting description update...');

    // 1. Read CSV
    if (!fs.existsSync(CSV_PATH)) {
        console.error('CSV file not found at:', CSV_PATH);
        return;
    }
    console.log('Reading CSV...');
    const csvFileContent = fs.readFileSync(CSV_PATH, 'utf8');
    const parseResult = Papa.parse(csvFileContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
    });

    if (parseResult.errors.length > 0) {
        console.warn('CSV Parsing Warnings:', parseResult.errors);
    }

    const csvData = parseResult.data;
    console.log(`Loaded ${csvData.length} rows from CSV.`);

    // Build Lookup Map: Product Name -> Description
    const descriptionMap = new Map();
    csvData.forEach(row => {
        const name = row['Ürün Adı'];
        let description = row['Ürün Açıklaması'];
        if (name && description) {
            // Normalize name key
            const key = name.trim();
            if (!descriptionMap.has(key)) {
                descriptionMap.set(key, description);
            }
        }
    });

    // 2. Read Products.json
    if (!fs.existsSync(PRODUCTS_JSON_PATH)) {
        console.error('Products JSON file not found at:', PRODUCTS_JSON_PATH);
        return;
    }
    console.log('Reading products.json...');
    const productsData = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf8'));

    // Handle both array and { data: [...] } structure
    let products = Array.isArray(productsData) ? productsData : productsData.data;

    if (!products) {
        console.error('Invalid products.json structure.');
        return;
    }

    // 3. Update Missing Descriptions
    let updateCount = 0;
    let missingCount = 0;

    products.forEach(product => {
        if (!product.description || product.description.trim() === '') {
            missingCount++;
            const key = product.name.trim();
            const csvDescription = descriptionMap.get(key);

            if (csvDescription) {
                product.description = csvDescription;
                updateCount++;
                // console.log(`Updated description for: ${product.name}`);
            } else {
                console.warn(`No description found in CSV for: ${product.name}`);
            }
        }
    });

    console.log(`Found ${missingCount} products with missing descriptions.`);
    console.log(`Updated ${updateCount} products.`);

    // 4. Save
    const finalData = Array.isArray(productsData) ? products : { ...productsData, data: products };
    fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(finalData, null, 2), 'utf8');
    console.log('Successfully saved updated products.json');
};

updateDescriptions().catch(err => console.error('Update failed:', err));
