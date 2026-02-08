import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import { motion, AnimatePresence } from 'framer-motion';

export const HeroSlider: React.FC = () => {
    const { slides } = useSite();
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [direction, setDirection] = useState(0);

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        if (newDirection > 0) {
            setCurrent((prev) => (prev + 1) % slides.length);
        } else {
            setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
        }
    };

    const nextSlide = () => paginate(1);
    const prevSlide = () => paginate(-1);

    useEffect(() => {
        if (isPaused) return;
        if (slides.length === 0) return;

        const timer = setInterval(nextSlide, 3000);
        return () => clearInterval(timer);
    }, [isPaused, slides.length]);

    if (!slides || slides.length === 0) {
        return (
            <div className="w-full h-[520px] bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden shadow-2xl">
                <p>Henüz slayt eklenmemiş.</p>
            </div>
        );
    }

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 1,
            zIndex: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 1
        })
    };

    return (
        <div
            className="relative w-full h-[520px] bg-gray-900 overflow-hidden group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={current}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "tween", ease: "easeInOut", duration: 0.5 },
                        opacity: { duration: 0.2 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(_, { offset, velocity }) => {
                        const swipe = swipePower(offset.x, velocity.x);

                        if (swipe < -swipeConfidenceThreshold) {
                            paginate(1);
                        } else if (swipe > swipeConfidenceThreshold) {
                            paginate(-1);
                        }
                    }}
                    className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
                >
                    {/* Background Image - Static (No Zoom) */}
                    <div className="absolute inset-0 overflow-hidden">
                        {slides[current].link ? (
                            <Link to={slides[current].link} className="block w-full h-full" draggable="false">
                                <img
                                    src={slides[current].image}
                                    alt={slides[current].title}
                                    className="w-full h-full object-cover pointer-events-none"
                                />
                            </Link>
                        ) : (
                            <img
                                src={slides[current].image}
                                alt={slides[current].title}
                                className="w-full h-full object-cover pointer-events-none"
                            />
                        )}
                        {/* No Overlay or Text */}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-2 md:p-3 rounded-full backdrop-blur-md transition-all duration-300 z-30 hover:scale-110 border border-white/20 group-hover:opacity-100 opacity-0"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-2 md:p-3 rounded-full backdrop-blur-md transition-all duration-300 z-30 hover:scale-110 border border-white/20 group-hover:opacity-100 opacity-0"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </>
            )}

            {/* Pagination Dots */}
            {slides.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setDirection(i > current ? 1 : -1);
                                setCurrent(i);
                            }}
                            className="relative h-2 rounded-full overflow-hidden transition-all duration-500 bg-white/30 hover:bg-white/60"
                            style={{ width: i === current ? '60px' : '15px' }}
                        >
                            {i === current && (
                                <motion.div
                                    className="absolute inset-0 bg-white"
                                    layoutId="activeDot"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
