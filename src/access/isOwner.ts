import { Access } from 'payload'

export const isOwner: Access = ({ req: { user }, id }) => {
  // 1. Admins have full access
  if (user?.roles?.includes('admin')) return true

  // 2. Allow access to specific documents (supports fetching by ID)
  // if (id) return true

  // 3. For logged-in users, strictly enforce their email filter
  if (user?.email) {
    return {
      useremail: {
        equals: user.email,
      },
    }
  }

  // 4. Deny access for everyone else (guests)
  return false
}
