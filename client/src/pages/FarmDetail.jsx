import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Rating,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Breadcrumbs,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BoltIcon from '@mui/icons-material/Bolt';
import GrassIcon from '@mui/icons-material/Grass';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import CloseIcon from '@mui/icons-material/Close';
import axios from '../api/axiosConfig';
import { formatDate, formatCurrency } from '../utils/exportUtils';

dayjs.locale('ru');

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );
}

export default function FarmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  
  // Бронирование
  const [bookingDialog, setBookingDialog] = useState(false);
  const [startDate, setStartDate] = useState(dayjs().add(1, 'day'));
  const [endDate, setEndDate] = useState(dayjs().add(8, 'day'));
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Отзыв
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchFarmData();
    fetchBookings();
    fetchReviews();
  }, [id]);

  const fetchFarmData = async () => {
    try {
      const response = await axios.get(`/farms/${id}`);
      setFarm(response.data);
    } catch (error) {
      console.error('Error fetching farm:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`/bookings/farm/${id}`);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/reviews/farm/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const calculateTotalPrice = () => {
    const days = endDate.diff(startDate, 'day');
    const pricePerDay = farm?.price_per_month / 30;
    return days * pricePerDay;
  };

  const handleBooking = async () => {
    if (!user) {
      alert('Пожалуйста, войдите в систему для бронирования');
      navigate('/login');
      return;
    }
    
    if (user.role === 'landowner') {
      alert('Вы не можете бронировать ферму как владелец земли');
      return;
    }
    
    setBookingLoading(true);
    try {
      const totalPrice = calculateTotalPrice();
      await axios.post('/bookings', {
        farm_id: id,
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD'),
        total_price: totalPrice,
        notes: bookingNotes
      });
      alert('Заявка на бронирование отправлена владельцу!');
      setBookingDialog(false);
      fetchBookings();
      setBookingNotes('');
      setStartDate(dayjs().add(1, 'day'));
      setEndDate(dayjs().add(8, 'day'));
    } catch (error) {
      console.error('Error booking:', error);
      alert('Ошибка при бронировании');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      await axios.post('/reviews', {
        farm_id: id,
        rating: reviewRating,
        comment: reviewComment
      });
      alert('Спасибо за отзыв!');
      setReviewDialog(false);
      setReviewRating(5);
      setReviewComment('');
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Ошибка при отправке отзыва');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!farm) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Ферма не найдена</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/farms')}>
          Вернуться к списку
        </Button>
      </Container>
    );
  }

  const totalPrice = calculateTotalPrice();
  const isOwner = user?.id === farm.owner?.id;
  const isFarmer = user?.role === 'farmer';

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
          Главная
        </Link>
        <Link color="inherit" onClick={() => navigate('/farms')} sx={{ cursor: 'pointer' }}>
          Фермы
        </Link>
        <Typography color="text.primary">{farm.name}</Typography>
      </Breadcrumbs>

      {/* Кнопка назад */}
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Назад
      </Button>

      <Grid container spacing={3}>
        {/* Левая колонка - изображения */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <img
              src={farm.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'}
              alt={farm.name}
              style={{ width: '100%', height: 'auto', borderRadius: 8 }}
            />
          </Paper>
        </Grid>

        {/* Правая колонка - основная информация */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {farm.name}
              </Typography>
              <Chip
                label={farm.is_available ? 'Доступна' : 'Недоступна'}
                color={farm.is_available ? 'success' : 'error'}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="body1">{farm.location}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={farm.rating} readOnly precision={0.5} />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({farm.total_reviews} отзывов)
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Цена за месяц</Typography>
                    <Typography variant="h6" color="primary">
                      {Number(farm.price_per_month).toLocaleString()} ₽
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SquareFootIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Площадь</Typography>
                    <Typography variant="h6">{Number(farm.area_hectares).toLocaleString()} га</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GrassIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Тип почвы</Typography>
                    <Typography variant="body1">{farm.soil_type || 'Не указан'}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WaterDropIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Водоснабжение</Typography>
                    <Typography variant="body1">{farm.water_access ? 'Да' : 'Нет'}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Кнопка бронирования */}
            {!isOwner && farm.is_available && isFarmer && (
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<BookOnlineIcon />}
                onClick={() => setBookingDialog(true)}
                sx={{ mt: 3, mb: 2 }}
              >
                Забронировать ферму
              </Button>
            )}

            {!user && (
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/login')}
                sx={{ mt: 2 }}
              >
                Войдите чтобы забронировать
              </Button>
            )}

            {isOwner && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Это ваша ферма. Вы не можете забронировать её сами.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Описание */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Описание</Typography>
            <Typography variant="body1" color="text.secondary">
              {farm.description || 'Описание отсутствует'}
            </Typography>
          </Paper>
        </Grid>

        {/* Владелец */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Владелец фермы</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: '#2e7d32' }}>
                {farm.owner?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">{farm.owner?.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2">{farm.owner?.phone || 'Не указан'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2">{farm.owner?.email}</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Tabs с бронированиями и отзывами */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab label="Бронирования" />
              <Tab label="Отзывы" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {bookings.length === 0 ? (
                <Typography color="text.secondary">Нет активных бронирований</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell>Период</TableCell>
                        <TableCell>Арендатор</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell>Стоимость</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            {formatDate(booking.start_date)} — {formatDate(booking.end_date)}
                          </TableCell>
                          <TableCell>{booking.farmer?.name || '—'}</TableCell>
                          <TableCell>
                            <Chip
                              label={{
                                pending: 'Ожидает',
                                approved: 'Подтверждено',
                                rejected: 'Отклонено',
                                completed: 'Завершено',
                                cancelled: 'Отменено'
                              }[booking.status] || booking.status}
                              color={{
                                pending: 'warning',
                                approved: 'success',
                                rejected: 'error',
                                completed: 'info',
                                cancelled: 'default'
                              }[booking.status] || 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{Number(booking.total_price).toLocaleString()} ₽</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {!isOwner && user && user.role === 'farmer' && (
                <Button
                  variant="outlined"
                  onClick={() => setReviewDialog(true)}
                  sx={{ mb: 2 }}
                >
                  Оставить отзыв
                </Button>
              )}

              {reviews.length === 0 ? (
                <Typography color="text.secondary">Пока нет отзывов</Typography>
              ) : (
                <List>
                  {reviews.map((review) => (
                    <ListItem key={review.id} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>{review.user?.name?.[0]?.toUpperCase()}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">{review.user?.name}</Typography>
                            <Rating value={review.rating} readOnly size="small" />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {review.comment}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(review.created_at)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Диалог бронирования */}
      <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Бронирование фермы</Typography>
            <IconButton onClick={() => setBookingDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Выберите даты</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Дата начала"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    minDate={dayjs().add(1, 'day')}
                    sx={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Дата окончания"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    minDate={startDate}
                    sx={{ width: '100%' }}
                  />
                </Grid>
              </Grid>
            </Box>
          </LocalizationProvider>

          <TextField
            fullWidth
            label="Комментарий"
            multiline
            rows={3}
            value={bookingNotes}
            onChange={(e) => setBookingNotes(e.target.value)}
            placeholder="Дополнительная информация для владельца"
            margin="normal"
          />

          <Paper sx={{ p: 2, mt: 2, bgcolor: '#e8f5e9' }}>
            <Typography variant="subtitle2" gutterBottom>Расчет стоимости</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">{startDate.format('DD.MM.YYYY')} — {endDate.format('DD.MM.YYYY')}</Typography>
              <Typography variant="body2">{endDate.diff(startDate, 'day')} дней</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2">Стоимость за день:</Typography>
              <Typography variant="body2">{(farm.price_per_month / 30).toFixed(0)} ₽</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" fontWeight="bold">Итого:</Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
                {totalPrice.toFixed(0).toLocaleString()} ₽
              </Typography>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialog(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleBooking}
            disabled={bookingLoading}
          >
            {bookingLoading ? <CircularProgress size={24} /> : 'Отправить заявку'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог отзыва */}
      <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Оставить отзыв</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography gutterBottom>Ваша оценка</Typography>
            <Rating
              value={reviewRating}
              onChange={(e, v) => setReviewRating(v || 5)}
              size="large"
            />
          </Box>
          <TextField
            fullWidth
            label="Ваш отзыв"
            multiline
            rows={4}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Расскажите о своем опыте..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSubmitReview}>Отправить</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}