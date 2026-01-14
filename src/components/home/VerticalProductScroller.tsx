import React, { useEffect, useState } from 'react';
import { useProducts, type Product } from '../../context/ProductContext';
import { Sparkles, ShoppingCart, Eye, Star } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { slugify } from '../../utils/slugify';

export const VerticalProductScroller: React.FC = () => {
    const { products } = useProducts();
    const [randomProducts, setRandomProducts] = useState<Product[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (products.length > 0) {
            // Select 6 random products when products are available
            const shuffled = [...products].sort(() => 0.5 - Math.random());
            setRandomProducts(shuffled.slice(0, 6));
        }
    }, [products]);

    const handleProductClick = (productName: string) => {
        navigate(`/${slugify(productName)}`);
    };

    return (
        <div className="bg-white border text-gray-800 border-gray-200 rounded-xl h-full flex flex-col shadow-sm relative group/container">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-4 flex items-center gap-3 rounded-t-xl">
                <div className="bg-white/20 p-2 rounded-lg">
                    <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <div>
                    <h3 className="font-bold text-lg leading-none">Ofisiniz İçin</h3>
                    <span className="text-sm text-blue-100 font-medium">Seçtik</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-2 gap-1 overflow-visible">
                {randomProducts.map((product, index) => (
                    <div
                        key={product.id}
                        onClick={() => handleProductClick(product.name)}
                        className="group relative bg-white hover:bg-gray-50 rounded-lg p-2 flex gap-3 transition-all cursor-pointer border border-transparent hover:border-gray-200 hover:shadow-md hover:z-50"
                    >
                        <Link to={`/${slugify(product.name)}`} className="absolute inset-0 z-0" aria-label={product.name} />
                        {/* Hover Popup - Appearing to the Left */}
                        <div
                            className="absolute right-full top-1/2 -translate-y-1/2 mr-4 w-52 bg-white rounded-xl shadow-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] border border-gray-100 pointer-events-none group-hover:pointer-events-auto cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleProductClick(product.name);
                            }}
                        >
                            {/* Connector Arrow */}
                            <div className="absolute top-1/2 -translate-y-1/2 -right-[16px] border-8 border-transparent border-l-white"></div>

                            <div className="flex flex-col gap-2">
                                <div className="h-32 rounded-lg overflow-hidden bg-white border border-gray-200 p-2">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <div className="text-gray-800 text-xs font-bold line-clamp-2 mb-1 hover:text-blue-600 transition-colors">{product.name}</div>

                                    {/* Ratings */}
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-medium">({product.reviews} Değ.)</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {product.price.original > product.price.current && (
                                            <div className="text-xs text-gray-400 line-through">
                                                {product.price.original.toLocaleString('tr-TR')} TL
                                            </div>
                                        )}
                                        <div className="text-blue-600 font-bold text-lg">
                                            {product.price.current.toLocaleString('tr-TR')} TL
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full bg-blue-600 text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors shadow-sm">
                                    <ShoppingCart className="w-3 h-3" />
                                    Sepete Ekle
                                </button>
                            </div>
                        </div>

                        <div className="w-14 h-14 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 relative p-1">
                            <span className="absolute top-0 left-0 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br z-10">
                                #{index + 1}
                            </span>
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h5 className="text-xs font-medium text-gray-700 line-clamp-2 group-hover:text-blue-600 transition-colors mb-0.5">
                                {product.name}
                            </h5>
                            <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-1.5">
                                    {product.price.original > product.price.current && (
                                        <span className="text-[10px] text-gray-400 line-through">
                                            {product.price.original.toLocaleString('tr-TR')}
                                        </span>
                                    )}
                                    <span className="font-bold text-blue-600 text-sm">
                                        {product.price.current.toLocaleString('tr-TR')} TL
                                    </span>
                                </div>
                                <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>


        </div>
    );
};
