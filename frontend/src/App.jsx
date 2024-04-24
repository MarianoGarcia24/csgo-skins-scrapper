import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Link } from 'react-router-dom'
import 'tailwindcss/tailwind.css'
import './index.css'
import './main.css'

import skinService from './services/skinService'
import Skins from './components/Skins'




function App() {
  const [items, setItems] = useState([])

  useEffect(()=>{
    skinService.getAll().then(skins => setItems(skins))
  },[])

  return (
      <Skins skins={items}/>
  )
}

export default App
