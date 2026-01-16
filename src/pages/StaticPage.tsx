import React from 'react';
import { useSite } from '../context/SiteContext';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface StaticPageProps {
    pageKey: 'distanceSalesAgreement' | 'returnConditions' | 'membershipAgreement';
}

const StaticPage: React.FC<StaticPageProps> = ({ pageKey }) => {
    const { policyPages } = useSite();
    const page = policyPages?.[pageKey];

    if (!page) {
        return <div className="container mx-auto px-4 py-8 text-center bg-gray-50 rounded-lg mt-8">Sayfa yükleniyor...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Simple Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Link to="/" className="hover:text-secondary flex items-center gap-1">
                            <Home className="w-3 h-3" /> Ana Sayfa
                        </Link>
                        <ChevronRight className="w-3 h-3 text-gray-300" />
                        <span className="text-gray-900 font-medium">{page.title}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-12">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 border-b border-gray-100 pb-4">{page.title}</h1>
                    <div
                        className="prose prose-slate prose-sm md:prose-base max-w-none text-gray-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </div>
            </div>
        </div>
    );
};

export default StaticPage;
