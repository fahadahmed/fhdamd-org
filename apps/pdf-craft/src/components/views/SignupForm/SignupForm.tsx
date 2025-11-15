'use client'
import { useState } from 'react'
import { actions } from 'astro:actions'
import { Button, Input } from '../../../components'

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('name', name)
    formData.append('email', email)
    formData.append('password', password)

    try {
      const response = await actions.user.createUser(formData)
      if (response.data?.success) {
        window.location.href = '/signin'
      } else {
        setError(response.data?.error || 'An unknown error occurred')
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error.message)
    }
  }
  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Input type="text" name="name" id="name" labelText='Name' value={name} setValue={setName} />
      <Input type="email" name="email" id="email" labelText='Email' value={email} setValue={setEmail} />
      <Input type="password" name="password" id="password" labelText='Password' value={password} setValue={setPassword} />
      <Button type="submit" text="Register" kind="primary" />
    </form>
  )
}