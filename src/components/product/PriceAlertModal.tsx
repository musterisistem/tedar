import React from 'react';
import { X, Bell, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PriceAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    isLoggedIn: boolean;
    productName: string;
    isSaving?: boolean;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({ isOpen, onClose, onAccept, isLoggedIn, productName, isSaving }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-8 text-white relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                        <Bell className="w-8 h-8 text-white animate-ring" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight mb-2 uppercase">Fiyat Alarmı</h2>
                    <p className="text-blue-100 text-sm font-medium leading-relaxed">
                        {productName} ürünündeki indirimleri kaçırmayın!
                    </p>
                </div>

                {/* Content */}
                <div className="p-8">
                    {isLoggedIn ? (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-4">
                                <div className="bg-white p-2 rounded-xl shadow-sm h-fit">
                                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="text-sm text-slate-700 leading-relaxed font-bold">
                                    Bu ürünün fiyatı düştüğünde size e-posta ile haber vereceğiz. Kampanyalar ve indirimlerden anında haberdar olmak için lütfen onaylayın.
                                </div>
                            </div>

                            <button
                                onClick={onAccept}
                                disabled={isSaving}
                                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100 hover:-translate-y-1 active:scale-95 text-lg ${isSaving ? 'opacity-50' : ''}`}
                            >
                                {isSaving ? 'AKTİFLEŞTİRİLİYOR...' : (
                                    <>
                                        KABUL EDİYORUM
                                        <ArrowRight className="w-6 h-6" />
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-slate-600 text-center font-medium leading-relaxed">
                                Fiyat alarmını aktif edebilmek için üye olmanız veya giriş yapmanız gerekmektedir.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => { onClose(); navigate('/login'); }}
                                    className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all"
                                >
                                    <LogIn className="w-5 h-5" />
                                    GİRİŞ YAP
                                </button>
                                <button
                                    onClick={() => { onClose(); navigate('/register'); }}
                                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-100"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    KAYIT OL
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-bold transition-colors">
                        VAZGEÇ
                    </button>
                </div>
            </div>
        </div>
    );
};
