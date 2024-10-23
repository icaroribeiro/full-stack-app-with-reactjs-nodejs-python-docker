import { Link } from 'react-router-dom'
import '../styles/Header.css'
import {
  userPathConstants,
  aboutPathConstant,
  homePathConstant,
} from '../routes/paths'

function Header() {
  return (
    <header>
      <div className="header-div">
        <h1 className="title">
          <Link to={homePathConstant.HOME}>My React App</Link>
        </h1>
        <nav className="navbar">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to={userPathConstants.USER_LISTING}>User Listing</Link>
            </li>
            <li className="nav-item">
              <Link to={aboutPathConstant.ABOUT}>About</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
