import {createSlice} from '@reduxjs/toolkit'
import skinService from '../services/skinService'

const skinSlice = createSlice({
    name: 'skins',
    initialState: [],
    reducers: {
        appendSkins(state, action){
            state.push(action.payload)
        },
        setSkins(state, action){
            return action.payload
        }
    }
})

export const { appendSkins, setSkins } = skinSlice.actions

export const initializeNotes = () => {
    return async dispatch => {
        const skins = await skinService.getAll()
        dispatch(setSkins(skins))
    }
}

export default skinSlice.reducer