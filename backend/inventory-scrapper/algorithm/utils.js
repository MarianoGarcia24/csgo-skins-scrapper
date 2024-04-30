const csvParser = require('csv-parser')
const fs = require('fs')
const mongoose = require('mongoose')
const axios = require('axios')
const config = require('./config.js')
const baseURL = `http://localhost:${config.PORT}/api/skins`


const getFromDatabase = async (page) => {
    const skins = await axios.get(`${baseURL}/${page}`)
    console.log(skins.data)
    return skins.data
}

const postToDatabase_v1 =  async (skins,pagename) => {
    const promiseArray = skins.map(skin => {
        axios.post(`${baseURL}`,{page:pagename, ...skin})})
    Promise.all(promiseArray)
    console.log('ya tamos')
}



const readCsvFile = (skinpage) => {
    let skinsOnFile = []
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

const writeJSONFile = (skins,pagename) => {
    fs.writeFile(`./outputs/${pagename}.json`,JSON.stringify(skins,null,'\t'),(err)=>{
        if (err)
            console.log("No se pudo escribir el archivo")
    })
}

const readJSONFile = (pagename) => {
    let skins
    try{
        skins = fs.readFileSync(`../outputs/${pagename}.json`)
        skins = JSON.parse(skins)
        let skinsbyId = []
        skins.forEach(s => skinsbyId.push(s.ID))
        return ({skins, skinsbyId})
    }
    catch{
        console.log("JSON File not found. We'll create one.")
        skins = []
        let skinsById = []
        return ({skins,skinsById})
    }
}

const modifyJSONFile = (pagename) => {
    let profiles
    let arr = []
    try{
        profiles = fs.readFileSync(`./inputs/${pagename}.json`)
        profiles = JSON.parse(profiles)
        profiles.forEach(profile => profile.JSONlink_V2 = profile.JSONlink_V2.concat('?count=1000'))
        fs.writeFileSync(`./inputs/${pagename}.json`,JSON.stringify(profiles,null, "\t"))
    }
    catch{
    }
}

// modifyJSONFile('skinsmonkey')

const skins = readJSONFile('tradeit')
postToDatabase_v1(skins.skins,'tradeit')

module.exports = {readCsvFile, writeCsvFile, writeJSONFile, readJSONFile}

//DEPRECATED METHOD TO SCRAP INVENTORY

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

