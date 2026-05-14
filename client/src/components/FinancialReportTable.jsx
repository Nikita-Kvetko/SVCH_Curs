import React from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from '@mui/material';
import { formatCurrency, formatDate } from '../utils/exportUtils';

export default function FinancialReportTable({ data }) {
  if (!data) return null;

  const { bookings, summary } = data;

  return (
    <>
      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
          <Typography variant="h5" color="primary">{summary?.total_bookings || 0}</Typography>
          <Typography variant="body2" color="text.secondary">Всего бронирований</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
          <Typography variant="h5" color="secondary">{formatCurrency(summary?.total_revenue || 0)}</Typography>
          <Typography variant="body2" color="text.secondary">Общий доход</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
          <Typography variant="h5">{summary?.average_booking_value ? formatCurrency(summary.average_booking_value) : '—'}</Typography>
          <Typography variant="body2" color="text.secondary">Средний чек</Typography>
        </Paper>
      </Box>

      {/* Bookings Table */}
      <Typography variant="h6" gutterBottom>Детали бронирований</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#2e7d32' }}>
              <TableCell sx={{ color: 'white' }}>Ферма</TableCell>
              <TableCell sx={{ color: 'white' }}>Дата начала</TableCell>
              <TableCell sx={{ color: 'white' }}>Дата окончания</TableCell>
              <TableCell sx={{ color: 'white' }}>Стоимость</TableCell>
              <TableCell sx={{ color: 'white' }}>Статус</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings?.map((booking) => (
              <TableRow key={booking.id} hover>
                <TableCell>{booking.farm_name}</TableCell>
                <TableCell>{formatDate(booking.start_date)}</TableCell>
                <TableCell>{formatDate(booking.end_date)}</TableCell>
                <TableCell>{formatCurrency(booking.total_price)}</TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: booking.status === 'approved' ? '#e8f5e9' : booking.status === 'completed' ? '#e3f2fd' : '#fff3e0',
                    color: booking.status === 'approved' ? '#2e7d32' : booking.status === 'completed' ? '#0288d1' : '#ed6c02',
                  }}>
                    {booking.status === 'approved' ? 'Подтверждено' : booking.status === 'completed' ? 'Завершено' : booking.status === 'pending' ? 'Ожидает' : 'Отменено'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {(!bookings || bookings.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} align="center">Нет данных за выбранный период</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}