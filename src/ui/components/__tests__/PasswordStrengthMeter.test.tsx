import { render, screen, waitFor, cleanup } from '@testing-library/react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import translations from '@infrastructure/i18n/locales/es-ES.json';
import PasswordStrengthMeter from '@ui/components/PasswordStrengthMeter';

jest.mock('zxcvbn');
jest.mock('react-i18next');
jest.mock('@ui/hooks/useAuth');
jest.mock('@ui/hooks/useForm');
jest.mock('@ui/hooks/useToast');

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

const getTranslationForKey = (key: string): string => {
  const result = key
    .split('.')
    .reduce(
      (obj, k) =>
        obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[k] : undefined,
      translations as unknown
    );
  return typeof result === 'string' ? result : key;
};

beforeEach(() => {
  (useTranslation as jest.Mock).mockReturnValue({
    t: getTranslationForKey,
    i18n: { language: 'es-ES' },
  });
});

describe('PasswordStrengthMeter integration test', () => {
  let mockT: TFunction;

  beforeEach(() => {
    mockT = ((key: string) => {
      const result = getTranslationForKey(key);
      return result ?? key;
    }) as unknown as TFunction;
  });

  it('should render weak for empty password', async () => {
    render(<PasswordStrengthMeter password="" t={mockT} />);
    await waitFor(() => {
      expect(screen.getByTestId('password-strength-label')).toHaveTextContent(
        translations.register.strength.weak
      );
    });
    expect(screen.getByTestId('password-strength-bar')).toHaveClass('bg-danger');
  });

  it('should render fair for mediapass', async () => {
    render(<PasswordStrengthMeter password="mediapass" t={mockT} />);
    await waitFor(() => {
      expect(screen.getByTestId('password-strength-label')).toHaveTextContent(
        translations.register.strength.fair
      );
    });
    expect(screen.getByTestId('password-strength-bar')).toHaveClass('bg-warning');
  });

  it('should render fair for goodpass', async () => {
    render(<PasswordStrengthMeter password="goodpass" t={mockT} />);
    await waitFor(() => {
      expect(screen.getByTestId('password-strength-label')).toHaveTextContent(
        translations.register.strength.fair
      );
    });
    expect(screen.getByTestId('password-strength-bar')).toHaveClass('bg-warning');
  });

  it('should render fair for strongpass', async () => {
    render(<PasswordStrengthMeter password="strongpass" t={mockT} />);
    await waitFor(() => {
      expect(screen.getByTestId('password-strength-label')).toHaveTextContent(
        translations.register.strength.fair
      );
    });
    expect(screen.getByTestId('password-strength-bar')).toHaveClass('bg-warning');
  });

  it('should render very strong for a complex password', async () => {
    render(<PasswordStrengthMeter password="A!9=123/dB*a.zvMS" t={mockT} />);
    await waitFor(() => {
      expect(screen.getByTestId('password-strength-label')).toHaveTextContent(
        translations.register.strength.very_strong
      );
    });
    expect(screen.getByTestId('password-strength-bar')).toHaveClass('bg-success');
  });

  it('should render a span with text', async () => {
    render(<PasswordStrengthMeter password="mediapass" t={mockT} />);
    await waitFor(() => {
      const label = screen.getByTestId('password-strength-label');
      expect(label.textContent).toBe(translations.register.strength.fair);
    });
  });
});
