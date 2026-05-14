import React from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, LinearProgress } from '@mui/material';
import { formatCurrency } from '../utils/exportUtils';

export default function CropsReportTable({ data }) {
  if (!data) return null;

  const { crops, summary } = data;

  return (
    <>
      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
          <Typography variant="h5">{summary?.total_crops || 0}</Typography>
          <Typography variant="body2" color="text.secondary">Всего культур</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
          <Typography variant="h5">{summary?.total_yield?.toLocaleString() || 0} кг</Typography>
          <Typography variant="body2" color="text.secondary">Общий урожай</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
          <Typography variant="h5">{summary?.avg_yield?.toLocaleString() || 0} кг/га</Typography>
          <Typography variant="body2" color="text.secondary">Средняя урожайность</Typography>
        </Paper>
      </Box>

      {/* Crops Table */}
      <Typography variant="h6" gutterBottom>Детали по культурам</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#2e7d32' }}>
              <TableCell sx={{ color: 'white' }}>Культура</TableCell>
              <TableCell sx={{ color: 'white' }}>Ферма</TableCell>
              <TableCell sx={{ color: 'white' }}>Площадь (га)</TableCell>
              <TableCell sx={{ color: 'white' }}>Урожай (кг)</TableCell>
              <TableCell sx={{ color: 'white' }}>Урожайность (кг/га)</TableCell>
              <TableCell sx={{ color: 'white' }}>Прогресс</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {crops?.map((crop) => (
              <TableRow key={crop.id} hover>
                <TableCell>{crop.crop_name}</TableCell>
                <TableCell>{crop.farm_name}</TableCell>
                <TableCell>{crop.area_hectares}</TableCell>
                <TableCell>{crop.yield_kg?.toLocaleString() || '—'}</TableCell>
                <TableCell>
                  <Typography fontWeight="bold">
                    {crop.yield_per_hectare?.toLocaleString() || '—'} кг/га
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 120 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, (crop.yield_per_hectare / (crop.target_yield || 5000)) * 100)} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {(!crops || crops.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} align="center">Нет данных за выбранный период</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}