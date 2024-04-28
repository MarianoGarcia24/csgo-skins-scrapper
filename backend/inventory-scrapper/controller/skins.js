const skinsRouter = require('express').Router()
const Skin = require('../model/skins')

skinsRouter.get('/', async(req,res) => {
    const skins = await Skin.find({})
    res.json(skins)
})

skinsRouter.get('/:page', async(req,res) => {
    const page = req.params.page

    try {
        const skins = Skin.find({page: page})
        res.json(skins)
    }
    catch (error){
        console.log(err)
        res.status(500).json({message: 'Server Error'})
    }
})

skinsRouter.post('/:page',async(req,res) => {
    const skins = req.body.skins
    const page = req.params.page

    try {
        Skin.insertMany(skins)
        .then(data => res.status(201).json(skins))
    }
    catch(error){

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