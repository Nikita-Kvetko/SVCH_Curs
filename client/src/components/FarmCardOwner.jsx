import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, IconButton, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SquareFootIcon from '@mui/icons-material/SquareFoot';

export default function FarmCardOwner({ farm, onDelete }) {
  const navigate = useNavigate();

  return (
    <Card sx={{ mb: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, '&:hover': { boxShadow: 3 } }}>
      <CardMedia
        component="img"
        sx={{ width: { xs: '100%', sm: 150 }, height: 150, objectFit: 'cover' }}
        image={farm.images?.[0] || 'https://via.placeholder.com/150x150?text=No+Image'}
        alt={farm.name}
      />
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" component="h2">
              {farm.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <LocationOnIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {farm.location}
              </Typography>
            </Box>
          </Box>
          <Box>
            <IconButton size="small" onClick={() => navigate(`/farm/${farm.id}/edit`)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => onDelete(farm.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AttachMoneyIcon fontSize="small" color="primary" />
            <Typography variant="body2">{Number(farm.price_per_month).toLocaleString()} ₽/мес</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SquareFootIcon fontSize="small" color="primary" />
            <Typography variant="body2">{farm.area_hectares} га</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {farm.water_access && <Chip label="Водоснабжение" size="small" variant="outlined" />}
          {farm.electricity && <Chip label="Электричество" size="small" variant="outlined" />}
          {farm.soil_type && <Chip label={farm.soil_type} size="small" variant="outlined" />}
          <Chip
            label={farm.is_available ? 'Доступна' : 'Недоступна'}
            size="small"
            color={farm.is_available ? 'success' : 'default'}
          />
        </Box>

        <Button
          size="small"
          sx={{ mt: 1 }}
          onClick={() => navigate(`/farm/${farm.id}`)}
        >
          Просмотр на карте
        </Button>
      </CardContent>
    </Card>
  );
}