import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/mockData';
import * as Icons from 'lucide-react';
import { ChevronRight } from 'lucide-react';

export const HomeSidebar: React.FC = () => {
    return (
        <div className="bg-white rounded-b-lg border-2 border-gray-200 border-t-0 shadow-lg overflow-hidden h-full flex flex-col">
            <div className="p-3 bg-secondary text-white font-bold flex items-center text-base flex-shrink-0">
                Kategoriler
            </div>
            <ul className="flex-1 py-2 overflow-hidden">
                {categories.map((cat) => {
                    const IconComponent = (Icons as any)[cat.icon] || Icons.Circle;
                    return (
                        <li key={cat.id}>
                            <Link to={`/category/${cat.id}`} className="group flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                                        <IconComponent className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-gray-800 group-hover:text-blue-600">{cat.name}</span>
                                        {/* Optional: Show subcategory count or hint */}
                                        <span className="text-[10px] text-gray-400 group-hover:text-blue-400 font-normal">
                                            {cat.subcategories ? `${cat.subcategories.length} Alt Kategori` : ''}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-blue-600 transition-all flex-shrink-0" />
                            </Link>
                        </li>
                    );
                })}
                <li className="border-t-2 border-gray-200 mt-2 pt-2">
                    <Link to="/campaigns" className="flex items-center justify-between px-4 py-2.5 text-red-600 font-bold hover:bg-red-50 transition-colors text-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icons.Percent className="w-4 h-4 text-red-600" />
                            </div>
                            <span>KAMPANYALAR</span>
                        </div>
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    </Link>
                </li>
            </ul>
        </div>
    );
};
