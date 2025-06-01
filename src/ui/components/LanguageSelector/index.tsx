import React, { useEffect, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

enum SupportedLngs {
  'es-ES' = 'es-ES',
  'en-GB' = 'en-GB',
}

const LanguageSelector: React.FC = () => {
  const { t, i18n } = useTranslation();
  const supportedLngs = Array.isArray(i18n.options.supportedLngs)
    ? i18n.options.supportedLngs.filter(lng => lng !== 'cimode')
    : ['es-ES', 'en-GB'];
  const currentLang = supportedLngs.includes(i18n.language) ? i18n.language : supportedLngs[0];
  const liveRegionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.lang = currentLang;
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = t('language.changed', {
        lng: t(`language.${currentLang}`),
      });
    }
  }, [currentLang, t]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value;
    if (newLang !== i18n.language && supportedLngs.includes(newLang)) {
      i18n
        .changeLanguage(newLang)
        .then(() => {
          localStorage.setItem('i18nextLng', newLang);
        })
        .catch(() => {
          if (liveRegionRef.current) {
            liveRegionRef.current.textContent = t('language.change_error');
          }
        });
    }
  };

  return (
    <div className="d-flex align-items-center language-picker">
      <Form className="language-picker__form" data-testid="language-selector">
        <Form.Group className="language-picker__group">
          <Form.Label
            htmlFor="language-picker-select"
            className="visually-hidden language-picker__label"
            data-testid="lang-select-label">
            {t('language.selector_label')}
          </Form.Label>
          <Form.Select
            id="language-picker-select"
            name="language-picker-select"
            value={currentLang}
            className="language-picker__select"
            aria-label={t('language.selector_label')}
            onChange={handleChange}
            data-testid="language-picker-select">
            {supportedLngs.map((lng: SupportedLngs) => (
              <option data-testid={`language-picker__option_${lng}`} key={lng} value={lng}>
                {t(`language.${lng}`)}
              </option>
            ))}
          </Form.Select>
          <span id="language-selector-desc" className="visually-hidden">
            {t('language.selector_hint')}
          </span>
          <div
            ref={liveRegionRef}
            aria-live="polite"
            aria-atomic="true"
            className="visually-hidden"
          />
          <Button
            type="submit"
            className="visually-hidden language-picker__button"
            aria-label="English, Select your language"
            aria-expanded="false"
            aria-controls="language-picker-dropdown">
            <span
              aria-hidden="true"
              className="language-picker__flag language-picker__flag--english"></span>
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default LanguageSelector;
