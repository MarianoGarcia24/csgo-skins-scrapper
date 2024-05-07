const skinsRouter = require('express').Router()
const Skin = require('../model/skin')

skinsRouter.get('/', async(req,res) => {
    const skins = await Skin.find({})
    return res.json(skins)
})

skinsRouter.get('/:page', async(req,res) => {
    const page = req.params.page
    console.log(page)

    try {
        const skins = await Skin.find({page: page})
        res.status(200).json(skins)
    }
    catch (error){
        console.log(error)
        res.status(500).json({message: 'Server Error'})
    }
})

skinsRouter.post('/:page',(req,res) => {
    let skins = req.body
    const page = req.params.page

    console.log(skins)
    console.log(page)
    try {
        Skin.insertMany(skins)
        .then(data => res.status(201).json(data))
    }
    catch(error){
        console.log(error)
    }
})

skinsRouter.post('/',async(req,res) => {
    let skin = req.body
    try {
        const skinObj = new Skin(skin)
        await skinObj.save()
    }
    catch(e){
        console.log(e)
    }
})

skinsRouter.get('/:page/:id/', async(req,res) => {
    const idToFind = req.params.id

    try{
        const skin = await Skin.find({ID: idToFind})
        res.status(200).json(skin)
    }
    catch(e){
        console.log(e)
    }
})

skinsRouter.delete('/:page/:id', async(req,res) => {
    const idToDelete = req.params.id

    try {
        const response = await Skin.findOneAndDelete({ID: idToDelete})
        if (response)
            res.status(200).json(JSON.stringify({NAME: response.NAME, stickers: response.Stickers}))
    }
    catch(e){
        console.log(e)
    }
})

module.exports = skinsRouter