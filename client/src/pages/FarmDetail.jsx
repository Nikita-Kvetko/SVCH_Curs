import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Button } from '@mui/material';

export default function FarmDetail() {
  const { id } = useParams();
  
  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">Детали фермы #{id}</Typography>
        <Typography sx={{ mt: 2 }}>Страница в разработке</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.history.back()}>
          Назад
        </Button>
      </Paper>
    </Container>
  );
}