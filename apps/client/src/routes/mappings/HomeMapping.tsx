import { lazy } from 'react'
import { homePathConstant } from '../paths'

const Home = lazy(() => import('../../pages/Home'))

const homeRoute = {
  id: 'home',
  path: homePathConstant.HOME,
  element: <Home />,
}

export { homeRoute }
