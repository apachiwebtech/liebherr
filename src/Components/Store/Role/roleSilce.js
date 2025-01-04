import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    roleAssign : [],
}

const roleSlice = createSlice({
    name : "role",
    initialState : initialState,
    reducers : {
        getRoleData(state, action){
            const newList = action.payload;
            state.roleAssign = newList;
            console.log(newList, "from slice");
        },

    }
})

export const roleActions = roleSlice.actions;
export default roleSlice.reducer;