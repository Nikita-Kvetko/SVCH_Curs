import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Divider,
  LinearProgress,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  PriorityHigh as PriorityHighIcon,
  Flag as FlagIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import axios from '../api/axiosConfig';

dayjs.locale('ru');

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [user, setUser] = useState(null);
  const [farmsLoading, setFarmsLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    farmId: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: dayjs().add(3, 'day').format('YYYY-MM-DD'),
    priority: 'medium',
    task_type: 'other',
    farm_id: '',
  });

  const priorityColors = {
    low: { color: 'success', label: 'Низкий' },
    medium: { color: 'warning', label: 'Средний' },
    high: { color: 'error', label: 'Высокий' },
  };

  const taskTypes = [
    { value: 'planting', label: 'Посадка', icon: '🌱' },
    { value: 'watering', label: 'Полив', icon: '💧' },
    { value: 'fertilizing', label: 'Удобрение', icon: '🌾' },
    { value: 'harvesting', label: 'Сбор урожая', icon: '🚜' },
    { value: 'maintenance', label: 'Обслуживание', icon: '🔧' },
    { value: 'other', label: 'Другое', icon: '📋' },
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchTasks();
    fetchFarms();
  }, [filters]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status === 'completed') params.status = 'completed';
      if (filters.status === 'pending') params.status = 'pending';
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.farmId !== 'all') params.farm_id = filters.farmId;
      
      const response = await axios.get('/tasks', { params });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showMessage('Ошибка загрузки задач', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFarms = async () => {
    setFarmsLoading(true);
    try {
      // Пробуем получить все фермы через основной эндпоинт
      const response = await axios.get('/farms');
      console.log('Все фермы из /farms:', response.data);
      
      if (response.data && response.data.length > 0) {
        setFarms(response.data);
        if (!formData.farm_id) {
          setFormData(prev => ({ ...prev, farm_id: response.data[0].id }));
        }
      } else {
        // Если нет ферм, показываем сообщение
        showMessage('Нет доступных ферм. Обратитесь к администратору.', 'warning');
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
      console.error('Error details:', error.response?.data);
      showMessage('Ошибка загрузки списка ферм: ' + (error.response?.data?.error || error.message), 'error');
      
      // Пробуем альтернативный эндпоинт
      try {
        const altResponse = await axios.get('/farms/my');
        console.log('Фермы из /farms/my:', altResponse.data);
        if (altResponse.data && altResponse.data.length > 0) {
          setFarms(altResponse.data);
          if (!formData.farm_id) {
            setFormData(prev => ({ ...prev, farm_id: altResponse.data[0].id }));
          }
        }
      } catch (altError) {
        console.error('Alternative endpoint also failed:', altError);
      }
    } finally {
      setFarmsLoading(false);
    }
  };

  const showMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        due_date: task.due_date,
        priority: task.priority,
        task_type: task.task_type,
        farm_id: task.farm_id || '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        due_date: dayjs().add(3, 'day').format('YYYY-MM-DD'),
        priority: 'medium',
        task_type: 'other',
        farm_id: farms.length > 0 ? farms[0].id : '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTask(null);
  };

  // Замените функцию handleSaveTask в Tasks.jsx

const handleSaveTask = async () => {
  // Валидация
  if (!formData.title || !formData.title.trim()) {
    showMessage('Введите название задачи', 'error');
    return;
  }
  
  // Подготовка данных для отправки
  const taskData = {
    title: formData.title.trim(),
    description: formData.description || null,
    due_date: formData.due_date || null,
    priority: formData.priority || 'medium',
    task_type: formData.task_type || 'other',
    farm_id: formData.farm_id || null
  };
  
  console.log('Отправка данных задачи:', taskData);
  
  try {
    let response;
    if (editingTask) {
      response = await axios.put(`/tasks/${editingTask.id}`, taskData);
      showMessage('Задача обновлена');
    } else {
      response = await axios.post('/tasks', taskData);
      showMessage('Задача создана');
    }
    
    console.log('Ответ сервера:', response.data);
    handleCloseDialog();
    fetchTasks(); // Обновляем список задач
  } catch (error) {
    console.error('Error saving task:', error);
    console.error('Детали ошибки:', error.response?.data);
    
    const errorMessage = error.response?.data?.error || 'Ошибка сохранения задачи';
    showMessage(errorMessage, 'error');
  }
};

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Удалить задачу?')) {
      try {
        await axios.delete(`/tasks/${taskId}`);
        showMessage('Задача удалена');
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        showMessage('Ошибка удаления задачи', 'error');
      }
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await axios.put(`/tasks/${task.id}`, {
        ...task,
        is_completed: !task.is_completed,
        completed_at: !task.is_completed ? new Date() : null,
      });
      fetchTasks();
      showMessage(task.is_completed ? 'Задача отмечена как невыполненная' : 'Задача выполнена!');
    } catch (error) {
      console.error('Error toggling task:', error);
      showMessage('Ошибка обновления статуса', 'error');
    }
  };

  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    if (filters.status === 'completed') {
      filtered = filtered.filter(t => t.is_completed);
    } else if (filters.status === 'pending') {
      filtered = filtered.filter(t => !t.is_completed);
    }
    
    if (filters.priority !== 'all') {
      filtered = filtered.filter(t => t.priority === filters.priority);
    }
    
    if (filters.farmId !== 'all') {
      filtered = filtered.filter(t => t.farm_id === filters.farmId);
    }
    
    return filtered;
  };

  const getTasksByStatus = () => {
    const all = getFilteredTasks();
    const pending = all.filter(t => !t.is_completed);
    const completed = all.filter(t => t.is_completed);
    const overdue = all.filter(t => !t.is_completed && dayjs(t.due_date).isBefore(dayjs(), 'day'));
    
    return { all, pending, completed, overdue };
  };

  const tasksByStatus = getTasksByStatus();
  
  const getTaskIcon = (taskType) => {
    const found = taskTypes.find(t => t.value === taskType);
    return found ? found.icon : '📋';
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      farmId: 'all',
    });
  };

  const TaskCard = ({ task }) => {
    const isOverdue = !task.is_completed && dayjs(task.due_date).isBefore(dayjs(), 'day');
    const priorityInfo = priorityColors[task.priority];
    
    return (
      <Card sx={{ 
        mb: 2, 
        opacity: task.is_completed ? 0.7 : 1,
        borderLeft: isOverdue ? '4px solid #d32f2f' : task.is_completed ? '4px solid #2e7d32' : 'none',
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <IconButton 
                size="small" 
                onClick={() => handleToggleComplete(task)}
                color={task.is_completed ? 'success' : 'default'}
              >
                {task.is_completed ? <CheckCircleIcon /> : <UncheckedIcon />}
              </IconButton>
              <Typography 
                variant="h6" 
                component="span"
                sx={{ 
                  textDecoration: task.is_completed ? 'line-through' : 'none',
                  color: task.is_completed ? 'text.secondary' : 'text.primary',
                }}
              >
                {task.title}
              </Typography>
              <Chip 
                size="small" 
                label={priorityInfo.label} 
                color={priorityInfo.color}
                icon={<FlagIcon fontSize="small" />}
              />
              <Chip 
                size="small" 
                variant="outlined"
                label={`${getTaskIcon(task.task_type)} ${taskTypes.find(t => t.value === task.task_type)?.label || 'Другое'}`}
              />
              {isOverdue && !task.is_completed && (
                <Chip size="small" label="Просрочено" color="error" icon={<PriorityHighIcon />} />
              )}
            </Box>
            <Box>
              <Tooltip title="Редактировать">
                <IconButton size="small" onClick={() => handleOpenDialog(task)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Удалить">
                <IconButton size="small" color="error" onClick={() => handleDeleteTask(task.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {task.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 5 }}>
              {task.description}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, ml: 5, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarIcon fontSize="small" color="action" />
              <Typography variant="caption" color={isOverdue ? 'error' : 'text.secondary'}>
                Срок: {dayjs(task.due_date).format('DD.MM.YYYY')}
              </Typography>
            </Box>
            {task.farm && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Ферма: {task.farm.name}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  const completedPercentage = tasks.length > 0 
    ? (tasks.filter(t => t.is_completed).length / tasks.length) * 100 
    : 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1">
            Мои задачи
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Фильтры
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Новая задача
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Общий прогресс: {tasks.filter(t => t.is_completed).length} из {tasks.length} задач выполнено
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={completedPercentage} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Paper>

        {showFilters && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Фильтры задач</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Статус</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    label="Статус"
                  >
                    <MenuItem value="all">Все</MenuItem>
                    <MenuItem value="pending">В работе</MenuItem>
                    <MenuItem value="completed">Выполненные</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Приоритет</InputLabel>
                  <Select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    label="Приоритет"
                  >
                    <MenuItem value="all">Все</MenuItem>
                    <MenuItem value="high">Высокий</MenuItem>
                    <MenuItem value="medium">Средний</MenuItem>
                    <MenuItem value="low">Низкий</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ферма</InputLabel>
                  <Select
                    value={filters.farmId}
                    onChange={(e) => setFilters({ ...filters, farmId: e.target.value })}
                    label="Ферма"
                  >
                    <MenuItem value="all">Все фермы</MenuItem>
                    {farms.map(farm => (
                      <MenuItem key={farm.id} value={farm.id}>{farm.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button fullWidth variant="outlined" onClick={resetFilters} startIcon={<ClearIcon />}>
                  Сбросить фильтры
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Paper sx={{ px: 3, py: 1.5, textAlign: 'center', flex: 1 }}>
            <Typography variant="h4">{tasksByStatus.all.length}</Typography>
            <Typography variant="caption">Всего задач</Typography>
          </Paper>
          <Paper sx={{ px: 3, py: 1.5, textAlign: 'center', flex: 1, bgcolor: '#fff3e0' }}>
            <Typography variant="h4" color="warning.main">{tasksByStatus.pending.length}</Typography>
            <Typography variant="caption">В работе</Typography>
          </Paper>
          <Paper sx={{ px: 3, py: 1.5, textAlign: 'center', flex: 1, bgcolor: '#e8f5e9' }}>
            <Typography variant="h4" color="success.main">{tasksByStatus.completed.length}</Typography>
            <Typography variant="caption">Выполнено</Typography>
          </Paper>
          <Paper sx={{ px: 3, py: 1.5, textAlign: 'center', flex: 1, bgcolor: '#ffebee' }}>
            <Typography variant="h4" color="error.main">{tasksByStatus.overdue.length}</Typography>
            <Typography variant="caption">Просрочено</Typography>
          </Paper>
        </Box>

        <Paper sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Все задачи" />
            <Tab label={`В работе (${tasksByStatus.pending.length})`} />
            <Tab label={`Выполненные (${tasksByStatus.completed.length})`} />
            <Tab label={`Просроченные (${tasksByStatus.overdue.length})`} />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TabPanel value={tabValue} index={0}>
                  {tasksByStatus.all.length === 0 ? (
                    <Alert severity="info">У вас пока нет задач. Создайте первую задачу!</Alert>
                  ) : (
                    tasksByStatus.all.map(task => <TaskCard key={task.id} task={task} />)
                  )}
                </TabPanel>
                
                <TabPanel value={tabValue} index={1}>
                  {tasksByStatus.pending.length === 0 ? (
                    <Alert severity="info">Нет активных задач</Alert>
                  ) : (
                    tasksByStatus.pending.map(task => <TaskCard key={task.id} task={task} />)
                  )}
                </TabPanel>
                
                <TabPanel value={tabValue} index={2}>
                  {tasksByStatus.completed.length === 0 ? (
                    <Alert severity="info">Нет выполненных задач</Alert>
                  ) : (
                    tasksByStatus.completed.map(task => <TaskCard key={task.id} task={task} />)
                  )}
                </TabPanel>
                
                <TabPanel value={tabValue} index={3}>
                  {tasksByStatus.overdue.length === 0 ? (
                    <Alert severity="info">Нет просроченных задач</Alert>
                  ) : (
                    tasksByStatus.overdue.map(task => <TaskCard key={task.id} task={task} />)
                  )}
                </TabPanel>
              </>
            )}
          </Box>
        </Paper>

        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingTask ? 'Редактировать задачу' : 'Новая задача'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Название задачи *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Описание"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Дата выполнения"
                  value={dayjs(formData.due_date)}
                  onChange={(newValue) => setFormData({ ...formData, due_date: newValue.format('YYYY-MM-DD') })}
                  sx={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Приоритет</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    label="Приоритет"
                  >
                    <MenuItem value="low">Низкий</MenuItem>
                    <MenuItem value="medium">Средний</MenuItem>
                    <MenuItem value="high">Высокий</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Тип задачи</InputLabel>
                  <Select
                    value={formData.task_type}
                    onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                    label="Тип задачи"
                  >
                    {taskTypes.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Ферма</InputLabel>
                  <Select
                    value={formData.farm_id}
                    onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                    label="Ферма"
                    disabled={farmsLoading}
                  >
                    {farmsLoading ? (
                      <MenuItem disabled>Загрузка ферм...</MenuItem>
                    ) : farms.length === 0 ? (
                      <MenuItem disabled>Нет доступных ферм</MenuItem>
                    ) : (
                      farms.map(farm => (
                        <MenuItem key={farm.id} value={farm.id}>{farm.name}</MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                {!farmsLoading && farms.length === 0 && (
                  <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                    Нет доступных ферм. Обратитесь к администратору для добавления ферм.
                  </Typography>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button variant="contained" onClick={handleSaveTask}>
              {editingTask ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
}