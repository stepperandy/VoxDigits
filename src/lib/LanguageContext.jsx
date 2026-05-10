import { createContext, useState, useEffect, useContext } from 'react';

export const LanguageContext = createContext();

const translations = {
  en: {
    home: 'Home',
    features: 'Features',
    servers: 'Servers',
    pricing: 'Pricing',
    support: 'Support',
    logIn: 'Log In',
    signUp: 'Sign Up',
    choosePlan: 'Choose a Plan',
  },
  es: {
    home: 'Inicio',
    features: 'Características',
    servers: 'Servidores',
    pricing: 'Precios',
    support: 'Soporte',
    logIn: 'Iniciar sesión',
    signUp: 'Registrarse',
    choosePlan: 'Elegir un plan',
  },
  fr: {
    home: 'Accueil',
    features: 'Caractéristiques',
    servers: 'Serveurs',
    pricing: 'Tarification',
    support: 'Support',
    logIn: 'Connexion',
    signUp: 'S\'inscrire',
    choosePlan: 'Choisir un forfait',
  },
  de: {
    home: 'Startseite',
    features: 'Funktionen',
    servers: 'Server',
    pricing: 'Preisgestaltung',
    support: 'Unterstützung',
    logIn: 'Anmelden',
    signUp: 'Registrieren',
    choosePlan: 'Plan wählen',
  },
  zh: {
    home: '首页',
    features: '功能',
    servers: '服务器',
    pricing: '定价',
    support: '支持',
    logIn: '登录',
    signUp: '注册',
    choosePlan: '选择计划',
  },
  ja: {
    home: 'ホーム',
    features: '機能',
    servers: 'サーバー',
    pricing: '料金',
    support: 'サポート',
    logIn: 'ログイン',
    signUp: '登録',
    choosePlan: 'プランを選択',
  },
  ru: {
    home: 'Главная',
    features: 'Возможности',
    servers: 'Серверы',
    pricing: 'Цены',
    support: 'Поддержка',
    logIn: 'Вход',
    signUp: 'Зарегистрироваться',
    choosePlan: 'Выбрать план',
  },
  ar: {
    home: 'الرئيسية',
    features: 'الميزات',
    servers: 'الخوادم',
    pricing: 'التسعير',
    support: 'الدعم',
    logIn: 'تسجيل الدخول',
    signUp: 'التسجيل',
    choosePlan: 'اختر خطة',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('voxvpn_language') || 'en';
    setLanguage(saved);
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('voxvpn_language', lang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}