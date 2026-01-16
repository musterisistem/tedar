import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { useCategories } from '../../context/CategoryContext';
import { Link } from 'react-router-dom';
import { slugify } from '../../utils/slugify';

export const Footer: React.FC = () => {
    const { contactPage } = useSite();
    const { categories } = useCategories();

    return (
        <footer className="bg-primary text-gray-300 pt-16 pb-8 font-sans">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                    {/* Column 1: Company Info */}
                    <div className="lg:col-span-1">
                        <div className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="text-secondary">Dörtel</span>
                            <span>Tedarik</span>
                        </div>
                        <p className="text-sm leading-relaxed mb-6 text-gray-400">
                            Modern ve kaliteli alışverişin adresi. Ofis ihtiyaçlarınızdan elektronik ürünlere kadar her şey kapınızda.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center hover:bg-secondary transition-colors"><Facebook className="w-4 h-4" /></a>
                            <a href="#" className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center hover:bg-secondary transition-colors"><Twitter className="w-4 h-4" /></a>
                            <a href="#" className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center hover:bg-secondary transition-colors"><Instagram className="w-4 h-4" /></a>
                            <a href="#" className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center hover:bg-secondary transition-colors"><Linkedin className="w-4 h-4" /></a>
                        </div>
                    </div>

                    {/* Column 2: Kurumsal */}
                    <div>
                        <h3 className="text-white font-bold mb-6">Kurumsal</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/hakkimizda" className="hover:text-secondary transition-colors">Hakkımızda</Link></li>
                            <li><Link to="/mesafeli-satis-sozlesmesi" className="hover:text-secondary transition-colors">Mesafeli Satış Sözleşmesi</Link></li>
                            <li><Link to="/iade-ve-kargo" className="hover:text-secondary transition-colors">İade ve Kargo Şartları</Link></li>
                            <li><Link to="/uyelik-sozlesmesi" className="hover:text-secondary transition-colors">Üyelik Sözleşmesi</Link></li>
                            <li><Link to="/iletisim" className="hover:text-secondary transition-colors">İletişim</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Müşteri Hizmetleri */}
                    <div>
                        <h3 className="text-white font-bold mb-6">Kategoriler</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/kategori/kalem-yazi" className="hover:text-secondary transition-colors">Kalem & Yazı Gereçleri</Link></li>
                            <li><Link to="/kategori/hobi-oyuncak" className="hover:text-secondary transition-colors">Hobi & Oyuncak</Link></li>
                            <li><Link to="/kategori/ozel-gun" className="hover:text-secondary transition-colors">Özel Gün & Sezonluk</Link></li>
                            <li><Link to="/kategori/dekorasyon" className="hover:text-secondary transition-colors">Dekorasyon</Link></li>
                            <li><Link to="/kategori/ofis-kirtasiye" className="hover:text-secondary transition-colors">Ofis & Kırtasiye</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Kategoriler */}
                    <div>
                        <h3 className="text-white font-bold mb-6">Popüler Kategoriler</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/kategori/ofis-kirtasiye-urunleri" className="hover:text-secondary transition-colors">Ofis Kırtasiye</Link></li>
                            <li><Link to="/kategori/teknoloji-elektronik-aksesuarlar" className="hover:text-secondary transition-colors">Elektronik</Link></li>
                            <li><Link to="/kategori/mutfak-icecek-urunleri" className="hover:text-secondary transition-colors">Mutfak Ürünleri</Link></li>
                            <li><Link to="/kategori/kisisel-aksesuarlar" className="hover:text-secondary transition-colors">Kişisel Aksesuarlar</Link></li>
                            <li><Link to="/kategori/promosyon-kurumsal-urunler" className="hover:text-secondary transition-colors">Promosyon Ürünleri</Link></li>
                        </ul>
                    </div>

                    {/* Column 5: İletişim & Bülten - Dynamic from SiteContext */}
                    <div>
                        <h3 className="text-white font-bold mb-6">Bize Ulaşın</h3>
                        <ul className="space-y-4 text-sm mb-6">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-secondary flex-shrink-0" />
                                <span>{contactPage?.address || 'İstoç Ticaret Merkezi, 24. Ada No:12 Bağcılar / İSTANBUL'}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-secondary flex-shrink-0" />
                                <span>{contactPage?.phone || '+90 (212) 123 45 67'}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
                                <span>{contactPage?.email || 'info@dorteltedarik.com'}</span>
                            </li>
                        </ul>

                        <h4 className="text-white font-semibold text-sm mb-3">Bültenimize Abone Olun</h4>
                        <div className="flex">
                            <input type="email" placeholder="E-posta adresiniz" className="bg-gray-800 text-white px-4 py-2 rounded-l-md w-full focus:outline-none focus:ring-1 focus:ring-secondary text-sm" />
                            <button className="bg-secondary text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors">OK</button>
                        </div>
                    </div>
                </div>

                {/* SEO Text & Main Categories */}
                <div className="border-t border-gray-800 pt-8 pb-8 mb-4">
                    <div className="text-center mb-8">
                        <h2 className="text-lg font-bold text-white mb-4">Ofis & Kırtasiye Ürünleri ve Kurumsal Çözümler</h2>
                        <p className="text-sm text-gray-400 max-w-4xl mx-auto leading-relaxed">
                            Dörtel Tedarik, <strong>Ofis & Kırtasiye Ürünleri</strong> konusunda sektörün güvenilir ismidir. İş yerinizin ve okulunuzun ihtiyacı olan tüm <strong>Ofis & Kırtasiye Ürünleri</strong>ni en uygun fiyatlarla sunuyoruz.
                            Geniş ürün yelpazemiz içerisinde kağıt ürünlerinden dosyalama sistemlerine, kalem çeşitlerinden masaüstü gereçlerine kadar binlerce <strong>Ofis & Kırtasiye Ürünleri</strong> bulunmaktadır.
                            Kaliteli ve ekonomik <strong>Ofis & Kırtasiye Ürünleri</strong> arıyorsanız, doğru adrestesiniz. Siparişlerinizi hızlı ve güvenli bir şekilde kapınıza teslim ediyoruz.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/kategori/${slugify(cat.name)}`}
                                className="px-4 py-2 border border-gray-700 rounded-lg text-sm text-gray-400 hover:text-white hover:border-secondary hover:bg-gray-800 transition-all duration-300"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <p className="text-sm text-gray-500">
                            © 2026 Dörtel Tedarik. Tüm hakları saklıdır.
                        </p>
                        {/* SEO Backlink */}
                        <p className="text-xs text-gray-600">
                            WebCode: <a
                                href="https://bursawebtasarimhizmeti.com.tr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary hover:text-blue-400 transition-colors"
                            >
                                Bursa Web Tasarım
                            </a>
                        </p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
                        {/* SSL Badge */}
                        <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700 hover:border-green-500/30 transition-colors cursor-help group">
                            <ShieldCheck className="w-4 h-4 text-green-500 group-hover:text-green-400 transition-colors" />
                            <span className="text-xs font-medium text-gray-300 group-hover:text-white">256 Bit SSL Güvenli Ödeme</span>
                        </div>

                        {/* Payment Logos */}
                        <div className="flex items-center gap-2">
                            <div className="bg-white px-2 py-1 rounded h-6 w-10 flex items-center justify-center">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="max-h-full max-w-full" />
                            </div>
                            <div className="bg-white px-2 py-1 rounded h-6 w-10 flex items-center justify-center">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="max-h-full max-w-full" />
                            </div>
                            <div className="bg-white px-2 py-1 rounded h-6 w-10 flex items-center justify-center">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Troy_logo.png/200px-Troy_logo.png" alt="Troy" className="max-h-full max-w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer >
    );
};

