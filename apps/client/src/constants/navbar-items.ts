import {
  homePathConstant,
  aboutPathConstant,
  featuresPathConstant,
} from '../routes/paths'

import { FaBriefcase, FaHome, FaPhone } from 'react-icons/fa'
import { NavbarItemType } from '../types'

const navbarItems: NavbarItemType[] = [
  {
    title: 'Home',
    icon: FaHome,
    route: homePathConstant.HOME,
  },
  {
    title: 'Features',
    icon: FaBriefcase,
    route: featuresPathConstant.FEATURES,
  },
  {
    title: 'About',
    icon: FaPhone,
    route: aboutPathConstant.ABOUT,
  },
]

export { navbarItems }
