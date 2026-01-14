import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';

interface ProductGalleryProps {
    images?: string[];
    videoUrl?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images = [], videoUrl }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    // Zoom State
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

    // Touch/Swipe State
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance
    const minSwipeDistance = 50;

    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);

    const onTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!touchStart) return;
        const currentX = e.targetTouches[0].clientX;
        setTouchEnd(currentX);
        const diff = currentX - touchStart;
        setDragOffset(diff);
    };

    const onTouchEnd = () => {
        setIsDragging(false);
        setDragOffset(0);

        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            // Next image
            setSelectedImage((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
        }
        if (isRightSwipe) {
            // Prev image
            setSelectedImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
        }

        setTouchStart(null);
        setTouchEnd(null);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        // Disable zoom on mobile/touch devices
        if (window.innerWidth < 1024) return;

        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPosition({ x, y });
        setIsZoomed(true);
    };

    const handleMouseLeave = () => {
        setIsZoomed(false);
    };

    // Placeholder for ZoomIn component
    const ZoomIn = (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
    );

    // Fallback if no images
    const displayImages = images.length > 0 ? images : ['https://via.placeholder.com/800'];

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedImage((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
    };

    const getVideoSrc = (url: string) => {
        if (!url) return '';
        if (url.includes('<iframe')) {
            const srcMatch = url.match(/src="([^"]+)"/);
            return srcMatch ? srcMatch[1] : '';
        }
        if (url.includes('youtube.com/embed/')) return url;
        if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
            let videoId = '';
            if (url.includes('v=')) {
                videoId = url.split('v=')[1].split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0];
            }
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        }
        return url;
    };

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-4 relative">
            {/* Thumbnails (Bottom on Mobile, Left on Desktop) */}
            <div className="w-full lg:w-20 flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto scrollbar-hide py-1">
                {displayImages.map((img, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-20 h-20 lg:w-full lg:h-auto aspect-square rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImage === index ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>

            {/* Main Image Viewport (Top on Mobile, Right on Desktop) */}
            <div
                className="flex-1 rounded-2xl overflow-hidden relative lg:cursor-crosshair group z-10 shadow-2xl shadow-gray-200 border border-gray-100 hover:shadow-gray-300 transition-all duration-300 aspect-[3/4] bg-white"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Product Video Button */}
                {videoUrl && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsVideoModalOpen(true);
                        }}
                        className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-blue-600 rounded-lg text-xs font-bold hover:bg-white transition-colors border border-blue-100 shadow-sm"
                    >
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <Play className="w-3 h-3 fill-current" />
                        Ürün Videosu
                    </button>
                )}

                {/* Carousel Track */}
                <div
                    className="flex h-full w-full"
                    style={{
                        transform: `translateX(calc(-${selectedImage * 100}% + ${dragOffset}px))`,
                        transition: isDragging ? 'none' : 'transform 300ms ease-out'
                    }}
                >
                    {displayImages.map((img, index) => (
                        <div key={index} className="min-w-full h-full flex-shrink-0 relative overflow-hidden">
                            <div className="absolute inset-0 w-full h-full">
                                <img
                                    src={img}
                                    alt={`Product Main ${index + 1}`}
                                    className="w-full h-full object-cover scale-110"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows (Desktop Only) */}
                <button
                    onClick={handlePrev}
                    className="hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-full text-gray-700 shadow-md hover:bg-white hover:text-blue-600 transition-colors z-20"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={handleNext}
                    className="hidden lg:block absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-full text-gray-700 shadow-md hover:bg-white hover:text-blue-600 transition-colors z-20"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Zoom Hint (Desktop Only) */}
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 hidden lg:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <ZoomIn className="w-3 h-3" /> Büyütmek için gezin
                </div>
            </div>

            {/* Side Zoom Window */}
            {isZoomed && (
                <div
                    className="hidden lg:block absolute left-[102%] top-0 z-[100] w-[340px] h-[440px] border border-gray-200 shadow-2xl bg-white rounded-xl overflow-hidden"
                    style={{
                        backgroundImage: `url(${displayImages[selectedImage]})`,
                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        backgroundSize: '200%'
                    }}
                >
                </div>
            )}

            {/* Video Modal */}
            {isVideoModalOpen && videoUrl && (
                <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" style={{ zIndex: 9999 }}>
                    <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <button
                            onClick={() => setIsVideoModalOpen(false)}
                            className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <iframe
                            src={`${getVideoSrc(videoUrl)}?autoplay=1`}
                            title="Product Video"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                    <div className="absolute inset-0 -z-10" onClick={() => setIsVideoModalOpen(false)}></div>
                </div>
            )}
        </div>
    );
};
