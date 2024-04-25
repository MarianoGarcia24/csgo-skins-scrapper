import '../main.css'

const Skin = ({object}) => {

    const icon_url = `https://community.akamai.steamstatic.com/economy/image/`
  
    const stickers_class = `flex flex-row`
    return(
      <div className='Weapon'>
        <h5> {object.NAME}</h5>
        <p className='text-gray-500'> {object.WEAR} </p>
        <div>
          <img  className='WpnImg' src={icon_url + object.icon_url} title={object.NAME}></img>
        </div>
        
        <div><meter style={{'--value': 0.15}} min='0' max='1'> </meter></div>
        <div className={stickers_class}>
            {object.Stickers.map((sticker,index) => 
             sticker.sticker != '' &&
             <div>
                <img src={sticker.icon_url} className={`w-auto h-9` } alt='Sticker'></img>
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

  export default Skin