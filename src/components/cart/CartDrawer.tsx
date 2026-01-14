import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, ArrowRight, Percent, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { slugify } from '../../utils/slugify';

export const CartDrawer: React.FC = () => {
    const {
        isDrawerOpen, closeDrawer, items, updateQuantity, removeItem,
        totalPrice, subtotal, basketDiscount, qualifyingCount
    } = useCart();
    const { basketDiscountRate, discountInCartProductIds, products } = useProducts();
    const navigate = useNavigate();
    const [render, setRender] = React.useState(false);

    React.useEffect(() => {
        if (isDrawerOpen) {
            setRender(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setRender(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isDrawerOpen]);

    // Standardize IDs for comparison
    const discountIdsStrings = discountInCartProductIds.map(id => id.toString());
    const cartProductIds = items.map(i => i.id.toString());

    // Find a suggestion product from discountInCartProductIds that is NOT in the cart
    const suggestionId = discountInCartProductIds.find(id => !cartProductIds.includes(id.toString()));
    const suggestionProduct = products.find(p => p.id.toString() === suggestionId?.toString());

    if (!render) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={closeDrawer}
            />

            {/* Draws Slide-in */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col font-sans ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-800">Sepetim ({items.length} Ürün)</h2>
                    </div>
                    <button
                        onClick={closeDrawer}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                                            onClick={() => { closeDrawer(); navigate(`/${slugify(suggestionProduct.name)}`); }}
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

                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <ShoppingBag className="w-16 h-16 mb-4 text-gray-300" />
                            <p className="text-lg">Sepetinizde ürün bulunmamaktadır.</p>
                            <button onClick={closeDrawer} className="mt-4 text-blue-600 font-bold hover:underline">Alışverişe Başla</button>
                        </div>
                    ) : (
                        items.map((item) => {
                            const isQualifying = discountIdsStrings.includes(item.id.toString());
                            return (
                                <div key={item.id} className="flex gap-4">
                                    <Link
                                        to={`/${slugify(item.name)}`}
                                        onClick={closeDrawer}
                                        className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0"
                                    >
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    </Link>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <Link
                                                to={`/${slugify(item.name)}`}
                                                onClick={closeDrawer}
                                                className="text-sm font-medium text-gray-800 line-clamp-2 mb-1 hover:text-blue-600 transition-colors"
                                            >
                                                {item.name}
                                            </Link>
                                        </div>
                                        {isQualifying && (
                                            <div className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded inline-block mb-2 uppercase tracking-tight">
                                                Sepette İndirimli
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center border border-gray-200 rounded-lg h-8">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-gray-900">{item.price.toLocaleString('tr-TR')} TL</span>
                                                <button onClick={() => removeItem(item.id)} className="text-[10px] text-red-500 hover:font-bold mt-1 uppercase">SİL</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-gray-100 bg-white">
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>Ara Toplam:</span>
                                <span>{subtotal.toLocaleString('tr-TR')} TL</span>
                            </div>
                            {basketDiscount > 0 && (
                                <div className="flex justify-between items-center text-sm text-green-600 font-bold">
                                    <span>Sepette İndirim (%{basketDiscountRate}):</span>
                                    <span>-{basketDiscount.toLocaleString('tr-TR')} TL</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                <span className="text-gray-800 font-bold">Toplam Tutar:</span>
                                <span className="text-2xl font-bold text-blue-800">{totalPrice.toLocaleString('tr-TR')} TL</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={closeDrawer}
                                className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                            >
                                Alışverişe Devam
                            </button>
                            <button
                                onClick={() => { closeDrawer(); navigate('/checkout'); }}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                Siparişi Tamamla <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
