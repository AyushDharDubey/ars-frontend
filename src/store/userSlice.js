import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    id: '',
    username: '',
    email: '',
    roles: [],
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            const { id, roles, username, email } = action.payload;

            if (!id || !username || !email || !Array.isArray(roles) || roles.length === 0) {
                console.log(action.payload);
                throw new Error("All user fields must be populated and roles should be a non-empty array.");
            }

            state.id = id;
            state.username = username;
            state.email = email;
            state.roles = roles;
        },
        clearUser: (state) => {
            state.id = '';
            state.username = '';
            state.email = '';
            state.roles = [];
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
