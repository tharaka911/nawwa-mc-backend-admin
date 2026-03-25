import { Access } from 'payload'

export const isAdminOrRider: Access = ({ req: { user } }) => {
  // Need to be logged in
  if (user) {
    // If user has role of 'admin'
    if (user.roles?.includes('admin')) {
      return true
    }

    {
      if (user.roles?.includes('rider')) {
        return true
      }
    }
      
    
  }

  // Reject everyone else
  return false
}
