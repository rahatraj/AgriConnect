import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from 'react-daisyui';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'mr', name: 'मराठी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'pn', name: 'ਪੰਜਾਬੀ' }
  ];

  const changeLanguage = (event) => {
    const languageCode = event.target.value;
    i18n.changeLanguage(languageCode);
  };

  return (
    <Select
      value={i18n.language}
      onChange={changeLanguage}
      size="sm"
      width="auto"
      variant="outline"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </Select>
  );
};

export default LanguageSwitcher; 