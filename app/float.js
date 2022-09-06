const axios = require('axios');
const BASE_URL = 'https://steamcommunity.com/id/je981/inventory/json/730/2'
const fs = require('fs')
const adapter = require('./adapter')
const cheerio = require('cheerio')
const checker = require('./checker')
const csvParser = require('csv-parser')


var filters;
var skinsById = []
var skinsOnFile = []

function readCsvFile(){
    let text = []
    let head
    fs.createReadStream("./data.csv")
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

function writeCsvFile(skinsToPush){
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
    fs.writeFile("./data.csv",skins,"utf-8",(err)=>{
        if (err)
            console.log("No data file found, creating a new one")
        else{
            console.log("Data saved")
            console.timeEnd("begin")
        } 
    })
}

async function getFilters(){
    filters = fs.readFileSync('./filters.json');
    filters = await JSON.parse(filters)
    bots()
    // getUserInv({
    //     name: "Exo - bot#13",
    //     JSONlink: "https://steamcommunity.com/id/gabriel309/inventory/json/730/2",
    //     link: "https://steamcommunity.com/id/gabriel309/inventory/"
    // })
}

bots = async () => {
    const urlgroup = 'https://steamcommunity.com/groups/csgoexotrade/members?searchKey=EXO%20-%20BOT'
    //const urlgroup = 'https://steamcommunity.com/groups/skinsmonkeybots/members?searchKey=mr.%20monkey'
    let datos = await axios.get(urlgroup)
    .then(({data})=>{
        const $ = cheerio.load(data);
        //array to save bot's links
        const bots = [];
        $('.linkFriend').each((i,el)=>{
            const bot = {name:"",link:""};
            bot.name = $(el).text();
            bot.link = $(el).attr("href");
            
            bot.JSONlink = bot.link + "/inventory/json/730/2";
            bot.link = bot.link + "/inventory/"
            bots.push(bot)
        })
        return bots
    })
    let i = 1
    let j = 0
    let skinsToCsv = [];
    while (j<datos.length){
        console.log("Scrapping:",datos[j].name, "bots left:",datos.length-j-1)
        skins = await getUserInv(datos[j])
        if (skins!=429){
            j++;
            if (skins!=[])
                skinsToCsv.push(skins)
            if (i%3==0){
                console.log("Waiting 110 seconds")
                await new Promise(r => setTimeout(r, 110000));    
            }
            else{
                console.log("Waiting 6 seconds")
                await new Promise(r => setTimeout(r, 6000));    
            }
            i++;
        }
        else{
            console.log("Query rejected because of error #429. Trying again in 80 seconds.")
            await new Promise(r => setTimeout(r, 80000));  
        }
    }
    console.log("New skins added:", skinsToCsv)
    writeCsvFile(skinsToCsv.join("\n"))
}

async function getUserInv(dato){
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
        console.log(err)
        return ""
    })
    return skins
}

function iterateSkins(skins_ID,skins_DESC,link){
    let inv_skinstopush = []
    let ids_arr = []
    //save the id's to match the skin
    for (const [key,val] of Object.entries(skins_ID)){
        ids_arr.push(val.classid + "_" + val.instanceid)
    }
    for (const [key,val] of Object.entries(skins_DESC)){
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
            stickers = stickers.slice(stickers.lastIndexOf("Sticker:"),stickers.indexOf("</"))
            stickers = stickers.replace("Sticker: ","")
            stickers = stickers.split(`, `)
            //Here, I have a skin that was previously uploaded in the file and it's still, on a inventory, so I have to push it
            let skin_obj = adapter.skinToObject(val,stickers,skin_id,link)
            skin_obj = adapter.objectToCsv(skin_obj)
            skinsOnFile.push(skin_obj)
        }
    }
    if (inv_skinstopush!=[]){
        inv_skinstopush = inv_skinstopush.join("\n")
        return inv_skinstopush
    }
}

console.time("begin")
readCsvFile()
getFilters()
//getSkins()
// bots()
