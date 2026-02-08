
import { useState, useEffect } from 'react';

// Use relative path since Vite proxies /api requests
const API_BASE = '/api/location';

export interface LocationHook {
    cities: string[];
    districts: string[];
    neighborhoods: string[];
    loading: boolean;
    error: string | null;
    fetchDistricts: (city: string) => Promise<void>;
    fetchNeighborhoods: (city: string, district: string) => Promise<void>;
}

export const useLocation = (selectedCity?: string, selectedDistrict?: string): LocationHook => {
    const [cities, setCities] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial Load: Cities
    useEffect(() => {
        const fetchCities = async () => {
            try {
                // Determine if we need to show loading for initial fetch
                // We can skip loading state for initial render if we want to avoid flicker
                // but let's be safe.
                const response = await fetch(`${API_BASE}/cities`);
                if (!response.ok) throw new Error('Şehirler yüklenemedi');
                const data = await response.json();
                setCities(data);
            } catch (err: any) {
                console.error('Location Error:', err);
                setError(err.message);
            }
        };

        fetchCities();
    }, []);

    // Effect: Fetch districts when city changes
    useEffect(() => {
        if (!selectedCity) {
            setDistricts([]);
            setNeighborhoods([]); // Clear neighborhoods too if city is cleared
            return;
        }

        const fetchDistrictsEffect = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE}/districts?city=${encodeURIComponent(selectedCity)}`);
                if (!response.ok) throw new Error('İlçeler yüklenemedi');
                const data = await response.json();
                setDistricts(data);
            } catch (err: any) {
                console.error('Location Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDistrictsEffect();
    }, [selectedCity]);

    // Effect: Fetch neighborhoods when district changes
    useEffect(() => {
        if (!selectedCity || !selectedDistrict) {
            setNeighborhoods([]);
            return;
        }

        const fetchNeighborhoodsEffect = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE}/neighborhoods?city=${encodeURIComponent(selectedCity)}&district=${encodeURIComponent(selectedDistrict)}`);
                if (!response.ok) throw new Error('Mahalleler yüklenemedi');
                const data = await response.json();
                setNeighborhoods(data);
            } catch (err: any) {
                console.error('Location Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNeighborhoodsEffect();
    }, [selectedCity, selectedDistrict]);

    // Manual fetch functions (optional, if needed for direct control)
    const fetchDistricts = async (city: string) => {
        if (!city) {
            setDistricts([]);
            return;
        }
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/districts?city=${encodeURIComponent(city)}`);
            const data = await response.json();
            setDistricts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchNeighborhoods = async (city: string, district: string) => {
        if (!city || !district) {
            setNeighborhoods([]);
            return;
        }
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/neighborhoods?city=${encodeURIComponent(city)}&district=${encodeURIComponent(district)}`);
            const data = await response.json();
            setNeighborhoods(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return {
        cities,
        districts,
        neighborhoods,
        loading,
        error,
        fetchDistricts,
        fetchNeighborhoods
    };
};
