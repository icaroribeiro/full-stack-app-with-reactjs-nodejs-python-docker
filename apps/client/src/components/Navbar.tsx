import { navbarItems } from '../constants'
import { NavLink } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className="bg-black flex items-center h-24 mx-auto px-4 text-white">
      <h1 className="w-full text-3xl font-bold text-[#00df9a]">
        My Take-home Assignment
      </h1>
      <ul className="hidden md:flex">
        {navbarItems.map((item) => {
          return (
            <NavLink to={item.route} className="nav-link">
              <div className="flex items-center p-4 hover:bg-[#00df9a] rounded-xl cursor-pointer duration-300 hover:text-black">
                {item.icon && <item.icon />}
                {item.title}
              </div>
            </NavLink>
          )
        })}
      </ul>
    </div>
  )
}

export default Navbar
