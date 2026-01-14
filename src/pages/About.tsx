import React from 'react';
import { Award, Users, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useSite } from '../context/SiteContext';
import { SEOHead, BreadcrumbSchema } from '../components/seo';

export const About: React.FC = () => {
    const { aboutPage } = useSite();

    // Icon mapping helper
    const getIcon = (iconName: string) => {
        const icons: any = { Award, Users, Target, TrendingUp };
        return icons[iconName] || Award;
    };

    return (
        <div className="bg-white min-h-screen pb-12">
            <SEOHead
                title="Hakkımızda"
                description={aboutPage.heroDescription || "Dörtel Tedarik hakkında bilgi edinin. Vizyonumuz, misyonumuz ve değerlerimiz."}
                url="/hakkimizda"
                type="article"
            />
            <BreadcrumbSchema items={[
                { name: 'Ana Sayfa', url: '/' },
                { name: 'Hakkımızda', url: '/hakkimizda' }
            ]} />

            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-blue-900 to-slate-900 text-white py-20 lg:py-28 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-10 bg-cover bg-center"
                    style={{ backgroundImage: `url('${aboutPage.heroImage}')` }}
                ></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">{aboutPage.heroTitle}</h1>
                    <p className="text-lg lg:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
                        {aboutPage.heroDescription}
                    </p>
                    <Link to="/iletisim" className="inline-flex items-center gap-2 bg-white text-blue-900 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg">
                        Bizimle Tanışın <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Who We Are */}
            <div className="container mx-auto px-4 py-16 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            Hakkımızda
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            {aboutPage.missionTitle}
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            {aboutPage.missionText1}
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            {aboutPage.missionText2}
                        </p>

                        <div className="grid grid-cols-2 gap-6 pt-4">
                            <div className="flex flex-col gap-2">
                                <h4 className="text-3xl font-bold text-gray-900">{aboutPage.stats.years}</h4>
                                <p className="text-sm text-gray-500 font-medium">{aboutPage.stats.yearsLabel}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h4 className="text-3xl font-bold text-gray-900">{aboutPage.stats.customers}</h4>
                                <p className="text-sm text-gray-500 font-medium">{aboutPage.stats.customersLabel}</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative z-10">
                            <img
                                src={aboutPage.officeImage}
                                alt="Dörtel Tedarik Ofisi"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-2/3 aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border-4 border-white z-20 hidden lg:block">
                            <img
                                src={aboutPage.meetingImage}
                                alt="Toplantı Odası"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute top-10 -left-10 w-24 h-24 bg-blue-100 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute bottom-10 -right-10 w-32 h-32 bg-orange-100 rounded-full blur-3xl -z-10"></div>
                    </div>
                </div>
            </div>

            {/* Values */}
            <div className="bg-gray-50 py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Değerlerimiz</h2>
                        <p className="text-gray-600">
                            Bizi biz yapan ve her gün daha iyisini yapmamız için bize ilham veren temel prensiplerimiz.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {aboutPage.values.map((item, index) => {
                            const IconComponent = getIcon(item.icon);
                            return (
                                <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
                                    <div className={`w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <IconComponent className={`w-7 h-7 text-blue-600`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="container mx-auto px-4 py-16">
                <div className="bg-blue-600 rounded-3xl p-8 lg:p-16 text-center text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ofisinizin İhtiyaçlarını Karşılamaya Hazırız</h2>
                        <p className="text-blue-100 max-w-2xl mx-auto mb-8 text-lg">
                            Binlerce ürün çeşidi ve kurumsal avantajlarla tanışmak için hemen alışverişe başlayın.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/" className="bg-white text-blue-600 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg">
                                Alışverişe Başla
                            </Link>
                            <Link to="/iletisim" className="bg-blue-700 text-white border border-blue-500 px-8 py-3.5 rounded-xl font-bold hover:bg-blue-800 transition-colors">
                                İletişime Geç
                            </Link>
                        </div>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                </div>
            </div>
        </div>
    );
};
