import React from 'react';
import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';

interface LayoutProps {
    children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-900">
            <Header />
            <CartDrawer />
            <main className="flex-grow bg-gray-50">
                {children}
            </main>
            <Footer />
        </div>
    );
};
