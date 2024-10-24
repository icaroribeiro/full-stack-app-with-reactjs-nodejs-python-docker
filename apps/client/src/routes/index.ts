import { userManagementRoutes } from './mappings/UserManagementMapping'
import { featuresRoute } from './mappings/FeaturesMapping'
import { homeRoute } from './mappings/HomeMapping'
import { aboutRoute } from './mappings/AboutMapping'

const routes = [homeRoute, featuresRoute, aboutRoute, ...userManagementRoutes]

export default routes
