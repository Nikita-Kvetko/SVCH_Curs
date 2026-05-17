import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function AdminStatsCards({ stats }) {
  if (!stats) return null;

  const cards = [
    { title: 'Всего пользователей', value: stats.total_users, icon: <PeopleIcon sx={{ fontSize: 40 }} />, color: '#1976d2', bg: '#e3f2fd' },
    { title: 'Всего ферм', value: stats.total_farms, icon: <AgricultureIcon sx={{ fontSize: 40 }} />, color: '#2e7d32', bg: '#e8f5e9' },
    { title: 'Бронирований', value: stats.total_bookings, icon: <BookOnlineIcon sx={{ fontSize: 40 }} />, color: '#ed6c02', bg: '#fff3e0' },
    { title: 'Общий доход', value: `${stats.total_revenue?.toLocaleString() || 0} ₽`, icon: <AttachMoneyIcon sx={{ fontSize: 40 }} />, color: '#9c27b0', bg: '#f3e5f5' },
    { title: 'Активных пользователей', value: stats.active_users || 0, icon: <TrendingUpIcon sx={{ fontSize: 40 }} />, color: '#0288d1', bg: '#e1f5fe' },
    { title: 'Выполненных задач', value: stats.completed_tasks || 0, icon: <CheckCircleIcon sx={{ fontSize: 40 }} />, color: '#388e3c', bg: '#e8f5e9' },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card, idx) => (
        <Grid item xs={12} sm={6} md={4} key={idx}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: card.bg }}>
            <Box>
              <Typography variant="body2" color="text.secondary">{card.title}</Typography>
              <Typography variant="h4" fontWeight="bold" color={card.color}>{card.value}</Typography>
            </Box>
            <Box sx={{ color: card.color }}>{card.icon}</Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}