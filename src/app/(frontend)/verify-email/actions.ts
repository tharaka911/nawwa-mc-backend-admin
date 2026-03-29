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
    
    // Check for specific Payload error messages
    const errorMessage = err.message || 'An error occurred during verification.'
    
    return {
      success: false,
      message: errorMessage.includes('invalid') 
        ? 'This verification link is invalid or has already been used.' 
        : errorMessage,
    }
  }
}
