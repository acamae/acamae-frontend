jest.mock('react-i18next');

import { screen, fireEvent, render, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import LanguageSelector from '@ui/components/LanguageSelector';

let setItemSpy: jest.SpyInstance;
function setupUseTranslation({
  lang = 'es-ES',
  t = (str: string) => str,
  changeLanguage = createChangeLanguageMock(),
  supportedLngs = ['es-ES', 'en-GB'],
} = {}) {
  (useTranslation as jest.Mock).mockReturnValue({
    t,
    i18n: {
      language: lang,
      changeLanguage,
      options: { supportedLngs },
    },
  });
}

function createChangeLanguageMock(shouldResolve = true) {
  return jest.fn(() => (shouldResolve ? Promise.resolve() : Promise.reject(new Error('error'))));
}

function renderLanguageSelector() {
  return render(<LanguageSelector />);
}

describe('LanguageSelector', () => {
  beforeEach(() => {
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(jest.fn());
  });

  afterEach(() => {
    setItemSpy.mockRestore();
  });

  it('Should render the selector with the current language selected (es)', () => {
    setupUseTranslation();
    renderLanguageSelector();
    const selectElement = screen.getByTestId('language-picker-select') as HTMLSelectElement;
    expect(selectElement).toBeInTheDocument();
    expect(selectElement.value).toBe('es-ES');
  });

  it('Should render the selector with the current language selected (en)', () => {
    setupUseTranslation({ lang: 'en-GB' });
    renderLanguageSelector();
    const selectElement = screen.getByTestId('language-picker-select') as HTMLSelectElement;
    expect(selectElement.value).toBe('en-GB');
  });

  it('Should call the changeLanguage function of the hook and localStorage.setItem when changing the language', async () => {
    const changeLanguageMock = createChangeLanguageMock(); // success
    setupUseTranslation({ changeLanguage: changeLanguageMock });
    renderLanguageSelector();
    const selectElement = screen.getByTestId('language-picker-select') as HTMLSelectElement;
    fireEvent.change(selectElement, { target: { value: 'en-GB' } });

    await waitFor(() => {
      expect(changeLanguageMock).toHaveBeenCalledWith('en-GB');
      expect(setItemSpy).toHaveBeenCalledWith('i18nextLng', 'en-GB');
    });
  });

  it('Should not call changeLanguage or localStorage.setItem if the same language is selected', async () => {
    const changeLanguageMock = createChangeLanguageMock(false); // error
    setupUseTranslation({ changeLanguage: changeLanguageMock });
    renderLanguageSelector();
    const selectElement = screen.getByTestId('language-picker-select') as HTMLSelectElement;
    fireEvent.change(selectElement, { target: { value: 'es-ES' } });

    await waitFor(() => {
      expect(changeLanguageMock).not.toHaveBeenCalled();
      expect(setItemSpy).not.toHaveBeenCalled();
    });
  });

  it('Should have a hidden label for accessibility', () => {
    setupUseTranslation();
    renderLanguageSelector();
    const label = screen.getByLabelText('language.selector_label');
    expect(label).toBeInTheDocument();
  });

  it('Should not call changeLanguage with unsupported language', async () => {
    const changeLanguageMock = createChangeLanguageMock(false);
    setupUseTranslation({ changeLanguage: changeLanguageMock });
    renderLanguageSelector();
    const selectElement = screen.getByTestId('language-picker-select') as HTMLSelectElement;
    fireEvent.change(selectElement, { target: { value: 'fr-FR' } });

    await waitFor(() => {
      expect(changeLanguageMock).not.toHaveBeenCalled();
      expect(selectElement.value).toBe('es-ES');
    });
  });

  it('Should show the available options', () => {
    setupUseTranslation();
    renderLanguageSelector();
    expect(screen.getByTestId('language-picker__option_es-ES')).toBeInTheDocument();
    expect(screen.getByTestId('language-picker__option_en-GB')).toBeInTheDocument();
  });

  it('snapshot: render of the selector', () => {
    setupUseTranslation();
    renderLanguageSelector();
    const { asFragment } = renderLanguageSelector();
    expect(asFragment()).toMatchSnapshot();
  });
});
