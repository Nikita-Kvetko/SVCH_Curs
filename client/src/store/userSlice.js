import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

// Fetch user's bookings
export const fetchMyBookings = createAsyncThunk(
  'user/fetchMyBookings',
  async () => {
    const response = await api.get('/bookings/my');
    return response.data;
  }
);

// Fetch user's farms (for landowner)
export const fetchMyFarms = createAsyncThunk(
  'user/fetchMyFarms',
  async () => {
    const response = await api.get('/farms/my');
    return response.data;
  }
);

// Update booking status (approve/reject)
export const updateBookingStatus = createAsyncThunk(
  'user/updateBookingStatus',
  async ({ bookingId, status }) => {
    const response = await api.put(`/bookings/${bookingId}/status`, { status });
    return response.data;
  }
);

// Create new farm
export const createFarm = createAsyncThunk(
  'user/createFarm',
  async (farmData) => {
    const response = await api.post('/farms', farmData);
    return response.data;
  }
);

// Delete farm
export const deleteFarm = createAsyncThunk(
  'user/deleteFarm',
  async (farmId) => {
    await api.delete(`/farms/${farmId}`);
    return farmId;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    myBookings: [],
    myFarms: [],
    loading: false,
    error: null,
    updateLoading: false,
  },
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch my bookings
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.myBookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch my farms
      .addCase(fetchMyFarms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyFarms.fulfilled, (state, action) => {
        state.loading = false;
        state.myFarms = action.payload;
      })
      .addCase(fetchMyFarms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update booking status
      .addCase(updateBookingStatus.pending, (state) => {
        state.updateLoading = true;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.myBookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.myBookings[index] = action.payload;
        }
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.error.message;
      })
      // Create farm
      .addCase(createFarm.fulfilled, (state, action) => {
        state.myFarms.push(action.payload);
      })
      // Delete farm
      .addCase(deleteFarm.fulfilled, (state, action) => {
        state.myFarms = state.myFarms.filter(f => f.id !== action.payload);
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;