// Liens comparateurs de voyage — logos SVG offline (pas de Clearbit)
const COMPARATORS = [
    {
        name: 'Booking',
        bg: '#003580',
        icon: (
            <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
                <rect width="40" height="40" rx="8" fill="#003580"/>
                <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle"
                    fill="white" fontWeight="800" fontSize="13" fontFamily="sans-serif">B.</text>
            </svg>
        ),
        url: (dest) => `https://www.booking.com/searchresults.fr.html?ss=${encodeURIComponent(dest.location?.address || dest.name)}`,
    },
    {
        name: 'Airbnb',
        bg: '#FF5A5F',
        icon: (
            <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
                <rect width="40" height="40" rx="8" fill="#FF5A5F"/>
                <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle"
                    fill="white" fontWeight="800" fontSize="14" fontFamily="sans-serif">♡</text>
            </svg>
        ),
        url: (dest) => `https://www.airbnb.fr/s/${encodeURIComponent(dest.location?.address || dest.name)}/homes`,
    },
    {
        name: 'Kayak',
        bg: '#FF690F',
        icon: (
            <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
                <rect width="40" height="40" rx="8" fill="#FF690F"/>
                <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle"
                    fill="white" fontWeight="800" fontSize="13" fontFamily="sans-serif">K</text>
            </svg>
        ),
        url: (dest) => `https://www.kayak.fr/hotels/${encodeURIComponent(dest.name)}`,
    },
    {
        name: 'Skyscanner',
        bg: '#0770E3',
        icon: (
            <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
                <rect width="40" height="40" rx="8" fill="#0770E3"/>
                <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle"
                    fill="white" fontWeight="800" fontSize="16" fontFamily="sans-serif">✈</text>
            </svg>
        ),
        url: (dest) => `https://www.skyscanner.fr/hotels/${encodeURIComponent(dest.name)}`,
    },
    {
        name: 'Trainline',
        bg: '#00A88F',
        icon: (
            <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
                <rect width="40" height="40" rx="8" fill="#00A88F"/>
                <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle"
                    fill="white" fontWeight="800" fontSize="16" fontFamily="sans-serif">🚆</text>
            </svg>
        ),
        url: (dest) => `https://www.trainline.fr/search/${encodeURIComponent(dest.name)}`,
    },
];

export default function TravelComparators({ destination }) {
    return (
        <section className="comparator-section">
            <h2>Comparer les offres</h2>
            <div className="comparator-links">
                {COMPARATORS.map(link => (
                    <a
                        key={link.name}
                        href={link.url(destination)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="comparator-link"
                        style={{ background: link.bg }}
                    >
                        {link.icon}
                        <span className="comparator-name">{link.name}</span>
                    </a>
                ))}
            </div>
        </section>
    );
}
