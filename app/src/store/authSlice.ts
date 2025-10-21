import { createSlice } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean;
  user: any,
  token: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user:null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setlogin: (state, action) => {
      state.user = action.payload.user;
      //state.token = action.payload.token;
    },
    setlogout: (state) => {
      state.user = null;
      state.token = null;
    },
    setUpdatedPreferenceVector: (state, action) => {
  if (state.user) {
    state.user = {
      ...state.user,
      preference_vector: [...action.payload],  // clone to avoid mutation
    };
  }
},
  setUpdatedRewards: (state, action) => {
  if (state.user) {
    state.user = {
      ...state.user,
      rewards: action.payload,  // clone to avoid mutation
    };
  }
}
  },
});

export const { setlogin, setlogout,setUpdatedPreferenceVector, setUpdatedRewards } = authSlice.actions;
export default authSlice.reducer;
