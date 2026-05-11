import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const statusColors = {
  pending: { color: '#ed6c02', label: 'Ожидает подтверждения' },
  approved: { color: '#2e7d32', label: 'Подтверждено' },
  rejected: { color: '#d32f2f', label: 'Отклонено' },
  completed: { color: '#0288d1', label: 'Завершено' },
  cancelled: { color: '#9e9e9e', label: 'Отменено' },
};

export default function BookingCard({ booking, showActions = false, onApprove, onReject, isOwner = false }) {
  const navigate = useNavigate();
  const status = statusColors[booking.status] || statusColors.pending;

  return (
    <Card sx={{ mb: 2, '&:hover': { boxShadow: 3 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {booking.farm?.name || 'Ферма'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {booking.farm?.location}
            </Typography>
          </Box>
          <Chip
            label={status.label}
            sx={{ bgcolor: `${status.color}15`, color: status.color, fontWeight: 'medium' }}
            size="small"
          />
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2">
            📅 {dayjs(booking.start_date).format('DD.MM.YYYY')} — {dayjs(booking.end_date).format('DD.MM.YYYY')}
          </Typography>
          <Typography variant="body2" fontWeight="bold" color="primary">
            💰 {Number(booking.total_price).toLocaleString()} ₽
          </Typography>
        </Box>

        {booking.notes && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            📝 {booking.notes}
          </Typography>
        )}

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button size="small" onClick={() => navigate(`/farm/${booking.farm_id}`)}>
            Посмотреть ферму
          </Button>
          {showActions && booking.status === 'pending' && (
            <>
              <Button size="small" variant="contained" color="success" onClick={() => onApprove(booking.id)}>
                Подтвердить
              </Button>
              <Button size="small" variant="outlined" color="error" onClick={() => onReject(booking.id)}>
                Отклонить
              </Button>
            </>
          )}
          {isOwner && booking.status === 'approved' && (
            <Button size="small" variant="outlined" color="primary">
              Связаться с фермером
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}