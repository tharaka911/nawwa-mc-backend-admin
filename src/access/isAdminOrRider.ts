import { Access } from 'payload'

export const isAdminOrRider: Access = ({ req: { user } }) => {
  // Need to be logged in
  if (!user) return false

  // If user has role of 'admin'
  if (user.roles?.includes('admin')) {
    return true
  }

  // If user has role of 'rider'
  if (user.roles?.includes('rider')) {
    return {
      riderEmail: {
        equals: user.email,
      },
    }
  }

  // Reject everyone else
  return false
}
