import type { TFunction } from 'i18next';
import React, { useEffect, useState } from 'react';
import zxcvbn from 'zxcvbn';

interface Props {
  password: string;
  t: TFunction;
}

const levels = ['weak', 'fair', 'good', 'strong', 'very_strong'];
const bootstrapColors = ['danger', 'warning', 'info', 'success', 'success'];

const PasswordStrengthMeter: React.FC<Props> = ({ password, t }) => {
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    setScore(password ? zxcvbn(password).score : 0);
  }, [password]);

  // El label se calcula en cada render, usando el score actual
  const label = t(`register.strength.${levels[score]}`);

  return (
    <div className="form-text">
      <span data-testid="password-strength-label">{label}</span>
      <div className="progress mt-1" aria-hidden="true">
        <div
          className={`progress-bar bg-${bootstrapColors[score]} progressBar progressBar-${score + 1}`}
          data-testid="password-strength-bar"
        />
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
