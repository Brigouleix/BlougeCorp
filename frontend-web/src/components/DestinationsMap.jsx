import { useEffect, useRef } from 'react';

export default function DestinationsMap({ destinations, showRoute = false }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        const validDests = (destinations || []).filter(
            d => d.location?.lat && d.location?.lng
        );

        // Nettoie l'ancienne instance
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        if (!window.L || !mapRef.current || validDests.length === 0) return;

        // requestAnimationFrame garantit que le conteneur a ses dimensions CSS
        const raf = requestAnimationFrame(() => {
            if (!mapRef.current) return;

            try {

            const lats = validDests.map(d => d.location.lat);
            const lngs = validDests.map(d => d.location.lng);
            const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
            const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

            const map = window.L.map(mapRef.current, { zoomControl: true, zoomAnimation: false, markerZoomAnimation: false, fadeAnimation: false }).setView([centerLat, centerLng], 6);
            mapInstanceRef.current = map;

            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
                crossOrigin: false,
            }).on('tileerror', () => { /* silencieux */ }).addTo(map);

            // Marqueurs
            validDests.forEach((dest, i) => {
                const popup = `<b style="font-size:0.95rem">${dest.name}</b>${dest.location.address ? `<br/><small>${dest.location.address}</small>` : ''}`;

                if (showRoute) {
                    const icon = window.L.divIcon({
                        className: '',
                        html: `<div style="
                            background:#4f46e5;color:white;width:28px;height:28px;
                            border-radius:50%;display:flex;align-items:center;
                            justify-content:center;font-weight:800;font-size:13px;
                            border:2px solid white;box-shadow:0 2px 8px rgba(79,70,229,0.5);
                            font-family:sans-serif;
                        ">${i + 1}</div>`,
                        iconSize: [28, 28],
                        iconAnchor: [14, 14],
                    });
                    window.L.marker([dest.location.lat, dest.location.lng], { icon })
                        .addTo(map)
                        .bindPopup(`<b>Étape ${i + 1} : ${dest.name}</b>${dest.location.address ? `<br/><small>${dest.location.address}</small>` : ''}`);
                } else {
                    window.L.marker([dest.location.lat, dest.location.lng])
                        .addTo(map)
                        .bindPopup(popup);
                }
            });

            // Polyline de route
            if (showRoute && validDests.length > 1) {
                window.L.polyline(
                    validDests.map(d => [d.location.lat, d.location.lng]),
                    { color: '#4f46e5', weight: 3, opacity: 0.75, dashArray: '10, 8' }
                ).addTo(map);
            }

            // Ajuster le zoom sur tous les marqueurs
            if (validDests.length > 1) {
                map.fitBounds(
                    window.L.latLngBounds(validDests.map(d => [d.location.lat, d.location.lng])),
                    { padding: [40, 40] }
                );
            }

            // Force Leaflet à recalculer la taille (cas où le container n'était pas encore visible)
            setTimeout(() => {
                if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
            }, 150);

            } catch (err) {
                console.warn('DestinationsMap init error:', err);
            }
        });

        return () => {
            cancelAnimationFrame(raf);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [destinations, showRoute]);

    const hasValidDests = (destinations || []).some(d => d.location?.lat && d.location?.lng);
    if (!hasValidDests) return null;

    return (
        <div className="destinations-map-wrapper">
            <div ref={mapRef} className="destinations-map" />
        </div>
    );
}
