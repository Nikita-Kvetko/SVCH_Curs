import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  }
);

export const fetchFarmBookings = createAsyncThunk(
  'bookings/fetchFarmBookings',
  async (farmId) => {
    const response = await api.get(`/bookings/farm/${farmId}`);
    return response.data;
  }
);

export const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUserBookings',
  async () => {
    const response = await api.get('/bookings/my');
    return response.data;
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    farmBookings: [],
    userBookings: [],
    loading: false,
    error: null,
    createLoading: false,
  },
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch farm bookings
      .addCase(fetchFarmBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarmBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.farmBookings = action.payload;
      })
      .addCase(fetchFarmBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.createLoading = false;
        state.userBookings.push(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.error.message;
      })
      // Fetch user bookings
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.userBookings = action.payload;
      })
      .addCase(fetchUserBookings.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearBookingError } = bookingSlice.actions;
export default bookingSlice.reducer;