import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, Percent, CheckCircle, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useSite } from '../context/SiteContext';
import { slugify } from '../utils/slugify';

export const CartPage: React.FC = () => {
    const {
        items, removeItem, updateQuantity, totalPrice,
        subtotal, basketDiscount, qualifyingCount, shippingCost, finalTotal
    } = useCart();
    const { basketDiscountRate, discountInCartProductIds, products } = useProducts();
    const { deliverySettings } = useSite();
    const navigate = useNavigate();

    // Standardize IDs for comparison
    const discountIdsStrings = discountInCartProductIds.map(id => id.toString());
    const cartProductIds = items.map(i => i.id.toString());

    // Find a suggestion product from discountInCartProductIds that is NOT in the cart
    const suggestionId = discountInCartProductIds.find(id => !cartProductIds.includes(id.toString()));
    const suggestionProduct = products.find(p => p.id.toString() === suggestionId?.toString());

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="text-4xl">🛒</div>
                </div>
                <h2 className="text-2xl font-bold mb-4">Sepetiniz Boş</h2>
                <p className="text-gray-500 mb-8">Sepetinizde henüz ürün bulunmamaktadır.</p>
                <Link to="/" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Alışverişe Başla
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Alışveriş Sepetim ({items.length} Ürün)</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Items List */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Discount Notification Alert */}
                    {qualifyingCount === 1 && (
                        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 animate-pulse">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                                    <Percent className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-slate-800">%{basketDiscountRate} İndirim Fırsatı!</h4>
                                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                        Sepetinize bu özellikli bir ürün daha eklerseniz toplamda <span className="font-bold text-orange-600">%{basketDiscountRate}</span> indirim kazanırsınız.
                                    </p>
                                    {suggestionProduct && (
                                        <button
                                            onClick={() => navigate(`/${slugify(suggestionProduct.name)}`)}
                                            className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                                        >
                                            Önerilen ürünü incele &rarr;
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {qualifyingCount >= 2 && (
                        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-xl text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">Tebrikler!</h4>
                                    <p className="text-xs text-slate-600">Sepette ek <span className="font-bold text-green-600">%{basketDiscountRate}</span> indirim uygulandı.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4 items-center">
                                <Link to={`/${slugify(item.name)}`} className="shrink-0">
                                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md border border-gray-100 hover:opacity-80 transition-opacity" />
                                </Link>

                                <div className="flex-1">
                                    <Link to={`/${slugify(item.name)}`} className="hover:text-blue-600 transition-colors">
                                        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-1">{item.name}</h3>
                                    </Link>
                                    {discountIdsStrings.includes(item.id.toString()) && (
                                        <div className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded inline-block mb-2 uppercase tracking-tight">
                                            Sepette İndirimli
                                        </div>
                                    )}
                                    <div className="text-blue-600 font-bold">{item.price.toLocaleString('tr-TR')} TL</div>
                                </div>

                                <div className="flex flex-col items-end gap-4">
                                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>

                                    <div className="flex items-center border border-gray-300 rounded-md">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
                        <h3 className="text-lg font-bold mb-4">Sipariş Özeti</h3>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>Ara Toplam</span>
                                <span>{subtotal.toLocaleString('tr-TR')} TL</span>
                            </div>
                            {basketDiscount > 0 && (
                                <div className="flex justify-between text-green-600 font-bold text-sm">
                                    <span>Sepette İndirim (%{basketDiscountRate})</span>
                                    <span>-{basketDiscount.toLocaleString('tr-TR')} TL</span>
                                </div>
                            )}

                            {/* Kargo Bölümü */}
                            {deliverySettings.isEnabled && shippingCost > 0 ? (
                                <div className="flex justify-between text-orange-600 text-sm font-medium">
                                    <span>Kargo Ücreti</span>
                                    <span>{shippingCost.toLocaleString('tr-TR')} TL</span>
                                </div>
                            ) : (
                                <div className="flex justify-between text-green-600 text-sm font-bold">
                                    <span>Kargo</span>
                                    <span>ÜCRETSİZ</span>
                                </div>
                            )}

                            {/* Free Shipping Progress */}
                            {deliverySettings.isEnabled && shippingCost > 0 && (
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    <p className="text-xs text-blue-800 mb-2">
                                        <span className="font-bold">{(deliverySettings.freeShippingThreshold - totalPrice).toLocaleString('tr-TR')} TL</span> daha alışveriş yaparsanız <strong>ücretsiz kargo</strong> kazanırsınız!
                                    </p>
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min((totalPrice / deliverySettings.freeShippingThreshold) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                <span>Toplam</span>
                                <span className="text-blue-600">{finalTotal.toLocaleString('tr-TR')} TL</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/odeme')}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            Sepeti Onayla <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
