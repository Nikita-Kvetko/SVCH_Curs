import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

export const fetchFarms = createAsyncThunk(
  'farms/fetchFarms',
  async (params) => {
    const response = await api.get('/farms', { params });
    return response.data;
  }
);

const loadFiltersFromStorage = () => {
  const saved = localStorage.getItem('farmsFilters');
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    search: '',
    sortBy: 'price_asc',
    priceRange: [0, 100000],
    areaRange: [0, 100],
    soilType: '',
    waterAccess: false,
  };
};

const farmsSlice = createSlice({
  name: 'farms',
  initialState: {
    list: [],
    loading: false,
    error: null,
    filters: loadFiltersFromStorage(),
  },
  reducers: {
    setSearch: (state, action) => {
      state.filters.search = action.payload;
      localStorage.setItem('farmsFilters', JSON.stringify(state.filters));
    },
    setSortBy: (state, action) => {
      state.filters.sortBy = action.payload;
      localStorage.setItem('farmsFilters', JSON.stringify(state.filters));
    },
    setPriceRange: (state, action) => {
      state.filters.priceRange = action.payload;
      localStorage.setItem('farmsFilters', JSON.stringify(state.filters));
    },
    setAreaRange: (state, action) => {
      state.filters.areaRange = action.payload;
      localStorage.setItem('farmsFilters', JSON.stringify(state.filters));
    },
    setSoilType: (state, action) => {
      state.filters.soilType = action.payload;
      localStorage.setItem('farmsFilters', JSON.stringify(state.filters));
    },
    setWaterAccess: (state, action) => {
      state.filters.waterAccess = action.payload;
      localStorage.setItem('farmsFilters', JSON.stringify(state.filters));
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        sortBy: 'price_asc',
        priceRange: [0, 100000],
        areaRange: [0, 100],
        soilType: '',
        waterAccess: false,
      };
      localStorage.setItem('farmsFilters', JSON.stringify(state.filters));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFarms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarms.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchFarms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  setSearch,
  setSortBy,
  setPriceRange,
  setAreaRange,
  setSoilType,
  setWaterAccess,
  resetFilters,
} = farmsSlice.actions;

export default farmsSlice.reducer;