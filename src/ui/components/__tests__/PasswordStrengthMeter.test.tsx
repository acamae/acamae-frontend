import { render, screen, waitFor } from '@testing-library/react';

import PasswordStrengthMeter from '../PasswordStrengthMeter';

// Mock zxcvbn
jest.mock('zxcvbn', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockZxcvbn = require('zxcvbn').default;

// Mock translations
const mockT = (key: string) => {
  const translations: Record<string, string> = {
    'register.password_requirements.length': 'al menos 8 caracteres',
    'register.password_requirements.lowercase': 'al menos 1 letra minúscula',
    'register.password_requirements.uppercase': 'al menos 1 letra mayúscula',
    'register.password_requirements.digit': 'al menos 1 dígito',
    'register.strength.weak': 'La contraseña es débil, intenta añadir más caracteres.',
    'register.strength.fair': 'La contraseña es regular, intenta añadir más caracteres.',
    'register.strength.good': 'La contraseña es buena',
    'register.strength.strong': 'La contraseña es fuerte',
    'register.strength.very_strong': 'La contraseña es muy fuerte',
    'register.strength.progress_label': 'Progreso de fortaleza de la contraseña',
  };
  return translations[key] || key;
};

describe('PasswordStrengthMeter integration test', () => {
  beforeEach(() => {
    // Configurar zxcvbn mock por defecto
    mockZxcvbn.mockReturnValue({
      score: 0,
      feedback: {
        warning: '',
        suggestions: [],
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render weak for empty password', async () => {
    mockZxcvbn.mockReturnValue({
      score: 0,
      feedback: { warning: '', suggestions: [] },
    });

    // Corregir el error de tipado de t pasando un mock compatible con TFunction
    render(
      <PasswordStrengthMeter
        password=""
        // @ts-expect-error: mockT no implementa $TFunctionBrand, pero es suficiente para pruebas
        t={mockT}
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('password-strength-label')).toHaveTextContent(
        'La contraseña es débil, intenta añadir más caracteres.'
      );
    });
    expect(screen.getByTestId('password-strength-label')).toHaveClass(
      'password-strength__strength-text--weak'
    );
  });

  it('should render all password requirements', async () => {
    // @ts-expect-error: mockT no implementa $TFunctionBrand, pero es suficiente para pruebas
    render(<PasswordStrengthMeter password="" t={mockT} />);

    await waitFor(() => {
      expect(screen.getByTestId('password-requirement-length')).toBeInTheDocument();
      expect(screen.getByTestId('password-requirement-lowercase')).toBeInTheDocument();
      expect(screen.getByTestId('password-requirement-uppercase')).toBeInTheDocument();
      expect(screen.getByTestId('password-requirement-digit')).toBeInTheDocument();
    });
  });

  it('should show length requirement as completed when password has characters', async () => {
    mockZxcvbn.mockReturnValue({
      score: 2,
      feedback: { warning: '', suggestions: [] },
    });

    // @ts-expect-error: mockT no implementa $TFunctionBrand, pero es suficiente para pruebas
    render(<PasswordStrengthMeter password="password123" t={mockT} />);

    await waitFor(() => {
      const lengthRequirement = screen.getByTestId('password-requirement-length');
      expect(lengthRequirement.querySelector('.bi-check-circle-fill')).toBeInTheDocument();
    });
  });

  it('should show lowercase requirement as completed when password has lowercase', async () => {
    mockZxcvbn.mockReturnValue({
      score: 2,
      feedback: { warning: '', suggestions: [] },
    });

    // @ts-expect-error: mockT no implementa $TFunctionBrand, pero es suficiente para pruebas
    render(<PasswordStrengthMeter password="password123" t={mockT} />);

    await waitFor(() => {
      const lowercaseRequirement = screen.getByTestId('password-requirement-lowercase');
      expect(lowercaseRequirement.querySelector('.bi-check-circle-fill')).toBeInTheDocument();
    });
  });

  it('should show uppercase requirement as completed when password has uppercase', async () => {
    mockZxcvbn.mockReturnValue({
      score: 3,
      feedback: { warning: '', suggestions: [] },
    });

    // @ts-expect-error: mockT no implementa $TFunctionBrand, pero es suficiente para pruebas
    render(<PasswordStrengthMeter password="Password123" t={mockT} />);

    await waitFor(() => {
      const uppercaseRequirement = screen.getByTestId('password-requirement-uppercase');
      expect(uppercaseRequirement.querySelector('.bi-check-circle-fill')).toBeInTheDocument();
    });
  });

  it('should show digit requirement as completed when password has digit', async () => {
    mockZxcvbn.mockReturnValue({
      score: 2,
      feedback: { warning: '', suggestions: [] },
    });

    // @ts-expect-error: mockT no implementa $TFunctionBrand, pero es suficiente para pruebas
    render(<PasswordStrengthMeter password="password123" t={mockT} />);

    await waitFor(() => {
      const digitRequirement = screen.getByTestId('password-requirement-digit');
      expect(digitRequirement.querySelector('.bi-check-circle-fill')).toBeInTheDocument();
    });
  });

  it('should show all requirements as completed for strong password', async () => {
    mockZxcvbn.mockReturnValue({
      score: 4,
      feedback: { warning: '', suggestions: [] },
    });

    // @ts-expect-error: mockT no implementa $TFunctionBrand, pero es suficiente para pruebas
    render(<PasswordStrengthMeter password="Password123" t={mockT} />);

    await waitFor(() => {
      expect(
        screen.getByTestId('password-requirement-length').querySelector('.bi-check-circle-fill')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('password-requirement-lowercase').querySelector('.bi-check-circle-fill')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('password-requirement-uppercase').querySelector('.bi-check-circle-fill')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('password-requirement-digit').querySelector('.bi-check-circle-fill')
      ).toBeInTheDocument();
    });
  });

  it('should show incomplete requirements with circle icon', async () => {
    mockZxcvbn.mockReturnValue({
      score: 0,
      feedback: { warning: '', suggestions: [] },
    });

    // @ts-expect-error: mockT no implementa $TFunctionBrand, pero es suficiente para pruebas
    render(<PasswordStrengthMeter password="a" t={mockT} />);

    await waitFor(() => {
      expect(
        screen.getByTestId('password-requirement-length').querySelector('.bi-circle')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('password-requirement-uppercase').querySelector('.bi-circle')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('password-requirement-digit').querySelector('.bi-circle')
      ).toBeInTheDocument();
    });
  });

  it('should render strong strength for password with most requirements met', async () => {
    mockZxcvbn.mockReturnValue({
      score: 3,
      feedback: { warning: '', suggestions: [] },
    });

    // @ts-expect-error: mockT no implementa $TFunctionBrand, pero es suficiente para pruebas
    render(<PasswordStrengthMeter password="Password" t={mockT} />);

    await waitFor(() => {
      expect(screen.getByTestId('password-strength-label')).toHaveTextContent(
        'La contraseña es buena'
      );
      expect(screen.getByTestId('password-strength-label')).toHaveClass(
        'password-strength__strength-text--good'
      );
    });
  });

  it('should render very strong strength for complex password', async () => {
    mockZxcvbn.mockReturnValue({
      score: 4,
      feedback: { warning: '', suggestions: [] },
    });

    // @ts-expect-error: mockT no implementa $TFunctionBrand, pero es suficiente para pruebas
    render(<PasswordStrengthMeter password="A!9=123/dB*a.zvMS" t={mockT} />);

    await waitFor(() => {
      expect(screen.getByTestId('password-strength-label')).toHaveTextContent(
        'La contraseña es muy fuerte'
      );
      expect(screen.getByTestId('password-strength-label')).toHaveClass(
        'password-strength__strength-text--very-strong'
      );
    });
  });

  it('should render weak strength for short password even with all character types', async () => {
    mockZxcvbn.mockReturnValue({
      score: 0,
      feedback: { warning: '', suggestions: [] },
    });

    // @ts-expect-error: mockT no implementa $TFunctionBrand, pero es suficiente para pruebas
    render(<PasswordStrengthMeter password="a1P" t={mockT} />);

    await waitFor(() => {
      expect(screen.getByTestId('password-strength-label')).toHaveTextContent(
        'La contraseña es débil, intenta añadir más caracteres.'
      );
      expect(screen.getByTestId('password-strength-label')).toHaveClass(
        'password-strength__strength-text--weak'
      );
    });
  });

  it('should render weak strength for password with 7 characters even with all requirements met', async () => {
    mockZxcvbn.mockReturnValue({
      score: 2,
      feedback: { warning: '', suggestions: [] },
    });

    // @ts-expect-error: mockT no implementa $TFunctionBrand, pero es suficiente para pruebas
    render(<PasswordStrengthMeter password="Pass1" t={mockT} />);

    await waitFor(() => {
      expect(screen.getByTestId('password-strength-label')).toHaveTextContent(
        'La contraseña es débil, intenta añadir más caracteres.'
      );
      expect(screen.getByTestId('password-strength-label')).toHaveClass(
        'password-strength__strength-text--weak'
      );
    });
  });

  it('should render weak strength for password with 7 characters and all character types', async () => {
    mockZxcvbn.mockReturnValue({
      score: 2,
      feedback: { warning: '', suggestions: [] },
    });

    // @ts-expect-error: mockT no implementa $TFunctionBrand, pero es suficiente para pruebas
    render(<PasswordStrengthMeter password="Pass1" t={mockT} />);

    await waitFor(() => {
      expect(screen.getByTestId('password-strength-label')).toHaveTextContent(
        'La contraseña es débil, intenta añadir más caracteres.'
      );
      expect(screen.getByTestId('password-strength-label')).toHaveClass(
        'password-strength__strength-text--weak'
      );
    });
  });

  it('should display correct requirement labels', async () => {
    // @ts-expect-error: mockT no implementa $TFunctionBrand, pero es suficiente para pruebas
    render(<PasswordStrengthMeter password="" t={mockT} />);

    await waitFor(() => {
      expect(screen.getByText('al menos 8 caracteres')).toBeInTheDocument();
      expect(screen.getByText('al menos 1 letra minúscula')).toBeInTheDocument();
      expect(screen.getByText('al menos 1 letra mayúscula')).toBeInTheDocument();
      expect(screen.getByText('al menos 1 dígito')).toBeInTheDocument();
    });
  });

  it('should render progress bar with correct accessibility attributes', async () => {
    mockZxcvbn.mockReturnValue({
      score: 4,
      feedback: { warning: '', suggestions: [] },
    });

    // @ts-expect-error: mockT no implementa $TFunctionBrand, pero es suficiente para pruebas
    render(<PasswordStrengthMeter password="Password123" t={mockT} />);

    await waitFor(() => {
      const progressBar = screen.getByTestId('password-strength-progress');
      expect(progressBar).toHaveAttribute('aria-label', 'Progreso de fortaleza de la contraseña');
    });
  });

  it('should show progress bar with correct width for very strong password', async () => {
    mockZxcvbn.mockReturnValue({
      score: 4,
      feedback: { warning: '', suggestions: [] },
    });

    // @ts-expect-error: mockT no implementa $TFunctionBrand, pero es suficiente para pruebas
    render(<PasswordStrengthMeter password="A!9=123/dB*a.zvMS" t={mockT} />);

    await waitFor(() => {
      const progressBar = screen.getByTestId('password-strength-progress');
      expect(progressBar).toHaveAttribute('value', '100');
    });
  });

  it('should show progress bar with correct width for good password', async () => {
    mockZxcvbn.mockReturnValue({
      score: 3,
      feedback: { warning: '', suggestions: [] },
    });

    // @ts-expect-error: mockT no implementa $TFunctionBrand, pero es suficiente para pruebas
    render(<PasswordStrengthMeter password="Password" t={mockT} />);

    await waitFor(() => {
      const progressBar = screen.getByTestId('password-strength-progress');
      expect(progressBar).toHaveAttribute('value', '75');
    });
  });
});
