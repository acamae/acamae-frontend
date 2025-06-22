import { useTranslation } from 'react-i18next';

import ForgotPasswordForm from '@ui/components/Forms/ForgotPasswordForm';

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="forgot-password" data-testid="forgot-password-page">
      <div className="forgot-password-content">
        <h1 className="text-center" data-testid="forgot-password-title">
          {t('forgot.title')}
        </h1>
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
