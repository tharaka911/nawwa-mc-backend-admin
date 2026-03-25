// import { Access, AccessResult, Where } from 'payload'

// export const isAdminOrHasSiteAccessOrPublished: Access = async ({
//   req: { user },
// }): Promise<AccessResult> => {
//   // Need to be logged in
//   if (user) {
//     // If user has role of 'admin'
//     if (user.roles?.includes('admin')) return true

//     // If user has role of 'employee' and has access to a site,
//     // return a query constraint to restrict the documents this user can edit
//     // to only those that are assigned to a site, or have no site assigned
//     return {
//       or: [
//         {
//           site: {
//             in: user.sites,
//           },
//         },
//         {
//           site: {
//             exists: false,
//           },
//         },
//       ],
//       _status: [
//         {
//           equals: 'published',
//         },
//       ] as Where[],
//     }
//   }

//   // Non-logged in users can only read published docs
//   return {
//     _status: {
//       equals: 'published',
//     },
//   }
// }