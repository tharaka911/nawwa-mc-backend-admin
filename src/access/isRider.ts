import { Access } from "payload";
import { User } from "../payload-types";

export const isRider: Access<User> = ({ req: { user } }) => {
  // Return true or false based on if the user has an admin role
  return Boolean(user?.roles?.includes('rider'));
}

