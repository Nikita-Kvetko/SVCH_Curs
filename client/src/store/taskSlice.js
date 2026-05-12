import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

// Fetch all tasks for user
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params = {}) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  }
);

// Create new task
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  }
);

// Update task
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  }
);

// Delete task
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id) => {
    await api.delete(`/tasks/${id}`);
    return id;
  }
);

// Toggle complete status
export const toggleTaskComplete = createAsyncThunk(
  'tasks/toggleComplete',
  async ({ id, is_completed }) => {
    const response = await api.patch(`/tasks/${id}/complete`, { is_completed: !is_completed });
    return response.data;
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    list: [],
    loading: false,
    error: null,
    filters: {
      status: 'all', // all, pending, completed, overdue
      priority: 'all', // all, low, medium, high
      farm_id: 'all',
    },
  },
  reducers: {
    setTaskFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Save to localStorage
      localStorage.setItem('taskFilters', JSON.stringify(state.filters));
    },
    resetTaskFilters: (state) => {
      state.filters = {
        status: 'all',
        priority: 'all',
        farm_id: 'all',
      };
      localStorage.setItem('taskFilters', JSON.stringify(state.filters));
    },
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create task
      .addCase(createTask.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.list.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.list = state.list.filter(t => t.id !== action.payload);
      })
      // Toggle complete
      .addCase(toggleTaskComplete.fulfilled, (state, action) => {
        const index = state.list.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });
  },
});

export const { setTaskFilter, resetTaskFilters, clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;