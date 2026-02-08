import React from 'react';
import { Link } from 'react-router-dom';

// Import images
import storyCleaning from '../../assets/story-cleaning.png';
import storyShipping from '../../assets/story-shipping.png';
import storyBestseller from '../../assets/story-bestseller.png';
import storyFlash from '../../assets/story-flash.png';
import storyCampaign from '../../assets/story-campaign.png';
import storyOffice from '../../assets/story-office.png';
import storyStationery from '../../assets/story-stationery.png';
import storyDiscount from '../../assets/story-discount.png';
import storyHobby from '../../assets/story-hobby.png';
import storySpecial from '../../assets/story-special.png';

export const StoryMenu: React.FC = () => {
    const stories = [
        { id: 1, title: "Sepette İndirim", image: storyDiscount, link: "/kategori/ofis-kirtasiye-urunleri", color: "from-teal-400 to-emerald-500" },
        { id: 2, title: "Tüm Kampanyalar", image: storyCampaign, link: "/kampanyalar", color: "from-green-400 to-emerald-600" },
        { id: 3, title: "Flaş Ürünler", image: storyFlash, link: "/flas-urunler", color: "from-yellow-400 to-orange-500" },
        { id: 4, title: "En Çok Satanlar", image: storyBestseller, link: "/best-sellers", color: "from-purple-500 to-indigo-600" },
        { id: 5, title: "Aynı Gün Kargo", image: storyShipping, link: "/ayni-gun-kargo", color: "from-orange-400 to-red-500" },
        { id: 6, title: "Ofis Yaşam", image: storyOffice, link: "/kategori/ofis-yasam", color: "from-blue-400 to-indigo-500" },
        { id: 7, title: "Temizlik", image: storyCleaning, link: "/kategori/temizlik-urunleri", color: "from-cyan-400 to-blue-500" },
        { id: 8, title: "Kırtasiye", image: storyStationery, link: "/kategori/kirtasiye-urunleri", color: "from-pink-400 to-rose-500" },
        { id: 9, title: "Hobi, Oyuncak", image: storyHobby, link: "/kategori/hobi-oyuncak", color: "from-lime-400 to-green-500" },
        { id: 10, title: "Özel Günler", image: storySpecial, link: "/kategori/ozel-gunler", color: "from-fuchsia-400 to-purple-500" },
        { id: 11, title: "Dekorasyon", image: storyOffice, link: "/kategori/dekorasyon", color: "from-amber-400 to-orange-500" }
    ];

    return (
        <div className="py-6 overflow-x-auto scrollbar-hide">
            <div className="flex items-start gap-3 md:gap-6 min-w-min px-4">
                {stories.map((story) => (
                    <Link
                        key={story.id}
                        to={story.link}
                        className="group flex flex-col items-center gap-2 min-w-[72px] md:min-w-[84px] cursor-pointer"
                    >
                        {/* Circle Container */}
                        <div className="relative w-16 h-16 md:w-[70px] md:h-[70px] rounded-full p-[3px] group-hover:scale-105 transition-transform duration-300 ease-out z-0">
                            {/* Static Gradient Border (Default) */}
                            <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${story.color} opacity-40 group-hover:opacity-0 transition-opacity duration-300`}></div>

                            {/* Animated Outer Ring (Conic Gradient) - Visible on Hover */}
                            <div className={`absolute -inset-[3px] rounded-full bg-gradient-to-tr ${story.color} opacity-0 group-hover:opacity-70 blur-[2px] animate-pulse transition-opacity duration-300`}></div>

                            {/* Rotating Border Layer 1 - Visible on Hover */}
                            <div className="absolute -inset-[2px] rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className={`w-[200%] h-[200%] absolute top-[-50%] left-[-50%] bg-[conic-gradient(transparent,${story.id % 2 === 0 ? '#3b82f6' : '#f59e0b'},transparent_30%)] animate-spin-slow-custom opacity-100`}></div>
                            </div>

                            {/* Rotating Border Layer 2 (Opposite direction) - Visible on Hover */}
                            <div className="absolute -inset-[2px] rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className={`w-[200%] h-[200%] absolute top-[-50%] left-[-50%] bg-[conic-gradient(transparent,${story.id % 2 === 0 ? '#ef4444' : '#10b981'},transparent_30%)] animate-spin-reverse-custom opacity-100`}></div>
                            </div>

                            {/* Inner White Border - Make it slightly smaller to show rotating border */}
                            <div className="absolute inset-[2px] rounded-full bg-white z-10"></div>

                            {/* Image Area */}
                            <div className="absolute inset-[4px] rounded-full bg-gray-50 z-20 flex items-center justify-center overflow-hidden border border-gray-100">
                                <img
                                    src={story.image}
                                    alt={story.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        </div>

                        {/* Title */}
                        <span className="text-[10px] md:text-xs font-semibold text-center text-gray-700 leading-tight max-w-[80px] group-hover:text-blue-700 transition-colors">
                            {story.title}
                        </span>
                    </Link>
                ))}
            </div>

            <style>{`
                @keyframes spin-slow-custom {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spin-reverse-custom {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                .animate-spin-slow-custom {
                    animation: spin-slow-custom 3s linear infinite;
                }
                .animate-spin-reverse-custom {
                    animation: spin-reverse-custom 4s linear infinite;
                }
            `}</style>
        </div>
    );
};
