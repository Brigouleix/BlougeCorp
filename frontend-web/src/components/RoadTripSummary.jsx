import DestinationsMap from './DestinationsMap';

export default function RoadTripSummary({ destinations = [], members = [] }) {
    const totalPriceHouse = destinations.reduce((sum, d) => sum + (parseFloat(d.priceHouse) || 0), 0);
    const totalPriceTravel = destinations.reduce((sum, d) => sum + (parseFloat(d.priceTravel) || 0), 0);
    const budgetTotal = totalPriceHouse + totalPriceTravel;
    const budgetPerPerson = members.length > 0 ? (budgetTotal / members.length).toFixed(2) : null;

    const avgNote = (() => {
        const allRatings = destinations.flatMap(d =>
            (d.comments || []).map(c => parseInt(c.rating) || 0)
        );
        if (allRatings.length === 0) return null;
        return (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1);
    })();

    const handleExport = () => {
        const lines = [
            `=== ROAD TRIP — ${destinations.length} étapes ===`,
            '',
            `Destinations : ${destinations.map(d => d.name).join(' → ')}`,
            '',
            `Budget total : ${budgetTotal.toFixed(2)} €`,
            budgetPerPerson ? `Budget par personne : ${budgetPerPerson} €` : '',
            `Total hébergement : ${totalPriceHouse.toFixed(2)} €`,
            `Total transport : ${totalPriceTravel.toFixed(2)} €`,
            avgNote ? `Note moyenne : ${avgNote} / 5` : '',
            '',
            members.length > 0 ? `Membres (${members.length}) : ${members.join(', ')}` : '',
        ].filter(l => l !== undefined);

        const text = lines.join('\n');
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => alert('Résumé copié dans le presse-papier !'));
        } else {
            window.print();
        }
    };

    return (
        <div className="road-trip-summary">
            <h2 className="road-trip-summary-title">
                🗺️ Road Trip — {destinations.length} étape{destinations.length !== 1 ? 's' : ''}
            </h2>

            {/* Pills de destinations */}
            <div className="road-trip-pills">
                {destinations.map((d, i) => (
                    <span key={d.id ?? i} className="road-trip-pill">{d.name}</span>
                ))}
            </div>

            {/* Stats */}
            <div className="road-trip-stats">
                <div className="road-trip-stat">
                    <span className="road-trip-stat-label">Budget total</span>
                    <span className="road-trip-stat-value">{budgetTotal.toFixed(2)} €</span>
                </div>
                <div className="road-trip-stat">
                    <span className="road-trip-stat-label">Hébergement</span>
                    <span className="road-trip-stat-value">{totalPriceHouse.toFixed(2)} €</span>
                </div>
                <div className="road-trip-stat">
                    <span className="road-trip-stat-label">Transport</span>
                    <span className="road-trip-stat-value">{totalPriceTravel.toFixed(2)} €</span>
                </div>
                {budgetPerPerson && (
                    <div className="road-trip-stat">
                        <span className="road-trip-stat-label">Par personne</span>
                        <span className="road-trip-stat-value">{budgetPerPerson} €</span>
                    </div>
                )}
                {avgNote && (
                    <div className="road-trip-stat">
                        <span className="road-trip-stat-label">Note moyenne</span>
                        <span className="road-trip-stat-value">{avgNote} ⭐</span>
                    </div>
                )}
            </div>

            {/* Carte */}
            <DestinationsMap destinations={destinations} />

            {/* Bouton export */}
            <button className="create-group-button road-trip-export-btn" onClick={handleExport}>
                📋 Copier le résumé
            </button>
        </div>
    );
}
