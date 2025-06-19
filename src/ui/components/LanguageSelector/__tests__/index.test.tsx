jest.mock('react-i18next');

import { screen, fireEvent, render, waitFor, act } from '@testing-library/react';
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

  it('should render the selector with the current language selected (es)', () => {
    setupUseTranslation();
    renderLanguageSelector();
    expect(screen.getByTestId('language-picker-select')).toBeInTheDocument();
    expect(screen.getByTestId('language-picker-select')).toHaveValue('es-ES');
  });

  it('should render the selector with the current language selected (en)', () => {
    setupUseTranslation({ lang: 'en-GB' });
    renderLanguageSelector();
    expect(screen.getByTestId('language-picker-select')).toHaveValue('en-GB');
  });

  it('should call the changeLanguage function of the hook and localStorage.setItem when changing the language', async () => {
    const changeLanguageMock = createChangeLanguageMock(); // success
    setupUseTranslation({ changeLanguage: changeLanguageMock });
    renderLanguageSelector();
    fireEvent.change(screen.getByTestId('language-picker-select'), { target: { value: 'en-GB' } });

    await waitFor(() => {
      expect(changeLanguageMock).toHaveBeenCalledWith('en-GB');
      expect(setItemSpy).toHaveBeenCalledWith('i18nextLng', 'en-GB');
    });
  });

  it('should not call changeLanguage or localStorage.setItem if the same language is selected', async () => {
    const changeLanguageMock = createChangeLanguageMock(false); // error
    setupUseTranslation({ changeLanguage: changeLanguageMock });
    renderLanguageSelector();
    fireEvent.change(screen.getByTestId('language-picker-select'), { target: { value: 'es-ES' } });

    await waitFor(() => {
      expect(changeLanguageMock).not.toHaveBeenCalled();
      expect(setItemSpy).not.toHaveBeenCalled();
    });
  });

  it('should have a hidden label for accessibility', () => {
    setupUseTranslation();
    renderLanguageSelector();
    const label = screen.getByLabelText('language.selector_label');
    expect(label).toBeInTheDocument();
  });

  it('should not call changeLanguage with unsupported language', async () => {
    const changeLanguageMock = createChangeLanguageMock(false);
    setupUseTranslation({ changeLanguage: changeLanguageMock });
    renderLanguageSelector();
    fireEvent.change(screen.getByTestId('language-picker-select'), { target: { value: 'fr-FR' } });

    await waitFor(() => {
      expect(changeLanguageMock).not.toHaveBeenCalled();
      expect(screen.getByTestId('language-picker-select')).toHaveValue('es-ES');
    });
  });

  it('should show the available options', () => {
    setupUseTranslation();
    renderLanguageSelector();
    expect(screen.getByTestId('language-picker__option_es-ES')).toBeInTheDocument();
    expect(screen.getByTestId('language-picker__option_en-GB')).toBeInTheDocument();
  });

  it('should render snapshot correctly', () => {
    setupUseTranslation();
    renderLanguageSelector();
    const { asFragment } = renderLanguageSelector();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should change language when selecting a different option', async () => {
    const changeLanguage = createChangeLanguageMock();
    setupUseTranslation({ changeLanguage });
    render(<LanguageSelector />);

    const select = screen.getByTestId('language-picker-select');
    await act(async () => {
      fireEvent.change(select, { target: { value: 'en-GB' } });
    });

    expect(changeLanguage).toHaveBeenCalledWith('en-GB');
  });

  it('should show current language as selected', () => {
    setupUseTranslation({ lang: 'es-ES' });
    render(<LanguageSelector />);

    expect(screen.getByTestId('language-picker-select')).toHaveValue('es-ES');
  });

  it('should save language in localStorage when changed', async () => {
    const changeLanguage = createChangeLanguageMock();
    setupUseTranslation({ changeLanguage });
    render(<LanguageSelector />);

    const select = screen.getByTestId('language-picker-select');
    await act(async () => {
      fireEvent.change(select, { target: { value: 'en-GB' } });
    });

    expect(setItemSpy).toHaveBeenCalledWith('i18nextLng', 'en-GB');
  });
});
