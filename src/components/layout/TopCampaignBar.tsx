import React from 'react';
import { useSite } from '../../context/SiteContext';
import { Link } from 'react-router-dom';

export const TopCampaignBar: React.FC = () => {
    const { topCampaignBar } = useSite();
    const { isActive, items } = topCampaignBar;

    // Filter active items and sort by order
    const campaigns = items.filter(item => item.isActive).sort((a, b) => a.order - b.order);

    if (!isActive || campaigns.length === 0) return null;

    return (
        <div className="w-full bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 text-white overflow-hidden h-10 flex items-center relative z-40 border-b border-blue-800/50 shadow-sm">
            {/* Gradient Overlay for smooth fade effect at edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-blue-900 to-transparent z-10 hidden md:block"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-blue-900 to-transparent z-10 hidden md:block"></div>

            <div className="w-full flex whitespace-nowrap group">
                <div className="animate-marquee flex items-center group-hover:[animation-play-state:paused]">
                    {/* First Loop */}
                    {campaigns.map((item, index) => (
                        <Link key={`loop1-${item.id}`} to={item.link} className="flex items-center mx-8 md:mx-16 hover:text-yellow-300 transition-colors">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 mr-4 animate-pulse"></span>
                            <span className="text-xs md:text-sm font-bold tracking-wider">{item.text}</span>
                        </Link>
                    ))}
                    {/* Duplicate for infinite seamless scroll */}
                    {campaigns.map((item, index) => (
                        <Link key={`loop2-${item.id}`} to={item.link} className="flex items-center mx-8 md:mx-16 hover:text-yellow-300 transition-colors">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 mr-4 animate-pulse"></span>
                            <span className="text-xs md:text-sm font-bold tracking-wider">{item.text}</span>
                        </Link>
                    ))}
                    {/* Minimal third loop to ensure no gaps on very wide screens */}
                    {campaigns.map((item, index) => (
                        <Link key={`loop3-${item.id}`} to={item.link} className="flex items-center mx-8 md:mx-16 hover:text-yellow-300 transition-colors">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 mr-4 animate-pulse"></span>
                            <span className="text-xs md:text-sm font-bold tracking-wider">{item.text}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); } 
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
            `}</style>
        </div>
    );
};
