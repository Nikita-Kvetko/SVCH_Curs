import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Alert,
  Chip,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  FilterList,
  CalendarMonth,
  ViewList,
  Close,
  Warning,
} from '@mui/icons-material';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  setTaskFilter,
  resetTaskFilters,
} from '../store/taskSlice';
import { fetchMyFarms } from '../store/userSlice';
import TaskCard from '../components/TaskCard';
import TaskCalendar from '../components/TaskCalendar';
import AddTaskFab from '../components/AddTaskFab';
import dayjs from 'dayjs';

export default function Tasks() {
  const dispatch = useDispatch();
  const { list, loading, filters } = useSelector((state) => state.tasks);
  const { myFarms } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.auth);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [showOverdueAlert, setShowOverdueAlert] = useState(true);

  useEffect(() => {
    // Load saved filters from localStorage
    const savedFilters = localStorage.getItem('taskFilters');
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      if (parsed.farm_id !== filters.farm_id || parsed.status !== filters.status || parsed.priority !== filters.priority) {
        dispatch(setTaskFilter(parsed));
      }
    }
  }, []);

  useEffect(() => {
    dispatch(fetchMyFarms());
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (filters.status !== 'all') params.status = filters.status;
    if (filters.priority !== 'all') params.priority = filters.priority;
    if (filters.farm_id !== 'all') params.farm_id = filters.farm_id;
    dispatch(fetchTasks(params));
  }, [dispatch, filters]);

  const filteredTasks = list.filter(task => {
    if (filters.status === 'completed') return task.is_completed;
    if (filters.status === 'pending') return !task.is_completed;
    if (filters.status === 'overdue') return !task.is_completed && dayjs(task.due_date).isBefore(dayjs(), 'day');
    return true;
  });

  const overdueTasks = list.filter(t => !t.is_completed && dayjs(t.due_date).isBefore(dayjs(), 'day'));

  const stats = {
    total: list.length,
    completed: list.filter(t => t.is_completed).length,
    pending: list.filter(t => !t.is_completed).length,
    overdue: overdueTasks.length,
  };

  const handleCreateTask = async (taskData) => {
    await dispatch(createTask(taskData));
  };

  const handleUpdateTask = async (id, taskData) => {
    await dispatch(updateTask({ id, taskData }));
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      await dispatch(deleteTask(id));
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    await dispatch(toggleTaskComplete({ id, is_completed: currentStatus }));
  };

  const handleCalendarDateClick = (date) => {
    // Filter tasks for that date
    dispatch(setTaskFilter({ status: 'all' }));
    setViewMode('list');
    // Optional: scroll to that date
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">
          Мои задачи
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            color={viewMode === 'list' ? 'primary' : 'default'}
            onClick={() => setViewMode('list')}
          >
            <ViewList />
          </IconButton>
          <IconButton
            color={viewMode === 'calendar' ? 'primary' : 'default'}
            onClick={() => setViewMode('calendar')}
          >
            <CalendarMonth />
          </IconButton>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h4">{stats.total}</Typography>
            <Typography variant="body2" color="text.secondary">Всего задач</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <Typography variant="h4" color="success.main">{stats.completed}</Typography>
            <Typography variant="body2" color="text.secondary">Выполнено</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h4" color="warning.main">{stats.pending}</Typography>
            <Typography variant="body2" color="text.secondary">В работе</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
            <Typography variant="h4" color="error.main">{stats.overdue}</Typography>
            <Typography variant="body2" color="text.secondary">Просрочено</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Overdue Alert */}
      {overdueTasks.length > 0 && showOverdueAlert && (
        <Alert
          severity="warning"
          icon={<Warning />}
          action={
            <IconButton size="small" onClick={() => setShowOverdueAlert(false)}>
              <Close fontSize="small" />
            </IconButton>
          }
          sx={{ mb: 3 }}
        >
          У вас {overdueTasks.length} просроченн{overdueTasks.length === 1 ? 'ая' : 'ых'} задач{overdueTasks.length !== 1 ? 'и' : 'а'}!
          Пожалуйста, обновите статус.
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FilterList color="action" />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => dispatch(setTaskFilter({ status: e.target.value }))}
              label="Статус"
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="pending">Активные</MenuItem>
              <MenuItem value="completed">Выполненные</MenuItem>
              <MenuItem value="overdue">Просроченные</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Приоритет</InputLabel>
            <Select
              value={filters.priority}
              onChange={(e) => dispatch(setTaskFilter({ priority: e.target.value }))}
              label="Приоритет"
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="low">Низкий</MenuItem>
              <MenuItem value="medium">Средний</MenuItem>
              <MenuItem value="high">Высокий</MenuItem>
            </Select>
          </FormControl>
          {myFarms.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Ферма</InputLabel>
              <Select
                value={filters.farm_id}
                onChange={(e) => dispatch(setTaskFilter({ farm_id: e.target.value }))}
                label="Ферма"
              >
                <MenuItem value="all">Все фермы</MenuItem>
                {myFarms.map((farm) => (
                  <MenuItem key={farm.id} value={farm.id}>{farm.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Button size="small" onClick={() => dispatch(resetTaskFilters())}>
            Сбросить
          </Button>
        </Box>

        {/* Active filters chips */}
        {(filters.status !== 'all' || filters.priority !== 'all' || filters.farm_id !== 'all') && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            <Typography variant="caption">Активные фильтры:</Typography>
            {filters.status !== 'all' && (
              <Chip
                label={`Статус: ${filters.status === 'pending' ? 'Активные' : filters.status === 'completed' ? 'Выполненные' : 'Просроченные'}`}
                size="small"
                onDelete={() => dispatch(setTaskFilter({ status: 'all' }))}
              />
            )}
            {filters.priority !== 'all' && (
              <Chip
                label={`Приоритет: ${filters.priority === 'low' ? 'Низкий' : filters.priority === 'medium' ? 'Средний' : 'Высокий'}`}
                size="small"
                onDelete={() => dispatch(setTaskFilter({ priority: 'all' }))}
              />
            )}
            {filters.farm_id !== 'all' && myFarms.find(f => f.id === filters.farm_id) && (
              <Chip
                label={`Ферма: ${myFarms.find(f => f.id === filters.farm_id)?.name}`}
                size="small"
                onDelete={() => dispatch(setTaskFilter({ farm_id: 'all' }))}
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Content */}
      {loading ? (
        <Typography>Загрузка задач...</Typography>
      ) : viewMode === 'list' ? (
        filteredTasks.length === 0 ? (
          <Alert severity="info">
            Нет задач, соответствующих выбранным фильтрам. Нажмите на кнопку +, чтобы создать новую задачу.
          </Alert>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              farms={myFarms}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
            />
          ))
        )
      ) : (
        <TaskCalendar tasks={list} onDateClick={handleCalendarDateClick} />
      )}

      {/* Add Task FAB */}
      <AddTaskFab farms={myFarms} onCreate={handleCreateTask} />
    </Container>
  );
}