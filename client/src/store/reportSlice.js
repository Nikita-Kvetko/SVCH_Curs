import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

// Fetch report data
export const fetchFinancialReport = createAsyncThunk(
  'reports/fetchFinancial',
  async ({ startDate, endDate, farmId = null }) => {
    const params = { startDate, endDate };
    if (farmId) params.farmId = farmId;
    const response = await api.get('/reports/financial', { params });
    return response.data;
  }
);

export const fetchTasksReport = createAsyncThunk(
  'reports/fetchTasks',
  async ({ startDate, endDate, farmId = null }) => {
    const params = { startDate, endDate };
    if (farmId) params.farmId = farmId;
    const response = await api.get('/reports/tasks', { params });
    return response.data;
  }
);

export const fetchCropsReport = createAsyncThunk(
  'reports/fetchCrops',
  async ({ startDate, endDate, farmId = null }) => {
    const params = { startDate, endDate };
    if (farmId) params.farmId = farmId;
    const response = await api.get('/reports/crops', { params });
    return response.data;
  }
);

export const saveReport = createAsyncThunk(
  'reports/save',
  async (reportData) => {
    const response = await api.post('/reports', reportData);
    return response.data;
  }
);

export const fetchSavedReports = createAsyncThunk(
  'reports/fetchSaved',
  async () => {
    const response = await api.get('/reports/my');
    return response.data;
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    financial: null,
    tasks: null,
    crops: null,
    savedReports: [],
    loading: false,
    error: null,
    generating: false,
  },
  reducers: {
    clearReportError: (state) => {
      state.error = null;
    },
    clearReports: (state) => {
      state.financial = null;
      state.tasks = null;
      state.crops = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Financial report
      .addCase(fetchFinancialReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFinancialReport.fulfilled, (state, action) => {
        state.loading = false;
        state.financial = action.payload;
      })
      .addCase(fetchFinancialReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Tasks report
      .addCase(fetchTasksReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasksReport.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasksReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Crops report
      .addCase(fetchCropsReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCropsReport.fulfilled, (state, action) => {
        state.loading = false;
        state.crops = action.payload;
      })
      .addCase(fetchCropsReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Save report
      .addCase(saveReport.fulfilled, (state, action) => {
        state.savedReports.unshift(action.payload);
      })
      // Fetch saved reports
      .addCase(fetchSavedReports.fulfilled, (state, action) => {
        state.savedReports = action.payload;
      });
  },
});

export const { clearReportError, clearReports } = reportSlice.actions;
export default reportSlice.reducer;