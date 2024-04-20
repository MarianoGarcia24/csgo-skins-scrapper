const csvParser = require('csv-parser')
const fs = require('fs')

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
        skins = fs.readFileSync(`./outputs/${pagename}.json`)
        skins = JSON.parse(skins)
        let skinsbyId = []
        skins.forEach(s => skinsbyId.push(s.ID))
        return skinsbyId
    }
    catch{
        console.log("JSON File not found. We'll create one.")
        return []
    }
}

module.exports = {readCsvFile, writeCsvFile, writeJSONFile, readJSONFile}