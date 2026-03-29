import { Access } from 'payload'

/**
 * Access rule for collections that track ownership via the 'useremail' field (e.g., Carts, Orders).
 * 
 * - Admins: Full access (return true)
 * - Users: Access to documents where useremail matches their own (return query)
 * - Others: Denied (return false)
 */
export const isOwner: Access = ({ req: { user }, id }) => {
  // 1. Admins have full access to all carts
  if (user && Array.isArray(user.roles) && user.roles.includes('admin')) {
    return true
  }

  // 2. Allow access if a specific document ID is requested (e.g., Guest Cart lookup)
  if (id) {
    return true
  }

  // 3. For list/query operations, only show documents owned by the logged-in user
  if (user && user.email) {
    return {
      useremail: {
        equals: user.email,
      },
    }
  }

  // 4. Deny access for everyone else (e.g., guests trying to list all carts)
  return false
}
