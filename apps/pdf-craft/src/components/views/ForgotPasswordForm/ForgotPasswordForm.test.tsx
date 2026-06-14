import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockGetToken = vi.fn().mockResolvedValue('captcha-token');

vi.mock('../../../utils', () => ({
  useRecaptcha: () => ({ getToken: mockGetToken }),
}));

import ForgotPasswordForm from './ForgotPasswordForm';
import { sendPasswordReset } from '../../../test/mocks/astro-actions';

beforeEach(() => {
  vi.clearAllMocks();
  mockGetToken.mockResolvedValue('captcha-token');
  sendPasswordReset.mockResolvedValue({ data: { success: true }, error: null });
});

describe('ForgotPasswordForm', () => {
  it('renders email input and submit button', () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send reset link/i })).toBeInTheDocument();
  });

  it('shows captcha error and does not call sendPasswordReset when getToken returns null', async () => {
    mockGetToken.mockResolvedValue(null);
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText('Email address'), 'jane@test.com');
    await user.click(screen.getByRole('button', { name: /Send reset link/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/Captcha verification failed/i),
    );
    expect(sendPasswordReset).not.toHaveBeenCalled();
  });

  it('calls sendPasswordReset with email and captcha token', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText('Email address'), 'jane@test.com');
    await user.click(screen.getByRole('button', { name: /Send reset link/i }));
    await waitFor(() =>
      expect(sendPasswordReset).toHaveBeenCalledWith({
        email: 'jane@test.com',
        captchaToken: 'captcha-token',
      }),
    );
  });

  it('shows success state on success, with the submitted email in the message', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText('Email address'), 'jane@test.com');
    await user.click(screen.getByRole('button', { name: /Send reset link/i }));
    await waitFor(() =>
      expect(screen.getByText('Check your email')).toBeInTheDocument(),
    );
    expect(screen.getByText(/jane@test\.com/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows error callout when action returns success=false', async () => {
    sendPasswordReset.mockResolvedValue({
      data: { success: false, error: 'Failed to send reset email. Please try again.' },
      error: null,
    });
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText('Email address'), 'jane@test.com');
    await user.click(screen.getByRole('button', { name: /Send reset link/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to send reset email. Please try again.'),
    );
  });

  it('shows generic error when action throws', async () => {
    sendPasswordReset.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText('Email address'), 'jane@test.com');
    await user.click(screen.getByRole('button', { name: /Send reset link/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/Something went wrong/i),
    );
  });

  it('disables the button while sending', async () => {
    sendPasswordReset.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText('Email address'), 'jane@test.com');
    await user.click(screen.getByRole('button', { name: /Send reset link/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Sending/i })).toBeDisabled(),
    );
  });
});
