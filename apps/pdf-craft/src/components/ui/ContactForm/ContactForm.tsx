'use client'
import { useState } from 'react'
import { actions } from 'astro:actions'
import { Input, Textarea, Select, Button, Stack, Callout } from '@fhdamd/threads'
import { ContactFormSchema } from '../../../lib/contactSchema'
import { useRecaptcha } from '../../../utils'
import FormSuccess from '../FormSuccess/FormSuccess'

type Status = 'idle' | 'sending' | 'success' | 'error'
type FieldErrors = Partial<Record<'name' | 'email' | 'subject' | 'message', string>>

export default function ContactForm() {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [subject, setSubject] = useState('general')
  const [message, setMessage] = useState('')
  const [status, setStatus]   = useState<Status>('idle')
  const [error, setError]     = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const { getToken } = useRecaptcha('contact')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setError('')
    setFieldErrors({})

    const parsed = ContactFormSchema.safeParse({ name, email, subject, message })
    if (!parsed.success) {
      const errors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors
        if (!errors[key]) errors[key] = issue.message
      }
      setFieldErrors(errors)
      setError('Please fix the highlighted fields and try again.')
      setStatus('error')
      return
    }

    const captchaToken = await getToken()
    if (!captchaToken) {
      setError('Captcha verification failed. Please try again.')
      setStatus('error')
      return
    }

    const e2eBypassToken = new URLSearchParams(window.location.search).get('e2eBypassToken') ?? undefined

    try {
      const res = await actions.contact.sendMessage({
        ...parsed.data,
        captchaToken,
        e2eBypassToken,
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
      <FormSuccess title="Message sent!">
        We'll get back to you within 1–2 business days.
      </FormSuccess>
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
            error={fieldErrors.name}
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
            error={fieldErrors.email}
            required
          />
        </div>

        <Select
          id="contact-subject"
          name="subject"
          label="Subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          error={fieldErrors.subject}
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
          error={fieldErrors.message}
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
