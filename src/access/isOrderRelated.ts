import { Access, Where } from "payload";

export const isOrderRelated: Access = ({ req: { user } }) => {
  if (!user) return false;

  if (user.roles?.includes('admin')) {
    return true;
  }

  const constraint: Where = {
    or: [
      {
        useremail: {
          equals: user.email,
        },
      },
      {
        riderEmail: {
          equals: user.email,
        },
      },
    ],
  };

  return constraint;
};
