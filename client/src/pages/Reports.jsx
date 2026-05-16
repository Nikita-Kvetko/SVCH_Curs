import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  AttachMoney,
  Assignment,
  Grass,
  Save,
  History,
} from '@mui/icons-material';
import {
  fetchFinancialReport,
  fetchTasksReport,
  fetchCropsReport,
  saveReport,
  fetchSavedReports,
} from '../store/reportSlice';
import { fetchMyFarms } from '../store/userSlice';
import DateRangeSelector from '../components/DateRangeSelector';
import FinancialReportTable from '../components/FinancialReportTable';
import TasksReportTable from '../components/TasksReportTable';
import CropsReportTable from '../components/CropsReportTable';
import ReportCard from '../components/ReportCard';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import dayjs from 'dayjs';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );
}

export default function Reports() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myFarms } = useSelector((state) => state.user);
  const { financial, tasks, crops, loading, savedReports } = useSelector((state) => state.reports);
  
  const [tabValue, setTabValue] = useState(0);
  const [historyTab, setHistoryTab] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  });
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [saving, setSaving] = useState(false);

  const isLandowner = user?.role === 'landowner' || user?.role === 'admin';

  useEffect(() => {
    dispatch(fetchMyFarms());
    dispatch(fetchSavedReports());
  }, [dispatch]);

  const handleGenerateFinancial = async () => {
    await dispatch(fetchFinancialReport({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      farmId: selectedFarm,
    }));
  };

  const handleGenerateTasks = async () => {
    await dispatch(fetchTasksReport({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      farmId: selectedFarm,
    }));
  };

  const handleGenerateCrops = async () => {
    await dispatch(fetchCropsReport({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      farmId: selectedFarm,
    }));
  };

  const handleSaveReport = async (reportType, data) => {
    setSaving(true);
    await dispatch(saveReport({
      report_type: reportType,
      data: data,
      period_start: dateRange.startDate,
      period_end: dateRange.endDate,
      farm_id: selectedFarm,
    }));
    setSaving(false);
    alert('Отчёт сохранён в историю');
  };

  const handleExportPDF = (report) => {
    let columns = [];
    let data = [];
    let title = '';

    if (report.report_type === 'financial') {
      title = 'Финансовый отчёт';
      columns = [
        { label: 'Ферма', accessor: (r) => r.farm_name },
        { label: 'Дата начала', accessor: (r) => dayjs(r.start_date).format('DD.MM.YYYY') },
        { label: 'Дата окончания', accessor: (r) => dayjs(r.end_date).format('DD.MM.YYYY') },
        { label: 'Стоимость (₽)', accessor: (r) => r.total_price?.toLocaleString() },
        { label: 'Статус', accessor: (r) => r.status },
      ];
      data = report.data?.bookings || [];
    } else if (report.report_type === 'tasks') {
      title = 'Отчёт по задачам';
      columns = [
        { label: 'Название', accessor: (r) => r.title },
        { label: 'Ферма', accessor: (r) => r.farm_name },
        { label: 'Срок', accessor: (r) => dayjs(r.due_date).format('DD.MM.YYYY') },
        { label: 'Приоритет', accessor: (r) => r.priority },
        { label: 'Статус', accessor: (r) => r.is_completed ? 'Выполнена' : 'В работе' },
      ];
      data = report.data?.tasks || [];
    } else {
      title = 'Отчёт по урожайности';
      columns = [
        { label: 'Культура', accessor: (r) => r.crop_name },
        { label: 'Ферма', accessor: (r) => r.farm_name },
        { label: 'Площадь (га)', accessor: (r) => r.area_hectares },
        { label: 'Урожай (кг)', accessor: (r) => r.yield_kg?.toLocaleString() },
        { label: 'Урожайность (кг/га)', accessor: (r) => r.yield_per_hectare?.toLocaleString() },
      ];
      data = report.data?.crops || [];
    }

    exportToPDF(data, title, columns, `${title.toLowerCase().replace(/ /g, '_')}`);
  };

  const handleExportExcel = (report) => {
    let columns = [];
    let data = [];
    let title = '';

    if (report.report_type === 'financial') {
      title = 'Финансовый отчёт';
      columns = [
        { label: 'Ферма', accessor: (r) => r.farm_name },
        { label: 'Дата начала', accessor: (r) => dayjs(r.start_date).format('DD.MM.YYYY') },
        { label: 'Дата окончания', accessor: (r) => dayjs(r.end_date).format('DD.MM.YYYY') },
        { label: 'Стоимость (₽)', accessor: (r) => r.total_price },
        { label: 'Статус', accessor: (r) => r.status },
      ];
      data = report.data?.bookings || [];
    } else if (report.report_type === 'tasks') {
      title = 'Отчёт по задачам';
      columns = [
        { label: 'Название', accessor: (r) => r.title },
        { label: 'Ферма', accessor: (r) => r.farm_name },
        { label: 'Срок', accessor: (r) => dayjs(r.due_date).format('DD.MM.YYYY') },
        { label: 'Приоритет', accessor: (r) => r.priority },
        { label: 'Статус', accessor: (r) => r.is_completed ? 'Выполнена' : 'В работе' },
      ];
      data = report.data?.tasks || [];
    } else {
      title = 'Отчёт по урожайности';
      columns = [
        { label: 'Культура', accessor: (r) => r.crop_name },
        { label: 'Ферма', accessor: (r) => r.farm_name },
        { label: 'Площадь (га)', accessor: (r) => r.area_hectares },
        { label: 'Урожай (кг)', accessor: (r) => r.yield_kg },
        { label: 'Урожайность (кг/га)', accessor: (r) => r.yield_per_hectare },
      ];
      data = report.data?.crops || [];
    }

    exportToExcel(data, title, columns, `${title.toLowerCase().replace(/ /g, '_')}`);
  };

  const reportTypes = [
    { value: 0, label: 'Финансовый отчёт', icon: <AttachMoney />, component: FinancialReportTable, data: financial, handler: handleGenerateFinancial },
    { value: 1, label: 'Отчёт по задачам', icon: <Assignment />, component: TasksReportTable, data: tasks, handler: handleGenerateTasks },
  ];

  if (isLandowner) {
    reportTypes.push({ value: 2, label: 'Отчёт по урожайности', icon: <Grass />, component: CropsReportTable, data: crops, handler: handleGenerateCrops });
  }

  const currentReport = reportTypes.find(r => r.value === tabValue);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Отчёты
      </Typography>

      {/* History Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          startIcon={<History />}
          variant={historyTab ? 'contained' : 'outlined'}
          onClick={() => setHistoryTab(!historyTab)}
        >
          История отчётов
        </Button>
      </Box>

      {historyTab ? (
        // History Tab
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Сохранённые отчёты</Typography>
          <Divider sx={{ mb: 2 }} />
          {savedReports.length === 0 ? (
            <Alert severity="info">У вас пока нет сохранённых отчётов. Сгенерируйте и сохраните отчёт.</Alert>
          ) : (
            savedReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
              />
            ))
          )}
        </Paper>
      ) : (
        // Generate Reports Tab
        <>
          {/* Date Range Selector */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Период отчёта</Typography>
            <DateRangeSelector
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onStartChange={(val) => setDateRange({ ...dateRange, startDate: val })}
              onEndChange={(val) => setDateRange({ ...dateRange, endDate: val })}
              farms={myFarms}
              selectedFarm={selectedFarm}
              onFarmChange={setSelectedFarm}
              showFarmFilter={true}
            />
          </Paper>

          {/* Report Type Tabs */}
          <Paper sx={{ p: 3 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
              {reportTypes.map((type) => (
                <Tab key={type.value} icon={type.icon} label={type.label} />
              ))}
            </Tabs>

            {reportTypes.map((type) => (
              <TabPanel key={type.value} value={tabValue} index={type.value}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="h6">{type.label}</Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={type.handler}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Сформировать отчёт'}
                    </Button>
                    {type.data && (
                      <Button
                        variant="outlined"
                        startIcon={<Save />}
                        onClick={() => handleSaveReport(type.label === 'Финансовый отчёт' ? 'financial' : type.label === 'Отчёт по задачам' ? 'tasks' : 'crops', type.data)}
                        disabled={saving}
                      >
                        {saving ? 'Сохранение...' : 'Сохранить'}
                      </Button>
                    )}
                  </Box>
                </Box>

                {type.data ? (
                  <type.component data={type.data} />
                ) : (
                  <Alert severity="info">
                    Выберите период и нажмите "Сформировать отчёт"
                  </Alert>
                )}
              </TabPanel>
            ))}
          </Paper>
        </>
      )}
    </Container>
  );
}