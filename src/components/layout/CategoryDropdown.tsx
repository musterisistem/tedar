import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCategories } from '../../context/CategoryContext';
import { useProducts } from '../../context/ProductContext';
import * as Icons from 'lucide-react';
import { slugify } from '../../utils/slugify';

export const CategoryDropdown: React.FC = () => {
    const { categories } = useCategories();
    const { products } = useProducts();
    const [isOpen, setIsOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => {
                setIsOpen(false);
                setActiveCategory(null);
            }}
        >
            {/* Trigger Button */}
            <button className="w-full bg-secondary text-white h-12 rounded-lg flex items-center justify-between px-4 font-semibold hover:bg-blue-700 transition-colors">
                <div className="flex items-center gap-2">
                    <Icons.Menu className="w-5 h-5" />
                    <span>Ürün Kategorileri</span>
                </div>
                <Icons.ChevronDown className="w-4 h-4" />
            </button>

            {/* Mega Menu Overlay */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 flex min-h-[480px]">
                    {/* Left Column: Main Categories */}
                    <div className="w-64 border-r border-gray-100 py-2 bg-white rounded-l-lg">
                        <ul className="space-y-0.5">
                            {categories.map((cat) => {
                                const IconComponent = (Icons as any)[cat.icon] || Icons.Circle;
                                const isActive = activeCategory === cat.id;

                                return (
                                    <li key={cat.id} onMouseEnter={() => setActiveCategory(cat.id)}>
                                        <Link
                                            to={`/kategori/${slugify(cat.name)}`}
                                            className={`flex items-center justify-between px-4 py-2.5 mx-2 rounded-lg transition-colors group ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600'
                                                    }`}>
                                                    <IconComponent className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-sm">{cat.name}</span>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 transition-all ${isActive ? 'opacity-100 text-blue-600' : 'opacity-0 group-hover:opacity-50'
                                                }`} />
                                        </Link>
                                    </li>
                                );
                            })}


                        </ul>
                    </div>

                    {/* Right Column: Content */}
                    {activeCategory && (
                        <div className="w-[600px] p-6 bg-white rounded-r-lg animate-fadeIn flex flex-col h-full overflow-y-auto">
                            {/* Campaigns View */}


                            {/* Category View */}
                            {activeCategory !== 'campaigns' && categories.map(cat => {
                                if (cat.id !== activeCategory) return null;

                                const randomProducts = products
                                    .filter(p => {
                                        // Check if product belongs to this category by:
                                        // 1. Category ID match (e.g., 'mutfak-icecek')
                                        // 2. Category name match (e.g., 'Mutfak & İçecek Ürünleri')
                                        // 3. Subcategory name match (e.g., 'Mug', 'Kahve Fincanı')
                                        const productCategories = p.categories || [];
                                        return productCategories.includes(cat.id) ||
                                            productCategories.includes(cat.name) ||
                                            productCategories.some(c => cat.subcategories?.includes(c));
                                    })
                                    .sort(() => 0.5 - Math.random()) // Random shuffle
                                    .slice(0, 3);

                                return (
                                    <div key={cat.id} className="flex flex-col gap-6">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                                            <h3 className="text-xl font-bold text-gray-800">{cat.name}</h3>
                                            <Link to={`/kategori/${slugify(cat.name)}`} className="text-xs font-semibold text-blue-600 hover:underline bg-blue-50 px-3 py-1 rounded-full ml-auto">
                                                Tüm Ürünleri Gör
                                            </Link>
                                        </div>

                                        {/* Subcategories */}
                                        {cat.subcategories && cat.subcategories.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                                {cat.subcategories.map((sub, idx) => (
                                                    <Link
                                                        key={idx}
                                                        to={`/kategori/${slugify(cat.name)}/${slugify(sub)}`}
                                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 hover:translate-x-1 transition-all group"
                                                    >
                                                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full group-hover:bg-blue-600 transition-colors"></span>
                                                        {sub}
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-gray-400 italic">Bu kategoride alt kategori bulunmamaktadır.</div>
                                        )}

                                        {/* Special Offer Section */}
                                        <div className="bg-gradient-to-r from-blue-50 to-white p-3 rounded-lg border border-blue-100 flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-secondary text-sm mb-0.5">Özel Fırsat</div>
                                                <div className="text-[10px] text-gray-600">Seçili {cat.name} ürünlerinde indirimler!</div>
                                            </div>
                                            <Link to={`/kategori/${slugify(cat.name)}?discount=true`} className="text-[10px] font-bold bg-secondary text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors shadow-sm">
                                                İncele
                                            </Link>
                                        </div>

                                        {/* Random Products - Small View */}
                                        {randomProducts.length > 0 && (
                                            <div className="pt-2 border-t border-gray-100">
                                                <h4 className="font-bold text-gray-800 text-xs mb-3 flex items-center gap-2">
                                                    <Icons.Sparkles className="w-3 h-3 text-secondary fill-secondary" />
                                                    Sizin İçin Seçtiklerimiz
                                                </h4>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {randomProducts.map(product => (
                                                        <Link key={product.id} to={`/${slugify(product.name)}`} className="group flex flex-col gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                                            <div className="aspect-square rounded border border-gray-100 overflow-hidden bg-white relative">
                                                                <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform" />
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] font-medium text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 mb-1 h-8">
                                                                    {product.name}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="font-bold text-secondary text-xs">{product.price.current.toLocaleString('tr-TR')} TL</div>
                                                                    <div className="text-[9px] text-gray-400 flex items-center gap-0.5">
                                                                        <Icons.Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                                                                        {product.rating}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
