const cheerio = require('cheerio')
const fs = require('fs')
const axios = require('axios')

const getPageLinks = (groupname) => {
    let pages = fs.readFileSync('./inputs/pages.json')
    pages = JSON.parse(pages)
    let page = pages.filter(p => p.page == groupname)
    return page[0]
}

const getProfilesWithCSGO = async (data) => {
    let dataposta = []
    i = 0;
    while (i<data.length){
        hasCSGO = await hasCSGO_inventory(data[i].link)
        if (hasCSGO!=429){
            if (hasCSGO==true){
                dataposta.push(data[i])
            }
            await new Promise(r => setTimeout(r,1000))
            i++
        }
        else{
            console.log("ERROR ON BOT #",i+i )
            await new Promise(r=>setTimeout(r,3000))
        }
    }
    return dataposta
}

const scrapBots = async (page) => {
    let {pagename,url,method} = await getPageLinks(page)
    let data = []
    console.log(url)
    for (link of url){
        let bots = await getBotsFromURL(link,method)
        data = data.concat(bots)
    }
    i = 0
    let dataposta = await getProfilesWithCSGO(data)
    fs.writeFileSync("./inputs/" + page + ".json",JSON.stringify(dataposta,null, "\t"), 
        (err) => {
            if (err){
                 console.log("No se pudo escribir el archivo.")
            }else{
                console.log("Archivo creado con exito.")
            }
    })
}

/**
 * Create a list of the bots associated to the skin's webpage.
 * 
 * @param data - HTML code of the page where the bots are stored (steam)
 * @param method - Method that was used to find the bots (by searching on steam group, or by a steam profile) <br>
 * - Skin pages often give forms to verify the authenticity of the bots. It can be giving a steam group where all the bots used for trade are in,
 * or giving the skin page administrator's profile, whose friends are the bots mentioned above.
 * @return array of "bot" objects containing: <br>
 * - Steam Profile's name.
 * - Steam Profile's URL.
 * - Bot's Inventory API.
 * 
 */

const getBotsFromURL = (url,method) => {
    console.log("We will use the", method, "method.")

    const bots = axios.get(url)
                    .then(({data}) => {
                        const $ = cheerio.load(data);
                        //array to save bot's links
                        const bots = [];
                        if (method=="group"){
                            $('.linkFriend').each((i,el)=>{
                                const link = $(el).attr("href");
                                const bot = {name:"",link:""};
                                bot.name = $(el).text();
                                bot.JSONlink = link + "/inventory/json/730/2";
                                bot.link = link + "/inventory/"
                                bots.push(bot)
                        })
                        }
                        else{
                            $('.selectable').each((i,el)=>
                            {
                                if ($(el).attr("data-search").indexOf("[trade]")!=-1){
                                    const bot = {name:"",link:""};
                                    bot.name = $(el).attr("data-search");
                                    bot.link = $(el).find('.selectable_overlay').attr("href")
                                    bot.JSONlink = bot.link + "/inventory/json/730/2";
                                    bot.link = bot.link + "/inventory/"
                                    bots.push(bot)
                                }
                            })                
                        }
                        return bots
                    })
    return bots
}

// const hasCSGO_inventory = (links) => {
//     let truelinks = []
//     axios.all(links.map((link) => axios.get(link)))
//                 .then(({data})=>{
//                     console.log("here2")
//                     const $ = cheerio.load(data)
//                     if ($('.games_list_tabs').children('#inventory_link_730').length){
//                         console.log(link, "has csgo")
//                         links.push(link)
//                     }
//                 })
//     return links
// }

const hasCSGO_inventory = async (link) => {
    let istrue = await axios.get(link)
                .then(({data})=>{
                    const $ = cheerio.load(data)
                    if ($('.games_list_tabs').children('#inventory_link_730').length){
                        console.log(link, "has csgo")
                        return true
                    }
                    else{
                        return false
                    }
                })
                .catch(err =>{
                    return 429
                })
    return istrue
}

const getBots = (page) => {
    path = './inputs/' + page + '.json'
    let pages = fs.readFileSync(path)
    pages = JSON.parse(pages)
    return pages
}

function anon(){
     const bots = axios.get("https://steamcommunity.com/groups/skinsmonkeybots/members?searchKey=mr.%20monkey")
                    .then(async ({data})=>{
                        inv = await hasCSGO_inventory("https://steamcommunity.com/profiles/76561199199127358/inventory")
                        console.log(inv)
                        inv = await hasCSGO_inventory("https://steamcommunity.com/profiles/76561199199895773/inventory")
                        console.log("HOLAAAAAAAAAAAAAAAAAAA")
                        hasCSGO_inventory("https://steamcommunity.com/profiles/76561199198999427/inventory").then((data)=>console.log(data))
                        hasCSGO_inventory("https://steamcommunity.com/profiles/76561199199381418/inventory").then((data)=>console.log(data))
                    })
}

// anon()

exports.getBots = getBots