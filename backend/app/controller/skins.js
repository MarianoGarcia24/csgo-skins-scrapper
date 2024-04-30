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
        res.json(skins)
    }
    catch (error){
        console.log(error)
        res.status(500).json({message: 'Server Error'})
    }
})

skinsRouter.post('/:page',async(req,res) => {
    let skins = req.body
    const page = req.params.page

    console.log(skins)
    console.log(page)
    try {
        Skin.insertMany(skins)
        .then(data => res.status(201).send(data))
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

skinsRouter.delete('/:id', async(req,res) => {
    const idToDelete = req.params.id

    try {
        await Skin.findByIdAndDelete({_id: idToDelete})
        res.status(204).end
    }
    catch(e){
        
    }
})

module.exports = skinsRouter