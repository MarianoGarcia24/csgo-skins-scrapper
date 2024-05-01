import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import {
  Routes,
  Route,
  Link,
  useParams,
  useMatch,
  useNavigate,
  Navigate
} from 'react-router-dom'
import 'tailwindcss/tailwind.css'
import './index.css'
import './main.css'

import skinService from './services/skinService'
import Skins from './components/Skins'


const Menu = () => {
  const padding = {
    paddingRight: 5
  }
  return (
    <div>
      <Link style={padding} to='/tradeit'>tradeit</Link>
      <Link style={padding} to='/skinsmonkey'>skinsmonkey</Link>
      <Link style={padding} to='/about'>about</Link>
    </div>
  )
}

function App() {
  const [items, setItems] = useState([])

  useEffect(()=>{
    skinService.getAll().then(skins => setItems(skins))
  },[])

  return (
    <div>
      <Menu/>
      <Routes>
        <Route path='/tradeit' element={<Skins page='tradeit'/>}/>
        <Route path='/skinsmonkey' element={<Skins page='skinsmonkey'/>} />
        <Route path='/about' element={<h6>ABOUT ME</h6>} />
      </Routes>
    </div>
  )
}

export default App
