// src/lib/auth.ts

/**
 * Generates an API key for a specific user using Payload's native REST endpoint.
 * Requires SUPER_ADMIN_API_KEY in .env
 */
export async function createUserApiKey({ userId }: { userId: string }) {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  
  const res = await fetch(`${serverUrl}/api/users/${userId}/api-key`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `users API-Key ${process.env.SUPER_ADMIN_API_KEY}`,
    },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to create API key: ${err}`)
  }

  const data = await res.json()
  return data.apiKey
}

/**
 * Creates a user via REST and immediately generates an API key for them.
 * Useful for 3rd-party app registration (e.g. Android App).
 */
export async function createUserWithApiKey(userData: any) {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  
  // 1. Create user
  const userRes = await fetch(`${serverUrl}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `users API-Key ${process.env.SUPER_ADMIN_API_KEY}`,
    },
    body: JSON.stringify(userData),
  })

  if (!userRes.ok) {
    const err = await userRes.text()
    throw new Error(`Failed to create user: ${err}`)
  }

  const resData = await userRes.json()
  const user = resData.doc

  // 2. Generate API key (via REST to ensure it is correctly hashed)
  const apiKey = await createUserApiKey({ userId: user.id })

  return { user, apiKey }
}
