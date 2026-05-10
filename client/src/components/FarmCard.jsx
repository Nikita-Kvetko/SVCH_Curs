import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, Rating, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SquareFootIcon from '@mui/icons-material/SquareFoot';

export default function FarmCard({ farm }) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
      onClick={() => navigate(`/farm/${farm.id}`)}
    >
      <CardMedia
        component="img"
        height="200"
        image={farm.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
        alt={farm.name}
        sx={{ objectFit: 'cover' }}
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
          <Typography variant="body1" fontWeight="bold" color="primary">
            {Number(farm.price_per_month).toLocaleString()} ₽/мес
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SquareFootIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            {farm.area_hectares} га
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

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {farm.water_access && (
            <Chip label="Водоснабжение" size="small" color="info" variant="outlined" />
          )}
          {farm.electricity && (
            <Chip label="Электричество" size="small" color="info" variant="outlined" />
          )}
          {farm.soil_type && (
            <Chip label={farm.soil_type} size="small" variant="outlined" />
          )}
        </Box>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/farm/${farm.id}`);
          }}
        >
          Подробнее
        </Button>
      </CardContent>
    </Card>
  );
}