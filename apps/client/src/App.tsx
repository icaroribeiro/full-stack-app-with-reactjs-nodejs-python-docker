import 'react-toastify/ReactToastify.css'

import { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'

import { healthCheckAPI } from './apis/health-check-api'

function App() {
  const [health, setHealth] = useState({ healthy: false })

  const getHealth = () => {
    healthCheckAPI
      .get()
      .then((data) => {
        console.log(data)
        setHealth(data)
      })
      .catch((error) => console.error(error))
  }

  const checkHealth = (health: { healthy: boolean }) => {
    if (health?.healthy) {
      console.log('A')
      toast('A')
    }
    console.log('B')
  }

  useEffect(() => {
    checkHealth(health)
  }, [health])

  return (
    <>
      <div>
        <button
          onClick={() => {
            getHealth()
          }}
        >
          Check Health
        </button>
        <ToastContainer></ToastContainer>
      </div>
    </>
  )
}

export default App

// import { Effect } from 'effect'
// import { useCallback, useMemo, useState } from 'react'

// function App() {
//   const [count, setCount] = useState(0)

//   // Effect<void>
//   const task = useMemo(
//     () => Effect.sync(() => setCount((current) => current + 1)),
//     [setCount],
//   )

//   const increment = useCallback(() => Effect.runSync(task), [task])

//   return (
//     <>
//       <div>
//         <h1>Vite +React</h1>
//         <div className="card">
//           <button onClick={increment}>count is {count}</button>
//         </div>
//       </div>
//     </>
//   )
// }

// export default App
