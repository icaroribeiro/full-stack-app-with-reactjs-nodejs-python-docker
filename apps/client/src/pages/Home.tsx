import { useEffect, useState } from 'react'
import { healthCheckAPI } from '../apis/health-check-api'

const Home = () => {
  const [loading, setLoading] = useState(true)
  const [healthy, setHealthy] = useState()

  const getHealth = () => {
    setLoading(true)
    healthCheckAPI
      .get()
      .then((res) => {
        setLoading(false)
        console.log(`Res = ${JSON.stringify(res)}`)
        console.log(`${res.healthy}`)
        setHealthy(res.healthy)
      })
      .catch((err) => {
        setLoading(false)
        console.log(err)
        return null
      })
  }

  useEffect(() => {
    getHealth()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <b>Welcome to my Take-home Assignment!</b>
      <div> {healthy ? <b>ABC</b> : <b>DEF</b>}</div>
    </div>
  )
}

export default Home
