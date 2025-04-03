import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import GradientButton from '../components/GradientButton';
import logo from '../assets/blouge.svg';
import { login } from '../services/api';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, password);
            if (user) {
                navigate('/groups'); // Corrigé ici
            }
        } catch (error) {
            console.error("Erreur de connexion", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md">
                <img src={logo} alt="Logo" className="mx-auto h-16 mb-8" />

                <Card>
                    <h1 className="text-2xl font-bold text-center mb-6">Connexion</h1>

                    {/* Ajout de onSubmit au formulaire */}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>

                        {/* Correction : type="submit" pour déclencher handleSubmit */}
                        <GradientButton type="submit">
                            Se connecter
                        </GradientButton>
                    </form>
                </Card>
            </div>
        </div>
    );
}
