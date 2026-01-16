import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface Slide {
    id: number;
    image: string;
    title: string;
    description: string;
    link?: string;
    order: number;
    showText?: boolean;
}

export interface Banner {
    id: number;
    image: string;
    link: string;
    title?: string;
    order: number;
}

export interface Campaign {
    id: number;
    title: string;
    subtitle: string;
    buttonText: string;
    image: string;
    link: string;
    order: number;
    showText?: boolean;
}

export interface FeatureBox {
    id: number;
    icon: 'Truck' | 'Shield' | 'CheckCircle';
    title: string;
    description: string;
    bgColor: string;
    iconColor: string;
    borderColor: string;
}

export interface PromoBox {
    title: string;
    description: string;
    icon: 'Truck' | 'Zap' | 'Shield' | 'Star';
    buttonText: string;
    bgColor: string;
    iconBgColor: string;
    textColor: string;
    btnBgColor: string;
    btnTextColor: string;
}

export interface BankDetail {
    id: string;
    bankName: string;
    accountHolder: string;
    iban: string;
}

export interface AboutPageData {
    heroTitle: string;
    heroDescription: string;
    heroImage: string;
    missionTitle: string;
    missionText1: string;
    missionText2: string;
    stats: {
        years: string;
        yearsLabel: string;
        customers: string;
        customersLabel: string;
    };
    officeImage: string;
    meetingImage: string;
    values: {
        title: string;
        description: string;
        icon: string; // We'll store icon name as string
    }[];
}

export interface ContactPageData {
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
    supportEmail: string;
    workingHoursWeek: string;
    workingHoursWeekend: string;
    mapEmbedUrl: string;
}

export interface PopularCategoryItem {
    id: string;
    name: string;
    type: 'category' | 'subcategory';
    parentId?: string;
}

export interface PaymentSettings {
    isCreditCardActive: boolean;
    creditCardDescription: string;
    isCashOnDeliveryActive: boolean;
    cashOnDeliveryDescription: string;
    cashOnDeliveryFee: number;
    isBankTransferActive: boolean;
    bankTransferDescription: string;
    bankDetails: BankDetail[];
}

export interface FreeShippingBannerSettings {
    isActive: boolean;
    thresholdText: string;
    messageText: string;
    highlightText: string;
    buttonText: string;
    linkUrl: string;
}

interface SiteContextType {
    slides: Slide[];
    updateSlides: (slides: Slide[]) => void;
    banners: Banner[];
    updateBanners: (banners: Banner[]) => void;
    campaigns: Campaign[];
    updateCampaigns: (campaigns: Campaign[]) => void;
    featureBoxes: FeatureBox[];
    updateFeatureBoxes: (boxes: FeatureBox[]) => void;
    promoBox: PromoBox;
    updatePromoBox: (box: PromoBox) => void;
    paymentSettings: PaymentSettings;
    updatePaymentSettings: (settings: PaymentSettings) => void;
    popularCategories: PopularCategoryItem[];
    updatePopularCategories: (items: PopularCategoryItem[]) => void;
    deliveryConditions: string[];
    updateDeliveryConditions: (conditions: string[]) => void;
    aboutPage: AboutPageData;
    updateAboutPage: (data: AboutPageData) => void;
    contactPage: ContactPageData;
    updateContactPage: (data: ContactPageData) => void;
    freeShippingBanner: FreeShippingBannerSettings;
    updateFreeShippingBanner: (settings: FreeShippingBannerSettings) => void;
    policyPages: PolicyPages;
    updatePolicyPages: (pages: PolicyPages) => void;
    saveSiteSettings: (overrides?: any) => Promise<{ success: boolean; message: string }>;
}

export interface PolicyPage {
    title: string;
    content: string;
}

export interface PolicyPages {
    distanceSalesAgreement: PolicyPage;
    returnConditions: PolicyPage;
    membershipAgreement: PolicyPage;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

// Initial data loaded from JSON
import siteSettings from '../data/siteSettings.json';

export const SiteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Verileri sunucudan çek
    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings/siteSettings.json?t=' + Date.now());
                if (response.ok) {
                    const result = await response.json();

                    // Veri yapısı kontrolü: result.data içinde mi yoksa direkt kökte mi?
                    // server.js kaydederken: { filename, data: { ... } } -> dosyaya JSON.stringify(data.data) yazıyor.
                    // Yani dosya içeriği direkt settings objesi.
                    // Ancak okuma endpoint'i dosyayı olduğu gibi dönüyor.
                    // Dolayısıyla result direkt settings objesi olmalı.

                    const data = result.data || result; // Güvenlik önlemi

                    if (data.slides) setSlides(data.slides);
                    if (data.banners) setBanners(data.banners);
                    if (data.campaigns) setCampaigns(data.campaigns.map((c: any) => ({ ...c, showText: c.showText ?? true })));
                    if (data.featureBoxes) setFeatureBoxes(data.featureBoxes);
                    if (data.promoBox) setPromoBox(data.promoBox);
                    if (data.paymentSettings) setPaymentSettings(data.paymentSettings);
                    if (data.popularCategories) setPopularCategories(data.popularCategories);
                    if (data.deliveryConditions) setDeliveryConditions(data.deliveryConditions);
                    if (data.aboutPage) setAboutPage(data.aboutPage);
                    if (data.contactPage) setContactPage(data.contactPage);
                    if (data.freeShippingBanner) setFreeShippingBanner(data.freeShippingBanner);
                    if (data.policyPages) setPolicyPages(data.policyPages);
                }
            } catch (error) {
                console.error('Site ayarları yüklenemedi:', error);
            }
        };

        fetchSettings();
    }, []);



    const [slides, setSlides] = useState<Slide[]>(() => {
        const saved = localStorage.getItem('site_slides');
        if (saved) return JSON.parse(saved);
        const data = (siteSettings as any).data || siteSettings;
        return data.slides || [];
    });

    const [banners, setBanners] = useState<Banner[]>(() => {
        const saved = localStorage.getItem('site_banners');
        if (saved) return JSON.parse(saved);
        const data = (siteSettings as any).data || siteSettings;
        return data.banners || [];
    });

    const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
        const saved = localStorage.getItem('site_campaigns');
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.map((c: Campaign) => ({ ...c, showText: c.showText ?? true }));
        }
        const data = (siteSettings as any).data || siteSettings;
        return (data.campaigns || []).map((c: any) => ({ ...c, showText: c.showText ?? true }));
    });

    const [featureBoxes, setFeatureBoxes] = useState<FeatureBox[]>(() => {
        const saved = localStorage.getItem('site_feature_boxes');
        if (saved) return JSON.parse(saved);
        const data = (siteSettings as any).data || siteSettings;
        return data.featureBoxes || [];
    });

    const [promoBox, setPromoBox] = useState<PromoBox>(() => {
        const saved = localStorage.getItem('site_promo_box');
        if (saved) return JSON.parse(saved);
        const data = (siteSettings as any).data || siteSettings;
        return data.promoBox || {};
    });

    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
        const saved = localStorage.getItem('site_payment_settings');
        if (saved) return JSON.parse(saved);
        const data = (siteSettings as any).data || siteSettings;
        return data.paymentSettings || {};
    });

    const [popularCategories, setPopularCategories] = useState<PopularCategoryItem[]>(() => {
        const saved = localStorage.getItem('site_popular_categories');
        if (saved) return JSON.parse(saved);
        const data = (siteSettings as any).data || siteSettings;
        return data.popularCategories || [];
    });

    const [deliveryConditions, setDeliveryConditions] = useState<string[]>(() => {
        const saved = localStorage.getItem('site_delivery_conditions');
        if (saved) return JSON.parse(saved);
        const data = (siteSettings as any).data || siteSettings;
        return data.deliveryConditions || [
            'Siparişleriniz 24 saat içerisinde kargoya verilir.',
            '1500 TL ve üzeri alışverişlerinizde kargo ücretsizdir.',
            'Memnun kalmadığınız ürünleri 14 gün içerisinde koşulsuz iade edebilirsiniz.',
            'İade işlemlerinde kargo ücreti tarafımıza aittir.'
        ];
    });

    const [aboutPage, setAboutPage] = useState<AboutPageData>(() => {
        const saved = localStorage.getItem('site_about_page');
        if (saved) return JSON.parse(saved);
        const data = (siteSettings as any).data || siteSettings;
        return data.aboutPage || {
            heroTitle: "İşinizi Büyütmenize Ortak Oluyoruz",
            heroDescription: "Dörtel Tedarik olarak, ofis ihtiyaçlarınızdan kurumsal çözümlere kadar her adımda yanınızdayız. Kalite, hız ve güvenin adresi.",
            heroImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
            missionTitle: "Ofis Malzemeleri ve Kurumsal Tedarik Sektöründe Öncü Çözümler",
            missionText1: "Dörtel Tedarik, kurulduğu günden bu yana işletmelerin ofis yaşamını kolaylaştırmayı, verimliliği artıracak ürünleri en hızlı ve güvenilir şekilde ulaştırmayı misyon edinmiştir. Kırtasiyeden ofis mobilyasına, teknolojiden temizlik ürünlerine kadar geniş ürün yelpazemizle 81 ilde binlerce müşterimize hizmet veriyoruz.",
            missionText2: "Sektördeki tecrübemiz ve güçlü lojistik ağımız sayesinde, ihtiyaç duyduğunuz her an yanınızdayız. Müşteri memnuniyetini merkeze alan hizmet anlayışımızla, sadece bir tedarikçi değil, iş ortağınız olmayı hedefliyoruz.",
            stats: {
                years: "15+",
                yearsLabel: "Yıllık Tecrübe",
                customers: "10k+",
                customersLabel: "Mutlu Müşteri"
            },
            officeImage: "/images/about-kirtasiye.png",
            meetingImage: "/images/about-ofis.jpg",
            values: [
                {
                    title: "Kalite Odaklılık",
                    description: "En iyi markaları ve en dayanıklı ürünleri titizlikle seçerek sizlere sunuyoruz.",
                    icon: "Award"
                },
                {
                    title: "Müşteri Mutluluğu",
                    description: "Satış öncesi ve sonrası destek ekibimizle her zaman yanınızdayız.",
                    icon: "Users"
                },
                {
                    title: "Hızlı Teslimat",
                    description: "Gelişmiş lojistik ağımızla siparişlerinizi en kısa sürede kapınıza getiriyoruz.",
                    icon: "Target"
                },
                {
                    title: "Sürekli Gelişim",
                    description: "Teknolojiyi ve trendleri takip ederek hizmet kalitemizi sürekli artırıyoruz.",
                    icon: "TrendingUp"
                }
            ]
        };
    });

    const [contactPage, setContactPage] = useState<ContactPageData>(() => {
        const saved = localStorage.getItem('site_contact_page');
        if (saved) return JSON.parse(saved);
        const data = (siteSettings as any).data || siteSettings;
        return data.contactPage || {
            address: "İstoç Ticaret Merkezi, 24. Ada No:12 Bağcılar / İSTANBUL",
            phone: "+90 (212) 123 45 67",
            whatsapp: "+90 (555) 123 45 67",
            email: "info@dorteltedarik.com",
            supportEmail: "destek@dorteltedarik.com",
            workingHoursWeek: "Pazartesi - Cuma: 09:00 - 18:00",
            workingHoursWeekend: "Cumartesi: 09:00 - 14:00",
            mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12033.479577742885!2d28.816667!3d41.0625!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa5186b8c4c77%3A0x66415758f2d5930b!2zQmHEn2PEsWxhciwgxLBzdGFuYnVs!5e0!3m2!1str!2str!4v1650000000000!5m2!1str!2str"
        };
    });

    const [freeShippingBanner, setFreeShippingBanner] = useState<FreeShippingBannerSettings>(() => {
        const saved = localStorage.getItem('site_free_shipping_banner');
        if (saved) return JSON.parse(saved);
        const data = (siteSettings as any).data || siteSettings;
        return data.freeShippingBanner || {
            isActive: true,
            thresholdText: "1500 TL",
            messageText: "ve Üzeri Siparişlerde",
            highlightText: "KARGO BİZDEN!",
            buttonText: "Alışverişe Başla",
            linkUrl: "/kampanyalar"
        };
    });

    const [policyPages, setPolicyPages] = useState<PolicyPages>(() => {
        const saved = localStorage.getItem('site_policy_pages');
        if (saved) return JSON.parse(saved);
        const data = (siteSettings as any).data || siteSettings;
        return data.policyPages || {
            distanceSalesAgreement: { title: 'Mesafeli Satış Sözleşmesi', content: '<p>Mesafeli satış sözleşmesi içeriği buraya gelecek.</p>' },
            returnConditions: { title: 'İade ve Kargo Şartları', content: '<p>İade ve kargo şartları içeriği buraya gelecek.</p>' },
            membershipAgreement: { title: 'Üyelik Sözleşmesi', content: '<p>Üyelik sözleşmesi içeriği buraya gelecek.</p>' }
        };
    });

    const updateSlides = (newSlides: Slide[]) => {
        setSlides(newSlides);
        localStorage.setItem('site_slides', JSON.stringify(newSlides));
    };

    const updateBanners = (newBanners: Banner[]) => {
        setBanners(newBanners);
        localStorage.setItem('site_banners', JSON.stringify(newBanners));
    };

    const updateCampaigns = (newCampaigns: Campaign[]) => {
        setCampaigns(newCampaigns);
        localStorage.setItem('site_campaigns', JSON.stringify(newCampaigns));
    };

    const updateFeatureBoxes = (newBoxes: FeatureBox[]) => {
        setFeatureBoxes(newBoxes);
        localStorage.setItem('site_feature_boxes', JSON.stringify(newBoxes));
    };

    const updatePromoBox = (newBox: PromoBox) => {
        setPromoBox(newBox);
        localStorage.setItem('site_promo_box', JSON.stringify(newBox));
    };

    const updatePaymentSettings = (newSettings: PaymentSettings) => {
        setPaymentSettings(newSettings);
        localStorage.setItem('site_payment_settings', JSON.stringify(newSettings));
    };

    const updatePopularCategories = (newItems: PopularCategoryItem[]) => {
        setPopularCategories(newItems);
        localStorage.setItem('site_popular_categories', JSON.stringify(newItems));
    };

    const updateDeliveryConditions = (newConditions: string[]) => {
        setDeliveryConditions(newConditions);
        localStorage.setItem('site_delivery_conditions', JSON.stringify(newConditions));
    };

    const updateAboutPage = (newData: AboutPageData) => {
        setAboutPage(newData);
        localStorage.setItem('site_about_page', JSON.stringify(newData));
    };

    const updateContactPage = (newData: ContactPageData) => {
        setContactPage(newData);
        localStorage.setItem('site_contact_page', JSON.stringify(newData));
    };

    const updateFreeShippingBanner = (newSettings: FreeShippingBannerSettings) => {
        setFreeShippingBanner(newSettings);
        localStorage.setItem('site_free_shipping_banner', JSON.stringify(newSettings));
    };

    const updatePolicyPages = (newPages: PolicyPages) => {
        setPolicyPages(newPages);
        localStorage.setItem('site_policy_pages', JSON.stringify(newPages));
    }

    const saveSiteSettings = async (overrides?: any) => {
        const settings = {
            filename: 'siteSettings.json',
            data: {
                slides,
                banners,
                campaigns,
                featureBoxes,
                promoBox,
                paymentSettings,
                popularCategories,
                deliveryConditions,
                aboutPage,
                contactPage,
                freeShippingBanner,
                policyPages,
                ...overrides
            }
        };

        try {
            const response = await fetch('/api/save-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Sunucuya bağlanılamadı.', error };
        }
    };

    return (
        <SiteContext.Provider value={{
            slides, updateSlides,
            banners, updateBanners,
            campaigns, updateCampaigns,
            featureBoxes, updateFeatureBoxes,
            promoBox, updatePromoBox,
            paymentSettings, updatePaymentSettings,
            popularCategories, updatePopularCategories,
            deliveryConditions, updateDeliveryConditions,
            aboutPage, updateAboutPage,
            contactPage, updateContactPage,
            freeShippingBanner, updateFreeShippingBanner,
            policyPages, updatePolicyPages,
            saveSiteSettings
        }}>
            {children}
        </SiteContext.Provider>
    );
};

export const useSite = () => {
    const context = useContext(SiteContext);
    if (!context) {
        throw new Error('useSite must be used within a SiteProvider');
    }
    return context;
};
