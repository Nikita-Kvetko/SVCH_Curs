import React, { useEffect } from 'react';
import {
  Container,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Paper,
  Slider,
  FormControlLabel,
  Switch,
  Button,
  Chip,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import FarmCard from '../components/FarmCard';
import Loader from '../components/Loader';
import {
  fetchFarms,
  setSearch,
  setSortBy,
  setPriceRange,
  setAreaRange,
  setSoilType,
  setWaterAccess,
  resetFilters,
} from '../store/farmsSlice';

export default function Farms() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  const { list, loading, error, filters } = useSelector((state) => state.farms);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const params = {
      search: filters.search,
      minPrice: filters.priceRange[0],
      maxPrice: filters.priceRange[1],
      minArea: filters.areaRange[0],
      maxArea: filters.areaRange[1],
      soilType: filters.soilType,
      waterAccess: filters.waterAccess,
      sortBy: filters.sortBy,
    };
    dispatch(fetchFarms(params));
  }, [dispatch, filters]);

  const soilTypes = ['Чернозем', 'Глинистый', 'Песчаный', 'Суглинок', 'Торфяной'];

  const FilterContent = () => (
    <Box sx={{ p: 2, width: isMobile ? '280px' : 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Фильтры</Typography>
        {isMobile && (
          <IconButton onClick={() => setMobileFiltersOpen(false)}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Сортировка</InputLabel>
        <Select value={filters.sortBy} onChange={(e) => dispatch(setSortBy(e.target.value))} label="Сортировка">
          <MenuItem value="price_asc">Цена: по возрастанию</MenuItem>
          <MenuItem value="price_desc">Цена: по убыванию</MenuItem>
          <MenuItem value="area_asc">Площадь: по возрастанию</MenuItem>
          <MenuItem value="area_desc">Площадь: по убыванию</MenuItem>
          <MenuItem value="rating">По рейтингу</MenuItem>
        </Select>
      </FormControl>

      <Typography gutterBottom>Цена (₽/мес): {filters.priceRange[0]} - {filters.priceRange[1]}</Typography>
      <Slider
        value={filters.priceRange}
        onChange={(e, v) => dispatch(setPriceRange(v))}
        min={0}
        max={100000}
        step={1000}
        valueLabelDisplay="auto"
        sx={{ mb: 2 }}
      />

      <Typography gutterBottom>Площадь (га): {filters.areaRange[0]} - {filters.areaRange[1]}</Typography>
      <Slider
        value={filters.areaRange}
        onChange={(e, v) => dispatch(setAreaRange(v))}
        min={0}
        max={100}
        step={1}
        valueLabelDisplay="auto"
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Тип почвы</InputLabel>
        <Select
          value={filters.soilType}
          onChange={(e) => dispatch(setSoilType(e.target.value))}
          label="Тип почвы"
        >
          <MenuItem value="">Все</MenuItem>
          {soilTypes.map((type) => (
            <MenuItem key={type} value={type}>{type}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControlLabel
        control={
          <Switch
            checked={filters.waterAccess}
            onChange={(e) => dispatch(setWaterAccess(e.target.checked))}
          />
        }
        label="Наличие водоснабжения"
        sx={{ mb: 2, display: 'block' }}
      />

      <Button variant="outlined" fullWidth onClick={() => dispatch(resetFilters())}>
        Сбросить все фильтры
      </Button>
    </Box>
  );

  if (loading) return <Loader />;
  if (error) return <Typography color="error">Ошибка: {error}</Typography>;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">
          Доступные фермы
        </Typography>
        {isMobile && (
          <Button startIcon={<FilterListIcon />} onClick={() => setMobileFiltersOpen(true)}>
            Фильтры
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Desktop filters - sidebar */}
        {!isMobile && (
          <Paper sx={{ width: 300, p: 2, height: 'fit-content', position: 'sticky', top: 80 }}>
            <FilterContent />
          </Paper>
        )}

        {/* Mobile filters - drawer */}
        <Drawer anchor="right" open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}>
          <FilterContent />
        </Drawer>

        {/* Farm grid */}
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            placeholder="Поиск ферм по названию..."
            value={filters.search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            sx={{ mb: 3 }}
          />

          {/* Active filters chips */}
          {(filters.search || filters.soilType || filters.waterAccess || 
            filters.priceRange[0] > 0 || filters.priceRange[1] < 100000 ||
            filters.areaRange[0] > 0 || filters.areaRange[1] < 100) && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>Активные фильтры:</Typography>
              {filters.search && (
                <Chip label={`Поиск: ${filters.search}`} size="small" onDelete={() => dispatch(setSearch(''))} />
              )}
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) && (
                <Chip label={`Цена: ${filters.priceRange[0]} - ${filters.priceRange[1]} ₽`} size="small" />
              )}
              {filters.soilType && (
                <Chip label={`Почва: ${filters.soilType}`} size="small" onDelete={() => dispatch(setSoilType(''))} />
              )}
              {filters.waterAccess && (
                <Chip label="Водоснабжение" size="small" onDelete={() => dispatch(setWaterAccess(false))} />
              )}
              <Chip label="Сбросить всё" size="small" color="primary" onClick={() => dispatch(resetFilters())} />
            </Box>
          )}

          {list.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6">Ферм не найдено</Typography>
              <Typography variant="body2" color="text.secondary">
                Попробуйте изменить параметры фильтрации
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {list.map((farm) => (
                <Grid item key={farm.id} xs={12} sm={6} md={4} lg={3}>
                  <FarmCard farm={farm} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Container>
  );
}