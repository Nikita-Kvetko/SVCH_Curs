import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Paper,
  Slider,
  Button,
  Chip,
  CircularProgress,
  CardMedia,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Rating,
  Fab,
  Badge,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BarChartIcon from '@mui/icons-material/BarChart';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import GrassIcon from '@mui/icons-material/Grass';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BoltIcon from '@mui/icons-material/Bolt';
import SearchIcon from '@mui/icons-material/Search';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

export default function Farms() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [yieldData, setYieldData] = useState(null);
  const [expandedAccordion, setExpandedAccordion] = useState(false);

  // Отдельное состояние для поля поиска (мгновенное обновление)
  const [searchInput, setSearchInput] = useState('');
  
  // Основные фильтры
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'price_asc',
    priceRange: [0, 100000],
    areaRange: [0, 100],
    soilType: '',
    waterAccess: false,
    electricity: false,
    cropType: '',
    minRating: 0,
  });

  // Типы культур для фильтрации
  const cropTypes = [
    'Зерновые',
    'Овощи',
    'Фрукты',
    'Ягоды',
    'Зелень',
    'Технические культуры',
    'Кормовые культуры',
  ];

  const soilTypes = ['Чернозем', 'Глинистый', 'Песчаный', 'Суглинок', 'Торфяной'];

  // Debounce таймер
  const debounceTimeout = useRef(null);

  // Загрузка избранного из localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteFarms');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Загрузка сохранённых фильтров
  useEffect(() => {
    const saved = localStorage.getItem('farmsFilters');
    if (saved) {
      const parsed = JSON.parse(saved);
      setFilters(parsed);
      setSearchInput(parsed.search || '');
    }
  }, []);

  // Debounce для поиска
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 500);
    
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchInput]);

  // Сохранение фильтров в localStorage (кроме searchInput)
  useEffect(() => {
    const { search, ...filtersToSave } = filters;
    localStorage.setItem('farmsFilters', JSON.stringify(filters));
  }, [filters]);

  // Сохранение избранного
  useEffect(() => {
    localStorage.setItem('favoriteFarms', JSON.stringify(favorites));
  }, [favorites]);

  // Загрузка ферм при изменении фильтров
  useEffect(() => {
    fetchFarms();
  }, [filters]);

  const fetchFarms = async () => {
    setLoading(true);
    try {
      const params = {
        search: filters.search,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
        minArea: filters.areaRange[0],
        maxArea: filters.areaRange[1],
        soilType: filters.soilType,
        waterAccess: filters.waterAccess,
        electricity: filters.electricity,
        minRating: filters.minRating,
        sortBy: filters.sortBy,
      };
      const response = await axios.get('/farms', { params });
      setFarms(response.data);
    } catch (error) {
      console.error('Error fetching farms:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchInput('');
    setFilters({
      search: '',
      sortBy: 'price_asc',
      priceRange: [0, 100000],
      areaRange: [0, 100],
      soilType: '',
      waterAccess: false,
      electricity: false,
      cropType: '',
      minRating: 0,
    });
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const toggleFavorite = (farmId, e) => {
    e.stopPropagation();
    if (favorites.includes(farmId)) {
      setFavorites(favorites.filter(id => id !== farmId));
    } else {
      setFavorites([...favorites, farmId]);
    }
  };

  const showYieldStats = (farm, e) => {
    e.stopPropagation();
    setYieldData({
      farmName: farm.name,
      crops: [
        { name: 'Пшеница', yield: 42, target: 50, area: 2.5 },
        { name: 'Кукуруза', yield: 68, target: 70, area: 1.8 },
        { name: 'Подсолнечник', yield: 25, target: 30, area: 1.2 },
        { name: 'Ячмень', yield: 38, target: 45, area: 2.0 },
      ],
    });
    setStatsDialogOpen(true);
  };

  const getYieldChartData = () => {
    if (!yieldData) return null;
    return {
      labels: yieldData.crops.map(c => c.name),
      datasets: [
        {
          label: 'Фактическая урожайность (ц/га)',
          data: yieldData.crops.map(c => c.yield),
          backgroundColor: '#2e7d32',
          borderRadius: 8,
        },
        {
          label: 'Плановая урожайность (ц/га)',
          data: yieldData.crops.map(c => c.target),
          backgroundColor: '#ff8f00',
          borderRadius: 8,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: { title: { display: true, text: 'Урожайность (ц/га)' } },
    },
  };

  const activeFiltersCount = [
    filters.search,
    filters.soilType,
    filters.cropType,
    filters.waterAccess,
    filters.electricity,
    filters.minRating > 0,
    filters.priceRange[0] > 0,
    filters.priceRange[1] < 100000,
    filters.areaRange[0] > 0,
    filters.areaRange[1] < 100,
  ].filter(Boolean).length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Доступные фермы
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Найдите идеальное место для ведения сельского хозяйства
      </Typography>

      {/* Фильтры - аккордеон для мобильных устройств */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
        <Accordion expanded={expandedAccordion} onChange={() => setExpandedAccordion(!expandedAccordion)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>Фильтры</Typography>
              {activeFiltersCount > 0 && (
                <Chip label={activeFiltersCount} size="small" color="primary" />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <FilterContent
              filters={filters}
              setFilters={setFilters}
              soilTypes={soilTypes}
              cropTypes={cropTypes}
              resetFilters={resetFilters}
              searchInput={searchInput}
              handleSearchChange={handleSearchChange}
            />
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Фильтры - для десктопа */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, mb: 4 }}>
        <FilterContent
          filters={filters}
          setFilters={setFilters}
          soilTypes={soilTypes}
          cropTypes={cropTypes}
          resetFilters={resetFilters}
          searchInput={searchInput}
          handleSearchChange={handleSearchChange}
        />
      </Box>

      {/* Активные фильтры (чипсы) */}
      {activeFiltersCount > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center' }}>
            Активные фильтры:
          </Typography>
          {filters.search && (
            <Chip label={`Поиск: ${filters.search}`} size="small" onDelete={() => {
              setSearchInput('');
              setFilters({ ...filters, search: '' });
            }} />
          )}
          {filters.soilType && (
            <Chip label={`Почва: ${filters.soilType}`} size="small" onDelete={() => setFilters({ ...filters, soilType: '' })} />
          )}
          {filters.cropType && (
            <Chip label={`Культура: ${filters.cropType}`} size="small" onDelete={() => setFilters({ ...filters, cropType: '' })} />
          )}
          {filters.waterAccess && (
            <Chip label="Водоснабжение" size="small" onDelete={() => setFilters({ ...filters, waterAccess: false })} />
          )}
          {filters.electricity && (
            <Chip label="Электричество" size="small" onDelete={() => setFilters({ ...filters, electricity: false })} />
          )}
          {filters.minRating > 0 && (
            <Chip label={`Рейтинг ≥ ${filters.minRating}`} size="small" onDelete={() => setFilters({ ...filters, minRating: 0 })} />
          )}
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) && (
            <Chip label={`Цена: ${filters.priceRange[0]} - ${filters.priceRange[1]} ₽`} size="small" onDelete={() => setFilters({ ...filters, priceRange: [0, 100000] })} />
          )}
          {(filters.areaRange[0] > 0 || filters.areaRange[1] < 100) && (
            <Chip label={`Площадь: ${filters.areaRange[0]} - ${filters.areaRange[1]} га`} size="small" onDelete={() => setFilters({ ...filters, areaRange: [0, 100] })} />
          )}
          <Chip label="Сбросить всё" size="small" color="primary" onClick={resetFilters} />
        </Box>
      )}

      {/* Список ферм */}
      <Grid container spacing={3}>
        {farms.map((farm) => (
          <Grid item key={farm.id} xs={12} sm={6} md={4} lg={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                position: 'relative',
              }}
              onClick={() => navigate(`/farm/${farm.id}`)}
            >
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'white' } }}
                onClick={(e) => toggleFavorite(farm.id, e)}
              >
                {favorites.includes(farm.id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>

              <CardMedia
                component="img"
                height="180"
                image={farm.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'}
                alt={farm.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2" noWrap>
                  {farm.name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {farm.location}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoneyIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body1" color="primary" fontWeight="bold">
                    {Number(farm.price_per_month).toLocaleString()} ₽/мес
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SquareFootIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {Number(farm.area_hectares).toLocaleString()} га
                  </Typography>
                </Box>

                {farm.rating > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={farm.rating} readOnly size="small" precision={0.5} />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      ({farm.total_reviews})
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {farm.water_access && (
                    <Tooltip title="Есть водоснабжение">
                      <WaterDropIcon fontSize="small" color="primary" />
                    </Tooltip>
                  )}
                  {farm.electricity && (
                    <Tooltip title="Есть электричество">
                      <BoltIcon fontSize="small" color="primary" />
                    </Tooltip>
                  )}
                  {farm.soil_type && (
                    <Chip label={farm.soil_type} size="small" variant="outlined" />
                  )}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 'auto' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/farm/${farm.id}`);
                  }}
                >
                  Подробнее
                </Button>

                <Button
                  variant="text"
                  size="small"
                  fullWidth
                  sx={{ mt: 1 }}
                  startIcon={<BarChartIcon />}
                  onClick={(e) => showYieldStats(farm, e)}
                >
                  График урожайности
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {farms.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">Фермы не найдены</Typography>
          <Typography variant="body2" color="text.secondary">
            Попробуйте изменить параметры фильтрации
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={resetFilters}>
            Сбросить все фильтры
          </Button>
        </Paper>
      )}

      {/* Диалог с графиком урожайности */}
      <Dialog open={statsDialogOpen} onClose={() => setStatsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Прогноз урожайности</Typography>
            <IconButton onClick={() => setStatsDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {yieldData && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                {yieldData.farmName}
              </Typography>
              <Box sx={{ height: 300, mb: 3 }}>
                <Bar data={getYieldChartData()} options={chartOptions} />
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Детализация по культурам
              </Typography>
              <Grid container spacing={2}>
                {yieldData.crops.map((crop, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Paper sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">
                          <GrassIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                          {crop.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Площадь: {crop.area} га
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption">Фактическая урожайность</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(crop.yield / crop.target) * 100}
                            sx={{ height: 10, borderRadius: 5 }}
                            color="success"
                          />
                        </Box>
                        <Typography variant="body2">
                          {crop.yield} / {crop.target} ц/га
                        </Typography>
                      </Box>
                      <Typography variant="caption" color={crop.yield >= crop.target ? 'success.main' : 'warning.main'}>
                        {crop.yield >= crop.target
                          ? `✅ План перевыполнен на ${((crop.yield / crop.target - 1) * 100).toFixed(0)}%`
                          : `⚠️ Отставание от плана: ${((1 - crop.yield / crop.target) * 100).toFixed(0)}%`}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

// Компонент фильтров (вынесен для переиспользования)
function FilterContent({ filters, setFilters, soilTypes, cropTypes, resetFilters, searchInput, handleSearchChange }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Фильтры</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Поиск по названию"
            value={searchInput !== undefined ? searchInput : filters.search}
            onChange={handleSearchChange || ((e) => setFilters({ ...filters, search: e.target.value }))}
            size="small"
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            placeholder="Введите название фермы..."
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Сортировка</InputLabel>
            <Select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              label="Сортировка"
            >
              <MenuItem value="price_asc">Цена: по возрастанию</MenuItem>
              <MenuItem value="price_desc">Цена: по убыванию</MenuItem>
              <MenuItem value="area_asc">Площадь: по возрастанию</MenuItem>
              <MenuItem value="area_desc">Площадь: по убыванию</MenuItem>
              <MenuItem value="rating">По рейтингу</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Тип почвы</InputLabel>
            <Select
              value={filters.soilType}
              onChange={(e) => setFilters({ ...filters, soilType: e.target.value })}
              label="Тип почвы"
            >
              <MenuItem value="">Все</MenuItem>
              {soilTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Рекомендуемая культура</InputLabel>
            <Select
              value={filters.cropType}
              onChange={(e) => setFilters({ ...filters, cropType: e.target.value })}
              label="Рекомендуемая культура"
            >
              <MenuItem value="">Все</MenuItem>
              {cropTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Typography gutterBottom variant="body2">
            Минимальный рейтинг: {filters.minRating} ★
          </Typography>
          <Slider
            value={filters.minRating}
            onChange={(e, v) => setFilters({ ...filters, minRating: v })}
            min={0}
            max={5}
            step={0.5}
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Цена (₽/мес): {filters.priceRange[0].toLocaleString()} - {filters.priceRange[1].toLocaleString()} ₽</Typography>
          <Slider
            value={filters.priceRange}
            onChange={(e, v) => setFilters({ ...filters, priceRange: v })}
            min={0}
            max={100000}
            step={5000}
            valueLabelDisplay="auto"
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Площадь (га): {filters.areaRange[0]} - {filters.areaRange[1]} га</Typography>
          <Slider
            value={filters.areaRange}
            onChange={(e, v) => setFilters({ ...filters, areaRange: v })}
            min={0}
            max={100}
            step={5}
            valueLabelDisplay="auto"
            size="small"
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.waterAccess}
                  onChange={(e) => setFilters({ ...filters, waterAccess: e.target.checked })}
                  size="small"
                />
              }
              label="Водоснабжение"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={filters.electricity}
                  onChange={(e) => setFilters({ ...filters, electricity: e.target.checked })}
                  size="small"
                />
              }
              label="Электричество"
            />
            <Button variant="outlined" onClick={resetFilters} size="small">
              Сбросить фильтры
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}