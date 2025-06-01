const dispatchMock = jest.fn();
const useAppSelectorMock = jest.fn();

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: jest.fn(),
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import SessionTimeoutModal from '@ui/components/SessionTimeoutModal/SessionTimeoutModal';

jest.mock('@application/state/hooks', () => ({
  ...jest.requireActual('@application/state/hooks'),
  useAppSelector: (cb: unknown) => useAppSelectorMock(cb),
  useAppDispatch: () => dispatchMock,
}));

const changeLanguageMock = jest.fn();

function setupUseTranslation({
  lang = 'es-ES',
  t = jest.fn((str: string) => str),
  changeLanguage = changeLanguageMock,
} = {}) {
  (useTranslation as jest.Mock).mockReturnValue({
    t,
    i18n: {
      language: lang,
      changeLanguage,
    },
  });
  return t;
}

describe('SessionTimeoutModal', () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    useAppSelectorMock.mockReset();
  });

  it('no renderiza el modal si showModal es false', () => {
    const t = setupUseTranslation();
    useAppSelectorMock.mockImplementation(cb =>
      cb({ sessionTimer: { showModal: false, secondsLeft: 30 } })
    );
    render(<SessionTimeoutModal />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(t).not.toHaveBeenCalledWith('sessionTimeout.title', expect.anything());
  });

  it('renderiza el modal y llama a t con las claves esperadas', () => {
    const t = setupUseTranslation();
    useAppSelectorMock.mockImplementation(cb =>
      cb({ sessionTimer: { showModal: true, secondsLeft: 25 } })
    );
    render(<SessionTimeoutModal />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(t).toHaveBeenCalledWith('sessionTimeout.title');
    expect(t).toHaveBeenCalledWith('sessionTimeout.question');
    expect(t).toHaveBeenCalledWith('sessionTimeout.logout');
    expect(t).toHaveBeenCalledWith('sessionTimeout.stayConnected');
  });

  it('dispara las acciones correctas al pulsar los botones', () => {
    const t = setupUseTranslation();
    useAppSelectorMock.mockImplementation(cb =>
      cb({ sessionTimer: { showModal: true, secondsLeft: 10 } })
    );
    render(<SessionTimeoutModal />);
    fireEvent.click(screen.getByText('sessionTimeout.logout'));
    fireEvent.click(screen.getByText('sessionTimeout.stayConnected'));

    expect(dispatchMock).toHaveBeenCalledTimes(3);
    expect(t).toHaveBeenCalled();
  });
});
