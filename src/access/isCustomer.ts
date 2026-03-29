import { Access } from 'payload'

/**
 * Basic access rule checking for a logged-in customer or admin.
 * Suitable for 'create' and other non-query-based operations.
 */
export const isCustomer: Access = ({ req: { user } }) => {
  if (!user) {
    return false
  }

  // Admins always have full access
  if (user.roles?.includes('admin')) {
    return true
  }

  // Check customer role (type) - works for both session and API key users
  if (Array.isArray(user.roles)) {
    if (user.roles.includes('customer')) {
      return true
    }
  }

  return false
}
