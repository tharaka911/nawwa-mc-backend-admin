import { Access } from 'payload'

export const isAdminOrSelf: Access = ({ req: { user } }) => {
  // Need to be logged in
  if (user) {
    // If user has role of 'admin'
    if (user.roles?.includes('admin')) {
      return true
    }

    
      return {
        id: {
          equals: user.id,
        },
      }
    
  }

  // Reject everyone else
  return false
}
