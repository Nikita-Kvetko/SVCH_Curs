import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating,
  Tooltip,
} from '@mui/material';
import {
  PictureAsPdf,
  TableChart,
  Save,
  History,
  AttachMoney,
  Assignment,
  Grass,
  Download,
  Visibility,
  Close,
  BarChart,
} from '@mui/icons-material';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { exportToPDF, exportToExcel, formatCurrency, formatDate } from '../utils/exportUtils';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );
}

export default function Reports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [savedReports, setSavedReports] = useState([]);
  const [user, setUser] = useState(null);

  // Период отчёта
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  });

  // Данные отчётов
  const [financialData, setFinancialData] = useState(null);
  const [tasksData, setTasksData] = useState(null);
  const [yieldData, setYieldData] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState('');
  const [farms, setFarms] = useState([]);

  // Состояние сохранения
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    if (!token) {
      navigate('/login');
    }
    fetchUserFarms();
    fetchSavedReports();
  }, []);

  const fetchUserFarms = async () => {
    try {
      const response = await axios.get('/farms/my');
      setFarms(response.data);
    } catch (error) {
      console.error('Error fetching farms:', error);
    }
  };

  const fetchSavedReports = async () => {
    try {
      const response = await axios.get('/reports/my');
      setSavedReports(response.data);
    } catch (error) {
      console.error('Error fetching saved reports:', error);
    }
  };

  // Финансовый отчёт
  const generateFinancialReport = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        farmId: selectedFarm || undefined,
      };
      const response = await axios.get('/reports/financial', { params });
      setFinancialData(response.data);
    } catch (error) {
      console.error('Error generating financial report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Отчёт по задачам
  const generateTasksReport = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        farmId: selectedFarm || undefined,
      };
      const response = await axios.get('/reports/tasks', { params });
      setTasksData(response.data);
    } catch (error) {
      console.error('Error generating tasks report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Отчёт по урожайности
  const generateYieldReport = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        farmId: selectedFarm || undefined,
      };
      const response = await axios.get('/reports/yield', { params });
      setYieldData(response.data);
    } catch (error) {
      console.error('Error generating yield report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Сохранение отчёта
  const saveReport = async (reportType, data) => {
    setSaving(true);
    try {
      await axios.post('/reports', {
        report_type: reportType,
        data: data,
        period_start: dateRange.startDate,
        period_end: dateRange.endDate,
        farm_id: selectedFarm || null,
      });
      fetchSavedReports();
      alert('Отчёт сохранён в историю');
    } catch (error) {
      console.error('Error saving report:', error);
    } finally {
      setSaving(false);
    }
  };

  // Экспорт в PDF
  const handleExportPDF = (type, data) => {
    let columns = [];
    let tableData = [];
    let title = '';

    if (type === 'financial') {
      title = 'Финансовый отчёт';
      columns = [
        { label: 'Ферма', accessor: (r) => r.farm_name },
        { label: 'Период', accessor: (r) => `${formatDate(r.start_date)} — ${formatDate(r.end_date)}` },
        { label: 'Стоимость (₽)', accessor: (r) => r.total_price?.toLocaleString() },
        { label: 'Статус', accessor: (r) => r.status === 'approved' ? 'Подтверждено' : r.status === 'pending' ? 'Ожидает' : 'Завершено' },
      ];
      tableData = data?.bookings || [];
    } else if (type === 'tasks') {
      title = 'Отчёт по задачам';
      columns = [
        { label: 'Название', accessor: (r) => r.title },
        { label: 'Ферма', accessor: (r) => r.farm_name },
        { label: 'Срок', accessor: (r) => formatDate(r.due_date) },
        { label: 'Приоритет', accessor: (r) => r.priority === 'high' ? 'Высокий' : r.priority === 'medium' ? 'Средний' : 'Низкий' },
        { label: 'Статус', accessor: (r) => r.is_completed ? 'Выполнена' : 'В работе' },
      ];
      tableData = data?.tasks || [];
    } else if (type === 'yield') {
      title = 'Отчёт по урожайности';
      columns = [
        { label: 'Культура', accessor: (r) => r.crop_name },
        { label: 'Ферма', accessor: (r) => r.farm_name },
        { label: 'Площадь (га)', accessor: (r) => r.area_hectares },
        { label: 'Урожай (кг)', accessor: (r) => r.yield_kg?.toLocaleString() },
        { label: 'Урожайность (кг/га)', accessor: (r) => r.yield_per_hectare?.toLocaleString() },
      ];
      tableData = data?.crops || [];
    }

    exportToPDF(tableData, title, columns, `${title.toLowerCase().replace(/ /g, '_')}`);
  };

  // Экспорт в Excel
  const handleExportExcel = (type, data) => {
    let columns = [];
    let tableData = [];
    let title = '';

    if (type === 'financial') {
      title = 'Финансовый отчёт';
      columns = [
        { label: 'Ферма', accessor: (r) => r.farm_name },
        { label: 'Дата начала', accessor: (r) => formatDate(r.start_date) },
        { label: 'Дата окончания', accessor: (r) => formatDate(r.end_date) },
        { label: 'Стоимость (₽)', accessor: (r) => r.total_price },
        { label: 'Статус', accessor: (r) => r.status },
      ];
      tableData = data?.bookings || [];
    } else if (type === 'tasks') {
      title = 'Отчёт по задачам';
      columns = [
        { label: 'Название', accessor: (r) => r.title },
        { label: 'Ферма', accessor: (r) => r.farm_name },
        { label: 'Срок', accessor: (r) => formatDate(r.due_date) },
        { label: 'Приоритет', accessor: (r) => r.priority },
        { label: 'Статус', accessor: (r) => r.is_completed ? 'Выполнена' : 'В работе' },
      ];
      tableData = data?.tasks || [];
    } else if (type === 'yield') {
      title = 'Отчёт по урожайности';
      columns = [
        { label: 'Культура', accessor: (r) => r.crop_name },
        { label: 'Ферма', accessor: (r) => r.farm_name },
        { label: 'Площадь (га)', accessor: (r) => r.area_hectares },
        { label: 'Урожай (кг)', accessor: (r) => r.yield_kg },
        { label: 'Урожайность (кг/га)', accessor: (r) => r.yield_per_hectare },
      ];
      tableData = data?.crops || [];
    }

    exportToExcel(tableData, title, columns, `${title.toLowerCase().replace(/ /g, '_')}`);
  };

  // Данные для графика урожайности
  const getYieldChartData = () => {
    if (!yieldData?.crops) return null;
    return {
      labels: yieldData.crops.map(c => c.crop_name),
      datasets: [
        {
          label: 'Урожайность (кг/га)',
          data: yieldData.crops.map(c => c.yield_per_hectare),
          backgroundColor: '#2e7d32',
          borderRadius: 8,
        },
        {
          label: 'Плановая урожайность (кг/га)',
          data: yieldData.crops.map(c => c.target_yield || c.yield_per_hectare * 1.1),
          backgroundColor: '#ff8f00',
          borderRadius: 8,
        },
      ],
    };
  };

  // Данные для финансового графика
  const getFinancialChartData = () => {
    if (!financialData?.bookings) return null;
    const monthlyData = {};
    financialData.bookings.forEach(b => {
      const month = dayjs(b.start_date).format('MMM YYYY');
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, count: 0 };
      }
      monthlyData[month].revenue += b.total_price;
      monthlyData[month].count += 1;
    });
    return {
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: 'Доход (₽)',
          data: Object.values(monthlyData).map(m => m.revenue),
          borderColor: '#2e7d32',
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
  };

  const isLandowner = user?.role === 'landowner' || user?.role === 'admin';

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">
          Отчёты и аналитика
        </Typography>
        <Button
          variant={showHistory ? 'contained' : 'outlined'}
          startIcon={<History />}
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? 'Создать отчёт' : 'История отчётов'}
        </Button>
      </Box>

      {showHistory ? (
        // История отчётов
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Сохранённые отчёты</Typography>
          <Divider sx={{ mb: 2 }} />
          {savedReports.length === 0 ? (
            <Alert severity="info">У вас пока нет сохранённых отчётов</Alert>
          ) : (
            <Grid container spacing={2}>
              {savedReports.map((report) => (
                <Grid item xs={12} key={report.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {report.report_type === 'financial' ? '💰 Финансовый отчёт' :
                             report.report_type === 'tasks' ? '📋 Отчёт по задачам' : '🌾 Отчёт по урожайности'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Период: {formatDate(report.period_start)} — {formatDate(report.period_end)}
                          </Typography>
                          <Chip
                            label={formatDate(report.created_at)}
                            size="small"
                            variant="outlined"
                            sx={{ ml: 2 }}
                          />
                        </Box>
                        <Box>
                          <Tooltip title="Просмотреть">
                            <IconButton size="small" onClick={() => {
                              setPreviewData(report);
                              setPreviewOpen(true);
                            }}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Экспорт PDF">
                            <IconButton size="small" onClick={() => handleExportPDF(report.report_type, report.data)}>
                              <PictureAsPdf />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Экспорт Excel">
                            <IconButton size="small" onClick={() => handleExportExcel(report.report_type, report.data)}>
                              <TableChart />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Скачать">
                            <IconButton size="small" onClick={() => handleExportPDF(report.report_type, report.data)}>
                              <Download />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      ) : (
        // Форма создания отчётов
        <>
          {/* Выбор периода */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Параметры отчёта</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label="Дата начала"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label="Дата окончания"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => setDateRange({
                    startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
                    endDate: dayjs().format('YYYY-MM-DD'),
                  })}>7 дней</Button>
                  <Button size="small" variant="outlined" onClick={() => setDateRange({
                    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
                    endDate: dayjs().format('YYYY-MM-DD'),
                  })}>30 дней</Button>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ферма</InputLabel>
                  <Select
                    value={selectedFarm}
                    onChange={(e) => setSelectedFarm(e.target.value)}
                    label="Ферма"
                  >
                    <MenuItem value="">Все фермы</MenuItem>
                    {farms.map((farm) => (
                      <MenuItem key={farm.id} value={farm.id}>{farm.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Tabs отчётов */}
          <Paper sx={{ p: 3 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab icon={<AttachMoney />} label="Финансовый отчёт" />
              <Tab icon={<Assignment />} label="Отчёт по задачам" />
              {isLandowner && <Tab icon={<Grass />} label="Урожайность" />}
            </Tabs>

            {/* Финансовый отчёт */}
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h6">Финансовый отчёт</Typography>
                <Box>
                  <Button
                    variant="contained"
                    onClick={generateFinancialReport}
                    disabled={loading}
                    sx={{ mr: 1 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Сформировать'}
                  </Button>
                  {financialData && (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<PictureAsPdf />}
                        onClick={() => handleExportPDF('financial', financialData)}
                        sx={{ mr: 1 }}
                      >
                        PDF
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<TableChart />}
                        onClick={() => handleExportExcel('financial', financialData)}
                        sx={{ mr: 1 }}
                      >
                        Excel
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Save />}
                        onClick={() => saveReport('financial', financialData)}
                        disabled={saving}
                      >
                        Сохранить
                      </Button>
                    </>
                  )}
                </Box>
              </Box>

              {financialData ? (
                <>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                      <Card sx={{ bgcolor: '#e8f5e9', textAlign: 'center' }}>
                        <CardContent>
                          <Typography variant="h4" color="primary">
                            {financialData.summary?.total_bookings || 0}
                          </Typography>
                          <Typography variant="body2">Всего бронирований</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Card sx={{ bgcolor: '#fff3e0', textAlign: 'center' }}>
                        <CardContent>
                          <Typography variant="h4" color="secondary">
                            {formatCurrency(financialData.summary?.total_revenue || 0)}
                          </Typography>
                          <Typography variant="body2">Общий доход</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Card sx={{ bgcolor: '#e3f2fd', textAlign: 'center' }}>
                        <CardContent>
                          <Typography variant="h4" color="info.main">
                            {formatCurrency(financialData.summary?.average_booking_value || 0)}
                          </Typography>
                          <Typography variant="body2">Средний чек</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {getFinancialChartData() && (
                    <Box sx={{ height: 300, mb: 3 }}>
                      <Line data={getFinancialChartData()} options={chartOptions} />
                    </Box>
                  )}

                  <Typography variant="h6" gutterBottom>Детали бронирований</Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#2e7d32' }}>
                          <TableCell sx={{ color: 'white' }}>Ферма</TableCell>
                          <TableCell sx={{ color: 'white' }}>Период</TableCell>
                          <TableCell sx={{ color: 'white' }}>Стоимость</TableCell>
                          <TableCell sx={{ color: 'white' }}>Статус</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {financialData.bookings?.map((booking) => (
                          <TableRow key={booking.id} hover>
                            <TableCell>{booking.farm_name}</TableCell>
                            <TableCell>{formatDate(booking.start_date)} — {formatDate(booking.end_date)}</TableCell>
                            <TableCell>{formatCurrency(booking.total_price)}</TableCell>
                            <TableCell>
                              <Chip
                                label={booking.status === 'approved' ? 'Подтверждено' : booking.status === 'pending' ? 'Ожидает' : 'Завершено'}
                                size="small"
                                color={booking.status === 'approved' ? 'success' : 'warning'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Alert severity="info">Выберите период и нажмите "Сформировать"</Alert>
              )}
            </TabPanel>

            {/* Отчёт по задачам */}
            <TabPanel value={activeTab} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h6">Отчёт по задачам</Typography>
                <Box>
                  <Button
                    variant="contained"
                    onClick={generateTasksReport}
                    disabled={loading}
                    sx={{ mr: 1 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Сформировать'}
                  </Button>
                  {tasksData && (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<PictureAsPdf />}
                        onClick={() => handleExportPDF('tasks', tasksData)}
                        sx={{ mr: 1 }}
                      >
                        PDF
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<TableChart />}
                        onClick={() => handleExportExcel('tasks', tasksData)}
                        sx={{ mr: 1 }}
                      >
                        Excel
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Save />}
                        onClick={() => saveReport('tasks', tasksData)}
                        disabled={saving}
                      >
                        Сохранить
                      </Button>
                    </>
                  )}
                </Box>
              </Box>

              {tasksData ? (
                <>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={3}>
                      <Card sx={{ textAlign: 'center' }}>
                        <CardContent>
                          <Typography variant="h4">{tasksData.summary?.total || 0}</Typography>
                          <Typography variant="body2">Всего задач</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Card sx={{ bgcolor: '#e8f5e9', textAlign: 'center' }}>
                        <CardContent>
                          <Typography variant="h4" color="success.main">{tasksData.summary?.completed || 0}</Typography>
                          <Typography variant="body2">Выполнено</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Card sx={{ bgcolor: '#fff3e0', textAlign: 'center' }}>
                        <CardContent>
                          <Typography variant="h4" color="warning.main">{tasksData.summary?.pending || 0}</Typography>
                          <Typography variant="body2">В работе</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Card sx={{ bgcolor: '#ffebee', textAlign: 'center' }}>
                        <CardContent>
                          <Typography variant="h4" color="error.main">{tasksData.summary?.overdue || 0}</Typography>
                          <Typography variant="body2">Просрочено</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

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
                        {tasksData.tasks?.map((task) => (
                          <TableRow key={task.id} hover>
                            <TableCell>{task.title}</TableCell>
                            <TableCell>{task.farm_name || '—'}</TableCell>
                            <TableCell>{formatDate(task.due_date)}</TableCell>
                            <TableCell>
                              <Chip
                                label={task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                                size="small"
                                color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'success'}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={task.is_completed ? 'Выполнена' : 'В работе'}
                                size="small"
                                color={task.is_completed ? 'success' : 'warning'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Alert severity="info">Выберите период и нажмите "Сформировать"</Alert>
              )}
            </TabPanel>

            {/* Отчёт по урожайности (только для владельца/админа) */}
            {isLandowner && (
              <TabPanel value={activeTab} index={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6">Отчёт по урожайности</Typography>
                  <Box>
                    <Button
                      variant="contained"
                      onClick={generateYieldReport}
                      disabled={loading}
                      sx={{ mr: 1 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Сформировать'}
                    </Button>
                    {yieldData && (
                      <>
                        <Button
                          variant="outlined"
                          startIcon={<PictureAsPdf />}
                          onClick={() => handleExportPDF('yield', yieldData)}
                          sx={{ mr: 1 }}
                        >
                          PDF
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<TableChart />}
                          onClick={() => handleExportExcel('yield', yieldData)}
                          sx={{ mr: 1 }}
                        >
                          Excel
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Save />}
                          onClick={() => saveReport('yield', yieldData)}
                          disabled={saving}
                        >
                          Сохранить
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>

                {yieldData ? (
                  <>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={4}>
                        <Card sx={{ textAlign: 'center' }}>
                          <CardContent>
                            <Typography variant="h4">{yieldData.summary?.total_crops || 0}</Typography>
                            <Typography variant="body2">Всего культур</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Card sx={{ bgcolor: '#e8f5e9', textAlign: 'center' }}>
                          <CardContent>
                            <Typography variant="h4">{yieldData.summary?.total_yield?.toLocaleString() || 0} кг</Typography>
                            <Typography variant="body2">Общий урожай</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Card sx={{ bgcolor: '#fff3e0', textAlign: 'center' }}>
                          <CardContent>
                            <Typography variant="h4">{yieldData.summary?.avg_yield?.toLocaleString() || 0} кг/га</Typography>
                            <Typography variant="body2">Средняя урожайность</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    {getYieldChartData() && (
                      <Box sx={{ height: 350, mb: 3 }}>
                        <Bar data={getYieldChartData()} options={chartOptions} />
                      </Box>
                    )}

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
                          {yieldData.crops?.map((crop) => (
                            <TableRow key={crop.id} hover>
                              <TableCell><GrassIcon sx={{ mr: 0.5, verticalAlign: 'middle' }} /> {crop.crop_name}</TableCell>
                              <TableCell>{crop.farm_name}</TableCell>
                              <TableCell>{crop.area_hectares}</TableCell>
                              <TableCell>{crop.yield_kg?.toLocaleString()}</TableCell>
                              <TableCell><strong>{crop.yield_per_hectare?.toLocaleString()}</strong></TableCell>
                              <TableCell sx={{ minWidth: 100 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(100, (crop.yield_per_hectare / (crop.target_yield || 5000)) * 100)}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                ) : (
                  <Alert severity="info">Выберите период и нажмите "Сформировать"</Alert>
                )}
              </TabPanel>
            )}
          </Paper>
        </>
      )}

      {/* Диалог предпросмотра отчёта */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Просмотр отчёта</Typography>
            <IconButton onClick={() => setPreviewOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {previewData && (
            <>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Период: {formatDate(previewData.period_start)} — {formatDate(previewData.period_end)}
              </Typography>
              <Divider sx={{ my: 2 }} />
              {previewData.report_type === 'financial' && previewData.data?.bookings && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Ферма</TableCell>
                        <TableCell>Период</TableCell>
                        <TableCell>Стоимость</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewData.data.bookings.map((b, i) => (
                        <TableRow key={i}>
                          <TableCell>{b.farm_name}</TableCell>
                          <TableCell>{formatDate(b.start_date)} — {formatDate(b.end_date)}</TableCell>
                          <TableCell>{formatCurrency(b.total_price)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {previewData.report_type === 'tasks' && previewData.data?.tasks && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Название</TableCell>
                        <TableCell>Срок</TableCell>
                        <TableCell>Статус</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewData.data.tasks.map((t, i) => (
                        <TableRow key={i}>
                          <TableCell>{t.title}</TableCell>
                          <TableCell>{formatDate(t.due_date)}</TableCell>
                          <TableCell>{t.is_completed ? 'Выполнена' : 'В работе'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {previewData.report_type === 'yield' && previewData.data?.crops && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Культура</TableCell>
                        <TableCell>Урожайность</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewData.data.crops.map((c, i) => (
                        <TableRow key={i}>
                          <TableCell>{c.crop_name}</TableCell>
                          <TableCell>{c.yield_per_hectare?.toLocaleString()} кг/га</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}