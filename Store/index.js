import {configureStore} from '@reduxjs/toolkit'
import roleAssignReducer from './Role/roleSilce'
const store = configureStore({
    reducer : {
        roleAssign : roleAssignReducer,
    }
})
export default store;