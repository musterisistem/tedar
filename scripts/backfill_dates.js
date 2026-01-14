
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_JSON_PATH = path.resolve(__dirname, '../src/data/products.json');

const getRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const backfillDates = () => {
    console.log('Starting date backfill...');

    if (!fs.existsSync(PRODUCTS_JSON_PATH)) {
        console.error('Products file not found.');
        return;
    }

    const fileContent = fs.readFileSync(PRODUCTS_JSON_PATH, 'utf8');
    const data = JSON.parse(fileContent);

    // Handle { data: [...] } or [...]
    let products = Array.isArray(data) ? data : data.data;

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    let updatedCount = 0;

    products.forEach(p => {
        if (!p.createdAt) {
            // Assign a random date within the last 30 days
            p.createdAt = getRandomDate(thirtyDaysAgo, now).toISOString();
            updatedCount++;
        }
    });

    const finalData = Array.isArray(data) ? products : { ...data, data: products };
    fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(finalData, null, 2), 'utf8');

    console.log(`Updated ${updatedCount} products with random createdAt dates.`);
};

backfillDates();
