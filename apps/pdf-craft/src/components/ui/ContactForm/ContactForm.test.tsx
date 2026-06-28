import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockGetToken = vi.fn().mockResolvedValue('captcha-token');

vi.mock('../../../utils', () => ({
  useRecaptcha: () => ({ getToken: mockGetToken }),
}));

import ContactForm from './ContactForm';
import { sendMessage } from '../../../test/mocks/astro-actions';

beforeEach(() => {
  vi.clearAllMocks();
  mockGetToken.mockResolvedValue('captcha-token');
  sendMessage.mockResolvedValue({ data: { success: true }, error: null });
});

describe('ContactForm', () => {
  it('renders all form fields and submit button', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText('Your name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send message/i })).toBeInTheDocument();
  });

  it('shows a captcha error and does not submit when getToken returns null', async () => {
    mockGetToken.mockResolvedValue(null);
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Your name'), 'Jane');
    await user.type(screen.getByLabelText('Email address'), 'jane@test.com');
    await user.type(screen.getByLabelText('Message'), 'Hello there');
    await user.click(screen.getByRole('button', { name: /Send message/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/Captcha verification failed/i),
    );
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('calls actions.contact.sendMessage with form values and captcha token', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Your name'), 'Jane');
    await user.type(screen.getByLabelText('Email address'), 'jane@test.com');
    await user.selectOptions(screen.getByLabelText('Subject'), 'billing');
    await user.type(screen.getByLabelText('Message'), 'Where is my invoice?');
    await user.click(screen.getByRole('button', { name: /Send message/i }));
    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith({
        name: 'Jane',
        email: 'jane@test.com',
        subject: 'billing',
        message: 'Where is my invoice?',
        captchaToken: 'captcha-token',
      }),
    );
  });

  it('shows success state and clears the form on success', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Your name'), 'Jane');
    await user.type(screen.getByLabelText('Email address'), 'jane@test.com');
    await user.type(screen.getByLabelText('Message'), 'Hello there, this is a test message.');
    await user.click(screen.getByRole('button', { name: /Send message/i }));
    await waitFor(() =>
      expect(screen.getByText('Message sent!')).toBeInTheDocument(),
    );
    expect(screen.queryByRole('button', { name: /Send message/i })).not.toBeInTheDocument();
  });

  it('shows an error callout when sendMessage returns success=false', async () => {
    sendMessage.mockResolvedValue({ data: { success: false, error: 'Invalid email address.' }, error: null });
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Your name'), 'Jane');
    await user.type(screen.getByLabelText('Email address'), 'jane@test.com');
    await user.type(screen.getByLabelText('Message'), 'Hello there, this is a test message.');
    await user.click(screen.getByRole('button', { name: /Send message/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email address.'),
    );
  });

  it('shows a generic error when sendMessage throws', async () => {
    sendMessage.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Your name'), 'Jane');
    await user.type(screen.getByLabelText('Email address'), 'jane@test.com');
    await user.type(screen.getByLabelText('Message'), 'Hello there, this is a test message.');
    await user.click(screen.getByRole('button', { name: /Send message/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/Something went wrong/i),
    );
  });

  it('rejects a too-short message client-side without calling sendMessage', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Your name'), 'Jane');
    await user.type(screen.getByLabelText('Email address'), 'jane@test.com');
    await user.type(screen.getByLabelText('Message'), 'Hello');
    await user.click(screen.getByRole('button', { name: /Send message/i }));
    await waitFor(() =>
      expect(screen.getByText(/Message must be at least 10 characters/i)).toBeInTheDocument(),
    );
    expect(sendMessage).not.toHaveBeenCalled();
    expect(mockGetToken).not.toHaveBeenCalled();
  });

  it('rejects a too-short name client-side and surfaces the field error', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Your name'), 'J');
    await user.type(screen.getByLabelText('Email address'), 'jane@test.com');
    await user.type(screen.getByLabelText('Message'), 'Hello there, this is a test message.');
    await user.click(screen.getByRole('button', { name: /Send message/i }));
    await waitFor(() =>
      expect(screen.getByText(/Name must be at least 2 characters/i)).toBeInTheDocument(),
    );
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('disables the button while sending', async () => {
    sendMessage.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Your name'), 'Jane');
    await user.type(screen.getByLabelText('Email address'), 'jane@test.com');
    await user.type(screen.getByLabelText('Message'), 'Hello there, this is a test message.');
    await user.click(screen.getByRole('button', { name: /Send message/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Sending/i })).toBeDisabled(),
    );
  });
});
