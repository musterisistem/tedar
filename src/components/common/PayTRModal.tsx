import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface PayTRModalProps {
    token: string;
    onClose: () => void;
}

export const PayTRModal: React.FC<PayTRModalProps> = ({ token, onClose }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const handleResize = (event: MessageEvent) => {
            if (event.data?.name === 'paytr_iframe_resize' && iframeRef.current) {
                iframeRef.current.style.height = `${event.data.params.height}px`;
            }
        };

        window.addEventListener('message', handleResize);
        return () => window.removeEventListener('message', handleResize);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative animate-fadeIn">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                <div className="w-full overflow-y-auto max-h-[90vh]">
                    <iframe
                        ref={iframeRef}
                        src={`https://www.paytr.com/odeme/guvenli/${token}`}
                        className="w-full min-h-[600px] border-0"
                        scrolling="yes" // PayTR recommends 'no' but 'yes' handles overflow better on mobile if resize fails
                    // style={{ width: '100%' }}
                    ></iframe>
                </div>
            </div>
        </div>
    );
};
