import { Access } from 'payload'

/**
 * Access rule for collections that track ownership via the 'useremail' field (e.g., Carts, Orders).
 * 
 * - Admins: Full access (return true)
 * - Users: Access to documents where useremail matches their own (return query)
 * - Others: Denied (return false)
 */
export const isOwner: Access = ({ req: { user } }) => {
  if (!user) {
    return false
  }

  // Admins have full access
  if (user.roles?.includes('admin')) {
    return true
  }

  // Owners have access based on useremail field matching their own email
  if (user.email) {
    return {
      useremail: {
        equals: user.email,
      },
    }
  }

  return false
}
