const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/siteSettings.json');

try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const settings = JSON.parse(rawData);

    if (settings.slides && Array.isArray(settings.slides)) {
        settings.slides = settings.slides.map((slide, index) => {
            // Keep existing image and id, add missing fields if they don't exist
            return {
                ...slide,
                title: slide.title || "Ofisinizin Tüm İhtiyaçları",
                description: slide.description || "En kaliteli ofis malzemeleri ve kurumsal çözümler uygun fiyatlarla.",
                link: slide.link || "/kampanyalar",
                buttonText: "Alışverişe Başla", // Though HeroSlider uses Link presence, adding this for completeness
                showText: true
            };
        });

        fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf8');
        console.log('Successfully updated slides in siteSettings.json');
    } else {
        console.error('No slides array found in settings');
    }
} catch (error) {
    console.error('Error processing file:', error);
}
