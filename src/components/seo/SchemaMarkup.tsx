import React from 'react';
import type { Product } from '../../context/ProductContext';

interface ProductSchemaProps {
    product: Product;
    url: string;
}

export const ProductSchema: React.FC<ProductSchemaProps> = ({ product, url }) => {
    const baseUrl = 'https://dorteltedarik.com';
    const productUrl = `${baseUrl}${url}`;
    const imageUrl = product.image?.startsWith('http')
        ? product.image
        : `${baseUrl}${product.image}`;

    // Ortalama yıldız puanını hesapla
    const averageRating = product.reviewItems && product.reviewItems.length > 0
        ? product.reviewItems.reduce((sum, review) => sum + review.rating, 0) / product.reviewItems.length
        : product.rating || 0;

    const reviewCount = product.reviewItems?.length || product.reviews || 0;

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images?.length > 0
            ? product.images.map(img => img.startsWith('http') ? img : `${baseUrl}${img}`)
            : [imageUrl],
        sku: product.code || product.id,
        brand: {
            '@type': 'Brand',
            name: product.brand || 'Dörtel Tedarik'
        },
        offers: {
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: product.price?.currency || 'TRY',
            price: product.price?.current || 0,
            priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            availability: product.stock > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'Dörtel Tedarik'
            }
        },
        ...(reviewCount > 0 && averageRating > 0 && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: averageRating.toFixed(1),
                bestRating: '5',
                worstRating: '1',
                reviewCount: reviewCount
            }
        }),
        ...(product.reviewItems && product.reviewItems.length > 0 && {
            review: product.reviewItems.slice(0, 5).map(review => ({
                '@type': 'Review',
                author: {
                    '@type': 'Person',
                    name: review.user
                },
                datePublished: review.date,
                reviewBody: review.comment,
                reviewRating: {
                    '@type': 'Rating',
                    ratingValue: review.rating,
                    bestRating: '5',
                    worstRating: '1'
                }
            }))
        })
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

// Organization Schema (Ana sayfa için)
export const OrganizationSchema: React.FC = () => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Dörtel Tedarik',
        url: 'https://dorteltedarik.com',
        logo: 'https://dorteltedarik.com/images/logo.png',
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+90-XXX-XXX-XXXX',
            contactType: 'customer service',
            availableLanguage: 'Turkish'
        },
        sameAs: [
            'https://www.facebook.com/dorteltedarik',
            'https://www.instagram.com/dorteltedarik',
            'https://twitter.com/dorteltedarik'
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

// WebSite Schema (Site geneli için)
export const WebSiteSchema: React.FC = () => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Dörtel Tedarik',
        url: 'https://dorteltedarik.com',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://dorteltedarik.com/arama?q={search_term_string}'
            },
            'query-input': 'required name=search_term_string'
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

// BreadcrumbList Schema
interface BreadcrumbItem {
    name: string;
    url: string;
}

interface BreadcrumbSchemaProps {
    items: BreadcrumbItem[];
}

export const BreadcrumbSchema: React.FC<BreadcrumbSchemaProps> = ({ items }) => {
    const baseUrl = 'https://dorteltedarik.com';

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${baseUrl}${item.url}`
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};
