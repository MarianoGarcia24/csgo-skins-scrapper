require('dotenv').config()
const axios = require('axios')
const fs = require('fs')
const adapter = require('./algorithm/adapter')
const checker = require('./algorithm/checker')
const profiles = require('./algorithm/profiles')
const { readCsvFile,writeCsvFile,writeJSONFile,readJSONFile } = require('./algorithm/utils')
const skinService = require('./utils/skinService')


let pages = fs.readFileSync('./inputs/pages.json')
pages = JSON.parse(pages)

let filters = fs.readFileSync('./inputs/filters.json')
filters = JSON.parse(filters)



const createIDArray = (skins) => {
    const idValueArray = []

    skins.forEach((skin) => {
        idValueArray[skin.ID] = 0;
    })

    return idValueArray
}



const bots = async ({page,url,method},skins) => {
    console.log(page,url)
    let datos = profiles.getBots(page)
    let i = 1
    let j = 0
    
    let skinsById = createIDArray(skins)
    console.log(skinsById)
    let skinstoJSON = [];


    while (j<datos.length){
        console.log("Scrapping:",datos[j].name, "bots left:",datos.length-j-1)
        newSkins = await getUserInv_V2(datos[j],skins,skinsById)
        if (newSkins!=429){
            j++;
            if (newSkins!=[]){
                // skinsToCsv.push(skins)
                skinService.postToDatabase(newSkins,page)
                skinstoJSON.concat(newSkins)
            }
            if (i%3==0){
                await new Promise(r => setTimeout(r, 6000));    

                //await new Promise(r => setTimeout(r, 110000));    
            }
            else{
                await new Promise(r => setTimeout(r, 2000));    
            }
            i++;
        }
        else{
            console.log("FAILED AFETER",i,"OUT OF",datos.length)
            console.log("Query rejected because of error #429. Trying again in 80 seconds.")
            await new Promise(r => setTimeout(r, 80000));  
        }
    }
    // writeCsvFile(skinsToCsv.join("\n"),page)
    skins = skins.concat(skinstoJSON)
    console.log(skinsById)
    skinService.deleteFromDatabase(skinsById,page)
    console.timeEnd('begin')
}


const getUserInv_V2 = async (dato,skinsOnFile,skinsOnFile_ById) => {
    let skins = await axios.get(dato.JSONlink_V2)
    .then(({data}) => {
        if (data.success==1 && data.assets){
            let skins_ID = {}
            let skins_DESC = data.descriptions
            for (let skin of data.assets){
                let id = skin.classid + skin.instanceid
                skins_ID[id] = skin.assetid
            }
            let invSkins = iterateSkins_V2(skins_ID,skins_DESC,dato.link,skinsOnFile,skinsOnFile_ById)
            return invSkins
        }
        else{
            return []
        }
    })
    .catch(err =>{
        if (err.response.status != 429){
            console.log("Null inventory, it may be private")
            return []
        }
        return  429
    })
    return skins
}


const group_stickers_sources = (description) => {
    let desc = description.split('<img')
    desc = desc.splice(1,desc.length)
    for (x in desc){
        desc[x] = desc[x].slice(desc[x].indexOf('\"'),desc[x].lastIndexOf('\"'))
        desc[x] = desc[x].substring(1,desc[x].length)
    }    
    return desc
}

const getInspectLink = (skin,assetid,link) => {
    let string = ''
    let inspectLink = skin.actions[0].link
    let id = link.substring(link.indexOf('/profiles/') + '/profiles/'.length, link.indexOf('/inventory/'))
    inspectLink = inspectLink.replace('%owner_steamid%',id)
    inspectLink = inspectLink.replace('%assetid%', assetid)
    return inspectLink
}

let iterateSkins_V2 = (skins_ID,skins_DESC,link,skinsOnFile,skinsOnFile_ById) => {
    let inv_skinstopush = []
    //save the id's to match the skin
    for (let skin of skins_DESC){
        let name = skin.name
        if (name.indexOf("Souvenir")==-1){
            let id = skin.classid + skin.instanceid
            let skin_id = adapter.getId_V2(skins_ID[id])
            if (!skinsOnFile_ById.hasOwnProperty(skin_id)){
                let description = skin.descriptions
                description = description[description.length-1].value
                // here i evaluate whether the skin has stickers or not
                if (description.indexOf("Sticker:")!=-1){
                    //the tag has at least one sticker
                    //then i have to check all the stickers
                    let stickers = description.slice(description.lastIndexOf("Sticker:"),description.indexOf("</"))
                    stickers = stickers.replace("Sticker: ","")
                    if (checker.check(stickers,filters)){
                        stickers = stickers.split(`, `)
                        let stickers_img = group_stickers_sources(description)
                        let skin_obj = adapter.skinToObject(skin,stickers,skin_id,link,stickers_img)
                        inv_skinstopush.push({
                            assetid: skins_ID[id],
                            classid: skin.classid,
                            instanceid: skin.instanceid,
                            ...skin_obj,
                            icon_url: skin.icon_url,
                            link: getInspectLink(skin,skins_ID[id],link)
                        }
                        )
                    }
                } 
            }
            else{
                skinsOnFile_ById[skin_id] = 1
            }
        }
    }
    if (inv_skinstopush!=[]){
        // CSV FILE --> inv_skinstopush = inv_skinstopush.join("\n")
        return inv_skinstopush
    }
    else{
        return ""
    }
}

const scrap = async (groupname) => {
    console.time("begin")
    console.log('scrapping:',groupname)
    const skins = await skinService.getByPage(groupname)
    let page = pages.filter(p => p.page == groupname)
    bots(page[0],skins)
}

scrap("skinsmonkey")

// fix('skinsmonkey')
