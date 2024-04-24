import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Link } from 'react-router-dom'
import 'tailwindcss/tailwind.css'
import './index.css'
import './main.css'

import skinService from './services/skinService'



const Weapon = ({object}) => {

  const icon_url = `https://community.akamai.steamstatic.com/economy/image/`
  console.log(object)

  const stickers_class = `grid grid-cols-${object.Stickers.length}`
  return(
    <div className='Weapon'>
      <h5> {object.NAME}</h5>
      <p className='text-gray-500'> {object.WEAR} </p>
      <img  className='WpnImg' src={icon_url + object.icon_url} title={object.NAME}></img>
      <div><meter style={{'--value': 0.15}} min='0' max='1'> </meter></div>
      <div className={stickers_class}>
          {object.Stickers.map((sticker,index) => 
           sticker.sticker != '' &&
            <div>
              <img src={sticker.icon_url} className={`col-span-${index} w-12 h-auto`} alt={sticker.sticker}></img>
            </div>
          )
          }
        </div>
          <div className='grid grid-cols-2'>
            <a href={object.LINK} target='_blank'>
              <button className='button_external_site'>View on steam</button>
            </a>
            <a href={object.link} target='_blank'>
              <button className='button_external_site'> Inspect in game</button>
            </a>
          </div>

      </div>
  )
}

function App() {
  const [count, setCount] = useState(0)
  const [items, setItems] = useState([])

  useEffect(()=>{
    skinService.getAll().then(skins => setItems(skins))
  },[])

  return (
    
    <div>
      <h1 className='text-6xl text-red-500'>ANDA?</h1>
      <div className='grid grid-cols-4 gap-x-3'>
        {
          items.map(object => {
            return (
              <div>
              <Weapon object={object}/>
            </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default App
