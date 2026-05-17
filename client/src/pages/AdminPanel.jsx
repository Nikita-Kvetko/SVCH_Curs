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
  CircularProgress
} from '@mui/material';
import {
  Block,
  CheckCircle,
  Delete,
  Edit,
  AdminPanelSettings,
  Person,
  Store,
  BookOnline
} from '@mui/icons-material';
import axios from '../api/axiosConfig';

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchAllData();
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
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      await axios.patch(`/admin/users/${userId}/block`, { isBlocked });
      fetchAllData();
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleChangeRole = async (userId, role) => {
    try {
      await axios.put(`/admin/users/${userId}/role`, { role });
      fetchAllData();
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Удалить пользователя?')) {
      try {
        await axios.delete(`/admin/users/${userId}`);
        fetchAllData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleDeleteFarm = async (farmId) => {
    if (window.confirm('Удалить ферму?')) {
      try {
        await axios.delete(`/admin/farms/${farmId}`);
        fetchAllData();
      } catch (error) {
        console.error('Error deleting farm:', error);
      }
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AdminPanelSettings sx={{ fontSize: 40, color: '#2e7d32' }} />
        <Typography variant="h4" component="h1">
          Панель администратора
        </Typography>
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
                    <TableCell>{farm.area_hectares}</TableCell>
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
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Ферма</TableCell>
                  <TableCell>Арендатор</TableCell>
                  <TableCell>Период</TableCell>
                  <TableCell>Стоимость</TableCell>
                  <TableCell>Статус</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id} hover>
                    <TableCell>{booking.farm?.name || '—'}</TableCell>
                    <TableCell>{booking.farmer?.name || '—'}</TableCell>
                    <TableCell>
                      {booking.start_date} — {booking.end_date}
                    </TableCell>
                    <TableCell>{Number(booking.total_price).toLocaleString()} ₽</TableCell>
                    <TableCell>{getStatusChip(booking.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </Container>
  );
}