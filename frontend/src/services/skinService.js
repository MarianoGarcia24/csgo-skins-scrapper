import axios from 'axios'

const baseURL = 'http://localhost:3001/skins'

const getAll = async () => {
    const res = await axios.get(baseURL)
    console.log(res)
    return res.data
}

export default { getAll }