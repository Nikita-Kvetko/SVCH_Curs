import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Button,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Assignment as TaskIcon,
  EventAvailable as BookingIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CompleteIcon,
  Pending as PendingIcon,
  Store as FarmIcon,
  Chat as ChatIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from '../api/axiosConfig';
import WeatherWidget from '../components/WeatherWidget';
import dayjs from 'dayjs';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tasks: { total: 0, completed: 0, pending: 0, overdue: 0 },
    bookings: { total: 0, active: 0, pending: 0, completed: 0 },
    farms: 0,
    revenue: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Получаем задачи
      const tasksRes = await axios.get('/tasks');
      const tasks = tasksRes.data;
      
      const completedTasks = tasks.filter(t => t.is_completed);
      const pendingTasks = tasks.filter(t => !t.is_completed);
      const overdueTasks = tasks.filter(t => 
        !t.is_completed && dayjs(t.due_date).isBefore(dayjs(), 'day')
      );
      
      // Получаем бронирования
      const bookingsRes = await axios.get('/bookings/my');
      const bookings = bookingsRes.data;
      
      const activeBookings = bookings.filter(b => 
        b.status === 'approved' && dayjs(b.end_date).isAfter(dayjs())
      );
      const pendingBookings = bookings.filter(b => b.status === 'pending');
      const completedBookings = bookings.filter(b => b.status === 'completed');
      
      // Получаем фермы (для владельцев)
      let farms = [];
      try {
        const farmsRes = await axios.get('/farms/my');
        farms = farmsRes.data;
      } catch (e) {
        console.log('No farms or error');
      }
      
      // Финансы
      const revenue = bookings
        .filter(b => b.status === 'approved' || b.status === 'completed')
        .reduce((sum, b) => sum + Number(b.total_price), 0);
      
      setStats({
        tasks: {
          total: tasks.length,
          completed: completedTasks.length,
          pending: pendingTasks.length,
          overdue: overdueTasks.length
        },
        bookings: {
          total: bookings.length,
          active: activeBookings.length,
          pending: pendingBookings.length,
          completed: completedBookings.length
        },
        farms: farms.length,
        revenue: revenue
      });
      
      setRecentTasks(tasks.slice(0, 5));
      setRecentBookings(bookings.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'success';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'approved': return 'Подтверждено';
      case 'pending': return 'Ожидает';
      case 'completed': return 'Завершено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, pb: 8 }}>
      {/* Приветствие */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Личный кабинет
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Добро пожаловать, {user?.name}! Вот сводка вашей активности в системе Agri Coworking.
        </Typography>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: '#e8f5e9', height: '100%' }}>
            <CardContent>
              <TaskIcon sx={{ fontSize: 40, color: '#2e7d32', mb: 1 }} />
              <Typography variant="h4">{stats.tasks.total}</Typography>
              <Typography variant="body2" color="text.secondary">Всего задач</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                <Chip size="small" icon={<CompleteIcon />} label={stats.tasks.completed} color="success" />
                <Chip size="small" icon={<PendingIcon />} label={stats.tasks.pending} color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: '#e3f2fd', height: '100%' }}>
            <CardContent>
              <BookingIcon sx={{ fontSize: 40, color: '#0288d1', mb: 1 }} />
              <Typography variant="h4">{stats.bookings.total}</Typography>
              <Typography variant="body2" color="text.secondary">Бронирований</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <Chip size="small" label={`Активных: ${stats.bookings.active}`} color="success" />
                <Chip size="small" label={`Ожидает: ${stats.bookings.pending}`} color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {user?.role === 'landowner' && (
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', bgcolor: '#fff3e0', height: '100%' }}>
              <CardContent>
                <FarmIcon sx={{ fontSize: 40, color: '#ff8f00', mb: 1 }} />
                <Typography variant="h4">{stats.farms}</Typography>
                <Typography variant="body2" color="text.secondary">Моих ферм</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: '#fce4ec', height: '100%' }}>
            <CardContent>
              <MoneyIcon sx={{ fontSize: 40, color: '#d32f2f', mb: 1 }} />
              <Typography variant="h4">{stats.revenue.toLocaleString()} ₽</Typography>
              <Typography variant="body2" color="text.secondary">Общий доход</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Погода */}
        <Grid item xs={12} md={4}>
          <WeatherWidget location={user?.location || 'Москва'} />
        </Grid>

        {/* Последние задачи */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                <TaskIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Последние задачи
              </Typography>
              <Button size="small" onClick={() => navigate('/tasks')}>Все задачи →</Button>
            </Box>
            <Divider />
            {recentTasks.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                У вас пока нет задач
              </Typography>
            ) : (
              <List>
                {recentTasks.map((task) => (
                  <ListItem key={task.id} button onClick={() => navigate('/tasks')}>
                    <ListItemIcon>
                      {task.is_completed ? 
                        <CompleteIcon color="success" /> : 
                        task.priority === 'high' ? 
                          <WarningIcon color="error" /> : 
                          <PendingIcon color="warning" />
                      }
                    </ListItemIcon>
                    <ListItemText
                      primary={task.title}
                      secondary={`Срок: ${dayjs(task.due_date).format('DD.MM.YYYY')}`}
                      primaryTypographyProps={{
                        sx: { textDecoration: task.is_completed ? 'line-through' : 'none' }
                      }}
                    />
                    <Chip 
                      size="small" 
                      label={task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                      color={getPriorityColor(task.priority)}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Последние бронирования */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                <BookingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Последние бронирования
              </Typography>
              <Button size="small" onClick={() => navigate('/bookings')}>Все →</Button>
            </Box>
            <Divider />
            {recentBookings.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                У вас пока нет бронирований
              </Typography>
            ) : (
              <List>
                {recentBookings.map((booking) => (
                  <ListItem key={booking.id} button onClick={() => navigate(`/farm/${booking.farm_id}`)}>
                    <ListItemIcon>
                      <FarmIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={booking.farm?.name || 'Ферма'}
                      secondary={`${dayjs(booking.start_date).format('DD.MM')} — ${dayjs(booking.end_date).format('DD.MM.YYYY')}`}
                    />
                    <Chip 
                      size="small" 
                      label={getStatusLabel(booking.status)}
                      color={getStatusColor(booking.status)}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Быстрые действия */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>Быстрые действия</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={() => navigate('/farms')}>
                Найти ферму
              </Button>
              <Button variant="outlined" onClick={() => navigate('/tasks')}>
                Создать задачу
              </Button>
              <Button variant="outlined" onClick={() => navigate('/shop')}>
                Заказать удобрения
              </Button>
              <Button variant="outlined" onClick={() => navigate('/reports')}>
                Сформировать отчёт
              </Button>
              <Button variant="outlined" startIcon={<ChatIcon />} onClick={() => navigate('/chat')}>
                Чат с поддержкой
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}