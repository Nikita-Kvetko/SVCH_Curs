import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import DashboardIcon from '@mui/icons-material/Dashboard';
import {
  fetchAllUsers,
  fetchAllFarmsAdmin,
  fetchAllBookingsAdmin,
  fetchPlatformStats,
  updateUserRole,
  toggleUserBlock,
  deleteUser,
  updateFarmAdmin,
  deleteFarmAdmin,
} from '../store/adminSlice';
import AdminUserRow from '../components/AdminUserRow';
import AdminFarmRow from '../components/AdminFarmRow';
import AdminStatsCards from '../components/AdminStatsCards';
import dayjs from 'dayjs';

function TabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ pt: 2 }}>{children}</Box>}</div>;
}

export default function AdminPanel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { users, farms, bookings, stats, loading, totalUsers, totalFarms, totalBookings } = useSelector((state) => state.admin);
  
  const [tabValue, setTabValue] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchPlatformStats());
      dispatch(fetchAllUsers({ page: 0, limit: 100 }));
      dispatch(fetchAllFarmsAdmin({ page: 0, limit: 100 }));
      dispatch(fetchAllBookingsAdmin({ page: 0, limit: 100 }));
    }
  }, [dispatch, user]);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFarms = farms.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.location?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredBookings = bookings.filter(b =>
    b.farm?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.farmer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId, role) => {
    await dispatch(updateUserRole({ userId, role }));
    dispatch(fetchPlatformStats());
  };

  const handleToggleBlock = async (userId, isBlocked) => {
    await dispatch(toggleUserBlock({ userId, isBlocked }));
  };

  const handleDeleteUser = async (userId) => {
    await dispatch(deleteUser(userId));
    dispatch(fetchPlatformStats());
  };

  const handleUpdateFarm = async (farmId, farmData) => {
    await dispatch(updateFarmAdmin({ farmId, farmData }));
  };

  const handleDeleteFarm = async (farmId) => {
    await dispatch(deleteFarmAdmin(farmId));
    dispatch(fetchPlatformStats());
  };

  if (loading && !users.length && !farms.length) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Доступ запрещён. Требуются права администратора.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Панель администратора
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Управление пользователями, фермами и бронированиями
      </Typography>

      {/* Stats Dashboard */}
      <AdminStatsCards stats={stats} />

      {/* Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Tabs */}
      <Paper sx={{ p: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab icon={<DashboardIcon />} label="Статистика" />
          <Tab icon={<PeopleIcon />} label={`Пользователи (${totalUsers})`} />
          <Tab icon={<AgricultureIcon />} label={`Фермы (${totalFarms})`} />
          <Tab icon={<BookOnlineIcon />} label={`Бронирования (${totalBookings})`} />
        </Tabs>

        {/* Stats Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 2 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Последние пользователи</Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {users.slice(0, 5).map(user => (
                  <Box key={user.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #eee' }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">{user.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                    </Box>
                    <Chip label={user.role === 'admin' ? 'Админ' : user.role === 'landowner' ? 'Владелец' : 'Фермер'} size="small" />
                  </Box>
                ))}
              </Box>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Последние фермы</Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {farms.slice(0, 5).map(farm => (
                  <Box key={farm.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #eee' }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">{farm.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{farm.location}</Typography>
                    </Box>
                    <Chip label={`${Number(farm.price_per_month).toLocaleString()} ₽/мес`} size="small" variant="outlined" />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </TabPanel>

        {/* Users Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#2e7d32' }}>
                  <TableCell sx={{ color: 'white' }}>Пользователь</TableCell>
                  <TableCell sx={{ color: 'white' }}>Телефон</TableCell>
                  <TableCell sx={{ color: 'white' }}>Регион</TableCell>
                  <TableCell sx={{ color: 'white' }}>Роль</TableCell>
                  <TableCell sx={{ color: 'white' }}>Статус</TableCell>
                  <TableCell sx={{ color: 'white' }}>Дата регистрации</TableCell>
                  <TableCell sx={{ color: 'white' }} align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                  <AdminUserRow
                    key={user.id}
                    user={user}
                    onRoleChange={handleRoleChange}
                    onToggleBlock={handleToggleBlock}
                    onDelete={handleDeleteUser}
                  />
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">Пользователи не найдены</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          />
        </TabPanel>

        {/* Farms Tab */}
        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#2e7d32' }}>
                  <TableCell sx={{ color: 'white' }}>Ферма</TableCell>
                  <TableCell sx={{ color: 'white' }}>Владелец</TableCell>
                  <TableCell sx={{ color: 'white' }}>Площадь</TableCell>
                  <TableCell sx={{ color: 'white' }}>Цена</TableCell>
                  <TableCell sx={{ color: 'white' }}>Статус</TableCell>
                  <TableCell sx={{ color: 'white' }}>Дата создания</TableCell>
                  <TableCell sx={{ color: 'white' }} align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFarms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((farm) => (
                  <AdminFarmRow
                    key={farm.id}
                    farm={farm}
                    onUpdate={handleUpdateFarm}
                    onDelete={handleDeleteFarm}
                  />
                ))}
                {filteredFarms.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">Фермы не найдены</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredFarms.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          />
        </TabPanel>

        {/* Bookings Tab */}
        <TabPanel value={tabValue} index={3}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#2e7d32' }}>
                  <TableCell sx={{ color: 'white' }}>Ферма</TableCell>
                  <TableCell sx={{ color: 'white' }}>Фермер</TableCell>
                  <TableCell sx={{ color: 'white' }}>Период</TableCell>
                  <TableCell sx={{ color: 'white' }}>Стоимость</TableCell>
                  <TableCell sx={{ color: 'white' }}>Статус</TableCell>
                  <TableCell sx={{ color: 'white' }}>Дата бронирования</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((booking) => (
                  <TableRow key={booking.id} hover>
                    <TableCell>{booking.farm?.name || '—'}</TableCell>
                    <TableCell>{booking.farmer?.name || '—'}</TableCell>
                    <TableCell>
                      {dayjs(booking.start_date).format('DD.MM.YYYY')} — {dayjs(booking.end_date).format('DD.MM.YYYY')}
                    </TableCell>
                    <TableCell>{Number(booking.total_price).toLocaleString()} ₽</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          booking.status === 'approved' ? 'Подтверждено' :
                          booking.status === 'pending' ? 'Ожидает' :
                          booking.status === 'completed' ? 'Завершено' : 'Отклонено'
                        }
                        size="small"
                        color={
                          booking.status === 'approved' ? 'success' :
                          booking.status === 'pending' ? 'warning' :
                          booking.status === 'completed' ? 'info' : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell>{dayjs(booking.created_at).format('DD.MM.YYYY')}</TableCell>
                  </TableRow>
                ))}
                {filteredBookings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Бронирования не найдены</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredBookings.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
}