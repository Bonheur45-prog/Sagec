import { RouterProvider } from 'react-router-dom'
import router from './router'
import '@styles/globals.css'
import '@styles/animations.css'

function App() {
  return <RouterProvider router={router} />
}

export default App
