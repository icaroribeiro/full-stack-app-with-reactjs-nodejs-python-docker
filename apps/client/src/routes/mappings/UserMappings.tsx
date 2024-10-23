import { lazy } from 'react'
import { userPathConstants } from '../paths'
import { fetchPaginatedUsers } from '../loaders'

const UserListing = lazy(() => import('../../pages/UserListing'))

const userRoutes = [
  {
    id: 'user-listing',
    element: <UserListing />,
    path: userPathConstants.USER_LISTING,
    loader: () => {
      const str = 'Hello World!'
      console.log(str)
      return 0
    },
  },
]

export { userRoutes }
