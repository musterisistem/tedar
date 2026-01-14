import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useSite } from '../../context/SiteContext';

export const CampaignBanner: React.FC = () => {
    const { campaigns } = useSite();

    // Fallback if no campaigns exist yet
    if (!campaigns || campaigns.length === 0) return null;

    return (
        <div className="py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {campaigns.map((banner, index) => (
                        <div key={banner.id} className="group relative h-64 overflow-hidden bg-gray-100 flex items-center rounded-xl shadow-sm">
                            <img
                                src={banner.image}
                                alt={banner.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>

                            {banner.showText !== false && (
                                <div className="relative z-10 px-8 max-w-sm text-white">
                                    <span className={`text-xs font-bold px-2 py-1 rounded mb-3 inline-block ${index === 0 ? 'bg-blue-600' : 'bg-orange-500'}`}>
                                        {index === 0 ? 'YENİ' : 'KAMPANYA'}
                                    </span>
                                    <h3 className="text-2xl font-bold mb-2">{banner.title}</h3>
                                    <p className="text-gray-200 mb-6 text-sm">{banner.subtitle}</p>
                                    <a href={banner.link} className="flex items-center gap-2 font-semibold hover:gap-3 transition-all">
                                        {banner.buttonText} <ArrowRight className="w-4 h-4" />
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
