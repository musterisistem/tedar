import React, { useEffect, useState } from 'react';
import { Truck, Shield, CheckCircle, Clock } from 'lucide-react';
import { useProducts, type Product } from '../../context/ProductContext';
import { Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import { slugify } from '../../utils/slugify';

interface ProductFeaturesProps {
    currentProductId?: string;
}

export const ProductFeatures: React.FC<ProductFeaturesProps> = ({ currentProductId }) => {
    const { featureBoxes } = useSite();
    const { products } = useProducts();
    const [lastVisited, setLastVisited] = useState<Product | null>(null);

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('visited_products') || '[]');
        // Find the first product in history that is NOT the current one
        const lastId = history.find((id: string) => id !== currentProductId);

        if (lastId) {
            const product = products.find(p => p.id === lastId);
            if (product) {
                setLastVisited(product);
            }
        }
    }, [currentProductId]);

    // Icon mapping
    const iconMap = {
        Truck,
        Shield,
        CheckCircle
    };

    const features = featureBoxes.map(box => ({
        ...box,
        icon: iconMap[box.icon as keyof typeof iconMap] || Truck
    }));

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                        <div
                            key={index}
                            className={`${feature.bgColor} ${feature.borderColor} border-2 rounded-xl p-4 flex items-start gap-3 hover:shadow-md transition-shadow`}
                        >
                            <div className={`${feature.iconColor} flex-shrink-0 mt-0.5`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm mb-0.5">{feature.title}</h4>
                                <p className="text-xs text-gray-600">{feature.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recently Visited Widget */}
            {lastVisited && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wide">En Son Ziyaret Edilen</h4>
                    </div>
                    <Link to={`/${slugify(lastVisited.name)}`} className="flex gap-3 group">
                        <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                            <img src={lastVisited.image} alt={lastVisited.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                                {lastVisited.name}
                            </h5>
                            <span className="text-sm font-bold text-blue-600">
                                {lastVisited.price.current.toLocaleString('tr-TR')} TL
                            </span>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
};
