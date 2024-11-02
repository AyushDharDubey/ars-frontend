import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    username: '',
    email: '',
    roles: [],
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            const { roles, username, email } = action.payload;
            state.username = username;
            state.email = email;
            state.roles = roles
        },
        clearUser: (state) => {
            state.username = '';
            state.email = '';
            state.roles = [];
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
