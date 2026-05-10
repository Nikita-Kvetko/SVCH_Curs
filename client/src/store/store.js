import { configureStore } from '@reduxjs/toolkit';
import farmsReducer from './farmsSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    farms: farmsReducer,
    auth: authReducer,
  },
});