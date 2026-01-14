import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, ChevronUp, Check, SlidersHorizontal } from 'lucide-react';
import { useCategories } from '../../context/CategoryContext';
import { Link, useParams } from 'react-router-dom';

export interface FilterState {
    minPrice: string;
    maxPrice: string;
    brands: string[];
    rating: number | null;
}

interface ProductFilterSidebarProps {
    availableBrands: string[];
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
}

export const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({
    availableBrands,
    filters,
    setFilters
}) => {
    const { slug } = useParams();
    const { categories } = useCategories();

    // Collapsible sections state
    const [openSections, setOpenSections] = useState({
        categories: true,
        price: true,
        brands: true,
        rating: true
    });

    // Track expanded categories for accordion behavior
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

    // Local state for price inputs (apply only on button click)
    const [localPrice, setLocalPrice] = useState({ min: filters.minPrice, max: filters.maxPrice });

    // Sync local price if props change
    useEffect(() => {
        setLocalPrice({ min: filters.minPrice, max: filters.maxPrice });
    }, [filters.minPrice, filters.maxPrice]);

    // Auto-expand active category
    useEffect(() => {
        if (slug) {
            setExpandedCategories(prev => {
                if (!prev.includes(slug)) {
                    return [...prev, slug];
                }
                return prev;
            });
        }
    }, [slug]);

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleBrandToggle = (brand: string) => {
        const newBrands = filters.brands.includes(brand)
            ? filters.brands.filter(b => b !== brand)
            : [...filters.brands, brand];
        setFilters({ ...filters, brands: newBrands });
    };

    const applyPrice = () => {
        setFilters({ ...filters, minPrice: localPrice.min, maxPrice: localPrice.max });
    };

    const toggleCategory = (e: React.MouseEvent, catId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedCategories(prev =>
            prev.includes(catId)
                ? prev.filter(id => id !== catId)
                : [...prev, catId]
        );
    };

    const slugify = (text: string) => text
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');

    return (
        <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2 pb-3 border-b border-gray-100">
                <SlidersHorizontal className="w-5 h-5 text-secondary" />
                Filtreler
            </h2>
            <div className="space-y-6">
                {/* Categories */}
                <div className="overflow-hidden">
                    <div
                        className="flex justify-between items-center cursor-pointer mb-3"
                        onClick={() => toggleSection('categories')}
                    >
                        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Kategoriler</h3>
                        {openSections.categories ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                    {openSections.categories && (
                        <div className="p-2">
                            <ul className="space-y-1">
                                {categories.map((cat) => {
                                    const isCurrentCategory = slug === cat.id;
                                    const isExpanded = expandedCategories.includes(cat.id);

                                    return (
                                        <li key={cat.id}>
                                            <div className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${isCurrentCategory
                                                ? 'bg-blue-50 text-blue-700 font-bold'
                                                : 'text-gray-700 font-bold hover:bg-gray-50'
                                                }`}>
                                                <Link
                                                    to={`/kategori/${slugify(cat.name)}`}
                                                    className="flex-1"
                                                >
                                                    {cat.name}
                                                </Link>

                                                {/* Accordion Trigger */}
                                                {cat.subcategories && cat.subcategories.length > 0 && (
                                                    <button
                                                        onClick={(e) => toggleCategory(e, cat.id)}
                                                        className="p-1 hover:bg-gray-200 rounded-full transition-colors ml-2"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-4 h-4 text-gray-500" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Subcategories (Show if expanded) */}
                                            {isExpanded && cat.subcategories && (
                                                <ul className="mt-1 ml-2 pl-2 border-l-2 border-blue-100 space-y-1 animate-slideDown">
                                                    {cat.subcategories.map((sub) => {
                                                        const subSlug = slugify(sub);
                                                        const isSubActive = window.location.pathname.includes(`/${subSlug}`);

                                                        return (
                                                            <li key={sub}>
                                                                <Link
                                                                    to={`/kategori/${cat.id}/${subSlug}`}
                                                                    className={`block px-3 py-1.5 text-xs rounded-md transition-colors ${isSubActive
                                                                        ? 'text-blue-600 bg-white font-medium shadow-sm'
                                                                        : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    {sub}
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Price Filter */}
                <div className="border-t border-gray-100 pt-5">
                    <div
                        className="flex justify-between items-center cursor-pointer mb-3"
                        onClick={() => toggleSection('price')}
                    >
                        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Fiyat Aralığı</h3>
                        {openSections.price ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                    {openSections.price && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={localPrice.min}
                                    onChange={(e) => setLocalPrice(prev => ({ ...prev, min: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-secondary focus:bg-white transition-colors"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={localPrice.max}
                                    onChange={(e) => setLocalPrice(prev => ({ ...prev, max: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-secondary focus:bg-white transition-colors"
                                />
                            </div>
                            <button
                                onClick={applyPrice}
                                className="w-full py-2 bg-secondary text-white rounded-md text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Uygula
                            </button>
                        </div>
                    )}
                </div>

                {/* Brands Filter */}
                <div className="border-t border-gray-100 pt-5">
                    <div
                        className="flex justify-between items-center cursor-pointer mb-3"
                        onClick={() => toggleSection('brands')}
                    >
                        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Markalar</h3>
                        {openSections.brands ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                    {openSections.brands && (
                        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 pr-1">
                            {availableBrands.length > 0 ? (
                                availableBrands.map((brand) => (
                                    <label key={brand} className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 p-1 rounded -mx-1 transition-colors">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.brands.includes(brand) ? 'bg-secondary border-secondary' : 'border-gray-300 bg-white group-hover:border-secondary'}`}>
                                            {filters.brands.includes(brand) && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={filters.brands.includes(brand)}
                                            onChange={() => handleBrandToggle(brand)}
                                        />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">{brand}</span>
                                    </label>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">Marka bulunamadı</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Rating Filter */}
                <div className="border-t border-gray-100 pt-5">
                    <div
                        className="flex justify-between items-center cursor-pointer mb-3"
                        onClick={() => toggleSection('rating')}
                    >
                        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Yıldız Puanı</h3>
                        {openSections.rating ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                    {openSections.rating && (
                        <div className="space-y-1">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div
                                    key={star}
                                    className={`flex items-center gap-2 cursor-pointer p-2 rounded-md transition-all ${filters.rating === star ? 'bg-orange-50 border border-orange-100' : 'hover:bg-gray-50 border border-transparent'}`}
                                    onClick={() => setFilters({ ...filters, rating: filters.rating === star ? null : star })}
                                >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${filters.rating === star ? 'border-orange-500' : 'border-gray-300'}`}>
                                        {filters.rating === star && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3.5 h-3.5 ${i < star ? 'fill-orange-400 text-orange-400' : 'text-gray-200'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium ml-auto">& Üzeri</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
