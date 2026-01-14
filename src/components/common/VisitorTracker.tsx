import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * VisitorTracker: Sitedeki aktif ziyaretçileri anonim olarak takip eder.
 * Sadece bir oturum ID'si ve son işlem zamanını kaydeder.
 */
export const VisitorTracker = () => {
    const location = useLocation();

    const trackVisitor = useCallback(async () => {
        try {
            // Basit bir oturum ID'si oluştur (sayfa yenilendiğinde değişmez)
            let sessionId = sessionStorage.getItem('v_session_id');
            if (!sessionId) {
                sessionId = 'v_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem('v_session_id', sessionId);
            }

            const visitorData = {
                sessionId,
                lastSeen: Date.now(),
                url: window.location.pathname
            };

            // Performans Optimizasyonu:
            // Her sayfa geçişinde diske yazmak sistemi yoruyor (özellikle dev modunda).
            // Bu yüzden sadece 60 saniyede bir veya ilk girişte sunucuyu güncelle.
            const lastTracked = sessionStorage.getItem('last_tracked_time');
            const now = Date.now();

            if (lastTracked && (now - Number(lastTracked) < 60000)) {
                // 1 dakikadan az geçtiyse sunucuya yazma, sadece logla (opsiyonel)
                return;
            }

            // Önce mevcut veriyi oku
            const response = await fetch('/src/data/active_visitors.json?t=' + Date.now());
            let visitors = [];
            if (response.ok) {
                const json = await response.json();
                visitors = json.visitors || [];
            }

            // 5 dakikadan eski verileri temizle
            const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
            const filteredVisitors = visitors.filter((v: any) =>
                v.lastSeen > fiveMinutesAgo && v.sessionId !== sessionId
            );

            // Kendimizi ekle
            filteredVisitors.push(visitorData);

            // Kaydet
            await fetch('/api/save-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: 'active_visitors.json',
                    data: { visitors: filteredVisitors }
                })
            });

            // Son güncelleme zamanını kaydet
            sessionStorage.setItem('last_tracked_time', now.toString());
        } catch (error) {
            // Sessizce yut (siteyi bozmamalı)
            console.warn('Visitor tracking error:', error);
        }
    }, []);

    useEffect(() => {
        trackVisitor();
        const interval = setInterval(trackVisitor, 30000); // 30 saniyede bir güncelle
        return () => clearInterval(interval);
    }, [location.pathname, trackVisitor]);

    return null; // Görünmez bileşen
};
