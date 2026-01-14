import React from 'react';
import { useSite } from '../../context/SiteContext';

export const CategoryQuickAccess: React.FC = () => {
    const { banners } = useSite();

    if (!banners || banners.length === 0) return null;

    // Dynamic grid cols based on count
    const getGridClass = (count: number) => {
        if (count === 1) return 'grid-cols-1';
        if (count === 2) return 'grid-cols-1 md:grid-cols-2';
        if (count === 3) return 'grid-cols-1 md:grid-cols-3';
        return 'grid-cols-2 md:grid-cols-4'; // 4 or more
    };

    return (
        <div className="container mx-auto px-4 mb-8">
            <div className={`grid ${getGridClass(banners.length)} gap-6`}>
                {banners.map(banner => (
                    <a key={banner.id} href={banner.link} className="block relative overflow-hidden h-[200px] rounded-xl shadow-md">
                        <img
                            src={banner.image}
                            alt={banner.title || 'Banner'}
                            className="w-full h-full object-cover"
                        />
                    </a>
                ))}
            </div>
        </div>
    );
};
