// Simule une connexion réussie ou échouée
export const mockLogin = (email, password) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email === "test@email.com" && password === "123456") {
                resolve({ user: { id: 1, email } });
            } else {
                reject(new Error("Identifiants incorrects"));
            }
        }, 1000); // Délais réseaux
    });
};