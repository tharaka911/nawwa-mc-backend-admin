import { FieldAccess } from "payload";

export const isAdminCreate: FieldAccess = ({ req: { user } }) => {
  if (user && user.roles && user.roles.includes('admin')) {
    return true
  }
  return false
}