// Simule une connexion r�ussie ou �chou�e
export const mockLogin = (email, password) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email === "test@email.com" && password === "123456") {
                resolve({ user: { id: 1, email } });
            } else {
                reject(new Error("Identifiants incorrects"));
            }
        }, 1000); // D�lai r�seau simul�
    });
};