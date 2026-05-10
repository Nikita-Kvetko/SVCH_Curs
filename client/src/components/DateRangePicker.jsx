import React, { useState } from 'react';
import { TextField, Popover, Box, Grid, Typography, IconButton } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function DateRangePicker({ startDate, endDate, onStartChange, onEndChange, bookedDates }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selecting, setSelecting] = useState('start');

  const handleOpen = (event, type) => {
    setSelecting(type);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isDateDisabled = (date) => {
    if (!bookedDates) return false;
    return bookedDates.some(booking => {
      const bookingStart = dayjs(booking.start_date);
      const bookingEnd = dayjs(booking.end_date);
      return date.isBetween(bookingStart, bookingEnd, 'day', '[]');
    });
  };

  const handleDateSelect = (date) => {
    if (selecting === 'start') {
      onStartChange(date);
      if (endDate && date.isAfter(endDate)) {
        onEndChange(null);
      }
    } else {
      if (startDate && date.isBefore(startDate)) {
        onStartChange(date);
        onEndChange(null);
      } else {
        onEndChange(date);
      }
    }
    handleClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Дата начала"
          value={startDate ? startDate.format('DD.MM.YYYY') : ''}
          placeholder="Выберите дату"
          InputProps={{
            readOnly: true,
            endAdornment: (
              <IconButton onClick={(e) => handleOpen(e, 'start')} size="small">
                <CalendarTodayIcon />
              </IconButton>
            ),
          }}
          sx={{ flex: 1 }}
        />
        <Typography>—</Typography>
        <TextField
          label="Дата окончания"
          value={endDate ? endDate.format('DD.MM.YYYY') : ''}
          placeholder="Выберите дату"
          InputProps={{
            readOnly: true,
            endAdornment: (
              <IconButton onClick={(e) => handleOpen(e, 'end')} size="small">
                <CalendarTodayIcon />
              </IconButton>
            ),
          }}
          sx={{ flex: 1 }}
        />
      </Box>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <DateCalendar
          value={selecting === 'start' ? startDate : endDate}
          onChange={handleDateSelect}
          shouldDisableDate={isDateDisabled}
          minDate={dayjs()}
        />
      </Popover>
    </LocalizationProvider>
  );
}