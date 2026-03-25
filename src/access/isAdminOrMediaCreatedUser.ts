import { Access } from "payload";

export const isAdminOrMediaCreatedUser: Access = ({ req: { user } }) => {
  // Need to be logged in
  if (user) {
    // If user has role of 'admin'
    if (user.roles?.includes('admin')) {
      return true;
    }

    // If any other type of user, only provide access to themselves
    return {
      useremail: {
        equals: user.email,
      },
    }
  }

  // Reject everyone else
  return false;
}