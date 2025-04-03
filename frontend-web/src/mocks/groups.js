export const mockFetchGroups = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    name: "Vacances Bretagne",
                    members: ["test@email.com"],
                    destination: "Saint-Malo",
                    dates: "01-15 Août 2024"
                }
            ]);
        }, 800);
    });
};