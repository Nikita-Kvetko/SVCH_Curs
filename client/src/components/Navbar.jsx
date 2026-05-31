import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, Avatar, Menu, MenuItem, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import ChatIcon from '@mui/icons-material/Chat';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TaskIcon from '@mui/icons-material/Task';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import MenuIcon from '@mui/icons-material/Menu';
import StorefrontIcon from '@mui/icons-material/Storefront';

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  // Кнопки навигации для десктопа
  const NavButtons = () => (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
      <Button color="inherit" onClick={() => navigate('/farms')} startIcon={<StorefrontIcon />}>
        Фермы
      </Button>
      <Button color="inherit" onClick={() => navigate('/dashboard')} startIcon={<DashboardIcon />}>
        Кабинет
      </Button>
      <Button color="inherit" onClick={() => navigate('/tasks')} startIcon={<TaskIcon />}>
        Задачи
      </Button>
      <Button color="inherit" onClick={() => navigate('/reports')} startIcon={<AssessmentIcon />}>
        Отчёты
      </Button>
      <Button color="inherit" onClick={() => navigate('/bookings')} startIcon={<EventAvailableIcon />}>
        Бронирования
      </Button>
      <Button color="inherit" onClick={() => navigate('/chat')} startIcon={<ChatIcon />}>
        Чат
      </Button>
      {user?.role === 'admin' && (
        <Button color="inherit" onClick={() => navigate('/admin')} startIcon={<AdminPanelSettingsIcon />}>
          Админ
        </Button>
      )}
    </Box>
  );

  // Мобильное меню
  const MobileMenu = () => (
    <Menu
      anchorEl={mobileMenuAnchor}
      open={Boolean(mobileMenuAnchor)}
      onClose={() => setMobileMenuAnchor(null)}
      sx={{ display: { xs: 'block', md: 'none' } }}
    >
      <MenuItem onClick={() => handleNavigate('/farms')}>Фермы</MenuItem>
      <MenuItem onClick={() => handleNavigate('/dashboard')}>Личный кабинет</MenuItem>
      <MenuItem onClick={() => handleNavigate('/tasks')}>Задачи</MenuItem>
      <MenuItem onClick={() => handleNavigate('/reports')}>Отчёты</MenuItem>
      <MenuItem onClick={() => handleNavigate('/bookings')}>Бронирования</MenuItem>
      <MenuItem onClick={() => handleNavigate('/chat')}>Чат</MenuItem>
      {user?.role === 'admin' && (
        <MenuItem onClick={() => handleNavigate('/admin')}>Админ панель</MenuItem>
      )}
      <MenuItem onClick={handleLogout}>Выйти</MenuItem>
    </Menu>
  );

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#2e7d32' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Логотип десктоп */}
          <AgricultureIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            AGRI COWORKING
          </Typography>

          {/* Логотип мобильный */}
          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'none' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            AGRI
          </Typography>

          {/* Десктопные кнопки навигации */}
          {user && <NavButtons />}

          <Box sx={{ flexGrow: 1 }} />

          {/* Аватар и меню пользователя */}
          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <>
                {/* Кнопка меню для мобильных */}
                <IconButton
                  color="inherit"
                  onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
                  sx={{ display: { xs: 'inline-flex', md: 'none' }, mr: 1 }}
                >
                  <MenuIcon />
                </IconButton>
                
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
                  <Avatar alt={user.name} src={user.avatar_url} sx={{ bgcolor: '#1b5e20' }}>
                    {user.name?.[0]?.toUpperCase()}
                  </Avatar>
                </IconButton>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem onClick={() => handleNavigate('/farms')}>
                    <StorefrontIcon fontSize="small" sx={{ mr: 1 }} /> Фермы
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigate('/dashboard')}>
                    <DashboardIcon fontSize="small" sx={{ mr: 1 }} /> Личный кабинет
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigate('/tasks')}>
                    <TaskIcon fontSize="small" sx={{ mr: 1 }} /> Задачи
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigate('/reports')}>
                    <AssessmentIcon fontSize="small" sx={{ mr: 1 }} /> Отчёты
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigate('/bookings')}>
                    <EventAvailableIcon fontSize="small" sx={{ mr: 1 }} /> Бронирования
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigate('/chat')}>
                    <ChatIcon fontSize="small" sx={{ mr: 1 }} /> Чат
                  </MenuItem>
                  {user?.role === 'admin' && (
                    <MenuItem onClick={() => handleNavigate('/admin')}>
                      <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 1 }} /> Админ панель
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
                    Выйти
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button color="inherit" onClick={() => navigate('/login')}>
                Войти
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
      
      {/* Мобильное меню */}
      <MobileMenu />
    </AppBar>
  );
}