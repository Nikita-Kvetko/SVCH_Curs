import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  TextField,
  IconButton,
  Avatar,
  Rating,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
  Chip,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import GrassIcon from '@mui/icons-material/Grass';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import HarvestIcon from '@mui/icons-material/Agriculture';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';

export default function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const features = [
    { icon: <GrassIcon sx={{ fontSize: 40 }} />, title: 'Поиск ферм', description: 'Найдите идеальное место для ведения сельского хозяйства с удобными фильтрами' },
    { icon: <WaterDropIcon sx={{ fontSize: 40 }} />, title: 'Управление задачами', description: 'Планируйте посадки, полив и сбор урожая с системой напоминаний' },
    { icon: <HarvestIcon sx={{ fontSize: 40 }} />, title: 'Отчёты и аналитика', description: 'Анализируйте урожайность и финансовые показатели' },
    { icon: <SecurityIcon sx={{ fontSize: 40 }} />, title: 'Безопасные платежи', description: 'Все транзакции защищены и проходят через платформу' },
    { icon: <SupportAgentIcon sx={{ fontSize: 40 }} />, title: 'Поддержка 24/7', description: 'Наша команда всегда готова помочь вам' },
    { icon: <TrendingUpIcon sx={{ fontSize: 40 }} />, title: 'Рост урожайности', description: 'Повышайте эффективность с нашими инструментами' },
  ];

  const testimonials = [
    { name: 'Иван Петров', role: 'Владелец земли', rating: 5, text: 'Платформа помогла мне сдать свои участки в аренду. Теперь земля приносит стабильный доход!', avatar: 'И' },
    { name: 'Екатерина Смирнова', role: 'Фермер', rating: 5, text: 'Нашла идеальное поле для выращивания овощей. Система задач очень помогает в планировании работ.', avatar: 'Е' },
    { name: 'Сергей Михайлов', role: 'Администратор фермы', rating: 4.5, text: 'Отличный инструмент для управления бронированиями и общения с арендаторами.', avatar: 'С' },
  ];

  const stats = [
    { value: '500+', label: 'Активных ферм' },
    { value: '1000+', label: 'Довольных фермеров' },
    { value: '95%', label: 'Заполняемость' },
    { value: '24/7', label: 'Поддержка' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Спасибо! Мы свяжемся с вами в ближайшее время.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      {/* Hero Section */}
      <Box sx={{ bgcolor: '#1b5e20', color: 'white', minHeight: '90vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="overline" sx={{ color: '#ff8f00', letterSpacing: 2, fontWeight: 500 }}>
                Добро пожаловать в AGRI COWORKING
              </Typography>
              <Typography variant={isMobile ? 'h4' : 'h2'} component="h1" sx={{ fontWeight: 'bold', mt: 2, mb: 2 }}>
                Управляйте своими <br />
                <Typography component="span" variant={isMobile ? 'h4' : 'h2'} sx={{ color: '#ff8f00', fontWeight: 'bold' }}>
                  фермами
                </Typography>
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, maxWidth: '90%' }}>
                Платформа для аренды и управления сельскохозяйственными участками.
                Найдите идеальную ферму, планируйте работы и отслеживайте урожайность.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ bgcolor: '#ff8f00', '&:hover': { bgcolor: '#e67e00' }, px: 4 }}
                  onClick={() => navigate('/register')}
                >
                  Начать сейчас
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: '#ff8f00', color: '#ff8f00' }, px: 4 }}
                  onClick={() => navigate('/login')}
                >
                  Войти
                </Button>
              </Box>
              
              {/* Статистика */}
              <Box sx={{ display: 'flex', gap: 3, mt: 5, flexWrap: 'wrap' }}>
                {stats.map((stat, idx) => (
                  <Box key={idx}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff8f00' }}>{stat.value}</Typography>
                    <Typography variant="body2">{stat.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', display: { xs: 'none', md: 'block' } }}>
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600"
                  alt="Farming"
                  style={{ width: '100%', borderRadius: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                />
                <Box sx={{ position: 'absolute', bottom: -20, left: -20, bgcolor: '#ff8f00', p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>+35% урожайности</Typography>
                  <Typography variant="caption">с нашей платформой</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Преимущества */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" sx={{ color: '#ff8f00', fontWeight: 600 }}>Почему выбирают нас</Typography>
          <Typography variant={isMobile ? 'h5' : 'h3'} sx={{ fontWeight: 'bold', mt: 1 }}>
            Ваш надёжный партнёр в агробизнесе
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: 700, mx: 'auto' }}>
            Мы предоставляем все необходимые инструменты для эффективного управления фермами
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {features.map((feature, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-8px)', boxShadow: 8 } }}>
                <Box sx={{ color: '#2e7d32', mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom>{feature.title}</Typography>
                <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Как это работает */}
      <Box sx={{ bgcolor: '#f5f5f5', py: 8 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="overline" sx={{ color: '#ff8f00', fontWeight: 600 }}>Простой процесс</Typography>
            <Typography variant={isMobile ? 'h5' : 'h3'} sx={{ fontWeight: 'bold', mt: 1 }}>
              Как начать работу?
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {[
              { step: '01', title: 'Регистрация', desc: 'Создайте аккаунт за 2 минуты', icon: '📝' },
              { step: '02', title: 'Выбор фермы', desc: 'Найдите подходящий участок с фильтрами', icon: '🔍' },
              { step: '03', title: 'Бронирование', desc: 'Забронируйте и оплатите онлайн', icon: '📅' },
              { step: '04', title: 'Управление', desc: 'Планируйте работы и отслеживайте урожай', icon: '🌾' },
            ].map((item, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <Typography variant="h2" sx={{ color: '#e8f5e9', fontWeight: 'bold', mb: 1 }}>{item.step}</Typography>
                  <Typography variant="h3" sx={{ fontSize: 40, mb: 2 }}>{item.icon}</Typography>
                  <Typography variant="h6" gutterBottom>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Отзывы */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" sx={{ color: '#ff8f00', fontWeight: 600 }}>Отзывы клиентов</Typography>
          <Typography variant={isMobile ? 'h5' : 'h3'} sx={{ fontWeight: 'bold', mt: 1 }}>
            Что говорят о нас
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {testimonials.map((testimonial, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#2e7d32', mr: 2 }}>{testimonial.avatar}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">{testimonial.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{testimonial.role}</Typography>
                  </Box>
                </Box>
                <Rating value={testimonial.rating} readOnly precision={0.5} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">"{testimonial.text}"</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Призыв к действию */}
      <Box sx={{ bgcolor: '#1b5e20', color: 'white', py: 6 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 'bold', mb: 2 }}>
            Готовы начать?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Присоединяйтесь к сообществу фермеров и владельцев земли уже сегодня
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ bgcolor: '#ff8f00', '&:hover': { bgcolor: '#e67e00' }, px: 6 }}
            onClick={() => navigate('/register')}
          >
            Зарегистрироваться
            <ArrowForwardIcon sx={{ ml: 1 }} />
          </Button>
        </Container>
      </Box>

      {/* Контакты */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Свяжитесь с нами</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <PhoneIcon color="primary" />
              <Typography>+7 (999) 123-45-67</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <EmailIcon color="primary" />
              <Typography>info@agricoworking.ru</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <LocationOnIcon color="primary" />
              <Typography>г. Москва, ул. Сельскохозяйственная, 15</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <IconButton sx={{ bgcolor: '#e8f5e9' }}><FacebookIcon /></IconButton>
              <IconButton sx={{ bgcolor: '#e8f5e9' }}><InstagramIcon /></IconButton>
              <IconButton sx={{ bgcolor: '#e8f5e9' }}><TelegramIcon /></IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Остались вопросы?</Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Ваше имя"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Сообщение"
                  multiline
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  margin="normal"
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2, bgcolor: '#2e7d32' }}
                >
                  Отправить
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Typography variant="body2" color="text.secondary" textAlign="center">
          © 2024 AGRI COWORKING. Все права защищены.
        </Typography>
      </Container>
    </Box>
  );
}