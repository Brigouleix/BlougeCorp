import { mockLogin } from '../mocks/auth';
import { mockFetchGroups } from '../mocks/groups';

export const login = mockLogin;
export const fetchGroups = mockFetchGroups;

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const user = await login(email, password); // Utilise ton service mock�
        console.log("Connect� :", user);
        // Redirige vers /groups apr�s connexion
    } catch (error) {
        setError("Identifiants incorrects");
    }
};