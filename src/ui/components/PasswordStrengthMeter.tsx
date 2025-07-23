import type { TFunction } from 'i18next';
import React, { useMemo } from 'react';
import zxcvbn from 'zxcvbn';

interface Props {
  password: string;
  t: TFunction;
}

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

const PasswordStrengthMeter: React.FC<Props> = ({ password, t }) => {
  const requirements: PasswordRequirement[] = useMemo(
    () => [
      {
        id: 'length',
        label: t('register.password_requirements.length'),
        test: (pwd: string) => pwd.length >= 8,
      },
      {
        id: 'lowercase',
        label: t('register.password_requirements.lowercase'),
        test: (pwd: string) => /[a-z]/.test(pwd),
      },
      {
        id: 'uppercase',
        label: t('register.password_requirements.uppercase'),
        test: (pwd: string) => /[A-Z]/.test(pwd),
      },
      {
        id: 'digit',
        label: t('register.password_requirements.digit'),
        test: (pwd: string) => /\d/.test(pwd),
      },
    ],
    [t]
  );

  // Use zxcvbn to estimate real strength
  const zxcvbnResult = useMemo(() => {
    return zxcvbn(password);
  }, [password]);

  // Map zxcvbn score (0-4) to our strength levels
  const strengthLevel = useMemo(() => {
    const score = zxcvbnResult?.score ?? 0;
    const length = password.length;

    // If it doesn't meet minimum length, always weak
    if (length < 8) return 'weak';

    // Use zxcvbn score to determine strength
    switch (score) {
      case 0:
      case 1:
        return 'weak';
      case 2:
        return 'fair';
      case 3:
        return 'good';
      case 4:
        return 'very-strong';
      default:
        return 'weak';
    }
  }, [zxcvbnResult?.score, password.length]);

  const strengthLabel = t(`register.strength.${strengthLevel.replace('-', '_')}`);

  // Calculate percentage for progress bar based on zxcvbn
  const progressPercentage = useMemo(() => {
    const score = zxcvbnResult?.score ?? 0;
    const length = password.length;

    // If it doesn't meet minimum length, progress is 0
    if (length < 8) return 0;

    // Map zxcvbn score to percentage
    switch (score) {
      case 0:
        return 0;
      case 1:
        return 25;
      case 2:
        return 50;
      case 3:
        return 75;
      case 4:
        return 100;
      default:
        return 0;
    }
  }, [zxcvbnResult?.score, password.length]);

  return (
    <div className="password-strength">
      <div className="password-strength__requirements">
        {requirements.map(requirement => {
          const isCompleted = requirement.test(password);
          return (
            <div
              key={requirement.id}
              className={`password-strength__requirement${isCompleted ? ' password-strength__requirement--completed' : ''}`}
              data-testid={`password-requirement-${requirement.id}`}>
              <div className="password-strength__icon-container">
                <i
                  className={`bi ${isCompleted ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'}`}
                  aria-hidden="true"
                />
                <span className="password-strength__label">{requirement.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Horizontal progress bar */}
      <div className="password-strength__progress-container mt-2">
        <div
          className="progress password-strength__progress"
          role="progressbar"
          aria-label={t('register.strength.progress_label')}
          data-testid="password-strength-progress">
          <div
            className={`progress-bar password-strength__progress-bar password-strength__progress-bar--${strengthLevel} password-strength__progress-bar--width-${progressPercentage}`}
            data-testid="password-strength-progress-bar"
          />
        </div>
      </div>

      <div className="password-strength__strength-indicator mt-2">
        <span
          data-testid="password-strength-label"
          aria-live="polite"
          aria-atomic="true"
          role="alert"
          className={`password-strength__strength-text password-strength__strength-text--${strengthLevel}`}>
          {strengthLabel}
        </span>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
