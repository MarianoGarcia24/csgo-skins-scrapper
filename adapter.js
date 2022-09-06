const objectToCsv = (skin) =>{
    const skinToPush = skin.NAME + ',' + skin.WEAR + ',' 
    + (skin.STICKER_0 || "") + ',' + (skin.STICKER_1 || "") + ',' 
    + (skin.STICKER_2 || "") + ',' + (skin.STICKER_3 || "")+ ','
    + skin.ID + ',' + skin.LINK
    return skinToPush
}

const skinToObject = (skin,stickers,id_skin,link)=>{
    obj = {
        NAME: skin.name,
        WEAR: skin.descriptions[0].value.slice(10),
        STICKER_0: stickers[0] || "",
        STICKER_1: stickers[1] || "",
        STICKER_2: stickers[2] || "",
        STICKER_3: stickers[3] || "",
        ID: id_skin,
        LINK: link + "#" + id
    }
    return obj
}

const getId = (skin,ids_arr,skins_ID) => {
    let str = skin.classid + "_" + skin.instanceid
    let indx = ids_arr.indexOf(str)
    const [key,val] = Object.entries(skins_ID).at(indx)
    id = "730_2_"+ val.id
    return id;
}

exports.getId = getId;
exports.skinToObject = skinToObject;
exports.objectToCsv = objectToCsv;