//ADAPTER
//COMPONENT THAT TRANSFORMS PARAMETERS INTO OBJECTS, OR 
//OBJECTS INTO CSV STRINGS

const objectToCsv = (skin) =>{
    const skinToPush = skin.NAME + ',' + skin.WEAR + ',' 
    + (skin.STICKER_0 || "") + ',' + (skin.STICKER_1 || "") + ',' 
    + (skin.STICKER_2 || "") + ',' + (skin.STICKER_3 || "")+ ','
    + skin.ID + ',' + skin.LINK
    return skinToPush
}

const skinToObject = (skin,stickers,id_skin,link,stickers_img)=>{
    obj = {
        NAME: skin.name,
        WEAR: skin.descriptions[0].value.slice(10),
        Stickers: stickers.map((sticker,index) => ({
            sticker: sticker || "",
            icon_url: stickers_img[index] || ""
        })).filter(sticker => sticker.sticker !== ""),
        ID: id_skin,
        LINK: link + "#" + id_skin
    }
    return obj
}

/**
 * Get the skin ID by it's class and instance id.
 * @param  skin skin object
 * @param  ids_arr 
 * @param  skins_ID 
 * @returns 
 */

const getId = (skin,ids_arr,skins_ID) => {
    let str = skin.classid + "_" + skin.instanceid
    let indx = ids_arr.indexOf(str)
    const [key,val] = Object.entries(skins_ID).at(indx)
    id = "730_2_"+ val.id
    return id;
}

const getId_V2 = (id) => {
    return "730_2_" + id
}

exports.getId = getId;
exports.skinToObject = skinToObject;
exports.objectToCsv = objectToCsv;
exports.getId_V2 = getId_V2;