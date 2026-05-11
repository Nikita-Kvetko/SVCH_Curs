import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Typography,
  Box,
  Chip,
  Rating,
  Button,
  Divider,
  Paper,
  IconButton,
  Alert,
  Skeleton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  LocationOn,
  AttachMoney,
  SquareFoot,
  WaterDrop,
  Bolt,
  Terrain,
  Favorite,
  FavoriteBorder,
  Person,
  Phone,
  Email,
  Event,
  Assignment,
} from '@mui/icons-material';
import api from '../api/axiosConfig';
import ImageGallery from '../components/ImageGallery';
import DateRangePicker from '../components/DateRangePicker';
import BookingModal from '../components/BookingModal';
import ReviewCard from '../components/ReviewCard';
import { toggleFavorite } from '../store/favoriteSlice';
import { createBooking, fetchFarmBookings } from '../store/bookingSlice';
import dayjs from 'dayjs';

export default function FarmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { favorites } = useSelector((state) => state.favorites);
  const { farmBookings, createLoading } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);

  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const isFavorite = favorites.includes(id);

  useEffect(() => {
    fetchFarmData();
    dispatch(fetchFarmBookings(id));
    fetchReviews();
  }, [id]);

  const fetchFarmData = async () => {
    try {
      const response = await api.get(`/farms/${id}`);
      setFarm(response.data);
    } catch (err) {
      setError('Не удалось загрузить информацию о ферме');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/farm/${id}`);
      setReviews(response.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleSubmitReview = async () => {
    if (newReview.comment.trim() === '') {
      alert('Пожалуйста, оставьте комментарий');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        farm_id: id,
        rating: newReview.rating,
        comment: newReview.comment,
      });
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
      // Update farm rating
      fetchFarmData();
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Ошибка при отправке отзыва');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBooking = async (bookingData) => {
    const result = await dispatch(createBooking({
      farm_id: id,
      start_date: startDate.format('YYYY-MM-DD'),
      end_date: endDate.format('YYYY-MM-DD'),
      total_price: calculateTotalPrice(),
      notes: bookingData.notes,
    }));
    if (!result.error) {
      setBookingModalOpen(false);
      setStartDate(null);
      setEndDate(null);
      alert('Бронирование успешно создано!');
      dispatch(fetchFarmBookings(id));
    } else {
      alert('Ошибка при создании бронирования');
    }
  };

  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return 0;
    const days = endDate.diff(startDate, 'day');
    return days * (farm?.price_per_month / 30);
  };

  const isFarmOwner = farm?.owner_id === user?.id;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 3 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={30} />
            <Skeleton variant="rectangular" height={200} sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !farm) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Ферма не найдена'}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/')}>
          Вернуться к списку
        </Button>
      </Container>
    );
  }

  const bookedDates = farmBookings.filter(b => b.status === 'approved' || b.status === 'pending');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок и избранное */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {farm.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="body1" color="text.secondary">
                {farm.location}
              </Typography>
            </Box>
            {farm.rating > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Rating value={farm.rating} readOnly size="small" precision={0.5} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({farm.total_reviews} отзывов)
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        <IconButton
          onClick={() => dispatch(toggleFavorite(id))}
          sx={{ bgcolor: 'rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' } }}
        >
          {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
        </IconButton>
      </Box>

      {/* Галерея */}
      <ImageGallery images={farm.images} />

      {/* Основное содержание */}
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Левая колонка - информация */}
        <Grid item xs={12} md={8}>
          {/* Характеристики */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Характеристики
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SquareFoot color="primary" />
                  <Typography variant="body2">
                    <strong>Площадь:</strong> {farm.area_hectares} га
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoney color="primary" />
                  <Typography variant="body2">
                    <strong>Цена:</strong> {Number(farm.price_per_month).toLocaleString()} ₽/мес
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Terrain color="primary" />
                  <Typography variant="body2">
                    <strong>Почва:</strong> {farm.soil_type || '—'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WaterDrop color={farm.water_access ? 'primary' : 'disabled'} />
                  <Typography variant="body2">
                    <strong>Водоснабжение:</strong> {farm.water_access ? 'Есть' : 'Нет'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Bolt color={farm.electricity ? 'primary' : 'disabled'} />
                  <Typography variant="body2">
                    <strong>Электричество:</strong> {farm.electricity ? 'Есть' : 'Нет'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Описание */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Описание
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {farm.description || 'Описание отсутствует'}
            </Typography>
          </Paper>

          {/* Оборудование */}
          {farm.equipment_list?.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Оборудование
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {farm.equipment_list.map((item, idx) => (
                  <Chip key={idx} label={item} variant="outlined" />
                ))}
              </Box>
            </Paper>
          )}

          {/* Отзывы */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Отзывы ({reviews.length})
            </Typography>

            {/* Форма добавления отзыва */}
            {user && !isFarmOwner && (
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Оставить отзыв
                </Typography>
                <Rating
                  value={newReview.rating}
                  onChange={(e, v) => setNewReview({ ...newReview, rating: v || 5 })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Ваш комментарий..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Отправка...' : 'Отправить отзыв'}
                </Button>
              </Box>
            )}

            {reviews.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Пока нет отзывов. Будьте первым!
              </Typography>
            ) : (
              reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </Paper>
        </Grid>

        {/* Правая колонка - бронирование и владелец */}
        <Grid item xs={12} md={4}>
          {/* Блок бронирования */}
          <Paper sx={{ p: 3, mb: 3, position: 'sticky', top: 80 }}>
            <Typography variant="h6" gutterBottom>
              Бронирование
            </Typography>
            <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
              {Number(farm.price_per_month).toLocaleString()} ₽
              <Typography component="span" variant="body2" color="text.secondary">
                /месяц
              </Typography>
            </Typography>

            <Divider sx={{ my: 2 }} />

            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
              bookedDates={bookedDates}
            />

            {startDate && endDate && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Дней:</strong> {endDate.diff(startDate, 'day')}
                </Typography>
                <Typography variant="h6" color="primary">
                  Итого: {Math.round(calculateTotalPrice()).toLocaleString()} ₽
                </Typography>
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 2 }}
              disabled={!startDate || !endDate || isFarmOwner || user?.role === 'landowner'}
              onClick={() => setBookingModalOpen(true)}
            >
              {isFarmOwner
                ? 'Вы владелец этой фермы'
                : user?.role === 'landowner'
                ? 'Владельцы не могут бронировать'
                : 'Забронировать'}
            </Button>
          </Paper>

          {/* Информация о владельце */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Владелец фермы
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#2e7d32', mr: 2 }}>
                {farm.owner?.name?.[0]?.toUpperCase() || 'В'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {farm.owner?.name || 'Не указан'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  На сайте с {new Date(farm.created_at).getFullYear()} г.
                </Typography>
              </Box>
            </Box>
            <List dense>
              {farm.owner?.phone && (
                <ListItem>
                  <ListItemIcon><Phone fontSize="small" /></ListItemIcon>
                  <ListItemText primary={farm.owner.phone} />
                </ListItem>
              )}
              {farm.owner?.email && (
                <ListItem>
                  <ListItemIcon><Email fontSize="small" /></ListItemIcon>
                  <ListItemText primary={farm.owner.email} />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Модальное окно бронирования */}
      <BookingModal
        open={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        farm={farm}
        startDate={startDate}
        endDate={endDate}
        totalPrice={Math.round(calculateTotalPrice())}
        onSubmit={handleBooking}
        loading={createLoading}
      />
    </Container>
  );
}