import { useState } from 'react'
import { sidebarItems } from '../constants'
import SidebarItem from '../components/SidebarItem'
import Sidebar from '../components/Sidebar'

const Features = () => {
  const [expanded, setExpanded] = useState(true)

  return (
    <div>
      <Sidebar expanded={expanded} setExpanded={setExpanded}>
        {sidebarItems.map((item, index) => (
          <SidebarItem key={index} expanded={expanded} {...item} />
        ))}
      </Sidebar>
    </div>
  )
}

export default Features
