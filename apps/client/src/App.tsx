function App() {
  return (
    <>
      <div>
        <h1>Test123</h1>
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
