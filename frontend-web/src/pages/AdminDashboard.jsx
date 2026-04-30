import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getCurrentUser,
    fetchAdminStats, fetchAdminUsers, adminDeleteUser,
    fetchAdminGroups, adminDeleteGroup,
    fetchAdminDestinations, adminDeleteDestination,
    adminTestEmail,
} from '../services/api';
import '../styles/AdminDashboard.css';

const ADMIN_EMAIL = 'antoine.brigouleix@gmail.com';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const user = getCurrentUser();

    const [stats, setStats]               = useState(null);
    const [users, setUsers]               = useState([]);
    const [groups, setGroups]             = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [activeTab, setActiveTab]       = useState('stats');
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');
    const [emailTestMsg, setEmailTestMsg] = useState('');

    useEffect(() => {
        if (!user || user.email !== ADMIN_EMAIL) {
            navigate('/my-groups');
            return;
        }
        loadStats();
    }, []);

    async function loadStats() {
        try {
            setLoading(true);
            const s = await fetchAdminStats();
            setStats(s);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function loadUsers() {
        try {
            setLoading(true);
            const data = await fetchAdminUsers();
            setUsers(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function loadGroups() {
        try {
            setLoading(true);
            const data = await fetchAdminGroups();
            setGroups(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function loadDestinations() {
        try {
            setLoading(true);
            const data = await fetchAdminDestinations();
            setDestinations(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    const switchTab = (tab) => {
        setActiveTab(tab);
        setError('');
        if (tab === 'stats') loadStats();
        if (tab === 'users') loadUsers();
        if (tab === 'groups') loadGroups();
        if (tab === 'destinations') loadDestinations();
    };

    const handleDeleteUser = async (id, email) => {
        if (!window.confirm(`Supprimer l'utilisateur ${email} ?`)) return;
        try {
            await adminDeleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (e) { alert(e.message); }
    };

    const handleDeleteGroup = async (id, name) => {
        if (!window.confirm(`Supprimer le groupe "${name}" et toutes ses données ?`)) return;
        try {
            await adminDeleteGroup(id);
            setGroups(prev => prev.filter(g => g.id !== id));
            if (stats) setStats(prev => ({ ...prev, groups: prev.groups - 1 }));
        } catch (e) { alert(e.message); }
    };

    const handleTestEmail = async () => {
        setEmailTestMsg('Envoi en cours...');
        try {
            const r = await adminTestEmail();
            setEmailTestMsg('✅ ' + r.message);
        } catch (e) {
            setEmailTestMsg('❌ ' + e.message);
        }
    };

    const handleDeleteDestination = async (id, name) => {
        if (!window.confirm(`Supprimer définitivement la destination "${name}" ?`)) return;
        try {
            await adminDeleteDestination(id);
            setDestinations(prev => prev.filter(d => d.id !== id));
            if (stats) setStats(prev => ({ ...prev, destinations: prev.destinations - 1 }));
        } catch (e) { alert(e.message); }
    };

    if (!user || user.email !== ADMIN_EMAIL) return null;

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1 className="admin-title">🛡️ Dashboard Admin</h1>
                <p className="admin-subtitle">Connecté en tant que <strong>{user.email}</strong></p>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                {['stats', 'users', 'groups', 'destinations'].map(tab => (
                    <button
                        key={tab}
                        className={`admin-tab${activeTab === tab ? ' admin-tab-active' : ''}`}
                        onClick={() => switchTab(tab)}
                    >
                        {tab === 'stats'        && '📊 Statistiques'}
                        {tab === 'users'        && '👥 Utilisateurs'}
                        {tab === 'groups'       && '🗂️ Groupes'}
                        {tab === 'destinations' && '📍 Destinations'}
                    </button>
                ))}
            </div>

            {/* Test email */}
            <div className="admin-email-test">
                <button className="admin-email-test-btn" onClick={handleTestEmail}>
                    📧 Tester l'envoi d'email
                </button>
                {emailTestMsg && (
                    <span className={`admin-email-test-result ${emailTestMsg.startsWith('✅') ? 'ok' : 'err'}`}>
                        {emailTestMsg}
                    </span>
                )}
            </div>

            {error && <p className="admin-error">{error}</p>}
            {loading && <p className="admin-loading">Chargement...</p>}

            {/* Stats */}
            {activeTab === 'stats' && stats && !loading && (
                <div className="admin-stats-grid">
                    <StatCard icon="👥" label="Utilisateurs"  value={stats.users} />
                    <StatCard icon="🗂️" label="Groupes"       value={stats.groups} />
                    <StatCard icon="📍" label="Destinations"  value={stats.destinations} />
                    <StatCard icon="📦" label="Archivées"     value={stats.archived} />
                    <StatCard icon="💬" label="Commentaires"  value={stats.comments} />
                </div>
            )}

            {/* Users */}
            {activeTab === 'users' && !loading && (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Inscrit le</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>{u.username}</td>
                                    <td>{u.email}</td>
                                    <td>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                                    <td>
                                        {u.email !== ADMIN_EMAIL && (
                                            <button
                                                className="admin-delete-btn"
                                                onClick={() => handleDeleteUser(u.id, u.email)}
                                            >
                                                Supprimer
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Groups */}
            {activeTab === 'groups' && !loading && (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nom</th>
                                <th>Créateur</th>
                                <th>Créé le</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map(g => (
                                <tr key={g.id}>
                                    <td>{g.id}</td>
                                    <td>{g.name}</td>
                                    <td>{g.creator_name} <span className="admin-muted">({g.creator_email})</span></td>
                                    <td>{new Date(g.created_at).toLocaleDateString('fr-FR')}</td>
                                    <td>
                                        <button
                                            className="admin-delete-btn"
                                            onClick={() => handleDeleteGroup(g.id, g.name)}
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Destinations */}
            {activeTab === 'destinations' && !loading && (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nom</th>
                                <th>Groupe</th>
                                <th>Proposé par</th>
                                <th>Statut</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {destinations.map(d => (
                                <tr key={d.id}>
                                    <td>{d.id}</td>
                                    <td>{d.name}</td>
                                    <td>{d.group_name || '—'}</td>
                                    <td>{d.proposed_by || '—'}</td>
                                    <td>
                                        <span className={`admin-badge ${d.archived === '1' || d.archived === 1 ? 'admin-badge-archived' : 'admin-badge-active'}`}>
                                            {d.archived === '1' || d.archived === 1 ? 'Archivée' : 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="admin-delete-btn"
                                            onClick={() => handleDeleteDestination(d.id, d.name)}
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value }) {
    return (
        <div className="admin-stat-card">
            <span className="admin-stat-icon">{icon}</span>
            <span className="admin-stat-value">{value}</span>
            <span className="admin-stat-label">{label}</span>
        </div>
    );
}
