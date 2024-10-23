import { userRoutes } from './mappings/UserMappings'
import { homeRoute } from './mappings/HomeMapping'
import { aboutRoute } from './mappings/AboutMapping'

const routes = [homeRoute, aboutRoute, ...userRoutes]

export default routes
