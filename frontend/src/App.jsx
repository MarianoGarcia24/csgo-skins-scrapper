import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Link } from 'react-router-dom'
import './App.css'

const Weapon = ({object}) => {
  const baseURL = `https://community.akamai.steamstatic.com/economy/image/`
  const WeaponURL = `-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopujwezhz3MzbcDNG09GzkImemrmlYumGwW0H65Z337uQpNTw3wLi_RE_ZG-lLYWWI1VrMlDY-la2yL_om9bi609Wg2uD`

  const assetID = object.assetid
  const classID = object.classid

  const PreviewURL = `https://steamcommunity.com/profiles/76561198163313010/inventory/#730_${classID}_${assetID}`

  console.log(object)

  return(
    <div className='Weapon'>
      <img  className='WpnImg' src={baseURL + object.icon_url}></img>
      <meter style={{'--value': 0.15}} min='0' max='1'></meter>
      <div>
        <a href={PreviewURL} target='_blank'>
        <button className='button_external_site'>View on steam</button>
        </a>
        <a href={object.preview_link} target='_blank'>
        <button className='button_external_site'> Inspect in game</button>
        </a>
      </div>
    </div>
    
  )
}

function App() {
  const [count, setCount] = useState(0)

  const object = {
    steamid: "76561202255233023",
    assetid: "36430910749",
    classid: "3608233287",
    icon_url: `-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0PzadQJD_eOwm5KIkvPLP7LWnn8f65Uj3erEp42m2lDkrkFvYWmhJtSWIFc5MlmErADql-y-gJK4v5jKwGwj5HeIPtvrAA`,
    preview_link: `steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561202255233023A36430910749D11857417465907538183`

    //steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561202255233023A36430910749D11857417465907538183
    //    preview_link: `steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S${this.steamid}A${this.assetid}D11857417465907538183`

  }

  console.log(object)

  return (
    <>
      <Weapon object={object}/>
    </>
  )
}

export default App
