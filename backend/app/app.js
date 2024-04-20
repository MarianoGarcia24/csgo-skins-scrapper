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


const bots = async ({page,url,method},skinsById) => {
    console.log(page,url)
    let datos = profiles.getBots(page)
    let i = 1
    let j = 0
    // let skinsToCsv = [];
    let skinsOnFile = [];
    let skinstoJSON = [];
    while (j<datos.length){
        console.log("Scrapping:",datos[j].name, "bots left:",datos.length-j-1)
        skins = await getUserInv_V2(datos[j],skinsOnFile,skinsById)
        if (skins!=429){
            j++;
            if (skins!=[]){
                // skinsToCsv.push(skins)
                skinstoJSON = skinstoJSON.concat(skins)
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
            console.log("fAILED AFETER",i,"OUT OF",datos.length)
            console.log("Query rejected because of error #429. Trying again in 80 seconds.")
            await new Promise(r => setTimeout(r, 80000));  
        }
    }
    console.log("New skins added:", skinstoJSON)
    // writeCsvFile(skinsToCsv.join("\n"),page)
    skinsOnFile = skinsOnFile.concat(skinstoJSON)
    writeJSONFile(skinsOnFile,page)
}

let getUserInv = async (dato) => {
    let skins_ID;
    let skins_DESC;
    let skins = await axios.get(dato.JSONlink)
    .then(({data}) => {
        if (data.success==true){
            skins_ID = data.rgInventory
            skins_DESC = data.rgDescriptions
            let invSkins = iterateSkins(skins_ID,skins_DESC,dato.link)
            return invSkins
        }
        else{
            return []
        }
    })
    .catch(err =>{
        console.log(err.code)
        return  429
    })
    return skins
}

let iterateSkins = (skins_ID,skins_DESC,link) => {
    let inv_skinstopush = []
    let ids_arr = []
    //save the id's to match the skin
    for (const [key,val] of Object.entries(skins_ID)){
        ids_arr.push(val.classid + "_" + val.instanceid)
    }
    for (const [key,val] of Object.entries(skins_DESC)){
        let name = val.name
        if (name.indexOf("Souvenir")==-1){
            let skin_id = adapter.getId(val,ids_arr,skins_ID)
            if (skinsById.includes(skin_id)!=true){
                let description = val.descriptions
                let stickers = description[description.length-1].value
                // here i evaluate whether the skin has stickers or not
                if (stickers.indexOf("Sticker:")!=-1){
                    //the tag has at least one sticker
                    //then i have to check all the stickers
                    stickers = stickers.slice(stickers.lastIndexOf("Sticker:"),stickers.indexOf("</"))
                    stickers = stickers.replace("Sticker: ","")
                    if (checker.check(stickers,filters)){
                        //here i know that the weapon matches the stickers
                        stickers = stickers.split(`, `)
                        let skin_obj = adapter.skinToObject(val,stickers,adapter.getId(val,ids_arr,skins_ID),link)
                        inv_skinstopush.push(adapter.objectToCsv(skin_obj))
                    }
                } 
            }
            else{
                let description = val.descriptions
                let stickers = description[description.length-1].value
                stickers = stickers.slice(stickers.lastIndexOf("Sticker:"),stickers.indexOf("</")).replace("Sticker: ","").split(`, `)
                //Here, I have a skin that was previously uploaded in the file and it's still, on a inventory, so I have to push it
                let skin_obj = adapter.skinToObject(val,stickers,skin_id,link)
                skinsOnFile.push(adapter.objectToCsv(skin_obj))
            }
        }
    }
    if (inv_skinstopush!=[]){
        inv_skinstopush = inv_skinstopush.join("\n")
        return inv_skinstopush
    }
    else{
        return ""
    }
}

const getUserInv_V2 = async (dato,skinsOnFile,skinsById) => {
    let skins = await axios.get(dato.JSONlink_V2)
    .then(({data}) => {
        if (data.success==1 && data.assets){
            let skins_ID = {}
            let skins_DESC = data.descriptions
            for (let skin of data.assets){
                let id = skin.classid + skin.instanceid
                skins_ID[id] = skin.assetid
            }
            let invSkins = iterateSkins_V2(skins_ID,skins_DESC,dato.link,skinsOnFile,skinsById)
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

let iterateSkins_V2 = (skins_ID,skins_DESC,link,skinsOnFile,skinsById) => {
    let inv_skinstopush = []
    let ids_arr = []
    //save the id's to match the skin
    for (let val of skins_DESC){
        let name = val.name
        if (name.indexOf("Souvenir")==-1){
            let id = val.classid + val.instanceid
            let skin_id = adapter.getId_V2(skins_ID[id])
            if (skinsById.includes(skin_id)!=true){
                let description = val.descriptions
                description = description[description.length-1].value
                // here i evaluate whether the skin has stickers or not
                if (description.indexOf("Sticker:")!=-1){
                    //the tag has at least one sticker
                    //then i have to check all the stickers
                    let stickers = description.slice(description.lastIndexOf("Sticker:"),description.indexOf("</"))
                    stickers = stickers.replace("Sticker: ","")
                    if (checker.check(stickers,filters)){
                        //here i know that the weapon matches the stickers
                        stickers = stickers.split(`, `)
                        const stickers_img = group_stickers_sources(description)
                        let skin_obj = adapter.skinToObject(val,stickers,skin_id,link,stickers_img)
                        //CSV FILE --> inv_skinstopush.push(adapter.objectToCsv(skin_obj))
                        inv_skinstopush.push({
                            ...skin_obj,
                            icon_url: val.icon_url,
                            link: val.actions
                        }
                        )
                    }
                } 
            }
            else{   
                let description = val.descriptions
                description = description[description.length-1].value
                stickers = description.slice(description.lastIndexOf("Sticker:"),description.indexOf("</")).replace("Sticker: ","").split(`, `)
                const stickers_img = group_stickers_sources(description)
                //Here, I have a skin that was previously uploaded in the file and it's still, on a inventory, so I have to push it
                let skin_obj = adapter.skinToObject(val,stickers,skin_id,link,stickers_img)
                // CSV FILE --> skinsOnFile.push(adapter.objectToCsv(skin_obj))
                skinsOnFile.push({
                    ...skin_obj,
                    icon_url: val.icon_url,
                    link: val.actions
                })
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
    let skinsById = readJSONFile(groupname)
    let page = pages.filter(p => p.page == groupname)
    bots(page[0],skinsById)
}

scrap("tradeit")
