import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';

export const HeroSlider: React.FC = () => {
    const { slides } = useSite();
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    useEffect(() => {
        if (isPaused) return;
        if (slides.length === 0) return;

        const timer = setInterval(nextSlide, 6000);
        return () => clearInterval(timer);
    }, [isPaused, slides.length]);

    if (!slides || slides.length === 0) {
        return (
            <div className="w-full h-[520px] bg-gray-100 flex items-center justify-center text-gray-400 rounded-xl overflow-hidden">
                <p>Henüz slayt eklenmemiş.</p>
            </div>
        );
    }

    return (
        <div
            className="relative w-full h-[520px] bg-gray-100 overflow-hidden group rounded-xl shadow-lg"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Slides Container */}
            <div
                className="h-full flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div
                        key={slide.id}
                        className="w-full h-full flex-shrink-0 relative"
                    >
                        {slide.link ? (
                            <Link to={slide.link} className="block w-full h-full">
                                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                                {slide.showText !== false && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-start pb-12 pl-12">
                                        <div className="text-left text-white max-w-lg">
                                            <h2 className="text-4xl md:text-5xl font-bold mb-4 transform translate-y-4 opacity-0 transition-all duration-700 ease-out"
                                                style={{ opacity: 1, transform: current === slides.indexOf(slide) ? 'translateY(0)' : 'translateY(20px)' }}>
                                                {slide.title}
                                            </h2>
                                            <p className="text-xl md:text-2xl transform translate-y-4 opacity-0 transition-all duration-700 ease-out delay-200"
                                                style={{ opacity: 1, transform: current === slides.indexOf(slide) ? 'translateY(0)' : 'translateY(20px)' }}>
                                                {slide.description}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </Link>
                        ) : (
                            <>
                                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                                {slide.showText !== false && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-start pb-12 pl-12">
                                        <div className="text-left text-white max-w-lg">
                                            <h2 className="text-4xl md:text-5xl font-bold mb-4 transform translate-y-4 opacity-0 transition-all duration-700 ease-out"
                                                style={{ opacity: 1, transform: current === slides.indexOf(slide) ? 'translateY(0)' : 'translateY(20px)' }}>
                                                {slide.title}
                                            </h2>
                                            <p className="text-xl md:text-2xl transform translate-y-4 opacity-0 transition-all duration-700 ease-out delay-200"
                                                style={{ opacity: 1, transform: current === slides.indexOf(slide) ? 'translateY(0)' : 'translateY(20px)' }}>
                                                {slide.description}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-110"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-110"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Dots */}
            {slides.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/80'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
