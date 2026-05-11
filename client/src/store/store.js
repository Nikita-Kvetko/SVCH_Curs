import { configureStore } from '@reduxjs/toolkit';
import farmsReducer from './farmsSlice';
import authReducer from './authSlice';
import bookingsReducer from './bookingSlice';
import favoritesReducer from './favoriteSlice';

export const store = configureStore({
  reducer: {
    farms: farmsReducer,
    auth: bookingsReducer,
    favorites: favoritesReducer,
  },
});