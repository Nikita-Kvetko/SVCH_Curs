import React from 'react';
import { Container, Typography, Paper, Grid } from '@mui/material';

export default function Dashboard() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Личный кабинет</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Мои бронирования</Typography>
            <Typography>У вас пока нет активных бронирований</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Мои задачи</Typography>
            <Typography>Нет задач на сегодня</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}