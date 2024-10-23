import { lazy } from 'react'
import { aboutPathConstant } from '../paths'

const About = lazy(() => import('../../pages/About'))

const aboutRoute = {
  id: 'about',
  path: aboutPathConstant.ABOUT,
  element: <About />,
}

export { aboutRoute }
