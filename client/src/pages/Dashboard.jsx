import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Alert,
  Grid,
} from '@mui/material';
import {
  BookOnline,
  Agriculture,
  BarChart,
  Add,
} from '@mui/icons-material';
import BookingCard from '../components/BookingCard';
import FarmCardOwner from '../components/FarmCardOwner';
import StatCard from '../components/StatCard';
import AddFarmModal from '../components/AddFarmModal';
import StatsChart from '../components/StatsChart';
import {
  fetchMyBookings,
  fetchMyFarms,
  updateBookingStatus,
  createFarm,
  deleteFarm,
} from '../store/userSlice';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myBookings, myFarms, loading, updateLoading } = useSelector((state) => state.user);
  const [tabValue, setTabValue] = useState(0);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [stats, setStats] = useState({ totalBookings: 0, totalSpent: 0, totalFarms: 0, totalRevenue: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    dispatch(fetchMyBookings());
    if (user?.role === 'landowner' || user?.role === 'admin') {
      dispatch(fetchMyFarms());
    }
  }, [dispatch, user]);

  useEffect(() => {
    // Calculate statistics
    const approvedBookings = myBookings.filter(b => b.status === 'approved' || b.status === 'completed');
    setStats({
      totalBookings: myBookings.length,
      totalSpent: approvedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0),
      totalFarms: myFarms.length,
      totalRevenue: myFarms.reduce((sum, farm) => {
        const farmBookings = myBookings.filter(b => b.farm_id === farm.id && (b.status === 'approved' || b.status === 'completed'));
        return sum + farmBookings.reduce((s, b) => s + (b.total_price || 0), 0);
      }, 0),
    });

    // Generate chart data (mock for now)
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];
    setChartData(months.map((month, i) => ({
      month,
      count: Math.floor(Math.random() * 10),
      revenue: Math.floor(Math.random() * 100000),
    })));
  }, [myBookings, myFarms]);

  const handleApproveBooking = async (bookingId) => {
    await dispatch(updateBookingStatus({ bookingId, status: 'approved' }));
    dispatch(fetchMyBookings());
  };

  const handleRejectBooking = async (bookingId) => {
    await dispatch(updateBookingStatus({ bookingId, status: 'rejected' }));
    dispatch(fetchMyBookings());
  };

  const handleCreateFarm = async (farmData) => {
    await dispatch(createFarm(farmData));
    setAddModalOpen(false);
    dispatch(fetchMyFarms());
  };

  const handleDeleteFarm = async (farmId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту ферму?')) {
      await dispatch(deleteFarm(farmId));
    }
  };

  const isLandowner = user?.role === 'landowner' || user?.role === 'admin';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Личный кабинет
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Добро пожаловать, {user?.name}!
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Всего бронирований"
            value={stats.totalBookings}
            icon={<BookOnline sx={{ fontSize: 32 }} />}
            color="#2e7d32"
          />
        </Grid>
        {user?.role === 'farmer' ? (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Потрачено всего"
              value={`${stats.totalSpent.toLocaleString()} ₽`}
              icon={<BarChart sx={{ fontSize: 32 }} />}
              color="#ff8f00"
            />
          </Grid>
        ) : (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Мои фермы"
                value={stats.totalFarms}
                icon={<Agriculture sx={{ fontSize: 32 }} />}
                color="#1976d2"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Общий доход"
                value={`${stats.totalRevenue.toLocaleString()} ₽`}
                icon={<BarChart sx={{ fontSize: 32 }} />}
                color="#ff8f00"
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Мои бронирования" />
          {isLandowner && <Tab label="Мои фермы" />}
          <Tab label="Статистика" />
        </Tabs>
      </Box>

      {/* Bookings Tab */}
      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <Typography>Загрузка...</Typography>
        ) : myBookings.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            У вас пока нет бронирований. Перейдите на главную страницу, чтобы найти ферму.
          </Alert>
        ) : (
          myBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              showActions={isLandowner && booking.status === 'pending'}
              onApprove={handleApproveBooking}
              onReject={handleRejectBooking}
              isOwner={user?.role === 'farmer'}
            />
          ))
        )}
      </TabPanel>

      {/* Farms Tab (for landowner) */}
      {isLandowner && (
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddModalOpen(true)}
            >
              Добавить ферму
            </Button>
          </Box>

          {loading ? (
            <Typography>Загрузка...</Typography>
          ) : myFarms.length === 0 ? (
            <Alert severity="info">У вас пока нет зарегистрированных ферм. Добавьте первую!</Alert>
          ) : (
            myFarms.map((farm) => (
              <FarmCardOwner
                key={farm.id}
                farm={farm}
                onDelete={handleDeleteFarm}
              />
            ))
          )}
        </TabPanel>
      )}

      {/* Statistics Tab */}
      <TabPanel value={tabValue} index={isLandowner ? 2 : 1}>
        <StatsChart data={chartData} />
      </TabPanel>

      {/* Add Farm Modal */}
      <AddFarmModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleCreateFarm}
        loading={updateLoading}
      />
    </Container>
  );
}