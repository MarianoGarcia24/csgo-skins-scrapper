import { useEffect, useState } from "react"
import Skin from './Skin'
import skinService from "../services/skinService"
import { useSelector } from "react-redux"


const Skins = ({page}) => {


    const notes = useSelector(state => {
      return state.skins.filter(skin => skin.page==page)
    })

    return (
    <div className='grid sm:grid-cols-3 lg:grid-cols-4 '>
      {
        notes.map(object => {
          return (
            <div>
            <Skin key={object.ID} object={object}/>
          </div>
          )
        })
      }
    </div>
    )
}

export default Skins