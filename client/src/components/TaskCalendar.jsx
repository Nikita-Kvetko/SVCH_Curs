import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import dayjs from 'dayjs';

const priorityColors = {
  low: '#2e7d32',
  medium: '#ed6c02',
  high: '#d32f2f',
};

export default function TaskCalendar({ tasks, onDateClick }) {
  const [currentMonth, setCurrentMonth] = React.useState(dayjs());
  const daysInMonth = currentMonth.daysInMonth();
  const startDay = currentMonth.startOf('month').day();

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      const taskDate = dayjs(task.due_date);
      return !task.is_completed && taskDate.isSame(date, 'day');
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {currentMonth.format('MMMM YYYY')}
        </Typography>
        <Box>
          <button onClick={handlePrevMonth} style={{ marginRight: 8 }}>◀</button>
          <button onClick={handleNextMonth}>▶</button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <Typography key={day} textAlign="center" variant="body2" fontWeight="bold">
            {day}
          </Typography>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {Array.from({ length: startDay === 0 ? 6 : startDay - 1 }).map((_, i) => (
          <Box key={`empty-${i}`} sx={{ height: 80, bgcolor: '#fafafa', borderRadius: 1 }} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = currentMonth.date(i + 1);
          const tasksForDay = getTasksForDate(date);
          const isToday = date.isSame(dayjs(), 'day');

          return (
            <Box
              key={i}
              onClick={() => onDateClick(date)}
              sx={{
                height: 80,
                p: 1,
                bgcolor: isToday ? '#e8f5e9' : '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                cursor: 'pointer',
                overflow: 'hidden',
                '&:hover': { bgcolor: '#f5f5f5' },
              }}
            >
              <Typography variant="body2" fontWeight={isToday ? 'bold' : 'normal'}>
                {i + 1}
              </Typography>
              {tasksForDay.slice(0, 2).map(task => (
                <Chip
                  key={task.id}
                  label={task.title}
                  size="small"
                  sx={{
                    mt: 0.5,
                    height: 20,
                    fontSize: '10px',
                    bgcolor: priorityColors[task.priority] + '20',
                    color: priorityColors[task.priority],
                  }}
                />
              ))}
              {tasksForDay.length > 2 && (
                <Typography variant="caption" color="text.secondary">
                  +{tasksForDay.length - 2}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}