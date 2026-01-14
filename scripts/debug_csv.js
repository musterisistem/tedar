
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSV_PATH = path.resolve(__dirname, '../../urunler.csv');

const debug = () => {
    const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
    const result = Papa.parse(csvContent, { header: true });

    console.log("Searching for 'Frozen'...");
    result.data.forEach(row => {
        const name = row['Ürün Adı'];
        if (name && name.includes('Frozen')) {
            console.log(`Found: "${name}"`);
            console.log(`Description: "${row['Ürün Açıklaması'] ? row['Ürün Açıklaması'].substring(0, 50) : 'EMPTY'}"`);
            console.log('---');
        }
    });

    console.log("Searching for '40368' in entire row...");
    result.data.forEach(row => {
        if (JSON.stringify(row).includes('40368')) {
            console.log(`Row with 40368: Name="${row['Ürün Adı']}"`);
        }
    });
};

debug();
