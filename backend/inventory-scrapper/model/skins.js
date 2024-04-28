const mongoose = require('mongoose')

const skinSchema = new mongoose.Schema({
    page: String,
    assetid: String,
    classid: String,
    instanceid: String,
    id: String,
    NAME: String,
    WEAR: String,
    STICKERS: [
        {
            sticker: String,
            icon_url: String
        }
    ],
    LINK: String,
    icon_url: String,
    link: String
})

skinSchema.set('toJSON', {
    transform: (doc, returnedObject) => {
        delete returnedObject._id
        delete returnedObject._v
    }
})

module.exports = mongoose.model('Skin',skinSchema)