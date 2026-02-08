
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.resolve(__dirname, '../../urunler.csv');

const extractCategories = () => {
    try {
        const fileContent = fs.readFileSync(CSV_PATH, 'utf8');
        const parseResult = Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true
        });

        const categories = new Set();
        parseResult.data.forEach(row => {
            if (row['Kategori İsmi']) {
                categories.add(row['Kategori İsmi'].trim());
            }
        });

        console.log('Unique Categories in CSV:');
        console.log([...categories].sort());
    } catch (error) {
        console.error('Error reading CSV:', error);
    }
};

extractCategories();
