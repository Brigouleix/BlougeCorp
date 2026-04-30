import { createContext, useContext, useState } from 'react';
import { translations } from './translations';

const LanguageContext = createContext({ lang: 'fr', setLang: () => {} });

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState(() => localStorage.getItem('lang') || 'fr');

    const setLang = (code) => {
        setLangState(code);
        localStorage.setItem('lang', code);
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const { lang, setLang } = useContext(LanguageContext);

    const t = (key) => {
        return translations[lang]?.[key] ?? translations['fr']?.[key] ?? key;
    };

    return { t, lang, setLang };
}
