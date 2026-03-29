import { Access, Where } from 'payload'

export const isAdminOrRider: Access = ({ req: { user } }) => {
  // Need to be logged in
  if (!user) return false

  // Admins have full access
  if (user.roles?.includes('admin')) {
    return true
  }

  // Allow Riders to see their assigned deliveries AND 
  // Allow Customers to see their own deliveries
  if (user.email) {
    const constraint: Where = {
      or: [
        {
          riderEmail: {
            equals: user.email,
          },
        },
        {
          orderedPersonEmail: {
            equals: user.email,
          },
        },
      ],
    }
    return constraint
  }

  return false
}
