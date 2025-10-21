// redux/store/index.ts
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './authSlice'; // Import your auth slice
import cartReducer from './cartSlice';
// Persist Config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['register'],
};

// Create a combined reducer (if you have more than one reducer)
const rootReducer = combineReducers({
  auth: authReducer,
   cart: cartReducer,
});

// Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure Store
export const store = configureStore({
  reducer: persistedReducer, // Use the persisted reducer
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable the serializable check middleware
    }),
});

// Persist Store
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
