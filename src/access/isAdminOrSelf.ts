import { Access } from 'payload'

export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (user) {
    // Admin role has full access to all users
    const roles = Array.isArray(user.roles) ? user.roles : []
    if (roles.includes('admin')) {
      return true
    }

    // Individual users can only read their own document
    if (user.id) {
       return {
         id: {
           equals: user.id,
         },
       }
    }
  }

  // Everyone else (including logged-out users) is rejected
  return false
}
