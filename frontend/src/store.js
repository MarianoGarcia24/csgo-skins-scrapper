import { configureStore } from "@reduxjs/toolkit";

import skinReducer from "./reducers/skinReducer";


const store = configureStore({
    reducer: {
        skins: skinReducer
    }
})

export default store
