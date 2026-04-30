import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';

export default function RoadTripCard({ roadTrip = null, destinations = [], members = [], onDelete }) {
    const dests = roadTrip ? roadTrip.dests : destinations;
    const [hovered, setHovered] = useState(false);
    const leaveTimer = useRef(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const totalBudget = dests.reduce(
        (sum, d) => sum + (parseFloat(d.priceHouse) || 0) + (parseFloat(d.priceTravel) || 0), 0
    );
    const perPerson = members.length > 0 ? (totalBudget / members.length).toFixed(0) : null;
    const allRatings = dests.flatMap(d => (d.comments || []).map(c => parseInt(c.rating) || 0));
    const avgRating = allRatings.length > 0
        ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
        : null;

    const handleMouseEnter = () => {
        clearTimeout(leaveTimer.current);
        setHovered(true);
    };

    const handleMouseLeave = () => {
        leaveTimer.current = setTimeout(() => setHovered(false), 180);
    };

    const handleCardClick = () => {
        navigate('/roadtrip', { state: { roadTrip: roadTrip || { dests }, members } });
    };

    return (
        <div
            className={`road-trip-album-card ${hovered ? 'rt-hovered' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Stack shadow layers */}
            <div className="rt-stack-layer rt-layer-2" />
            <div className="rt-stack-layer rt-layer-1" />

            {/* Main card face */}
            <div className="rt-face" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
                <div className="rt-badge">🗺️ Road Trip</div>
                <h3 className="rt-title">
                    {dests.length} destination{dests.length !== 1 ? 's' : ''}
                </h3>
                <div className="rt-route">
                    {dests.map((d, i) => (
                        <span key={d.id ?? i}>
                            {i > 0 && <span className="rt-arrow">→</span>}
                            <span className="rt-stop">{d.name}</span>
                        </span>
                    ))}
                </div>
                <div className="rt-meta">
                    {totalBudget > 0 && <span>💶 {totalBudget.toFixed(0)} €{perPerson ? ` · ${perPerson} €/pers.` : ''}</span>}
                    {avgRating && <span>⭐ {avgRating}/5</span>}
                </div>
                <p className="rt-hint">{t('rt.hint')}</p>
            </div>

            {/* Fan des étapes — positionné en dessous de la card */}
            {hovered && (
                <div
                    className="rt-fan"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {dests.map((d, i) => {
                        const destRatings = (d.comments || []).map(c => parseInt(c.rating) || 0);
                        const destAvg = destRatings.length > 0
                            ? (destRatings.reduce((a, b) => a + b, 0) / destRatings.length).toFixed(1)
                            : '—';
                        const destBudgetPerPerson = members.length > 0
                            ? (((parseFloat(d.priceHouse) || 0) / members.length) + (parseFloat(d.priceTravel) || 0)).toFixed(0)
                            : null;

                        return (
                            <div
                                key={d.id ?? i}
                                className="rt-fan-card"
                                style={{ '--delay': `${i * 0.07}s` }}
                                onClick={() => navigate(`/groups/${d.id}`)}
                            >
                                {d.image && (
                                    <img src={d.image} alt={d.name} className="rt-fan-img" />
                                )}
                                <div className="rt-fan-info">
                                    <span className="rt-fan-step">{t('rt.step')} {i + 1}</span>
                                    <strong className="rt-fan-name">{d.name}</strong>
                                    <span className="rt-fan-rating">⭐ {destAvg}</span>
                                    {destBudgetPerPerson && (
                                        <span className="rt-fan-price">💶 {destBudgetPerPerson} €/pers.</span>
                                    )}
                                    {d.location?.address && (
                                        <span className="rt-fan-address">{d.location.address}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
