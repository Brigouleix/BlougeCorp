export const mockFetchGroups = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    name: "Vacances Bretagne",
                    members: ["test@email.com"],
                    destination: "Saint-Malo",
                    dates: "01-15 Ao�t 2024"
                }
            ]);
        }, 800);
    });
};