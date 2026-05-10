import React from 'react';
import { Box, Typography, Rating, Avatar, Paper } from '@mui/material';
import dayjs from 'dayjs';

export default function ReviewCard({ review }) {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Avatar sx={{ mr: 2, bgcolor: '#2e7d32' }}>
          {review.user?.name?.[0]?.toUpperCase() || 'U'}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {review.user?.name || 'Аноним'}
          </Typography>
          <Rating value={review.rating} readOnly size="small" />
        </Box>
        <Typography variant="caption" color="text.secondary">
          {dayjs(review.created_at).format('DD.MM.YYYY')}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {review.comment}
      </Typography>
    </Paper>
  );
}