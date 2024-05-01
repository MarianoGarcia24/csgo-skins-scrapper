import { useEffect, useState } from "react"
import Skin from './Skin'
import skinService from "../services/skinService"

const getItems = async (page) => {
  const items = await skinService.getByPage(page)
  return items
}


const Skins = ({page}) => {
    const [items,setItems] = useState([])

    getItems(page).then(skins => setItems(skins))

    return (
    <div className='grid sm:grid-cols-3 lg:grid-cols-4 '>
      {
        items.map(object => {
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