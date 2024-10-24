import { lazy } from 'react'
import { featuresPathConstant } from '../paths'

const Features = lazy(() => import('../../pages/Features'))

const featuresRoute = {
  id: 'features',
  path: featuresPathConstant.FEATURES,
  element: <Features />,
}

export { featuresRoute }
