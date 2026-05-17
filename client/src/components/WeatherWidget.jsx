import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, CircularProgress, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import GrainIcon from '@mui/icons-material/Grain';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import OpacityIcon from '@mui/icons-material/Opacity';
import AirIcon from '@mui/icons-material/Air';

const API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // Замените на свой ключ

export default function WeatherWidget({ location }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState(location || 'Москва');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather(searchLocation);
  }, [searchLocation]);

  const fetchWeather = async (city) => {
    setLoading(true);
    setError(null);
    try {
      // Если нет API ключа, используем моковые данные
      if (!API_KEY || API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
        // Моковые данные для демонстрации
        setTimeout(() => {
          setWeather({
            temp: 22,
            feelsLike: 20,
            humidity: 65,
            windSpeed: 3.5,
            description: 'Облачно с прояснениями',
            icon: 'cloud',
            city: city,
          });
          setLoading(false);
        }, 500);
        return;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}&lang=ru`
      );
      const data = await response.json();
      if (data.cod === 200) {
        setWeather({
          temp: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          city: data.name,
        });
      } else {
        setError('Город не найден');
      }
    } catch (err) {
      setError('Ошибка загрузки погоды');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconCode) => {
    if (!iconCode) return <WbSunnyIcon sx={{ fontSize: 48 }} />;
    if (iconCode.includes('01') || iconCode.includes('02')) return <WbSunnyIcon sx={{ fontSize: 48, color: '#ff9800' }} />;
    if (iconCode.includes('03') || iconCode.includes('04')) return <CloudIcon sx={{ fontSize: 48, color: '#78909c' }} />;
    if (iconCode.includes('09') || iconCode.includes('10')) return <GrainIcon sx={{ fontSize: 48, color: '#42a5f5' }} />;
    if (iconCode.includes('11')) return <ThunderstormIcon sx={{ fontSize: 48, color: '#ff5722' }} />;
    if (iconCode.includes('13')) return <AcUnitIcon sx={{ fontSize: 48, color: '#90caf9' }} />;
    return <WbSunnyIcon sx={{ fontSize: 48 }} />;
  };

  const getRecommendation = () => {
    if (!weather) return '';
    if (weather.temp < 5) return '❄️ Температура низкая. Рекомендуется отложить посадки.';
    if (weather.temp > 30) return '☀️ Сильная жара. Полив рекомендуется утром или вечером.';
    if (weather.humidity > 80) return '💧 Высокая влажность. Риск грибковых заболеваний.';
    if (weather.windSpeed > 10) return '💨 Сильный ветер. Защитите посевы.';
    return '🌱 Благоприятные условия для сельскохозяйственных работ.';
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress size={40} />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Прогноз погоды</Typography>
        <TextField
          size="small"
          placeholder="Введите город"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => fetchWeather(searchLocation)}>
                  <SearchIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ width: 150 }}
        />
      </Box>

      {error ? (
        <Typography color="error" textAlign="center">{error}</Typography>
      ) : weather ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              {getWeatherIcon(weather.icon)}
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {weather.temp}°C
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {weather.description}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1">{weather.city}</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <OpacityIcon fontSize="small" color="primary" />
                  <Typography variant="body2">Влажность: {weather.humidity}%</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AirIcon fontSize="small" color="primary" />
                  <Typography variant="body2">Ветер: {weather.windSpeed} м/с</Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Ощущается как {weather.feelsLike}°C
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e8f5e9', borderRadius: 2 }}>
            <Typography variant="body2" color="primary.main">
              {getRecommendation()}
            </Typography>
          </Box>
        </>
      ) : null}
    </Paper>
  );
}