const axios = require('axios');
const fs = require('fs')
const adapter = require('./adapter')
const cheerio = require('cheerio')
const checker = require('./checker')
const csvParser = require('csv-parser')
const utils = require('./utils')

var pages
var filters
var skinsById = []
var skinsOnFile = []

const readCsvFile = (skinpage) => {
    let text = []
    let head
    skinpage = "./outputs/" + skinpage + ".csv"
    console.log(skinpage)
    fs.createReadStream(skinpage)
    .on('error',(err)=>{
        console.log("File not found. We'll create one")
    })
    .pipe(csvParser())
    .on("headers",(headers) => {
        head = headers.join(",")
        text.push(head)
    })
    .on("data",(data)=>{
        skinsById.push(data.ID);
    })
    .on("end",()=>{
        skinsOnFile.push(text)
    }
    )
}

const writeCsvFile = (skinsToPush,pagename) => {
    let skins;
    if (skinsOnFile.length==0){
    //Create new file
        skins = "NAME,WEAR,STICKER_0,STICKER_1,STICKER_2,STICKER_3,ID,LINK\n"
        skins += skinsToPush
    }
    else{
        skinsOnFile = skinsOnFile.join("\n")
        skins = skinsOnFile + "\n" + skinsToPush
    }
    fs.writeFile("./outputs/" + pagename + ".csv",skins,"utf-8",(err)=>{
        if (err)
            console.log("No data file found, creating a new one")
        else{
            console.log("Data saved")
            console.timeEnd("begin")
        } 
    })
}

const getFilters = () => {
    filters = fs.readFileSync('./inputs/filters.json');
    filters = JSON.parse(filters)
    pages = fs.readFileSync('./inputs/pages.json')
    pages = JSON.parse(pages)
}

const bots = async ({page,url,method}) => {
    console.log(page,url)
    let datos = utils.getBots(page)
    let i = 1
    let j = 0
    let skinsToCsv = [];
    while (j<datos.length){
        console.log("Scrapping:",datos[j].name, "bots left:",datos.length-j-1)
        skins = await getUserInv_V2(datos[j])
        if (skins!=429){
            j++;
            if (skins!=[])
                skinsToCsv.push(skins)
            if (i%20==0){
                console.log("Waiting 100 seconds")
                await new Promise(r => setTimeout(r, 110000));    

                // await new Promise(r => setTimeout(r, 110000));    
            }
            else{
                console.log("Waiting 3 seconds")
                await new Promise(r => setTimeout(r, 3000));    
            }
            i++;
        }
        else{
            console.log("fAILED AFETER",i,"OUT OF",datos.length)
            console.log("Query rejected because of error #429. Trying again in 80 seconds.")
            await new Promise(r => setTimeout(r, 80000));  
        }
    }
    console.log("New skins added:", skinsToCsv)
    writeCsvFile(skinsToCsv.join("\n"),page)
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

let iterateSkins_V2 = (skins_ID,skins_DESC,link) => {
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
                        let skin_obj = adapter.skinToObject(val,stickers,skin_id,link)
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


const getUserInv_V2 = async (dato) => {
    let skins = await axios.get(dato.JSONlink_V2)
    .then(({data}) => {
        if (data.success==1){
            let skins_ID = {}
            let skins_DESC = data.descriptions
            for (let skin of data.assets){
                let id = skin.classid + skin.instanceid
                skins_ID[id] = skin.assetid
            }
            let invSkins = iterateSkins_V2(skins_ID,skins_DESC,dato.link)
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




const scrap = (groupname) => {
    console.time("begin")
    readCsvFile(groupname)
    getFilters()
    let page = pages.filter(p => p.page == groupname)
    bots(page[0])
}

scrap("swapgg")


// getUserInv_V2(
//     {
// 		"name": "EXO - BOT#1",
// 		"JSONlink": "https://steamcommunity.com/id/barbara575/inventory/json/730/2",
// 		"JSONlink_V2": "https://steamcommunity.com/inventory/76561198824095582/730/2",
// 		"link": "https://steamcommunity.com/id/barbara575/inventory/"
// 	}
// )