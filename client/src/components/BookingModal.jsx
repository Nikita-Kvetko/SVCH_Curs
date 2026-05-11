import React from 'react';
import {
  Modal, Box, Typography, Button, TextField, Divider, Alert, CircularProgress,
} from '@mui/material';
import dayjs from 'dayjs';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 500 },
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default function BookingModal({ open, onClose, farm, startDate, endDate, totalPrice, onSubmit, loading }) {
  const [notes, setNotes] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      setError('Выберите даты бронирования');
      return;
    }
    setError('');
    await onSubmit({ notes });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h5" gutterBottom>
          Бронирование
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {farm?.name}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" gutterBottom>
          <strong>Дата начала:</strong> {startDate ? startDate.format('DD.MM.YYYY') : '—'}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Дата окончания:</strong> {endDate ? endDate.format('DD.MM.YYYY') : '—'}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Количество дней:</strong> {startDate && endDate ? endDate.diff(startDate, 'day') : 0}
        </Typography>
        <Typography variant="h6" color="primary" sx={{ my: 2 }}>
          Итого: {totalPrice?.toLocaleString()} ₽
        </Typography>

        <TextField
          fullWidth
          label="Комментарий к бронированию"
          multiline
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          margin="normal"
        />

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button variant="outlined" fullWidth onClick={onClose}>
            Отмена
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={loading || !startDate || !endDate}
          >
            {loading ? <CircularProgress size={24} /> : 'Подтвердить бронирование'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}