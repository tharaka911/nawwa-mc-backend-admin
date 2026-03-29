'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export const verifyEmailAction = async (token: string) => {
  if (!token) {
    return {
      success: false,
      message: 'No verification token provided.',
    }
  }

  try {
    const payload = await getPayload({ config })

    // payload.verifyEmail returns the user object if successful, or throws if not
    const user = await payload.verifyEmail({
      collection: 'users',
      token,
    })

    if (user) {
      return {
        success: true,
        message: 'Email verified successfully! You can now use your account.',
      }
    }

    return {
      success: false,
      message: 'Verification failed. The link may be invalid or already used.',
    }
  } catch (err: any) {
    console.error('Verification Action Error:', err.message)
    const errorMessage = err.message || ''
    
    if (errorMessage.toLowerCase().includes('invalid')) {
      return {
        success: false,
        message: 'This link has already been used or is expired. Please check if your account is already verified.',
      }
    }

    return {
      success: false,
      message: errorMessage || 'An unexpected error occurred during verification.',
    }
  }
}
