const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()

//CONFIG
const config = require('./utils/config')

//ROUTERS
const skinsRouter = require('./controller/skins')

console.log('connecting to database', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
    .then(console.log('DATABASE Connected'))
    .catch(error => console.log('Failed to connect database:', error))

app.use(cors())
app.use(express.json())

app.use('/api/skins', skinsRouter)

module.exports = app