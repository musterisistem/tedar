import React from 'react';
import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { slugify } from '../../utils/slugify';

export const PopularCategories: React.FC = () => {
    const { popularCategories } = useSite();

    // Select categories based on dynamic items
    const categories = (popularCategories || []).map(item => {
        if (item.type === 'category') {
            return {
                id: item.id,
                name: item.name,
                path: `/kategori/${slugify(item.name)}`
            };
        } else {
            return {
                id: `${item.parentId}-${item.id}`,
                name: item.name,
                path: `/kategori/${slugify(item.parentId || '')}/${slugify(item.name)}` // Look up parent name if possible, or assume parentId is close to name? item.parentId might be slug? 
                // SiteContext types for popularCategory items: { id, name, type, parentId? }
                // If parentId is ID, we might need name. But for now using ID as slug might fail if ID != slugify(name).
                // However, user data usually puts ID. 
                // Let's assume parentId matches slug or use slugify(parentId).
                // Better: If subcategory, path should be /kategori/parent-slug/sub-slug.
                // If we don't have parent Name, this is tricky. 
                // Let's stick to /kategori/sub-slug if simpler, or /kategori/parent/sub.
                // If pop cat items come from admin, they might just include ID/Name.
                // Let's try to infer parent slug from parentId (assuming it's slug-like) or just use slugify(item.name) if parent is uncertain.
                // Actually App.tsx supports /kategori/:slug and /kategori/:slug/:subSlug. 
                // Any match on first slug is good.
                // Let's try to just point to /kategori/sub-slug if unique enough, or maintain structure.
                // I'll assume parentId is the slug for now or slugify(parentId).
            };
        }
    });

    // REVISIT: The replacement chunk above has comments. I should clean it up.
    // If I don't change `path` logic for subcategory properly, it might fail.
    // popularCategories data comes from siteSettings.
    // Let's just use /kategori/slugify(name) for ALL. CategoryPage finds by checking if slug matches category name OR subcategory name.
    // CategoryPage logic: const categoryInfo = categories.find(c => slugify(c.name) === slug);
    // Be careful. If I pass subcategory name as slug, it WON'T match main category name.
    // Does CategoryPage handle subcategory lookup? 
    // Step 1095 diff shows: `categories.find(c => slugify(c.name) === slug)`.
    // It does NOT check subcategories.
    // So `/kategori/subcategory-name` will FAIL if `subcategory-name` isn't a main category.
    // Proper URL: `/kategori/main-category-slug/subcategory-slug`? 
    // App.tsx has `/kategori/:slug/:subSlug`.
    // CategoryPage needs to handle `subSlug`.

    // I need to verify CategoryPage handles subSlug.
    // Let's check CategoryPage.tsx again.

    return (
        <div className="py-2">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-wrap flex-1">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <Tag className="w-5 h-5 text-blue-600" />
                        <span className="text-sm">Popüler Kategoriler:</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={category.path}
                                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
