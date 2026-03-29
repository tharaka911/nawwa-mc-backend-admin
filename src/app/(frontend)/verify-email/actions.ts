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

    const result = await payload.verifyEmail({
      collection: 'users',
      token,
    })

    if (result) {
      return {
        success: true,
        message: 'Email verified successfully!',
      }
    }

    return {
      success: false,
      message: 'Verification failed. The token may be invalid or expired.',
    }
  } catch (err: any) {
    console.error('Verification Action Error:', err)
    
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
