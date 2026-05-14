import React from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Chip } from '@mui/material';
import { formatDate } from '../utils/exportUtils';

const priorityConfig = {
  low: { label: 'Низкий', color: '#2e7d32' },
  medium: { label: 'Средний', color: '#ed6c02' },
  high: { label: 'Высокий', color: '#d32f2f' },
};

export default function TasksReportTable({ data }) {
  if (!data) return null;

  const { tasks, summary } = data;

  return (
    <>
      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
          <Typography variant="h5">{summary?.total || 0}</Typography>
          <Typography variant="body2" color="text.secondary">Всего задач</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
          <Typography variant="h5" color="success.main">{summary?.completed || 0}</Typography>
          <Typography variant="body2" color="text.secondary">Выполнено</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
          <Typography variant="h5" color="warning.main">{summary?.pending || 0}</Typography>
          <Typography variant="body2" color="text.secondary">В работе</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
          <Typography variant="h5" color="error.main">{summary?.overdue || 0}</Typography>
          <Typography variant="body2" color="text.secondary">Просрочено</Typography>
        </Paper>
      </Box>

      {/* Tasks Table */}
      <Typography variant="h6" gutterBottom>Детали задач</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#2e7d32' }}>
              <TableCell sx={{ color: 'white' }}>Название</TableCell>
              <TableCell sx={{ color: 'white' }}>Ферма</TableCell>
              <TableCell sx={{ color: 'white' }}>Срок</TableCell>
              <TableCell sx={{ color: 'white' }}>Приоритет</TableCell>
              <TableCell sx={{ color: 'white' }}>Статус</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks?.map((task) => {
              const priority = priorityConfig[task.priority] || priorityConfig.medium;
              return (
                <TableRow key={task.id} hover>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.farm_name || '—'}</TableCell>
                  <TableCell>{formatDate(task.due_date)}</TableCell>
                  <TableCell>
                    <Chip label={priority.label} size="small" sx={{ bgcolor: priority.color + '20', color: priority.color }} />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={task.is_completed ? 'Выполнена' : task.overdue ? 'Просрочена' : 'В работе'}
                      size="small"
                      color={task.is_completed ? 'success' : task.overdue ? 'error' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {(!tasks || tasks.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} align="center">Нет данных за выбранный период</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}