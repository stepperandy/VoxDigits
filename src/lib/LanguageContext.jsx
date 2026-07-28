import { createContext, useState, useEffect, useContext } from 'react';
import { base44 } from '@/api/base44Client';

export const LanguageContext = createContext();

const translations = {
  en: {
    home: 'Home', features: 'Features', servers: 'Servers', pricing: 'Pricing',
    support: 'Support', logIn: 'Log In', signUp: 'Sign Up', choosePlan: 'Choose a Plan',
    heroTitle: 'Your Privacy. Fully Protected.',
    heroSubtitle: 'VoxVPN shields your identity with military-grade encryption, a strict no-logs policy, and blazing-fast servers in 60+ countries.',
    getVoxvpn: 'Get VoxVPN Now', seeHowItWorks: 'See How It Works',
    questionsContact: 'Questions? Contact us →',
    trustNoLogs: 'No-Logs Policy', trustAES: 'AES-256 Encryption', trustLocations: '60+ Locations',
    trustKillSwitch: 'Kill Switch', trustMoneyBack: '30-Day Money-Back', trustSupport: '24/7 Support',
    vpnStatusCard: 'VPN Status Card', protected: 'Protected', disconnect: 'Disconnect', founded: 'Founded 2020',
    footerTagline: 'Your privacy is our priority. Stay protected, stay unrestricted.',
    weAccept: 'We Accept', followUs: 'Follow Us',
    footerRights: '© 2026 VoxDigits Communications LLC. All rights reserved. www.voxvpn.net',
    footerAbout: 'About', footerContact: 'Contact', footerPrivacy: 'Privacy Policy',
    footerTerms: 'Terms', footerRefund: 'Refund Policy', footerCookie: 'Cookie Policy',
    aiAssistant: 'AI Assistant',
  },
  es: {
    home: 'Inicio', features: 'Características', servers: 'Servidores', pricing: 'Precios',
    support: 'Soporte', logIn: 'Iniciar sesión', signUp: 'Registrarse', choosePlan: 'Elegir un plan',
    heroTitle: 'Tu Privacidad. Totalmente Protegida.',
    heroSubtitle: 'VoxVPN protege tu identidad con cifrado de grado militar, una estricta política de no registro y servidores ultrarrápidos en más de 60 países.',
    getVoxvpn: 'Obtén VoxVPN Ahora', seeHowItWorks: 'Ver Cómo Funciona',
    questionsContact: '¿Preguntas? Contáctanos →',
    trustNoLogs: 'Sin Registros', trustAES: 'Cifrado AES-256', trustLocations: '60+ Ubicaciones',
    trustKillSwitch: 'Interruptor de Apagado', trustMoneyBack: '30 Días de Garantía', trustSupport: 'Soporte 24/7',
    vpnStatusCard: 'Tarjeta de Estado VPN', protected: 'Protegido', disconnect: 'Desconectar', founded: 'Fundada 2020',
    footerTagline: 'Tu privacidad es nuestra prioridad. Mantente protegido, mantente sin restricciones.',
    weAccept: 'Aceptamos', followUs: 'Síguenos',
    footerRights: '© 2026 VoxDigits Communications LLC. Todos los derechos reservados. www.voxvpn.net',
    footerAbout: 'Acerca de', footerContact: 'Contacto', footerPrivacy: 'Política de Privacidad',
    footerTerms: 'Términos', footerRefund: 'Política de Reembolso', footerCookie: 'Política de Cookies',
    aiAssistant: 'Asistente IA',
  },
  fr: {
    home: 'Accueil', features: 'Caractéristiques', servers: 'Serveurs', pricing: 'Tarification',
    support: 'Support', logIn: 'Connexion', signUp: "S'inscrire", choosePlan: 'Choisir un forfait',
    heroTitle: 'Votre Confidentialité. Totalement Protégée.',
    heroSubtitle: "VoxVPN protège votre identité avec un chiffrement de qualité militaire, une politique stricte de non-journalisation et des serveurs ultra-rapides dans plus de 60 pays.",
    getVoxvpn: 'Obtenez VoxVPN Maintenant', seeHowItWorks: "Voir Comment Ça Marche",
    questionsContact: 'Des questions ? Contactez-nous →',
    trustNoLogs: 'Sans Journal', trustAES: 'Chiffrement AES-256', trustLocations: '60+ Emplacements',
    trustKillSwitch: "Coupure d'Urgence", trustMoneyBack: '30 Jours Garantis', trustSupport: 'Support 24/7',
    vpnStatusCard: "Carte d'État VPN", protected: 'Protégé', disconnect: 'Déconnecter', founded: 'Fondée en 2020',
    footerTagline: 'Votre confidentialité est notre priorité. Restez protégé, restez sans restriction.',
    weAccept: 'Nous Acceptons', followUs: 'Suivez-nous',
    footerRights: '© 2026 VoxDigits Communications LLC. Tous droits réservés. www.voxvpn.net',
    footerAbout: 'À Propos', footerContact: 'Contact', footerPrivacy: 'Politique de Confidentialité',
    footerTerms: 'Conditions', footerRefund: 'Politique de Remboursement', footerCookie: 'Politique de Cookies',
    aiAssistant: 'Assistant IA',
  },
  de: {
    home: 'Startseite', features: 'Funktionen', servers: 'Server', pricing: 'Preisgestaltung',
    support: 'Unterstützung', logIn: 'Anmelden', signUp: 'Registrieren', choosePlan: 'Plan wählen',
    heroTitle: 'Ihre Privatsphäre. Vollständig Geschützt.',
    heroSubtitle: 'VoxVPN schützt Ihre Identität mit militärischer Verschlüsselung, einer strengen No-Logs-Richtlinie und blitzschnellen Servern in über 60 Ländern.',
    getVoxvpn: 'VoxVPN Jetzt Holen', seeHowItWorks: "So Funktioniert's",
    questionsContact: 'Fragen? Kontaktieren Sie uns →',
    trustNoLogs: 'Keine Protokolle', trustAES: 'AES-256-Verschlüsselung', trustLocations: '60+ Standorte',
    trustKillSwitch: 'Kill-Switch', trustMoneyBack: '30 Tage Geld-zurück', trustSupport: '24/7 Support',
    vpnStatusCard: 'VPN-Statuskarte', protected: 'Geschützt', disconnect: 'Trennen', founded: 'Gegründet 2020',
    footerTagline: 'Ihre Privatsphäre ist unsere Priorität. Bleiben Sie geschützt, bleiben Sie unbeschränkt.',
    weAccept: 'Wir Akzeptieren', followUs: 'Folgen Sie Uns',
    footerRights: '© 2026 VoxDigits Communications LLC. Alle Rechte vorbehalten. www.voxvpn.net',
    footerAbout: 'Über Uns', footerContact: 'Kontakt', footerPrivacy: 'Datenschutzrichtlinie',
    footerTerms: 'AGB', footerRefund: 'Rückerstattungsrichtlinie', footerCookie: 'Cookie-Richtlinie',
    aiAssistant: 'KI-Assistent',
  },
  zh: {
    home: '首页', features: '功能', servers: '服务器', pricing: '定价',
    support: '支持', logIn: '登录', signUp: '注册', choosePlan: '选择计划',
    heroTitle: '您的隐私。全面保护。',
    heroSubtitle: 'VoxVPN 以军用级加密、严格的无日志策略和覆盖60+国家的超快服务器保护您的身份。',
    getVoxvpn: '立即获取 VoxVPN', seeHowItWorks: '查看工作原理',
    questionsContact: '有疑问？联系我们 →',
    trustNoLogs: '无日志政策', trustAES: 'AES-256 加密', trustLocations: '60+ 地区',
    trustKillSwitch: '终止开关', trustMoneyBack: '30天退款保证', trustSupport: '24/7 支持',
    vpnStatusCard: 'VPN 状态卡', protected: '已保护', disconnect: '断开连接', founded: '成立于2020年',
    footerTagline: '您的隐私是我们的首要任务。保持受保护，保持无限制。',
    weAccept: '我们接受', followUs: '关注我们',
    footerRights: '© 2026 VoxDigits Communications LLC. 版权所有. www.voxvpn.net',
    footerAbout: '关于', footerContact: '联系', footerPrivacy: '隐私政策',
    footerTerms: '条款', footerRefund: '退款政策', footerCookie: 'Cookie政策',
    aiAssistant: 'AI助手',
  },
  ja: {
    home: 'ホーム', features: '機能', servers: 'サーバー', pricing: '料金',
    support: 'サポート', logIn: 'ログイン', signUp: '登録', choosePlan: 'プランを選択',
    heroTitle: 'あなたのプライバシー。完全に保護。',
    heroSubtitle: 'VoxVPNは軍事級暗号化、厳格なノーログポリシー、60カ国以上の超高速サーバーであなたの身元を保護します。',
    getVoxvpn: '今すぐVoxVPNを入手', seeHowItWorks: '仕組みを見る',
    questionsContact: 'ご質問は？お問い合わせ →',
    trustNoLogs: 'ノーログポリシー', trustAES: 'AES-256暗号化', trustLocations: '60以上のロケーション',
    trustKillSwitch: 'キルスイッチ', trustMoneyBack: '30日返金保証', trustSupport: '24/7サポート',
    vpnStatusCard: 'VPNステータスカード', protected: '保護中', disconnect: '切断', founded: '2020年創業',
    footerTagline: 'あなたのプライバシーが私たちの最優先事項です。保護され、制限なく。',
    weAccept: '対応決済', followUs: 'フォローする',
    footerRights: '© 2026 VoxDigits Communications LLC. All rights reserved. www.voxvpn.net',
    footerAbout: '会社情報', footerContact: 'お問い合わせ', footerPrivacy: 'プライバシーポリシー',
    footerTerms: '利用規約', footerRefund: '返金ポリシー', footerCookie: 'Cookieポリシー',
    aiAssistant: 'AIアシスタント',
  },
  ru: {
    home: 'Главная', features: 'Возможности', servers: 'Серверы', pricing: 'Цены',
    support: 'Поддержка', logIn: 'Вход', signUp: 'Зарегистрироваться', choosePlan: 'Выбрать план',
    heroTitle: 'Ваша конфиденциальность. Полная защита.',
    heroSubtitle: 'VoxVPN защищает вашу личность с помощью военного шифрования, строгой политики отсутствия журналов и молниеносных серверов в 60+ странах.',
    getVoxvpn: 'Получить VoxVPN Сейчас', seeHowItWorks: 'Как Это Работает',
    questionsContact: 'Вопросы? Свяжитесь с нами →',
    trustNoLogs: 'Без логов', trustAES: 'Шифрование AES-256', trustLocations: '60+ локаций',
    trustKillSwitch: 'Kill Switch', trustMoneyBack: 'Возврат 30 дней', trustSupport: 'Поддержка 24/7',
    vpnStatusCard: 'Карта статуса VPN', protected: 'Защищено', disconnect: 'Отключить', founded: 'Основано в 2020',
    footerTagline: 'Ваша конфиденциальность — наш приоритет. Оставайтесь защищёнными, оставайтесь свободными.',
    weAccept: 'Мы принимаем', followUs: 'Подписывайтесь',
    footerRights: '© 2026 VoxDigits Communications LLC. Все права защищены. www.voxvpn.net',
    footerAbout: 'О нас', footerContact: 'Контакты', footerPrivacy: 'Политика конфиденциальности',
    footerTerms: 'Условия', footerRefund: 'Политика возврата', footerCookie: 'Политика Cookie',
    aiAssistant: 'ИИ-ассистент',
  },
  ar: {
    home: 'الرئيسية', features: 'الميزات', servers: 'الخوادم', pricing: 'التسعير',
    support: 'الدعم', logIn: 'تسجيل الدخول', signUp: 'التسجيل', choosePlan: 'اختر خطة',
    heroTitle: 'خصوصيتك. محمية بالكامل.',
    heroSubtitle: 'يحمي VoxVPN هويتك بتشفير عسكري، وسياسة صارمة لعدم حفظ السجلات، وخوادم فائقة السرعة في أكثر من 60 دولة.',
    getVoxvpn: 'احصل على VoxVPN الآن', seeHowItWorks: 'شاهد كيف يعمل',
    questionsContact: 'أسئلة؟ تواصل معنا ←',
    trustNoLogs: 'بدون سجلات', trustAES: 'تشفير AES-256', trustLocations: '+60 موقعًا',
    trustKillSwitch: 'مفتاح الإيقاف', trustMoneyBack: 'استرداد خلال 30 يومًا', trustSupport: 'دعم 24/7',
    vpnStatusCard: 'بطاقة حالة VPN', protected: 'محمي', disconnect: 'قطع الاتصال', founded: 'تأسس 2020',
    footerTagline: 'خصوصيتك هي أولويتنا. ابقَ محميًا، ابقَ بلا قيود.',
    weAccept: 'نقبل', followUs: 'تابعنا',
    footerRights: '© 2026 VoxDigits Communications LLC. جميع الحقوق محفوظة. www.voxvpn.net',
    footerAbout: 'من نحن', footerContact: 'اتصل بنا', footerPrivacy: 'سياسة الخصوصية',
    footerTerms: 'الشروط', footerRefund: 'سياسة الاسترداد', footerCookie: 'سياسة ملفات تعريف الارتباط',
    aiAssistant: 'مساعد الذكاء الاصطناعي',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Respect a previously saved manual choice
    const saved = localStorage.getItem('voxvpn_language');
    if (saved && translations[saved]) {
      setLanguage(saved);
      return;
    }
    // No saved preference — detect from the visitor's IP (once)
    let cancelled = false;
    base44.functions.invoke('detectLanguageByIp', {})
      .then((res) => {
        const data = res?.data || res;
        const detected = data?.language;
        if (!cancelled && detected && translations[detected]) {
          setLanguage(detected);
          localStorage.setItem('voxvpn_language', detected);
        }
      })
      .catch(() => { /* fall back to English silently */ });
    return () => { cancelled = true; };
  }, []);

  // Sync <html lang> and text direction (RTL for Arabic) whenever language changes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

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