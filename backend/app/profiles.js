const cheerio = require('cheerio')
const fs = require('fs')
const axios = require('axios')
require('dotenv').config()


const getPageLinks = (groupname) => {
    let pages = fs.readFileSync('./inputs/pages.json')
    pages = JSON.parse(pages)
    let page = pages.filter(p => p.page == groupname)
    return page[0]
}

const getProfilesWithCSGO = async (data) => {
    let dataposta = []
    i = 1;
    while (i<=data.length){
        hasCSGO = await hasCSGO_inventory(data[i-1].link)
        if (hasCSGO!=429){
            if (hasCSGO==true){
                dataposta.push(data[i-1])
            }
            if (i%29!=0)
                await new Promise(r => setTimeout(r,500))
            else{
                console.log("Maximum rate reached. Waiting 90 seconds after continuing scrapping.");
                await new Promise(r => setTimeout(r,90000))
            }
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
    fs.writeFile(`./inputs/${page}.json`,JSON.stringify(dataposta,null, "\t"),
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

const getBotsFromURL = async (url,method) => {
    console.log("We will use the", method, "method.")

    const bots = await axios.get(url)
                .then(async ({data}) => {
                        const $ = cheerio.load(data);
                        //array to save bot's links
                        const bots = [];
                        if (method=="group"){
                            let arr = $('.linkFriend')
                            for (el of arr){
                                const link = $(el).attr("href");
                                const name = $(el).text();
                                const bot = {};
                                bot.name = name;
                                bot.JSONlink = link + "/inventory/json/730/2";
                                let id = link.slice(link.lastIndexOf("/")+1,link.length)
                                let ID64
                                if (!id.includes("76")){
                                    ID64 = await getSteamID_64(id)
                                }
                                else{
                                    ID64 = id
                                }
                                bot.JSONlink_V2 = "https://steamcommunity.com/inventory/" + ID64 + "/730/2"
                                bot.link = link + "/inventory/"
                                bots.push(bot)
                            }
                        }                        
                        else{
                            let arr = $('.selectable')
                            
                            for (el of arr){
                                if ($(el).attr("data-search").indexOf("bot#")!=-1){
                                    let generic = "http://steamcommunity.com/"
                                    const bot = {};
                                    bot.name = $(el).attr("data-search");
                                    let id = $(el).attr("data-steamid")
                                    bot.JSONlink = generic + "id/" + id + "/inventory/json/730/2";
                                    let ID64
                                    console.log(id)
                                    if (!id.includes("76")){
                                        ID64 = await getSteamID_64(id)
                                    }
                                    else{
                                        ID64 = id
                                    }
                                    bot.JSONlink_V2 = "https://steamcommunity.com/inventory/" + ID64 + "/730/2"
                                    bot.link = generic + "profiles/" + id + "/inventory/"
                                    console.log(bot)
                                    bots.push(bot)
                                }
                            }               
                        }
                        return bots
                    })
    return bots
}

/**
 *
 */
const getSteamID_64 = async (vanityURL) => {
    let url = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.APIKEY}&vanityurl=${vanityURL}`
    const res = await axios.get(url)
    const ID64 = res.data.response.steamid
    return ID64
}

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

//scrapBots("skinsmonkey")
exports.getBots = getBots
