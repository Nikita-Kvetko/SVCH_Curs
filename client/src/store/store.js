import { configureStore } from '@reduxjs/toolkit';
import farmsReducer from './farmsSlice';
import authReducer from './authSlice';
import bookingsReducer from './bookingSlice';
import favoritesReducer from './favoriteSlice';
import userReducer from './userSlice';
import tasksReducer from './taskSlice';
import reportsReducer from './reportSlice';
import adminReducer from './adminSlice';

export const store = configureStore({
  reducer: {
    farms: farmsReducer,
    auth: authReducer,
    bookings: bookingsReducer,
    favorites: favoritesReducer,
    user: userReducer,
    tasks: tasksReducer,
    reports: reportsReducer,
    admin: adminReducer,
  },
});