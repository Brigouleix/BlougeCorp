import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import '../styles/Groups.css';

// Couleurs de dégradé pour le placeholder selon l'initiale
const PLACEHOLDER_GRADIENTS = [
    ['#4f46e5', '#7c3aed'],
    ['#0ea5e9', '#6366f1'],
    ['#10b981', '#059669'],
    ['#f59e0b', '#ef4444'],
    ['#ec4899', '#8b5cf6'],
    ['#14b8a6', '#0891b2'],
];

function getGradient(name = '') {
    const idx = name.charCodeAt(0) % PLACEHOLDER_GRADIENTS.length;
    return PLACEHOLDER_GRADIENTS[idx];
}

export default function DestinationCards({
    id, name, image, comments = [], priceHouse, priceTravel,
    dates, proposedBy, members = [], location, showDelete, onDelete,
    onEdit, roadTripMode = false, selected = false, onSelect,
    isArchived = false,
    showPermDelete = false, onPermDelete,
}) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const averageRating =
        comments.length > 0
            ? (comments.reduce((sum, c) => sum + (parseInt(c.rating) || 0), 0) / comments.length).toFixed(1)
            : '—';

    let pricePerPerson;
    if (members.length > 0 && !isNaN(priceHouse) && !isNaN(priceTravel)) {
        pricePerPerson = ((priceHouse / members.length) + priceTravel).toFixed(2);
    } else if (members.length === 0) {
        pricePerPerson = t('dest.noMembers');
    } else {
        pricePerPerson = t('dest.priceTbd');
    }

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(id);
    };

    const handlePermDelete = (e) => {
        e.stopPropagation();
        if (onPermDelete) onPermDelete(id);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        if (onEdit) onEdit();
    };

    const handleClick = () => {
        if (roadTripMode) {
            if (onSelect) onSelect({ id, name, image, comments, priceHouse, priceTravel, dates, proposedBy, members, location });
        } else {
            navigate(`/groups/${id}`);
        }
    };

    const [g1, g2] = getGradient(name);
    const initial = name ? name.charAt(0).toUpperCase() : '✈';

    return (
        <div
            className={`group-card${selected ? ' card-selected' : ''}`}
            onClick={handleClick}
            style={{ position: 'relative' }}
        >
            {roadTripMode && (
                <div className="road-trip-checkbox">
                    <input type="checkbox" checked={selected} readOnly onClick={e => e.stopPropagation()} />
                </div>
            )}

            {/* Image ou placeholder */}
            {image ? (
                <img src={image} alt={name} className="group-image" />
            ) : (
                <div className="group-image-placeholder" style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}>
                    <span className="group-image-placeholder-initial">{initial}</span>
                    <span className="group-image-placeholder-icon">✈️</span>
                </div>
            )}

            <div className="group-info">
                <h2 className="group-name">{name}</h2>
                <p className="group-rating"><strong>{averageRating}</strong> ⭐</p>
                <p><strong>{t('dest.price')} :</strong> {pricePerPerson} €/pers.</p>
                <p><strong>{t('dest.dates')} :</strong> {dates}</p>
                <p><strong>{t('details.proposedBy')} :</strong> {proposedBy}</p>

                <div className="card-actions" onClick={e => e.stopPropagation()}>
                    {onEdit && !roadTripMode && (
                        <button className="card-action-btn card-action-edit" onClick={handleEdit} title={t('common.edit')}>
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            {t('common.edit')}
                        </button>
                    )}
                    {showDelete && !isArchived && (
                        <button className="card-action-btn card-action-archive" onClick={handleDelete} title={t('common.archive')}>
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
                            </svg>
                            {t('common.archive')}
                        </button>
                    )}
                    {showPermDelete && !isArchived && (
                        <button className="card-action-btn card-action-delete" onClick={handlePermDelete} title={t('common.delete')}>
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                                <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                            </svg>
                            {t('common.delete')}
                        </button>
                    )}
                    {isArchived && (
                        <button className="card-action-btn card-action-delete" onClick={handleDelete} title={t('common.deleteForever')}>
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                                <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                            </svg>
                            {t('common.deleteForever')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
