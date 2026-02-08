
const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'src', 'data', 'products.json');

try {
    const rawData = fs.readFileSync(productsPath, 'utf8');
    const products = JSON.parse(rawData);

    const updatedProducts = products.map(product => {
        return {
            ...product,
            sameDayShipping: true
        };
    });

    fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2), 'utf8');
    console.log(`Successfully updated ${updatedProducts.length} products with sameDayShipping: true`);
} catch (error) {
    console.error('Error updating products:', error);
}
