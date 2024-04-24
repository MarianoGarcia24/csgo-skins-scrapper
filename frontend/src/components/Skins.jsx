import { useEffect } from "react"
import Skin from './Skin'

const Skins = ({skins}) => {
    return (
            
    <div>
    <h1 className='text-6xl text-red-500 justify-content' >ANDA?</h1>
    <div className='grid grid-cols-4 gap-x-3'>
      {
        skins.map(object => {
          return (
            <div>
            <Skin object={object}/>
          </div>
          )
        })
      }
    </div>
  </div>
    )
}

export default Skins