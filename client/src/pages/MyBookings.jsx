// client/src/pages/MyBookings.jsx
import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, Grid, Chip, Button, Rating, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from '../api/axiosConfig';
import dayjs from 'dayjs';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/bookings/my');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Отменить бронирование?')) {
      await axios.put(`/bookings/${bookingId}/status`, { status: 'cancelled' });
      fetchBookings();
    }
  };

  const handleSubmitReview = async () => {
    await axios.post('/reviews', {
      farm_id: selectedBooking.farm_id,
      rating: review.rating,
      comment: review.comment
    });
    setReviewOpen(false);
    setReview({ rating: 5, comment: '' });
    alert('Спасибо за отзыв!');
  };

  const getStatusChip = (status) => {
    const config = {
      pending: { label: 'Ожидает', color: 'warning' },
      approved: { label: 'Подтверждено', color: 'success' },
      rejected: { label: 'Отклонено', color: 'error' },
      completed: { label: 'Завершено', color: 'info' },
      cancelled: { label: 'Отменено', color: 'default' }
    };
    const c = config[status] || config.pending;
    return <Chip label={c.label} color={c.color} size="small" />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Мои бронирования</Typography>
      
      {bookings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography>У вас пока нет бронирований</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {bookings.map((booking) => (
            <Grid item xs={12} key={booking.id}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="h6">{booking.farm?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {booking.farm?.location}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      📅 {dayjs(booking.start_date).format('DD.MM.YYYY')} — {dayjs(booking.end_date).format('DD.MM.YYYY')}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      {Number(booking.total_price).toLocaleString()} ₽
                    </Typography>
                    {booking.notes && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        📝 {booking.notes}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    {getStatusChip(booking.status)}
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      {booking.status === 'pending' && (
                        <Button size="small" color="error" onClick={() => handleCancelBooking(booking.id)}>
                          Отменить
                        </Button>
                      )}
                      {booking.status === 'approved' && (
                        <Button size="small" color="success" onClick={() => {
                          setSelectedBooking(booking);
                          setReviewOpen(true);
                        }}>
                          Оставить отзыв
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)}>
        <DialogTitle>Оставить отзыв</DialogTitle>
        <DialogContent>
          <Rating
            value={review.rating}
            onChange={(e, v) => setReview({ ...review, rating: v || 5 })}
            size="large"
            sx={{ my: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Ваш комментарий"
            value={review.comment}
            onChange={(e) => setReview({ ...review, comment: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSubmitReview}>Отправить</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}