import { useEffect } from 'react'
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
import { initializeNotes } from './reducers/skinReducer'
import { useDispatch } from 'react-redux'

const Menu = () => {

  const padding = {
    paddingRight: 5
  }

  return (
    <div>
      <Link style={padding} to='/tradeit'>tradeit</Link>
      <Link style={padding} to='/skinsmonkey'>skinsmonkey</Link>
      <Link style={padding} to='/swapgg'> swap.gg </Link>
      <Link style={padding} to='/lootfarm'> loot.farm </Link>
      <Link style={padding} to='/about'>about</Link>
    </div>
  )
}

function App() {
  const dispatch = useDispatch()

  useEffect(()=> dispatch(initializeNotes()),[])

  return (
    <div>
      <Menu/>
      <Routes>
        <Route path='/tradeit' element={<Skins page='tradeit'/>}/>
        <Route path='/skinsmonkey' element={<Skins page='skinsmonkey'/>} />
        <Route path='/swapgg' element={<Skins page='swapgg'/>} />
        <Route path='/lootfarm' element={<Skins page='lootfarm'/>} />
        <Route path='/about' element={<h6>ABOUT ME</h6>} />
      </Routes>
    </div>
  )
}

export default App
