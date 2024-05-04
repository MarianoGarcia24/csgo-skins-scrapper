const axios = require('axios')
const config = require('./config')

const baseURL = `http://localhost:${config.PORT}/api/skins`

const getAll = async () => {
    const res = await axios.get(`${baseURL}`)
    return res.data
}

const getByPage = async (pagename) => {
    console.log('getting skins from:', baseURL)
    const res = await axios.get(`${baseURL}/${pagename}`)
    return res.data
}

const postToDatabase =  async (skins,pagename) => {
    const promiseArray = skins.map(skin => {
        axios.post(`${baseURL}`,{page:pagename, ...skin})})
    try{
        const response = await Promise.all(promiseArray)
        console.log(response)
        const responseData = response.map(response => response.data)
        return responseData
    }
    catch(e){
        console.log('Error posting skins', e)
    }   
}

const deleteFromDatabase = async (skins, page) => {
    const promiseArray = Object.entries(skins).map(([index,value]) => {
        if (value == 0){
            return axios.delete(`${baseURL}/${page}/${index}`)
        }
    })
    console.log(promiseArray)
    try{
        const response = await Promise.all(promiseArray)
        const responseData = response.map(res => res.data)
        console.log("Skins deleted because they weren't on inventory:", responseData)
        return responseData
    }
    catch(e){
        console.log('Error deleting skins:', e)
    }

}

module.exports = {
    getAll: getAll,
    getByPage: getByPage,
    postToDatabase: postToDatabase,
    deleteFromDatabase: deleteFromDatabase
}