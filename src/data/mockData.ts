import { realProducts } from './realProducts';

export const categories = [
    {
        id: 'ofis-kirtasiye',
        name: 'Ofis & Kırtasiye Ürünleri',
        icon: 'Briefcase',
        subcategories: [
            'Sekreterlik', 'Kalemlik & Ataşlık', 'Not Kağıtları ve Bloknot', 'Kırtasiye Seti',
            'Dosya', 'Planlayıcı', 'Masaüstü Organizer', 'Etiket', 'Fotokopi & Baskı Kağıtları',
            'Delgeç', 'Kaşe ve Istampa', 'Paket Lastiği', 'Ofis Aksesuarı', 'Hesap Makinesi', 'Lazer Yazıcı'
        ]
    },
    {
        id: 'kalem-yazi',
        name: 'Kalem & Yazı Gereçleri',
        icon: 'PenTool',
        subcategories: [
            'Kurşun Kalem', 'Keçeli Kalem', 'Fosforlu Kalem', 'Jel Mürekkepli Kalem',
            'Prestij & Dolma Kalem', 'Kuru Boya Kalemi', 'Pastel Boya', 'Guaj Boya',
            'Kalem Uçları', 'Kalemtraş', 'Silgi', 'Mürekkep', 'Sanatsal Kağıt & Kalem'
        ]
    },
    {
        id: 'kisisel-aksesuar',
        name: 'Kişisel Aksesuarlar',
        icon: 'User',
        subcategories: [
            'El Çantası', 'Omuz Çantası', 'Kartlık', 'Kapak & Kılıf', 'Rozet', 'Taç', 'Tırnak Makası'
        ]
    },
    {
        id: 'mutfak-icecek',
        name: 'Mutfak & İçecek Ürünleri',
        icon: 'Coffee',
        subcategories: [
            'Mug', 'Kahve Fincanı', 'Sürahi ve Karaf', 'Suluk & Matara', 'Spor Matara',
            'Karıştırıcı', 'Dripper', 'Limon Sıkacağı', 'Sarımsak Ezici', 'El Rondosu',
            'Tirbuşon', 'Kahve ve Baharat Öğütücü Değirmen', 'Saklama Kabı', 'Kağıt Peçete'
        ]
    },
    {
        id: 'promosyon-kurumsal',
        name: 'Promosyon & Kurumsal Ürünler',
        icon: 'Gift',
        subcategories: [
            'Mousepad', 'Kumbara', 'Kartlık', 'Rozet', 'Hediye Kutusu', 'Kırtasiye Seti'
        ]
    },
    {
        id: 'teknoloji',
        name: 'Teknoloji & Elektronik Aksesuarlar',
        icon: 'Monitor',
        subcategories: [
            'Mousepad', 'Led Işık', 'Lazer Yazıcı'
        ]
    },
    {
        id: 'hobi-oyuncak',
        name: 'Hobi, Oyuncak & Eğitici Ürünler',
        icon: 'Gamepad2',
        subcategories: [
            'Futbol Topu', 'Hamur Şekillendirici', 'Tohumlar', 'Sanatsal Kağıt & Kalem', 'Müzik Kutusu'
        ]
    },
    {
        id: 'ozel-gun',
        name: 'Özel Gün & Sezonluk Ürünler',
        icon: 'Sparkles',
        subcategories: [
            'Kar Küresi', 'Konsept Hediyelik', 'Mum & Kandil'
        ]
    },
    {
        id: 'dekorasyon',
        name: 'Dekorasyon & Özel Ürünler',
        icon: 'Gem',
        subcategories: [
            'Oda Kokusu', 'Mum & Kandil', 'Müzik Kutusu'
        ]
    }
];

// Exporting real products as 'products' so the rest of the app uses them automatically.
// Since the user requested all products to be in all categories, and our CategoryPage 
// by default shows all products (due to mock implementation), this simple export works as intended.
export const products = realProducts;

export const slides = [
    {
        id: 1,
        title: "Ofis İhtiyaçlarında Büyük İndirim",
        subtitle: "Seçili ürünlerde %30'a varan indirimler",
        image: "/slayt/slayt1.jpg",
        cta: "Hemen İncele",
        color: "bg-blue-600"
    },
    {
        id: 2,
        title: "Yeni Sezon Kırtasiye Ürünleri",
        subtitle: "Okula dönüş fırsatlarını kaçırmayın",
        image: "/slayt/slayt2.jpg",
        cta: "Alışverişe Başla",
        color: "bg-orange-500"
    },
    {
        id: 3,
        title: "Teknoloji Haftası Başladı",
        subtitle: "En son teknoloji ürünler şimdi stoklarda",
        image: "/slayt/slayt3.jpg",
        cta: "Keşfet",
        color: "bg-purple-600"
    }
];
