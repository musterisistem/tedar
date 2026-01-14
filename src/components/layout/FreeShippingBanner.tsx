import React from 'react';
import { Truck, Gift, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';

export const FreeShippingBanner: React.FC = () => {
    const { freeShippingBanner } = useSite();

    if (!freeShippingBanner?.isActive) return null;

    return (
        <div className="container mx-auto px-4 mt-2 mb-0">
            <div className="relative overflow-hidden rounded-xl shadow-lg shadow-orange-900/20 group transition-all duration-300 border-b-2 border-red-800/20">
                {/* Vibrant Red-Orange Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-gradient-xy"></div>

                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_2px_2px,_rgba(255,255,255,0.3)_1px,_transparent_0)] bg-[length:20px_20px]"></div>

                {/* Intense Shine Effect */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 animate-shine" />

                {/* Content */}
                <div className="relative z-10 flex items-center justify-between px-6 py-3 text-white">

                    {/* Icon & Badge - Hidden on very small screens */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/30">
                            <Gift className="w-5 h-5 text-yellow-300 animate-bounce" />
                        </div>
                        <span className="font-bold tracking-wider text-sm uppercase bg-white/10 px-2 py-1 rounded text-yellow-200 border border-white/10">Süper Fırsat</span>
                    </div>

                    {/* Main Message */}
                    <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-center">
                        <div className="flex items-center gap-2">
                            <Truck className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" />
                            <span className="font-medium text-sm md:text-lg text-shadow">
                                <span className="font-extrabold text-white text-lg md:text-xl drop-shadow-md">{freeShippingBanner.thresholdText}</span>
                                <span className="mx-1 text-white/90">{freeShippingBanner.messageText}</span>
                            </span>
                        </div>

                        {/* Looping Content */}
                        <div className="relative overflow-hidden h-8 w-40 md:w-48 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center">
                            <span className="font-black text-white text-lg tracking-widest uppercase whitespace-nowrap animate-marquee-loop absolute">
                                {freeShippingBanner.highlightText}
                            </span>
                            <span className="font-black text-white text-lg tracking-widest uppercase whitespace-nowrap animate-marquee-loop-delayed absolute">
                                {freeShippingBanner.highlightText}
                            </span>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <Link to={freeShippingBanner.linkUrl} className="hidden md:flex items-center gap-1 bg-white text-red-600 px-5 py-1.5 rounded-full font-bold text-sm hover:bg-orange-50 hover:scale-105 transition-all shadow-md group-hover:pr-3 duration-300">
                        {freeShippingBanner.buttonText}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <style>{`
                    @keyframes shine {
                        100% {
                            left: 125%;
                        }
                    }
                    .animate-gradient-xy {
                        background-size: 200% 200%;
                        animation: gradient-xy 4s ease infinite;
                    }
                    @keyframes gradient-xy {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    
                    /* Looping Animation */
                    @keyframes marquee-loop {
                        0% { transform: translateX(100%); opacity: 0; }
                         10% { opacity: 1; }
                        50% { transform: translateX(0%); opacity: 1; }
                        90% { opacity: 1; }
                        100% { transform: translateX(-100%); opacity: 0; }
                    }
                     /* Better simple slide loop */
                    @keyframes slide-loop {
                        0% { transform: translateX(150%); }
                        100% { transform: translateX(-150%); }
                    }

                    .animate-marquee-loop {
                        animation: slide-loop 3s linear infinite;
                    }
                    .animate-marquee-loop-delayed {
                        animation: slide-loop 3s linear infinite;
                        animation-delay: 1.5s;
                    }

                    .text-shadow {
                        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                `}</style>
            </div>
        </div>
    );
};
