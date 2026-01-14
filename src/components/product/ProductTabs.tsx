import React, { useState } from 'react';
import { FileText, Settings, Truck, Star } from 'lucide-react';
import { useUsers } from '../../context/UserContext';
import { useSite } from '../../context/SiteContext';

interface ProductTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    product: any;
    reviews: Review[];
    onAddReview: (review: Review) => void;
}

interface Review {
    user: string;
    comment: string;
    rating: number;
    date: string;
    hasPhoto: boolean;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({ activeTab, setActiveTab, product, reviews, onAddReview }) => {
    const { currentUser } = useUsers();
    const { deliveryConditions } = useSite();
    const [reviewFilter, setReviewFilter] = useState<string | number>('all');
    const [newReviewRating, setNewReviewRating] = useState(5);
    const [newReviewComment, setNewReviewComment] = useState('');

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !newReviewComment.trim()) return;

        const newReview: Review = {
            user: currentUser.name || currentUser.email.split('@')[0],
            comment: newReviewComment.trim(),
            rating: newReviewRating,
            date: "Az önce",
            hasPhoto: false
        };

        onAddReview(newReview);
        setNewReviewComment('');
        setNewReviewRating(5);
    };

    const tabs = [
        { id: 'desc', label: 'Ürün Açıklaması', icon: FileText },
        { id: 'specs', label: 'Teknik Özellikler', icon: Settings },
        { id: 'reviews', label: `Yorumlar (${reviews.length})`, icon: Star },
        { id: 'shipping', label: 'Teslimat ve İade', icon: Truck }
    ];

    const filteredReviews = reviews.filter(review => {
        if (reviewFilter === 'all') return true;
        if (reviewFilter === 'photo') return review.hasPhoto;
        return review.rating === reviewFilter;
    });

    return (
        <div className="mt-12" id="product-reviews-section">
            {/* ... (Tabs Header Block - UNCHANGED) */}
            <div className="bg-gray-50 rounded-t-xl border-b-2 border-blue-600 p-2">
                <div className="flex gap-2 text-sm md:text-base overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-4 px-6 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 p-8">
                <div className="text-gray-600 leading-relaxed space-y-4 animate-fadeIn">
                    {activeTab === 'desc' && (
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-blue-600" />
                                Ürün Hakkında
                            </h3>
                            <p className="text-base">{product.description}</p>
                        </div>
                    )}

                    {activeTab === 'specs' && (
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Settings className="w-6 h-6 text-blue-600" />
                                Teknik Detaylar
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <span className="font-bold text-gray-900">Ürün Rengi</span>
                                    <span className="text-gray-600">{product.specs?.color || "Belirtilmemiş"}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <span className="font-bold text-gray-900">Sevkiyat Tipi</span>
                                    <span className="text-gray-600">{product.specs?.shippingType || "Standart"}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <span className="font-bold text-gray-900">Boyut / Ebat</span>
                                    <span className="text-gray-600">{product.specs?.size || "Standart"}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Star className="w-6 h-6 text-blue-600" />
                                Ürün Değerlendirmeleri
                            </h3>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                <button onClick={() => setReviewFilter('all')} className={`px-4 py-2 rounded-full text-sm font-medium border ${reviewFilter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Tümü</button>
                                <button onClick={() => setReviewFilter('photo')} className={`px-4 py-2 rounded-full text-sm font-medium border ${reviewFilter === 'photo' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Fotoğraflı Yorumlar</button>
                                {[5, 4, 3, 2, 1].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setReviewFilter(star)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-1 ${reviewFilter === star ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        {star} <Star className="w-3 h-3 fill-current" />
                                    </button>
                                ))}
                            </div>

                            <div className="grid gap-4">
                                {filteredReviews.length > 0 ? (
                                    filteredReviews.map((review, idx) => (
                                        <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                                                        {review.user.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-sm text-gray-900 block">{review.user}</span>
                                                        <div className="flex text-yellow-400">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-400">{review.date}</span>
                                            </div>
                                            <p className="text-gray-600 text-sm">{review.comment}</p>
                                            {review.hasPhoto && (
                                                <div className="mt-2">
                                                    <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-600 font-medium">Fotoğraflı</span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        Bu kriterlere uygun yorum bulunamadı.
                                    </div>
                                )}
                            </div>

                            {/* Yorum Formu */}
                            <div id="review-form-section" className="mt-8 pt-8 border-t border-gray-200">
                                <h4 className="text-xl font-bold text-gray-800 mb-4">Yorum Yap</h4>
                                {currentUser ? (
                                    <form onSubmit={handleSubmitReview} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Puanınız</label>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button
                                                        type="button"
                                                        key={star}
                                                        onClick={() => setNewReviewRating(star)}
                                                        className="p-1 hover:scale-110 transition-transform"
                                                    >
                                                        <Star className={`w-6 h-6 ${star <= newReviewRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Yorumunuz</label>
                                            <textarea
                                                value={newReviewComment}
                                                onChange={(e) => setNewReviewComment(e.target.value)}
                                                rows={4}
                                                placeholder="Ürün hakkındaki düşüncelerinizi paylaşın..."
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                        >
                                            Yorumu Gönder
                                        </button>
                                    </form>
                                ) : (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
                                        <p className="font-medium">Yorum yapmak için lütfen sipariş verdiğiniz üyelik ile giriş yapın.</p>
                                        <a href="/login" className="inline-block mt-2 text-blue-600 font-semibold hover:underline">Giriş Yap →</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'shipping' && (
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Truck className="w-6 h-6 text-blue-600" />
                                Kargo ve İade Koşulları
                            </h3>
                            <div className="space-y-3">
                                {(deliveryConditions || [
                                    'Siparişleriniz 24 saat içerisinde kargoya verilir.',
                                    '1500 TL ve üzeri alışverişlerinizde kargo ücretsizdir.',
                                    'Memnun kalmadığınız ürünleri 14 gün içerisinde koşulsuz iade edebilirsiniz.',
                                    'İade işlemlerinde kargo ücreti tarafımıza aittir.'
                                ]).map((item, index) => (
                                    <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <p className="text-gray-700">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
