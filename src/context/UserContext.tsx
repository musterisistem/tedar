import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

// Types
export interface Address {
    id?: string | number;
    title: string;
    city: string;
    district: string;
    neighborhood?: string;
    zipCode?: string;
    content: string;
    phone?: string;
    // Billing specific fields (optional)
    isCorporate?: boolean;
    companyName?: string;
    taxNo?: string;
    taxOffice?: string;
}

export interface Order {
    id: string | number;
    orderNo?: string;
    date: string;
    total?: number; // used in mock
    amount?: number; // used in checkout (unify this later if needed)
    status: string;
    items?: any[]; // Store cart items
}

export interface User {
    id: string | number;
    name: string;
    username: string; // generated from email or name
    email: string;
    phone: string;
    city: string;
    district: string; // New field
    role: 'admin' | 'customer';
    status: 'active' | 'blocked';
    registerDate: string;
    ipAddress: string;
    lastLogin?: string; // New field
    isOnline?: boolean; // New field
    ipHistory?: string[]; // New field
    orders: Order[];
    addresses: Address[]; // We can keep this for multiple addresses, but initial registration will put the first one here.
    password?: string;
    favorites?: (string | number)[]; // List of product IDs
}

interface UserContextType {
    users: User[];
    currentUser: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (userData: {
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        district: string;
        zipCode: string;
        password: string
    }) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateUser: (id: string | number, updatedUser: Partial<User>) => void;
    deleteUser: (id: string | number) => void;
    blockUser: (id: string | number) => void;
    favorites: (string | number)[];
    toggleFavorite: (productId: string | number) => void;
    clearFavorites: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock Data
const initialUsers: User[] = [
    {
        id: 1,
        name: 'Ahmet Yılmaz',
        username: 'ahmety',
        email: 'ahmet@example.com',
        phone: '0555 123 45 67',
        city: 'İstanbul',
        district: 'Kadıköy',
        role: 'customer',
        status: 'active',
        registerDate: '2024-01-15',
        ipAddress: '192.168.1.1',
        lastLogin: '2024-03-10 14:30',
        isOnline: true,
        ipHistory: ['192.168.1.1', '192.168.1.5'],
        password: '123',
        orders: [
            { id: 'ORD-001', date: '2024-01-20', total: 1250.00, status: 'Teslim Edildi' },
            { id: 'ORD-002', date: '2024-02-10', total: 450.50, status: 'Kargolandı' }
        ],
        addresses: [
            {
                id: 1,
                title: 'Ev',
                city: 'İstanbul',
                district: 'Kadıköy',
                content: 'Atatürk Mah. Çiçek Sok. No:5'
            }
        ]
    },
    {
        id: 2,
        name: 'Ayşe Demir',
        username: 'aysed',
        email: 'ayse@example.com',
        phone: '0555 987 65 43',
        city: 'Ankara',
        district: 'Çankaya',
        role: 'customer',
        status: 'active',
        registerDate: '2024-02-01',
        ipAddress: '192.168.1.25',
        lastLogin: '2024-03-09 10:15',
        isOnline: false,
        ipHistory: ['192.168.1.25'],
        password: '123',
        orders: [],
        addresses: []
    },
    {
        id: 3,
        name: 'Mehmet Kara',
        username: 'mehmetk',
        email: 'mehmet@example.com',
        phone: '0532 111 22 33',
        city: 'İzmir',
        district: 'Konak',
        role: 'customer',
        status: 'blocked',
        registerDate: '2023-11-05',
        ipAddress: '88.241.55.12',
        lastLogin: '2023-12-05 18:20',
        isOnline: false,
        ipHistory: ['88.241.55.12', '88.241.55.14'],
        password: '123',
        orders: [
            { id: 'ORD-999', date: '2023-12-01', total: 3200.00, status: 'İptal' }
        ],
        addresses: []
    }
];

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    // Initialize users from localStorage if available, else use mock data
    const [users, setUsers] = useState<User[]>(() => {
        try {
            const storedUsers = localStorage.getItem('site_users');
            return storedUsers ? JSON.parse(storedUsers) : initialUsers;
        } catch (error) {
            console.error('Error parsing site_users from localStorage:', error);
            return initialUsers;
        }
    });

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const storedUser = localStorage.getItem('current_user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error('Error parsing current_user from localStorage:', error);
            return null;
        }
    });

    // Check Auth on Load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                const res = await fetch('/api/users/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setCurrentUser(data.user);
                } else {
                    localStorage.removeItem('auth_token');
                    setCurrentUser(null);
                }
            } catch (error) {
                localStorage.removeItem('auth_token');
                setCurrentUser(null);
            }
        };
        checkAuth();
    }, []);

    const login = async (emailInput: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const email = emailInput.trim().toLowerCase(); // Normalize email
            const res = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            let data;
            const responseText = await res.text();

            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('JSON Parse Error (Login). Response was:', responseText);
                return { success: false, error: 'Sunucu hatası (JSON Parse): ' + responseText.substring(0, 100) };
            }

            if (!res.ok) {
                return { success: false, error: data.error || 'Giriş başarısız' };
            }

            localStorage.setItem('auth_token', data.token);
            setCurrentUser(data.user);
            return { success: true };
        } catch (error: any) {
            console.error('Login Fetch Error:', error);
            return { success: false, error: 'Bağlantı hatası: ' + (error.message || error) };
        }
    };

    const register = async (userData: {
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        district: string;
        zipCode: string;
        password: string
    }): Promise<{ success: boolean; error?: string }> => {
        try {
            // Normalize email during registration
            const cleanUserData = { ...userData, email: userData.email.trim().toLowerCase() };

            const res = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleanUserData)
            });

            let data;
            const responseText = await res.text();

            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('JSON Parse Error. Response was:', responseText);
                return { success: false, error: 'Sunucu hatası (JSON Parse): ' + responseText.substring(0, 100) };
            }

            if (!res.ok) {
                return { success: false, error: data.error || 'Kayıt başarısız' };
            }


            localStorage.setItem('auth_token', data.token);
            setCurrentUser(data.user);

            // Welcome email is sent from backend during registration

            return { success: true };
        } catch (error: any) {
            console.error('Register Fetch Error:', error);
            return { success: false, error: 'Bağlantı hatası: ' + (error.message || error) };
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user'); // Also clean current_user just in case
        setCurrentUser(null);
        navigate('/giris');
    };

    const updateUser = async (id: string | number, updatedUser: Partial<User>) => {
        // Optimistic update
        let updatedCurrentUser = null;

        if (currentUser && currentUser.id.toString() === id.toString()) {
            updatedCurrentUser = { ...currentUser, ...updatedUser };
            setCurrentUser(updatedCurrentUser);
        }

        setUsers(prev => prev.map(user => {
            if (user.id.toString() === id.toString()) {
                // If we already updated currentUser, use that object, otherwise create new
                return updatedCurrentUser || { ...user, ...updatedUser };
            }
            return user;
        }));

        // Server update
        if (currentUser && currentUser.id.toString() === id.toString()) {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) return;

                const res = await fetch('/api/users', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updatedUser)
                });

                if (!res.ok) {
                    console.error('Server update failed');
                    // Revert context if needed (optional implementation)
                }
            } catch (error) {
                console.error('Error updating user on server:', error);
            }
        }
    };

    const deleteUser = (id: string | number) => {
        setUsers(prev => prev.filter(user => user.id.toString() !== id.toString()));
        if (currentUser && currentUser.id.toString() === id.toString()) {
            logout();
        }
    };

    const blockUser = (id: string | number) => {
        setUsers(prev => prev.map(user => {
            if (user.id.toString() === id.toString()) {
                const newStatus = user.status === 'active' ? 'blocked' : 'active';
                // Logout if blocked
                if (currentUser && currentUser.id === id && newStatus === 'blocked') {
                    logout();
                }
                return { ...user, status: newStatus as 'active' | 'blocked' };
            }
            return user;
        }));
    };

    // Favorites Logic
    const [guestFavorites, setGuestFavorites] = useState<(string | number)[]>(() => {
        try {
            const saved = localStorage.getItem('site_guest_favorites');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const favorites = currentUser ? (currentUser.favorites || []) : guestFavorites;

    const toggleFavorite = (productId: string | number) => {
        const pId = productId.toString();
        if (currentUser) {
            const currentFavs = (currentUser.favorites || []).map(id => id.toString());
            const newFavs = currentFavs.includes(pId)
                ? currentFavs.filter(id => id !== pId)
                : [...currentFavs, pId];

            updateUser(currentUser.id, { favorites: newFavs });
        } else {
            setGuestFavorites(prev => {
                const currentFavs = prev.map(id => id.toString());
                const newFavs = currentFavs.includes(pId)
                    ? currentFavs.filter(id => id !== pId)
                    : [...currentFavs, pId];
                localStorage.setItem('site_guest_favorites', JSON.stringify(newFavs));
                return newFavs;
            });
        }
    };

    const clearFavorites = () => {
        if (currentUser) {
            updateUser(currentUser.id, { favorites: [] });
        } else {
            setGuestFavorites([]);
            localStorage.removeItem('site_guest_favorites');
        }
    };

    return (
        <UserContext.Provider value={{ users, currentUser, login, register, logout, updateUser, deleteUser, blockUser, favorites, toggleFavorite, clearFavorites }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUsers = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUsers must be used within a UserProvider');
    }
    return context;
};
