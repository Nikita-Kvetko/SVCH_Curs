import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

// Users
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  }
);

export const toggleUserBlock = createAsyncThunk(
  'admin/toggleUserBlock',
  async ({ userId, isBlocked }) => {
    const response = await api.patch(`/admin/users/${userId}/block`, { isBlocked });
    return response.data;
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId) => {
    await api.delete(`/admin/users/${userId}`);
    return userId;
  }
);

// Farms (admin)
export const fetchAllFarmsAdmin = createAsyncThunk(
  'admin/fetchAllFarms',
  async (params = {}) => {
    const response = await api.get('/admin/farms', { params });
    return response.data;
  }
);

export const updateFarmAdmin = createAsyncThunk(
  'admin/updateFarm',
  async ({ farmId, farmData }) => {
    const response = await api.put(`/admin/farms/${farmId}`, farmData);
    return response.data;
  }
);

export const deleteFarmAdmin = createAsyncThunk(
  'admin/deleteFarm',
  async (farmId) => {
    await api.delete(`/admin/farms/${farmId}`);
    return farmId;
  }
);

// Bookings (admin)
export const fetchAllBookingsAdmin = createAsyncThunk(
  'admin/fetchAllBookings',
  async (params = {}) => {
    const response = await api.get('/admin/bookings', { params });
    return response.data;
  }
);

// Platform stats
export const fetchPlatformStats = createAsyncThunk(
  'admin/fetchStats',
  async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    farms: [],
    bookings: [],
    stats: null,
    loading: false,
    error: null,
    totalUsers: 0,
    totalFarms: 0,
    totalBookings: 0,
  },
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.totalUsers = action.payload.total;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update user role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      // Toggle user block
      .addCase(toggleUserBlock.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
      })
      // Fetch farms
      .addCase(fetchAllFarmsAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllFarmsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.farms = action.payload.farms;
        state.totalFarms = action.payload.total;
      })
      .addCase(fetchAllFarmsAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update farm
      .addCase(updateFarmAdmin.fulfilled, (state, action) => {
        const index = state.farms.findIndex(f => f.id === action.payload.id);
        if (index !== -1) {
          state.farms[index] = action.payload;
        }
      })
      // Delete farm
      .addCase(deleteFarmAdmin.fulfilled, (state, action) => {
        state.farms = state.farms.filter(f => f.id !== action.payload);
      })
      // Fetch bookings
      .addCase(fetchAllBookingsAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllBookingsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.totalBookings = action.payload.total;
      })
      .addCase(fetchAllBookingsAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch stats
      .addCase(fetchPlatformStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;