import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, CircularProgress, TextField, InputAdornment, IconButton, Alert, Snackbar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import GrainIcon from '@mui/icons-material/Grain';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import OpacityIcon from '@mui/icons-material/Opacity';
import AirIcon from '@mui/icons-material/Air';

// Для использования реального API:
// 1. Зарегистрируйтесь на https://home.openweathermap.org/users/sign_up
// 2. Получите API ключ
// 3. Создайте файл .env в папке client и добавьте:
//    VITE_WEATHER_API_KEY=ваш_ключ
// 4. Перезапустите приложение
const API_KEY = import.meta.env?.VITE_WEATHER_API_KEY || '';
const USE_MOCK = !API_KEY || API_KEY === 'YOUR_OPENWEATHER_API_KEY';

export default function WeatherWidget({ location }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState(location || 'Москва');
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchWeather(searchLocation);
  }, []);

  const showMessage = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchWeather = async (city) => {
    setLoading(true);
    setError(null);
    
    if (!city.trim()) {
      setError('Введите название города');
      setLoading(false);
      return;
    }

    try {
      if (USE_MOCK) {
        // Моковые данные для демонстрации (работают без API ключа)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockData = {
          'Москва': { temp: 18, feelsLike: 16, humidity: 65, windSpeed: 3.5, description: 'Облачно с прояснениями', icon: '03d' },
          'Санкт-Петербург': { temp: 15, feelsLike: 13, humidity: 75, windSpeed: 5.0, description: 'Пасмурно', icon: '04d' },
          'Краснодар': { temp: 25, feelsLike: 24, humidity: 55, windSpeed: 2.5, description: 'Солнечно', icon: '01d' },
          'Новосибирск': { temp: 10, feelsLike: 8, humidity: 70, windSpeed: 4.0, description: 'Небольшой дождь', icon: '10d' },
        };
        
        const data = mockData[city] || mockData['Москва'];
        setWeather({
          temp: data.temp,
          feelsLike: data.feelsLike,
          humidity: data.humidity,
          windSpeed: data.windSpeed,
          description: data.description,
          icon: data.icon,
          city: city,
        });
        
        if (USE_MOCK) {
          showMessage('Используются демо-данные погоды. Для реального прогноза добавьте API ключ OpenWeather', 'info');
        }
      } else {
        // Реальный API запрос
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}&lang=ru`
        );
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Неверный API ключ');
          } else if (response.status === 404) {
            throw new Error('Город не найден');
          } else {
            throw new Error('Ошибка сервера');
          }
        }
        
        const data = await response.json();
        
        setWeather({
          temp: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          city: data.name,
        });
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err.message || 'Ошибка загрузки погоды');
      showMessage(err.message || 'Ошибка загрузки погоды', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchLocation.trim()) {
      fetchWeather(searchLocation);
    } else {
      setError('Введите название города');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getWeatherIcon = (iconCode) => {
    if (!iconCode) return <WbSunnyIcon sx={{ fontSize: 48 }} />;
    
    // OpenWeather иконки: 01d, 01n, 02d, 03d, 04d, 09d, 10d, 11d, 13d, 50d
    if (iconCode.includes('01')) return <WbSunnyIcon sx={{ fontSize: 48, color: '#ff9800' }} />;
    if (iconCode.includes('02')) return <WbSunnyIcon sx={{ fontSize: 48, color: '#ffc107' }} />;
    if (iconCode.includes('03') || iconCode.includes('04')) return <CloudIcon sx={{ fontSize: 48, color: '#78909c' }} />;
    if (iconCode.includes('09') || iconCode.includes('10')) return <GrainIcon sx={{ fontSize: 48, color: '#42a5f5' }} />;
    if (iconCode.includes('11')) return <ThunderstormIcon sx={{ fontSize: 48, color: '#ff5722' }} />;
    if (iconCode.includes('13')) return <AcUnitIcon sx={{ fontSize: 48, color: '#90caf9' }} />;
    if (iconCode.includes('50')) return <CloudIcon sx={{ fontSize: 48, color: '#9e9e9e' }} />;
    
    return <WbSunnyIcon sx={{ fontSize: 48 }} />;
  };

  const getRecommendation = () => {
    if (!weather) return '';
    
    const recommendations = [];
    
    if (weather.temp < 0) {
      recommendations.push('❄️ Сильный мороз. Работы на открытом воздухе не рекомендуются.');
    } else if (weather.temp < 5) {
      recommendations.push('❄️ Температура низкая. Рекомендуется отложить посадки.');
    } else if (weather.temp > 30) {
      recommendations.push('☀️ Сильная жара. Полив рекомендуется утром или вечером.');
    } else if (weather.temp > 25) {
      recommendations.push('🌡️ Жаркая погода. Обеспечьте достаточный полив.');
    }
    
    if (weather.humidity > 80) {
      recommendations.push('💧 Высокая влажность. Риск грибковых заболеваний.');
    } else if (weather.humidity < 30) {
      recommendations.push('🏜️ Низкая влажность. Увеличьте частоту полива.');
    }
    
    if (weather.windSpeed > 15) {
      recommendations.push('💨 Очень сильный ветер. Защитите посевы и теплицы.');
    } else if (weather.windSpeed > 10) {
      recommendations.push('💨 Сильный ветер. Защитите молодые растения.');
    }
    
    if (weather.description?.toLowerCase().includes('дождь')) {
      recommendations.push('🌧️ Ожидается дождь. Отложите работы по внесению удобрений.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('🌱 Благоприятные условия для сельскохозяйственных работ.');
    }
    
    return recommendations.join(' ');
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress size={40} />
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WbSunnyIcon sx={{ color: '#ff9800' }} />
            Прогноз погоды
          </Typography>
          <TextField
            size="small"
            placeholder="Введите город"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleSearch} aria-label="Поиск">
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ width: 160 }}
          />
        </Box>

        {error ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography color="error" gutterBottom>{error}</Typography>
            <Typography variant="caption" color="text.secondary">
              Попробуйте ввести другой город или проверьте подключение к интернету
            </Typography>
          </Box>
        ) : weather ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                {getWeatherIcon(weather.icon)}
                <Typography variant="h2" sx={{ fontWeight: 'bold', fontSize: { xs: '2rem', sm: '3rem' } }}>
                  {weather.temp}°C
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {weather.description}
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1, minWidth: 150 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {weather.city}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <OpacityIcon fontSize="small" color="primary" />
                    <Typography variant="body2">Влажность: {weather.humidity}%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AirIcon fontSize="small" color="primary" />
                    <Typography variant="body2">Ветер: {weather.windSpeed} м/с</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Ощущается как {weather.feelsLike}°C
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e8f5e9', borderRadius: 2 }}>
              <Typography variant="body2" color="primary.main" sx={{ lineHeight: 1.5 }}>
                {getRecommendation()}
              </Typography>
            </Box>
          </>
        ) : null}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}