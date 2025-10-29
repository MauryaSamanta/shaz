// store/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartState {
  count: number;
  isUpdating: boolean;
}

const initialState: CartState = {
  count: 0,
  isUpdating: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    startCartUpdate: (state) => {
      state.isUpdating = true;
    },

    // Called when add-to-cart completes successfully
    finishCartUpdate: (state) => {
      state.isUpdating = false;
    },

    incrementCart: (state) => {
      state.count += 1;
    },
     decrementCart: (state) => {
      state.count -= 1;
    },
    setCartCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    resetCart: (state) => {
      state.count = 0;
    },
  },
});

export const { startCartUpdate, finishCartUpdate, incrementCart, setCartCount, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
