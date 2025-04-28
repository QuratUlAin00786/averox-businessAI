import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Language, Translations, getTranslations } from '@/lib/translations';

// Context interface
interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  setLanguage: (language: Language) => void;
  setRTL: (isRTL: boolean) => void;
  t: Translations;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language provider props
interface LanguageProviderProps {
  children: ReactNode;
}

// Language provider component
export function LanguageProvider({ children }: LanguageProviderProps) {
  // Default language is English
  const [language, setLanguageState] = useState<Language>('english');
  const [isRTL, setRTLState] = useState(false);
  const [translations, setTranslations] = useState<Translations>(getTranslations('english'));

  // Function to set language
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    
    // Automatically set RTL for Arabic
    if (newLanguage === 'arabic') {
      setRTLState(true);
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      // For all other languages, use LTR
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = newLanguage === 'english' ? 'en' : newLanguage.substring(0, 2);
    }
    
    // Update translations
    setTranslations(getTranslations(newLanguage));
    
    // Store language preference
    localStorage.setItem('language', newLanguage);
  };
  
  // Function to set RTL
  const setRTL = (rtl: boolean) => {
    setRTLState(rtl);
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    localStorage.setItem('rtl', rtl ? 'true' : 'false');
  };
  
  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    const savedRTL = localStorage.getItem('rtl') === 'true';
    
    if (savedLanguage) {
      setLanguageState(savedLanguage);
      setTranslations(getTranslations(savedLanguage));
    }
    
    if (savedRTL) {
      setRTLState(savedRTL);
      document.documentElement.dir = 'rtl';
    }
    
    // Set lang attribute based on language
    if (savedLanguage === 'arabic') {
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.lang = savedLanguage === 'english' ? 'en' : savedLanguage?.substring(0, 2) || 'en';
    }
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        isRTL,
        setLanguage,
        setRTL,
        t: translations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}