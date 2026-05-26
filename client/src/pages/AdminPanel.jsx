import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Switch,
  FormControlLabel,
  Snackbar
} from '@mui/material';
import {
  Block,
  CheckCircle,
  Delete,
  Edit,
  AdminPanelSettings,
  Person,
  Store,
  BookOnline,
  Add,
  Close
} from '@mui/icons-material';
import axios from '../api/axiosConfig';
import dayjs from 'dayjs';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );
}

export default function AdminPanel() {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  
  // Диалоги создания
  const [farmDialogOpen, setFarmDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Форма создания фермы
  const [farmForm, setFarmForm] = useState({
    name: '',
    location: '',
    area_hectares: '',
    price_per_month: '',
    soil_type: '',
    water_access: false,
    electricity: false,
    description: '',
    owner_id: ''
  });
  
  // Форма создания бронирования
  const [bookingForm, setBookingForm] = useState({
    farm_id: '',
    farmer_id: '',
    start_date: dayjs().format('YYYY-MM-DD'),
    end_date: dayjs().add(7, 'day').format('YYYY-MM-DD'),
    total_price: '',
    notes: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchAllData();
    fetchAllUsers();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, farmsRes, bookingsRes, statsRes] = await Promise.all([
        axios.get('/admin/users'),
        axios.get('/admin/farms'),
        axios.get('/admin/bookings'),
        axios.get('/admin/stats')
      ]);
      setUsers(usersRes.data.users || []);
      setFarms(farmsRes.data.farms || []);
      setBookings(bookingsRes.data.bookings || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showMessage('Ошибка загрузки данных', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('/admin/users');
      setAllUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const showMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      await axios.patch(`/admin/users/${userId}/block`, { isBlocked });
      showMessage(isBlocked ? 'Пользователь разблокирован' : 'Пользователь заблокирован');
      fetchAllData();
    } catch (error) {
      console.error('Error blocking user:', error);
      showMessage('Ошибка', 'error');
    }
  };

  const handleChangeRole = async (userId, role) => {
    try {
      await axios.put(`/admin/users/${userId}/role`, { role });
      showMessage('Роль изменена');
      fetchAllData();
    } catch (error) {
      console.error('Error changing role:', error);
      showMessage('Ошибка', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Удалить пользователя?')) {
      try {
        await axios.delete(`/admin/users/${userId}`);
        showMessage('Пользователь удалён');
        fetchAllData();
      } catch (error) {
        console.error('Error deleting user:', error);
        showMessage('Ошибка', 'error');
      }
    }
  };

  const handleDeleteFarm = async (farmId) => {
    if (window.confirm('Удалить ферму?')) {
      try {
        await axios.delete(`/admin/farms/${farmId}`);
        showMessage('Ферма удалена');
        fetchAllData();
      } catch (error) {
        console.error('Error deleting farm:', error);
        showMessage('Ошибка', 'error');
      }
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Удалить бронирование?')) {
      try {
        await axios.delete(`/admin/bookings/${bookingId}`);
        showMessage('Бронирование удалено');
        fetchAllData();
      } catch (error) {
        console.error('Error deleting booking:', error);
        showMessage('Ошибка', 'error');
      }
    }
  };

  // СОЗДАНИЕ ФЕРМЫ
  const handleCreateFarm = async () => {
    if (!farmForm.name || !farmForm.location || !farmForm.area_hectares || !farmForm.price_per_month) {
      showMessage('Заполните обязательные поля', 'error');
      return;
    }
    
    try {
      await axios.post('/admin/farms', farmForm);
      showMessage('Ферма успешно создана');
      setFarmDialogOpen(false);
      setFarmForm({
        name: '',
        location: '',
        area_hectares: '',
        price_per_month: '',
        soil_type: '',
        water_access: false,
        electricity: false,
        description: '',
        owner_id: ''
      });
      fetchAllData();
    } catch (error) {
      console.error('Error creating farm:', error);
      showMessage('Ошибка при создании фермы', 'error');
    }
  };

  // СОЗДАНИЕ БРОНИРОВАНИЯ
  const handleCreateBooking = async () => {
    if (!bookingForm.farm_id || !bookingForm.farmer_id || !bookingForm.start_date || !bookingForm.end_date || !bookingForm.total_price) {
      showMessage('Заполните обязательные поля', 'error');
      return;
    }
    
    try {
      await axios.post('/admin/bookings', bookingForm);
      showMessage('Бронирование успешно создано');
      setBookingDialogOpen(false);
      setBookingForm({
        farm_id: '',
        farmer_id: '',
        start_date: dayjs().format('YYYY-MM-DD'),
        end_date: dayjs().add(7, 'day').format('YYYY-MM-DD'),
        total_price: '',
        notes: '',
        status: 'pending'
      });
      fetchAllData();
    } catch (error) {
      console.error('Error creating booking:', error);
      showMessage('Ошибка при создании бронирования', 'error');
    }
  };

  const getRoleChip = (role) => {
    const colors = {
      admin: 'error',
      farm_admin: 'warning',
      landowner: 'primary',
      farmer: 'success'
    };
    const labels = {
      admin: 'Админ',
      farm_admin: 'Админ фермы',
      landowner: 'Владелец',
      farmer: 'Фермер'
    };
    return <Chip label={labels[role] || role} color={colors[role] || 'default'} size="small" />;
  };

  const getStatusChip = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      completed: 'info',
      cancelled: 'default'
    };
    const labels = {
      pending: 'Ожидает',
      approved: 'Подтверждено',
      rejected: 'Отклонено',
      completed: 'Завершено',
      cancelled: 'Отменено'
    };
    return <Chip label={labels[status] || status} color={colors[status] || 'default'} size="small" />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AdminPanelSettings sx={{ fontSize: 40, color: '#2e7d32' }} />
          <Typography variant="h4" component="h1">
            Панель администратора
          </Typography>
        </Box>
      </Box>

      {/* Статистика */}
      {stats && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', minWidth: 120 }}>
            <Typography variant="h4">{stats.total_users}</Typography>
            <Typography variant="caption">Пользователей</Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', minWidth: 120 }}>
            <Typography variant="h4">{stats.total_farms}</Typography>
            <Typography variant="caption">Ферм</Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', minWidth: 120 }}>
            <Typography variant="h4">{stats.total_bookings}</Typography>
            <Typography variant="caption">Бронирований</Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', minWidth: 120 }}>
            <Typography variant="h4">{stats.total_revenue?.toLocaleString() || 0}₽</Typography>
            <Typography variant="caption">Доход</Typography>
          </Paper>
        </Box>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<Person />} label="Пользователи" />
          <Tab icon={<Store />} label="Фермы" />
          <Tab icon={<BookOnline />} label="Бронирования" />
        </Tabs>

        {/* Пользователи */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Имя</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Телефон</TableCell>
                  <TableCell>Локация</TableCell>
                  <TableCell>Роль</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '—'}</TableCell>
                    <TableCell>{user.location || '—'}</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user.id, e.target.value)}
                          size="small"
                        >
                          <MenuItem value="farmer">Фермер</MenuItem>
                          <MenuItem value="landowner">Владелец</MenuItem>
                          <MenuItem value="farm_admin">Админ фермы</MenuItem>
                          <MenuItem value="admin">Админ</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_blocked ? 'Заблокирован' : 'Активен'}
                        color={user.is_blocked ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color={user.is_blocked ? 'success' : 'warning'}
                        onClick={() => handleBlockUser(user.id, !user.is_blocked)}
                      >
                        {user.is_blocked ? <CheckCircle /> : <Block />}
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Фермы */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setFarmDialogOpen(true)}
            >
              Добавить ферму
            </Button>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Название</TableCell>
                  <TableCell>Локация</TableCell>
                  <TableCell>Площадь (га)</TableCell>
                  <TableCell>Цена (₽/мес)</TableCell>
                  <TableCell>Владелец</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {farms.map((farm) => (
                  <TableRow key={farm.id} hover>
                    <TableCell>{farm.name}</TableCell>
                    <TableCell>{farm.location}</TableCell>
                    <TableCell>{Number(farm.area_hectares).toLocaleString()}</TableCell>
                    <TableCell>{Number(farm.price_per_month).toLocaleString()}</TableCell>
                    <TableCell>{farm.owner?.name || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={farm.is_available ? 'Доступна' : 'Недоступна'}
                        color={farm.is_available ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleDeleteFarm(farm.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Бронирования */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setBookingDialogOpen(true)}
            >
              Добавить бронирование
            </Button>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Ферма</TableCell>
                  <TableCell>Арендатор</TableCell>
                  <TableCell>Период</TableCell>
                  <TableCell>Стоимость</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id} hover>
                    <TableCell>{booking.farm?.name || '—'}</TableCell>
                    <TableCell>{booking.farmer?.name || '—'}</TableCell>
                    <TableCell>
                      {dayjs(booking.start_date).format('DD.MM.YYYY')} — {dayjs(booking.end_date).format('DD.MM.YYYY')}
                    </TableCell>
                    <TableCell>{Number(booking.total_price).toLocaleString()} ₽</TableCell>
                    <TableCell>{getStatusChip(booking.status)}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleDeleteBooking(booking.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Диалог создания фермы */}
      <Dialog open={farmDialogOpen} onClose={() => setFarmDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">➕ Добавление новой фермы</Typography>
            <IconButton onClick={() => setFarmDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Название фермы *"
                value={farmForm.name}
                onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Локация *"
                value={farmForm.location}
                onChange={(e) => setFarmForm({ ...farmForm, location: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Площадь (га) *"
                type="number"
                value={farmForm.area_hectares}
                onChange={(e) => setFarmForm({ ...farmForm, area_hectares: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Цена за месяц (₽) *"
                type="number"
                value={farmForm.price_per_month}
                onChange={(e) => setFarmForm({ ...farmForm, price_per_month: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Тип почвы</InputLabel>
                <Select
                  value={farmForm.soil_type}
                  onChange={(e) => setFarmForm({ ...farmForm, soil_type: e.target.value })}
                  label="Тип почвы"
                >
                  <MenuItem value="">Не указан</MenuItem>
                  <MenuItem value="Чернозем">Чернозем</MenuItem>
                  <MenuItem value="Суглинок">Суглинок</MenuItem>
                  <MenuItem value="Песчаный">Песчаный</MenuItem>
                  <MenuItem value="Глинистый">Глинистый</MenuItem>
                  <MenuItem value="Торфяной">Торфяной</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Владелец</InputLabel>
                <Select
                  value={farmForm.owner_id}
                  onChange={(e) => setFarmForm({ ...farmForm, owner_id: e.target.value })}
                  label="Владелец"
                >
                  <MenuItem value="">Не указан</MenuItem>
                  {allUsers.filter(u => u.role === 'landowner' || u.role === 'admin').map((user) => (
                    <MenuItem key={user.id} value={user.id}>{user.name} ({user.email})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Описание"
                multiline
                rows={3}
                value={farmForm.description}
                onChange={(e) => setFarmForm({ ...farmForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={farmForm.water_access}
                      onChange={(e) => setFarmForm({ ...farmForm, water_access: e.target.checked })}
                    />
                  }
                  label="Водоснабжение"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={farmForm.electricity}
                      onChange={(e) => setFarmForm({ ...farmForm, electricity: e.target.checked })}
                    />
                  }
                  label="Электричество"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFarmDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleCreateFarm}>Создать ферму</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог создания бронирования */}
      <Dialog open={bookingDialogOpen} onClose={() => setBookingDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">📅 Добавление бронирования</Typography>
            <IconButton onClick={() => setBookingDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Ферма *</InputLabel>
                <Select
                  value={bookingForm.farm_id}
                  onChange={(e) => setBookingForm({ ...bookingForm, farm_id: e.target.value })}
                  label="Ферма *"
                >
                  {farms.map((farm) => (
                    <MenuItem key={farm.id} value={farm.id}>{farm.name} ({farm.location})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Арендатор *</InputLabel>
                <Select
                  value={bookingForm.farmer_id}
                  onChange={(e) => setBookingForm({ ...bookingForm, farmer_id: e.target.value })}
                  label="Арендатор *"
                >
                  {allUsers.filter(u => u.role === 'farmer').map((user) => (
                    <MenuItem key={user.id} value={user.id}>{user.name} ({user.email})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Дата начала *"
                type="date"
                value={bookingForm.start_date}
                onChange={(e) => setBookingForm({ ...bookingForm, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Дата окончания *"
                type="date"
                value={bookingForm.end_date}
                onChange={(e) => setBookingForm({ ...bookingForm, end_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Стоимость (₽) *"
                type="number"
                value={bookingForm.total_price}
                onChange={(e) => setBookingForm({ ...bookingForm, total_price: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={bookingForm.status}
                  onChange={(e) => setBookingForm({ ...bookingForm, status: e.target.value })}
                  label="Статус"
                >
                  <MenuItem value="pending">Ожидает</MenuItem>
                  <MenuItem value="approved">Подтверждено</MenuItem>
                  <MenuItem value="completed">Завершено</MenuItem>
                  <MenuItem value="cancelled">Отменено</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Комментарий"
                multiline
                rows={2}
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleCreateBooking}>Создать бронирование</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar уведомления */}
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
  );
}