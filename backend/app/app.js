const axios = require('axios')
const fs = require('fs')
const adapter = require('./adapter')
const checker = require('./checker')
const csvParser = require('csv-parser')
const profiles = require('./profiles')
const { readCsvFile,writeCsvFile,writeJSONFile,readJSONFile } = require('./utils')

let pages = fs.readFileSync('./inputs/pages.json')
pages = JSON.parse(pages)


let filters = fs.readFileSync('./inputs/filters.json')
filters = JSON.parse(filters)

var skinsById = []
var skinsOnFile = []


const bots = async ({page,url,method},{skinsbyId,skins}) => {
    console.log(page,url)
    let datos = profiles.getBots(page)
    let i = 1
    let j = 0
    // let skinsToCsv = [];
    let skinstoJSON = [];
    let newSkins = [] 
    
 
    while (j<datos.length){
        console.log("Scrapping:",datos[j].name, "bots left:",datos.length-j-1)
        newSkins = await getUserInv_V2(datos[j],skins,skinsById)
        if (newSkins!=429){
            j++;
            if (newSkins!=[]){
                // skinsToCsv.push(skins)
                skinstoJSON = skinstoJSON.concat(newSkins)
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
    console.log("New skins added:", skinstoJSON)
    // writeCsvFile(skinsToCsv.join("\n"),page)
    skins = skins.concat(skinstoJSON)
    writeJSONFile(skins,page)
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
        console.log(err)
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


let iterateSkins_V2 = (skins_ID,skins_DESC,link,skinsOnFile,skinsOnFile_ById) => {
    let inv_skinstopush = []
    //save the id's to match the skin
    for (let skin of skins_DESC){
        let name = skin.name
        if (name.indexOf("Souvenir")==-1){
            let id = skin.classid + skin.instanceid
            let skin_id = adapter.getId_V2(skins_ID[id])
            if (skinsOnFile_ById.includes(skin_id)!=true){
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
                            ...skin_obj,
                            icon_url: skin.icon_url,
                            link: skin.actions
                        }
                        )
                    }
                } 
            }
            else{
                let skin_index = skinsOnFile.findIndex(X => X.ID == skin_id)
                inv_skinstopush.push(skinsOnFile[skin_index])
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

const scrap = (groupname) => {
    console.time("begin")
    let file = readJSONFile(groupname)
    let page = pages.filter(p => p.page == groupname)
    bots(page[0],file)
}

scrap("tradeit")
