import React, { createContext, useContext, useState, useEffect } from 'react';
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
    id: number;
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
    login: (email: string, password: string) => { success: boolean; error?: string };
    register: (userData: {
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        district: string;
        zipCode: string;
        password: string
    }) => void;
    logout: () => void;
    updateUser: (id: number, updatedUser: Partial<User>) => void;
    deleteUser: (id: number) => void;
    blockUser: (id: number) => void;
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

    // Update localStorage whenever users change
    useEffect(() => {
        localStorage.setItem('site_users', JSON.stringify(users));
    }, [users]);

    // Update localStorage whenever currentUser changes
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('current_user', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('current_user');
        }
    }, [currentUser]);

    const login = (email: string, password: string): { success: boolean; error?: string } => {
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPassword = password.trim();

        const user = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === normalizedPassword);

        if (!user) {
            return { success: false, error: 'E-posta veya şifre hatalı!' };
        }

        if (user.status !== 'active') {
            return { success: false, error: 'Hesabınız askıya alınmıştır. Lütfen destek ile iletişime geçin.' };
        }

        setCurrentUser(user);
        return { success: true };
    };

    const register = (userData: {
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        district: string;
        zipCode: string;
        password: string
    }) => {
        const newUser: User = {
            id: Date.now(),
            name: userData.name.trim(),
            username: userData.email.trim().toLowerCase().split('@')[0],
            email: userData.email.trim().toLowerCase(),
            phone: userData.phone.trim(),
            city: userData.city,
            district: userData.district,
            password: userData.password.trim(),
            role: 'customer',
            status: 'active',
            registerDate: new Date().toISOString().split('T')[0],
            ipAddress: '127.0.0.1',
            orders: [],
            addresses: [
                {
                    id: Date.now(),
                    title: 'Varsayılan Adres',
                    content: userData.address,
                    city: userData.city,
                    district: userData.district,
                    zipCode: userData.zipCode,
                    phone: userData.phone
                }
            ]
        };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);

        // Send Welcome Email
        import('../utils/emailService').then(({ emailService }) => {
            emailService.sendWelcomeEmail(newUser.email, newUser.name);
        });
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const updateUser = (id: number, updatedUser: Partial<User>) => {
        setUsers(prev => prev.map(user => {
            if (user.id === id) {
                const newUserData = { ...user, ...updatedUser };
                // Also update current user if it's the same person
                if (currentUser && currentUser.id === id) {
                    setCurrentUser(newUserData);
                }
                return newUserData;
            }
            return user;
        }));
    };

    const deleteUser = (id: number) => {
        setUsers(prev => prev.filter(user => user.id !== id));
        if (currentUser && currentUser.id === id) {
            logout();
        }
    };

    const blockUser = (id: number) => {
        setUsers(prev => prev.map(user => {
            if (user.id === id) {
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
