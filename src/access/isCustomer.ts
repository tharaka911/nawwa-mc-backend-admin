import { Access } from 'payload'

/**
 * Basic access rule checking for a logged-in customer or admin.
 * Suitable for 'create' and other non-query-based operations.
 */
export const isCustomer: Access = ({ req: { user } }) => {
  if (!user) {
    return false
  }

  // Admins always have access
  if (user.roles?.includes('admin')) {
    return true
  }

  // Customers are allowed to perform the action (e.g., create a cart)
  if (user.roles?.includes('customer')) {
    return true
  }

  return false
}
