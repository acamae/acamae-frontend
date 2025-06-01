import { screen, fireEvent, waitFor, render } from '@testing-library/react';

import api from '@shared/services/axiosService';

import ResendVerificationForm from '../ResendVerificationForm';

jest.mock('@shared/services/axiosService', () => ({
  post: jest.fn(),
}));

describe('ResendVerificationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input and button', () => {
    render(<ResendVerificationForm />);
    expect(screen.getByTestId('input-email-username')).toBeInTheDocument();
    expect(screen.getByTestId('btn-resend-verification')).toBeInTheDocument();
  });

  it('shows success message on successful resend', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({});
    render(<ResendVerificationForm />);
    fireEvent.change(screen.getByTestId('input-email-username'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByTestId('btn-resend-verification'));
    await waitFor(() => {
      expect(screen.getByTestId('alert-success')).toBeInTheDocument();
    });
  });

  it('shows error message on user not found', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('USER_NOT_FOUND'));
    render(<ResendVerificationForm />);
    fireEvent.change(screen.getByTestId('input-email-username'), {
      target: { value: 'notfound@example.com' },
    });
    fireEvent.click(screen.getByTestId('btn-resend-verification'));
    await waitFor(() => {
      expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    });
  });

  it('shows error message on already verified', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('ALREADY_VERIFIED'));
    render(<ResendVerificationForm />);
    fireEvent.change(screen.getByTestId('input-email-username'), {
      target: { value: 'already@example.com' },
    });
    fireEvent.click(screen.getByTestId('btn-resend-verification'));
    await waitFor(() => {
      expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    });
  });

  it('shows unknown error for other errors', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('SOME_OTHER_ERROR'));
    render(<ResendVerificationForm />);
    fireEvent.change(screen.getByTestId('input-email-username'), {
      target: { value: 'fail@example.com' },
    });
    fireEvent.click(screen.getByTestId('btn-resend-verification'));
    await waitFor(() => {
      expect(screen.getByTestId('alert-error')).toBeInTheDocument();
    });
  });

  it('snapshot render', () => {
    const { asFragment } = render(<ResendVerificationForm />);
    expect(asFragment()).toMatchSnapshot();
  });
});
