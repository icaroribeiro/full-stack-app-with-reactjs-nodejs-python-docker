import { lazy } from 'react'
import { userManagementPathConstants } from '../paths'

const UserRegister = lazy(
  () => import('../../features/UserManagement/pages/UserRegister'),
)

const UserListing = lazy(
  () => import('../../features/UserManagement/pages/UserListing'),
)

const userManagementRoutes = [
  {
    id: 'user-register',
    element: <UserRegister />,
    path: userManagementPathConstants.USER_REGISTER,
    loader: () => {
      const str = 'Hello World!'
      console.log(str)
      return 0
    },
  },
  {
    id: 'user-listing',
    element: <UserListing />,
    path: userManagementPathConstants.USER_LISTING,
    loader: () => {
      const str = 'Hello World!'
      console.log(str)
      return 0
    },
  },
]

export { userManagementRoutes }
