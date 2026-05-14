import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, Button } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import DownloadIcon from '@mui/icons-material/Download';
import dayjs from 'dayjs';

const reportTypeLabels = {
  financial: 'Финансовый отчёт',
  tasks: 'Отчёт по задачам',
  crops: 'Отчёт по урожайности',
};

export default function ReportCard({ report, onExportPDF, onExportExcel }) {
  const getSummary = () => {
    if (report.report_type === 'financial') {
      return `Доход: ${report.data?.total_revenue?.toLocaleString()} ₽, Бронирований: ${report.data?.total_bookings}`;
    }
    if (report.report_type === 'tasks') {
      return `Выполнено: ${report.data?.completed}, Просрочено: ${report.data?.overdue}`;
    }
    if (report.report_type === 'crops') {
      return `Урожайность: ${report.data?.avg_yield} кг/га`;
    }
    return '';
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {reportTypeLabels[report.report_type] || report.report_type}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Период: {dayjs(report.period_start).format('DD.MM.YYYY')} — {dayjs(report.period_end).format('DD.MM.YYYY')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {getSummary()}
            </Typography>
          </Box>
          <Box>
            <Chip
              label={`Создан: ${dayjs(report.created_at).format('DD.MM.YYYY')}`}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            size="small"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => onExportPDF(report)}
          >
            PDF
          </Button>
          <Button
            size="small"
            startIcon={<TableChartIcon />}
            onClick={() => onExportExcel(report)}
          >
            Excel
          </Button>
          <Button
            size="small"
            startIcon={<DownloadIcon />}
            onClick={() => onExportPDF(report)}
          >
            Скачать
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}