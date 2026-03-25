import { Access } from 'payload'

export const isAdminOrCustomer: Access = ({ req: { user } }) => {
  // Need to be logged in
  if (user) {
    // If user has role of 'admin'
    if (user.roles?.includes('admin')) {
      return true
    }

    if (user.roles?.includes('customer')) {
      return {
        id: {
          equals: user.id,
        },
      }
    }
  }

  // Reject everyone else
  return false
}
