import { useEffect } from "react"
import Skin from './Skin'

const Skins = ({skins}) => {
    return (
            
    <div className='grid sm:grid-cols-3 lg:grid-cols-4  gap-x-3 justify-center '>
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
    )
}

export default Skins