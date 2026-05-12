import React from 'react';
import { Paper, Typography } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function StatsChart({ data }) {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Бронирования',
        data: data.map(d => d.count),
        borderColor: '#2e7d32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Доход (₽)',
        data: data.map(d => d.revenue),
        borderColor: '#ff8f00',
        backgroundColor: 'rgba(255, 143, 0, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      y: { title: { display: true, text: 'Количество бронирований' } },
      y1: {
        position: 'right',
        title: { display: true, text: 'Доход (₽)' },
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Статистика за последние 6 месяцев
      </Typography>
      <Box sx={{ height: 300 }}>
        <Line data={chartData} options={options} />
      </Box>
    </Paper>
  );
}