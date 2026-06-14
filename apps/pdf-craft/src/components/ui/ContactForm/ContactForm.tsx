'use client'
import { useState } from 'react'
import { actions } from 'astro:actions'
import { Input, Textarea, Select, Button, Stack, Callout } from '@fhdamd/threads'
import { useRecaptcha } from '../../../utils'

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function ContactForm() {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [subject, setSubject] = useState('general')
  const [message, setMessage] = useState('')
  const [status, setStatus]   = useState<Status>('idle')
  const [error, setError]     = useState('')

  const { getToken } = useRecaptcha('contact')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setError('')

    const captchaToken = await getToken()
    if (!captchaToken) {
      setError('Captcha verification failed. Please try again.')
      setStatus('error')
      return
    }

    try {
      const res = await actions.contact.sendMessage({
        name,
        email,
        subject: subject as 'general' | 'billing' | 'technical' | 'feature' | 'other',
        message,
        captchaToken,
      })

      if (res.data?.success) {
        setStatus('success')
        setName(''); setEmail(''); setSubject('general'); setMessage('')
      } else {
        setError(res.data?.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{
        background: 'var(--th-color-sage-subtle)',
        borderRadius: 'var(--th-radius-lg)',
        padding: 'var(--th-space-8) var(--th-space-6)',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--th-font-display)',
          fontSize: 'var(--th-text-lg)',
          fontVariationSettings: '"wdth" 92, "wght" 650',
          color: 'var(--th-color-sage-text)',
          marginBlockEnd: 'var(--th-space-2)',
        }}>
          Message sent!
        </p>
        <p style={{
          fontFamily: 'var(--th-font-display)',
          fontSize: 'var(--th-text-base)',
          color: 'var(--th-color-text-2)',
        }}>
          We'll get back to you within 1–2 business days.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={4}>
        {status === 'error' && error && (
          <Callout variant="error">{error}</Callout>
        )}

        <div className="contact-form-grid">
          <Input
            type="text"
            id="contact-name"
            name="name"
            label="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="name"
            required
          />
          <Input
            type="email"
            id="contact-email"
            name="email"
            label="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <Select
          id="contact-subject"
          name="subject"
          label="Subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          required
        >
          <option value="general">General enquiry</option>
          <option value="billing">Billing &amp; credits</option>
          <option value="technical">Technical issue</option>
          <option value="feature">Feature request</option>
          <option value="other">Other</option>
        </Select>

        <Textarea
          id="contact-message"
          name="message"
          label="Message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={6}
          hint="Please include as much detail as possible."
          required
        />

        <Button
          type="submit"
          variant="solid-terra"
          disabled={status === 'sending'}
          style={{ alignSelf: 'flex-start' }}
        >
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </Button>
      </Stack>
    </form>
  )
}
