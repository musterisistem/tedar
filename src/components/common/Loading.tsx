
import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loading: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-slate-600 font-medium animate-pulse">Yükleniyor...</p>
            </div>
        </div>
    );
};
