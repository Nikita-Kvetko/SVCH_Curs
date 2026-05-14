import React from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import dayjs from 'dayjs';

export default function DateRangeSelector({ startDate, endDate, onStartChange, onEndChange, farms = [], selectedFarm, onFarmChange, showFarmFilter = false }) {
  const handlePreset = (days) => {
    const end = dayjs();
    const start = end.subtract(days, 'day');
    onStartChange(start.format('YYYY-MM-DD'));
    onEndChange(end.format('YYYY-MM-DD'));
  };

  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            label="Дата начала"
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            label="Дата окончания"
            type="date"
            value={endDate}
            onChange={(e) => onEndChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="outlined" onClick={() => handlePreset(7)}>7 дней</Button>
            <Button size="small" variant="outlined" onClick={() => handlePreset(30)}>30 дней</Button>
            <Button size="small" variant="outlined" onClick={() => handlePreset(90)}>90 дней</Button>
          </Box>
        </Grid>
      </Grid>
      
      {showFarmFilter && farms.length > 0 && (
        <FormControl fullWidth size="small" sx={{ mt: 2 }}>
          <InputLabel>Ферма</InputLabel>
          <Select value={selectedFarm || ''} onChange={(e) => onFarmChange(e.target.value || null)} label="Ферма">
            <MenuItem value="">Все фермы</MenuItem>
            {farms.map((farm) => (
              <MenuItem key={farm.id} value={farm.id}>{farm.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
}