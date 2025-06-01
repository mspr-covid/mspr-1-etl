import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  
  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  const getCurrentLanguageFlag = () => {
    const lang = i18n.language;
    switch (lang) {
      case 'fr':
        return '🇫🇷';
      case 'it':
        return '🇮🇹';
      case 'de':
        return '🇩🇪';
      default:
        return '🇬🇧';
    }
  };

  return (
    <Dropdown className="language-selector">
      <Dropdown.Toggle variant="light" id="dropdown-language" className="d-flex align-items-center">
        <span className="me-1">{getCurrentLanguageFlag()}</span>
        <span className="d-none d-md-inline">{t('languages.select')}</span>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => changeLanguage('en')} active={i18n.language === 'en'}>
          🇬🇧 {t('languages.en')}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => changeLanguage('fr')} active={i18n.language === 'fr'}>
          🇫🇷 {t('languages.fr')}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => changeLanguage('it')} active={i18n.language === 'it'}>
          🇮🇹 {t('languages.it')}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => changeLanguage('de')} active={i18n.language === 'de'}>
          🇩🇪 {t('languages.de')}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSelector;