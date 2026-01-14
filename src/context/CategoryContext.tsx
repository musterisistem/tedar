import React, { createContext, useContext, useState } from 'react';
import categoriesData from '../data/categories.json';

export interface Category {
    id: string;
    name: string;
    icon: string;
    subcategories: string[];
}

interface CategoryContextType {
    categories: Category[];
    addCategory: (category: Category) => void;
    updateCategory: (id: string, updatedCategory: Partial<Category>) => void;
    deleteCategory: (id: string) => void;
    reorderCategories: (newCategories: Category[]) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>(() => {
        const data = (categoriesData as any)?.data || categoriesData;
        return Array.isArray(data) ? data : [];
    });

    const saveCategoriesToDisk = async (currentCategories: Category[]) => {
        try {
            await fetch('/api/save-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: 'categories.json',
                    data: currentCategories
                })
            });
        } catch (error) {
            console.error('Kategoriler kaydedilirken hata oluştu:', error);
        }
    };

    const addCategory = async (category: Category) => {
        const next = [...categories, category];
        setCategories(next);
        await saveCategoriesToDisk(next);
    };

    const updateCategory = async (id: string, updatedCategory: Partial<Category>) => {
        const next = categories.map(cat =>
            cat.id === id ? { ...cat, ...updatedCategory } : cat
        );
        setCategories(next);
        await saveCategoriesToDisk(next);
    };

    const deleteCategory = async (id: string) => {
        const next = categories.filter(cat => cat.id !== id);
        setCategories(next);
        await saveCategoriesToDisk(next);
    };

    const reorderCategories = async (newCategories: Category[]) => {
        setCategories(newCategories);
        await saveCategoriesToDisk(newCategories);
    };

    return (
        <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, reorderCategories }}>
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategories = () => {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error('useCategories must be used within a CategoryProvider');
    }
    return context;
};
