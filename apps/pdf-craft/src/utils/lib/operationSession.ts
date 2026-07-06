'use client'
import { signInAnonymously } from 'firebase/auth'
import { actions } from 'astro:actions'
import * as Sentry from '@sentry/astro'
import { auth } from '../../firebase/client'
import { INSUFFICIENT_CREDITS_ERROR } from '../../components/shared'

export interface PrepareSessionConfig {
  readonly isAuthenticated: boolean
  readonly creditCost: number
  readonly defaultLabel: string
  readonly setButtonLabel: (label: string) => void
  readonly setError: (error: string) => void
  readonly setProcessing: (processing: boolean) => void
}

/**
 * Returns an async `prepareSession(task, requestId)` function that either:
 * - Creates an anonymous Firebase session (when isAuthenticated is false), or
 * - Runs the credit check (when the user is already authenticated).
 * Returns false and handles all error UI if either step fails.
 */
export function buildPrepareSession(config: PrepareSessionConfig) {
  return async (task: string, requestId: string): Promise<boolean> => {
    const { isAuthenticated, creditCost, defaultLabel, setButtonLabel, setError, setProcessing } = config

    if (!isAuthenticated) {
      setButtonLabel('Processing...')
      if (!auth.currentUser) {
        try {
          const credential = await signInAnonymously(auth)
          const idToken = await credential.user.getIdToken()
          const sessionRes = await actions.user.createAnonymousSession({ idToken })
          if (!sessionRes.data?.success) {
            setError('Failed to start session. Please try again.')
            setButtonLabel(defaultLabel)
            setProcessing(false)
            return false
          }
        } catch (err) {
          setError('Failed to start session. Please try again.')
          setButtonLabel(defaultLabel)
          setProcessing(false)
          Sentry.captureException(err)
          return false
        }
      }
      return true
    }

    setButtonLabel('Checking credits...')
    const response = await actions.credits.checkCredits({ task, requestId, creditCost })
    if (!response.data?.success) {
      setError(INSUFFICIENT_CREDITS_ERROR)
      setButtonLabel(defaultLabel)
      setProcessing(false)
      return false
    }
    return true
  }
}
