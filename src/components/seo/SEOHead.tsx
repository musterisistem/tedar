import React, { useEffect } from 'react';

// react-helmet-async yerine Vanilla React çözümü (Uyumluluk sorunu nedeniyle)

interface SEOHeadProps {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: 'website' | 'product' | 'article';
    keywords?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
    title,
    description,
    image = '/images/default-og.jpg',
    url = '',
    type = 'website',
    keywords = ''
}) => {
    const siteName = 'Dörtel Tedarik';
    const fullTitle = `${title} | ${siteName}`;
    const baseUrl = 'https://dorteltedarik.com';
    const fullUrl = `${baseUrl}${url}`;
    const fullImage = image && image.startsWith('http') ? image : `${baseUrl}${image}`;

    useEffect(() => {
        // 1. Update Title
        document.title = fullTitle;

        // 2. Helper to update meta tags
        const updateMeta = (name: string, content: string, attr: string = 'name') => {
            let element = document.querySelector(`meta[${attr}="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attr, name);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // 3. Update Standard Meta Tags
        updateMeta('description', description);
        if (keywords) updateMeta('keywords', keywords);

        // 4. Update Open Graph Tags (property="og:...")
        updateMeta('og:title', fullTitle, 'property');
        updateMeta('og:description', description, 'property');
        updateMeta('og:image', fullImage, 'property');
        updateMeta('og:url', fullUrl, 'property');
        updateMeta('og:type', type, 'property');
        updateMeta('og:site_name', siteName, 'property');
        updateMeta('og:locale', 'tr_TR', 'property');

        // 5. Update Twitter Tags
        updateMeta('twitter:card', 'summary_large_image');
        updateMeta('twitter:title', fullTitle);
        updateMeta('twitter:description', description);
        updateMeta('twitter:image', fullImage);

        // 6. Canonical
        let link = document.querySelector('link[rel="canonical"]');
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'canonical');
            document.head.appendChild(link);
        }
        link.setAttribute('href', fullUrl);

    }, [fullTitle, description, fullImage, fullUrl, type, keywords, siteName]);

    return null;
};
