import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

export default function StatCard({ title, value, icon, color }) {
  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderLeft: 4,
        borderColor: color,
      }}
    >
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
      </Box>
      <Box sx={{ color: color }}>
        {icon}
      </Box>
    </Paper>
  );
}