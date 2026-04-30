import { useEffect, useRef } from 'react';

/**
 * Map Leaflet dédiée au Road Trip.
 * Prend `destinations` (données fraîches avec location.lat/lng),
 * affiche des pins numérotés + polyline.
 * Container explicitement dimensionné → jamais de bug de largeur 0.
 */
export default function RoadTripMap({ destinations = [] }) {
    const containerRef = useRef(null);
    const mapRef       = useRef(null);

    useEffect(() => {
        if (!window.L || !containerRef.current) return;

        const valid = destinations.filter(d => d.location?.lat && d.location?.lng);
        if (valid.length === 0) return;

        try {

        // Détruire une instance précédente
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }

        const lats = valid.map(d => d.location.lat);
        const lngs = valid.map(d => d.location.lng);
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

        const map = window.L.map(containerRef.current, { zoomControl: true, zoomAnimation: false, markerZoomAnimation: false, fadeAnimation: false })
            .setView([centerLat, centerLng], 5);
        mapRef.current = map;

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
            crossOrigin: false,
        }).on('tileerror', () => { /* silencieux */ }).addTo(map);

        // Marqueurs numérotés
        valid.forEach((dest, i) => {
            const icon = window.L.divIcon({
                className: '',
                html: `<div style="
                    background: linear-gradient(135deg,#4f46e5,#7c3aed);
                    color: white; width: 32px; height: 32px;
                    border-radius: 50%; display: flex; align-items: center;
                    justify-content: center; font-weight: 900; font-size: 14px;
                    border: 3px solid white;
                    box-shadow: 0 3px 12px rgba(79,70,229,0.55);
                    font-family: sans-serif;
                ">${i + 1}</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            });
            window.L.marker([dest.location.lat, dest.location.lng], { icon })
                .addTo(map)
                .bindPopup(`<b>Étape ${i + 1} — ${dest.name}</b>${dest.location.address ? `<br/><small>${dest.location.address}</small>` : ''}`);
        });

        // Polyline reliant les étapes
        if (valid.length > 1) {
            window.L.polyline(
                valid.map(d => [d.location.lat, d.location.lng]),
                { color: '#4f46e5', weight: 3, opacity: 0.8, dashArray: '10, 8' }
            ).addTo(map);

            map.fitBounds(
                window.L.latLngBounds(valid.map(d => [d.location.lat, d.location.lng])),
                { padding: [48, 48] }
            );
        }

        // Leaflet recalcule les dimensions après que le DOM est stable
        setTimeout(() => {
            if (mapRef.current) mapRef.current.invalidateSize();
        }, 200);

        } catch (err) {
            console.warn('RoadTripMap init error:', err);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [destinations]);

    const hasCoords = destinations.some(d => d.location?.lat && d.location?.lng);

    if (!hasCoords) {
        return (
            <div className="roadtrip-map-empty">
                📍 Aucune localisation disponible pour les étapes de ce road trip.
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="roadtrip-map-canvas"
        />
    );
}
