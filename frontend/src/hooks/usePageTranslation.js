import { useTranslation } from 'react-i18next';

export const usePageTranslation = (page) => {
  const { t, i18n } = useTranslation();

  const translatePage = (key) => {
    return t(`pages.${page}.${key}`);
  };

  const translateCommon = (category, key) => {
    return t(`common.${category}.${key}`);
  };

  return {
    tp: translatePage,           // translate page-specific content
    tc: translateCommon,         // translate common elements
    t,                          // original translate function
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage
  };
};

// Usage example:
/*
const MyComponent = () => {
  const { tp, tc } = usePageTranslation('home');
  
  return (
    <div>
      <h1>{tp('title')}</h1>          // translates 'pages.home.title'
      <button>{tc('buttons', 'save')}</button>  // translates 'common.buttons.save'
    </div>
  );
};
*/ 