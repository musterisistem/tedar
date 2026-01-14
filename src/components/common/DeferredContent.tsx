
import React, { useEffect, useRef, useState, type ReactNode } from 'react';

interface DeferredContentProps {
    children: ReactNode;
    threshold?: number;
    height?: string; // Placeholder height to prevent layout shift
}

export const DeferredContent: React.FC<DeferredContentProps> = ({
    children,
    threshold = 0.1,
    height = '400px'
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [threshold]);

    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ minHeight: isVisible ? 'auto' : height }}
        >
            {isVisible && children}
        </div>
    );
};
