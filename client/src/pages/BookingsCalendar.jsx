import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tabs,
  Tab,
  Badge,
  Rating,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';

dayjs.locale('ru');

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );
}

export default function BookingsCalendar() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [tabValue, setTabValue] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, farmsRes] = await Promise.all([
        axios.get('/bookings/my'),
        axios.get('/farms/my'),
      ]);
      setBookings(bookingsRes.data);
      setFarms(farmsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: 'Ожидает подтверждения', color: '#ed6c02', bg: '#fff3e0', icon: <PendingIcon /> },
      approved: { label: 'Подтверждено', color: '#2e7d32', bg: '#e8f5e9', icon: <CheckCircleIcon /> },
      rejected: { label: 'Отклонено', color: '#d32f2f', bg: '#ffebee', icon: <CancelIcon /> },
      completed: { label: 'Завершено', color: '#0288d1', bg: '#e1f5fe', icon: <EventAvailableIcon /> },
      cancelled: { label: 'Отменено', color: '#9e9e9e', bg: '#f5f5f5', icon: <CancelIcon /> },
    };
    return configs[status] || configs.pending;
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      alert('Укажите причину отмены');
      return;
    }
    try {
      await axios.put(`/bookings/${selectedBooking.id}/status`, { 
        status: 'cancelled',
        cancel_reason: cancelReason 
      });
      await fetchData();
      setCancelDialogOpen(false);
      setCancelReason('');
      setDetailsOpen(false);
      alert('Бронирование отменено');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Ошибка при отмене бронирования');
    }
  };

  const getBookingsForDate = (date) => {
    return bookings.filter(booking => {
      const start = dayjs(booking.start_date);
      const end = dayjs(booking.end_date);
      return date.isBetween(start, end, 'day', '[]');
    });
  };

  const isFarmOwner = (farmId) => {
    const farm = farms.find(f => f.id === farmId);
    return farm?.owner_id === user?.id;
  };

  const canManageBooking = (booking) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'farm_admin') return true;
    if (user?.role === 'landowner' && isFarmOwner(booking.farm_id)) return true;
    return false;
  };

  const getCalendarTileContent = (date) => {
    const dayBookings = getBookingsForDate(date);
    if (dayBookings.length === 0) return null;
    
    const hasPending = dayBookings.some(b => b.status === 'pending');
    const hasApproved = dayBookings.some(b => b.status === 'approved');
    
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
        {hasPending && <Badge variant="dot" color="warning" sx={{ '& .MuiBadge-badge': { bgcolor: '#ed6c02' } }} />}
        {hasApproved && <Badge variant="dot" color="success" />}
      </Box>
    );
  };

  const upcomingBookings = bookings
    .filter(b => b.status === 'approved' && dayjs(b.end_date).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.start_date).diff(dayjs(b.start_date)));

  const pastBookings = bookings
    .filter(b => b.status === 'completed' || (b.status === 'approved' && dayjs(b.end_date).isBefore(dayjs())))
    .sort((a, b) => dayjs(b.start_date).diff(dayjs(a.start_date)));

  const pendingBookings = bookings.filter(b => b.status === 'pending');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Мои бронирования
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Управляйте своими бронированиями и отслеживайте статус
      </Typography>

      {/* Статистика */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="h4" color="#ed6c02">{pendingBookings.length}</Typography>
              <Typography variant="body2">Ожидают подтверждения</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography variant="h4" color="#2e7d32">{upcomingBookings.length}</Typography>
              <Typography variant="body2">Активных бронирований</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="h4" color="#0288d1">{pastBookings.length}</Typography>
              <Typography variant="body2">Завершённых бронирований</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Календарь */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={selectedDate}
                onChange={setSelectedDate}
                sx={{ width: '100%' }}
                slots={{
                  day: (props) => {
                    const dayBookings = getBookingsForDate(props.day);
                    const hasEvents = dayBookings.length > 0;
                    return (
                      <Box
                        {...props}
                        sx={{
                          ...props.sx,
                          position: 'relative',
                          bgcolor: dayBookings.some(b => b.status === 'approved') ? '#e8f5e9' : 
                                   dayBookings.some(b => b.status === 'pending') ? '#fff3e0' : 'transparent',
                          borderRadius: '50%',
                        }}
                      >
                        {props.children}
                        {hasEvents && (
                          <Box sx={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 0.3 }}>
                            {dayBookings.some(b => b.status === 'pending') && (
                              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#ed6c02' }} />
                            )}
                            {dayBookings.some(b => b.status === 'approved') && (
                              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#2e7d32' }} />
                            )}
                          </Box>
                        )}
                      </Box>
                    );
                  },
                }}
              />
            </LocalizationProvider>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2e7d32' }} />
                <Typography variant="caption">Подтверждено</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ed6c02' }} />
                <Typography variant="caption">Ожидает</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Список бронирований на выбранную дату */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Бронирования на {selectedDate.format('DD MMMM YYYY')}
            </Typography>
            {getBookingsForDate(selectedDate).length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                На эту дату нет бронирований
              </Typography>
            ) : (
              getBookingsForDate(selectedDate).map((booking) => {
                const statusConfig = getStatusConfig(booking.status);
                return (
                  <Card key={booking.id} sx={{ mb: 2, cursor: 'pointer' }} onClick={() => {
                    setSelectedBooking(booking);
                    setDetailsOpen(true);
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {booking.farm?.name || 'Ферма'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <LocationOnIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                            {booking.farm?.location}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            📅 {dayjs(booking.start_date).format('DD.MM.YYYY')} — {dayjs(booking.end_date).format('DD.MM.YYYY')}
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {Number(booking.total_price).toLocaleString()} ₽
                          </Typography>
                        </Box>
                        <Chip
                          icon={statusConfig.icon}
                          label={statusConfig.label}
                          sx={{ bgcolor: statusConfig.bg, color: statusConfig.color }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Вкладки со списками бронирований */}
      <Paper sx={{ mt: 3, p: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Предстоящие" />
          <Tab label="Ожидают подтверждения" />
          <Tab label="История" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {upcomingBookings.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              Нет предстоящих бронирований
            </Typography>
          ) : (
            upcomingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                statusConfig={getStatusConfig(booking.status)}
                onViewDetails={() => {
                  setSelectedBooking(booking);
                  setDetailsOpen(true);
                }}
              />
            ))
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {pendingBookings.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              Нет бронирований, ожидающих подтверждения
            </Typography>
          ) : (
            pendingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                statusConfig={getStatusConfig(booking.status)}
                onViewDetails={() => {
                  setSelectedBooking(booking);
                  setDetailsOpen(true);
                }}
                showActions={canManageBooking(booking)}
                onApprove={async () => {
                  await axios.put(`/bookings/${booking.id}/status`, { status: 'approved' });
                  fetchData();
                }}
                onReject={async () => {
                  await axios.put(`/bookings/${booking.id}/status`, { status: 'rejected' });
                  fetchData();
                }}
              />
            ))
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {pastBookings.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              Нет завершённых бронирований
            </Typography>
          ) : (
            pastBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                statusConfig={getStatusConfig(booking.status)}
                onViewDetails={() => {
                  setSelectedBooking(booking);
                  setDetailsOpen(true);
                }}
              />
            ))
          )}
        </TabPanel>
      </Paper>

      {/* Диалог с деталями бронирования */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Детали бронирования</Typography>
            <IconButton onClick={() => setDetailsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {selectedBooking.farm?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <LocationOnIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                {selectedBooking.farm?.location}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={getStatusConfig(selectedBooking.status).icon}
                  label={getStatusConfig(selectedBooking.status).label}
                  sx={{ bgcolor: getStatusConfig(selectedBooking.status).bg, color: getStatusConfig(selectedBooking.status).color }}
                />
                <Chip label={`${dayjs(selectedBooking.start_date).format('DD.MM.YYYY')} — ${dayjs(selectedBooking.end_date).format('DD.MM.YYYY')}`} variant="outlined" />
              </Box>

              <Typography variant="body2" gutterBottom>
                <strong>Количество дней:</strong> {dayjs(selectedBooking.end_date).diff(dayjs(selectedBooking.start_date), 'day')}
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                {Number(selectedBooking.total_price).toLocaleString()} ₽
              </Typography>

              {selectedBooking.notes && (
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Комментарий:</strong> {selectedBooking.notes}
                  </Typography>
                </Paper>
              )}

              {selectedBooking.farm?.owner && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    <PersonIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    Владелец фермы
                  </Typography>
                  <Typography variant="body2">{selectedBooking.farm.owner.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedBooking.farm.owner.phone}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedBooking && selectedBooking.status === 'pending' && selectedBooking.farmer_id === user?.id && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setDetailsOpen(false);
                setCancelDialogOpen(true);
              }}
            >
              Отменить бронирование
            </Button>
          )}
          <Button onClick={() => setDetailsOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог отмены */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Отмена бронирования</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Вы уверены, что хотите отменить бронирование фермы "{selectedBooking?.farm?.name}"?
          </Typography>
          <TextField
            fullWidth
            label="Причина отмены"
            multiline
            rows={2}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Укажите причину отмены"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Назад</Button>
          <Button variant="contained" color="error" onClick={handleCancelBooking}>Подтвердить отмену</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// Компонент карточки бронирования
function BookingCard({ booking, statusConfig, onViewDetails, showActions, onApprove, onReject }) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {booking.farm?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {booking.farm?.location}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              📅 {dayjs(booking.start_date).format('DD.MM.YYYY')} — {dayjs(booking.end_date).format('DD.MM.YYYY')}
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="primary">
              {Number(booking.total_price).toLocaleString()} ₽
            </Typography>
          </Box>
          <Box>
            <Chip icon={statusConfig.icon} label={statusConfig.label} sx={{ bgcolor: statusConfig.bg, color: statusConfig.color }} />
          </Box>
        </Box>
        
        {showActions && (
          <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
            <Button size="small" variant="contained" color="success" onClick={onApprove}>
              Подтвердить
            </Button>
            <Button size="small" variant="outlined" color="error" onClick={onReject}>
              Отклонить
            </Button>
          </Box>
        )}
        
        <Button size="small" sx={{ mt: 1 }} onClick={onViewDetails}>
          Подробнее
        </Button>
      </CardContent>
    </Card>
  );
}