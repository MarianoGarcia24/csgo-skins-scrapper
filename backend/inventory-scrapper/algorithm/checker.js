//verify if the weapon's stickers matches any of the wanted ones
check = (stickers,filters) => {
    let search
    let names
    for (let filter of filters){
        search = filter.search
        names = filter.sticker
        //check if the sticker is present in the weapon
        if (stickers.indexOf(search)!=-1){   
            //first of all, i check if the sticker is composed
            if (names.length!=0){
                let cond = false;
                let i = 0;
                //Iterate over the stickers related to the year
                while (!cond && i<names.length){
                    let name_and_tag = names[i].name + " " + search
                    //check if the weapon's sticker's tag matches at least one of the looked for
                    if (stickers.indexOf(name_and_tag)!=-1){
                        cond = true;
                        stickers = stickers.split(',')
                        if (names[i].tags!=null){
                            const tags = names[i].tags.split(',')
                            let j = 0
                            const possible_stickers = stickers.filter(element => {
                                if (element.includes(name_and_tag)) {
                                  return true;
                                }
                            });
                            while (j<tags.length){
                                for (stick of possible_stickers){
                                    if (stick.toUpperCase().indexOf(tags[j].toUpperCase())!=-1)
                                        return true;
                                }                    
                                j++;
                            }
                        }
                        //sticker without any tags, its relevant anyways
                        else{
                            return true;
                        }
                    }
                    else{
                        i++
                    }
                }
            }
            else{
                return true;
            }
        }
    }
    return false; 
}

exports.check = check;