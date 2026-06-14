import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { mockConfirmPasswordReset } = vi.hoisted(() => ({
  mockConfirmPasswordReset: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('firebase/auth', () => ({
  confirmPasswordReset: mockConfirmPasswordReset,
}));

import ResetPasswordForm from './ResetPasswordForm';

const VALID_CODE = 'valid-oob-code';

beforeEach(() => {
  vi.clearAllMocks();
  mockConfirmPasswordReset.mockResolvedValue(undefined);
});

describe('ResetPasswordForm', () => {
  describe('with a valid oobCode', () => {
    it('renders new password and confirm password fields', () => {
      render(<ResetPasswordForm oobCode={VALID_CODE} />);
      expect(screen.getByLabelText('New password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm new password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Update password/i })).toBeInTheDocument();
    });

    it('shows an error when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm oobCode={VALID_CODE} />);
      await user.type(screen.getByLabelText('New password'), 'password123');
      await user.type(screen.getByLabelText('Confirm new password'), 'different456');
      await user.click(screen.getByRole('button', { name: /Update password/i }));
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match.'),
      );
      expect(mockConfirmPasswordReset).not.toHaveBeenCalled();
    });

    it('shows an error when password is too short', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm oobCode={VALID_CODE} />);
      await user.type(screen.getByLabelText('New password'), 'abc');
      await user.type(screen.getByLabelText('Confirm new password'), 'abc');
      await user.click(screen.getByRole('button', { name: /Update password/i }));
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('at least 6 characters'),
      );
      expect(mockConfirmPasswordReset).not.toHaveBeenCalled();
    });

    it('calls confirmPasswordReset with the oobCode and new password', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm oobCode={VALID_CODE} />);
      await user.type(screen.getByLabelText('New password'), 'newpassword123');
      await user.type(screen.getByLabelText('Confirm new password'), 'newpassword123');
      await user.click(screen.getByRole('button', { name: /Update password/i }));
      await waitFor(() =>
        expect(mockConfirmPasswordReset).toHaveBeenCalledWith(
          expect.anything(),
          VALID_CODE,
          'newpassword123',
        ),
      );
    });

    it('shows success state after a successful reset', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm oobCode={VALID_CODE} />);
      await user.type(screen.getByLabelText('New password'), 'newpassword123');
      await user.type(screen.getByLabelText('Confirm new password'), 'newpassword123');
      await user.click(screen.getByRole('button', { name: /Update password/i }));
      await waitFor(() =>
        expect(screen.getByText('Password updated')).toBeInTheDocument(),
      );
      expect(screen.getByRole('link', { name: /Sign in to your account/i })).toBeInTheDocument();
    });

    it('shows invalid-link state when the code is expired', async () => {
      mockConfirmPasswordReset.mockRejectedValue({ code: 'auth/expired-action-code' });
      const user = userEvent.setup();
      render(<ResetPasswordForm oobCode={VALID_CODE} />);
      await user.type(screen.getByLabelText('New password'), 'newpassword123');
      await user.type(screen.getByLabelText('Confirm new password'), 'newpassword123');
      await user.click(screen.getByRole('button', { name: /Update password/i }));
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('expired or already been used'),
      );
      expect(screen.getByRole('link', { name: /Request a new one/i })).toBeInTheDocument();
    });

    it('shows a generic error for other Firebase failures', async () => {
      mockConfirmPasswordReset.mockRejectedValue({ code: 'auth/network-request-failed' });
      const user = userEvent.setup();
      render(<ResetPasswordForm oobCode={VALID_CODE} />);
      await user.type(screen.getByLabelText('New password'), 'newpassword123');
      await user.type(screen.getByLabelText('Confirm new password'), 'newpassword123');
      await user.click(screen.getByRole('button', { name: /Update password/i }));
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('Failed to reset password'),
      );
    });

    it('disables the button while submitting', async () => {
      mockConfirmPasswordReset.mockReturnValue(new Promise(() => {}));
      const user = userEvent.setup();
      render(<ResetPasswordForm oobCode={VALID_CODE} />);
      await user.type(screen.getByLabelText('New password'), 'newpassword123');
      await user.type(screen.getByLabelText('Confirm new password'), 'newpassword123');
      await user.click(screen.getByRole('button', { name: /Update password/i }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Updating/i })).toBeDisabled(),
      );
    });
  });

  describe('with no oobCode', () => {
    it('immediately shows the invalid-link state', () => {
      render(<ResetPasswordForm oobCode={null} />);
      expect(screen.getByRole('alert')).toHaveTextContent('expired or already been used');
      expect(screen.getByRole('link', { name: /Request a new one/i })).toBeInTheDocument();
    });
  });
});
