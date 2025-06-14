import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {TAuthProps} from "@/feature/auth/services/auth.type.ts";



const initialState : TAuthProps = {
    email: '',
    password: '',
    accessToken: localStorage.getItem("access-token"),
    refreshToken: localStorage.getItem("refresh-token"),
    isAuthenticated: false,
}



const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAccessToken: (state, action : PayloadAction<string | null>) => {
            state.accessToken = action.payload;
        },
    }
})

export const {setAccessToken} = authSlice.actions;

export default authSlice.reducer;

// console.log(authSlice)

