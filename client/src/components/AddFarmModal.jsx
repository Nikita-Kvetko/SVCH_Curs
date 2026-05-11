import React, { useState } from 'react';
import {
  Modal, Box, Typography, TextField, Button, Switch, FormControlLabel, Chip, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 600, md: 700 },
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  overflow: 'auto',
};

export default function AddFarmModal({ open, onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area_hectares: '',
    price_per_month: '',
    soil_type: '',
    water_access: false,
    electricity: false,
    description: '',
    equipment_list: [],
  });
  const [newEquipment, setNewEquipment] = useState('');

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddEquipment = () => {
    if (newEquipment.trim() && !formData.equipment_list.includes(newEquipment.trim())) {
      setFormData(prev => ({
        ...prev,
        equipment_list: [...prev.equipment_list, newEquipment.trim()],
      }));
      setNewEquipment('');
    }
  };

  const handleRemoveEquipment = (item) => {
    setFormData(prev => ({
      ...prev,
      equipment_list: prev.equipment_list.filter(e => e !== item),
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.location || !formData.area_hectares || !formData.price_per_month) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    onSubmit({
      ...formData,
      area_hectares: parseFloat(formData.area_hectares),
      price_per_month: parseFloat(formData.price_per_month),
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h5" gutterBottom>
          Добавить новую ферму
        </Typography>

        <TextField
          fullWidth
          label="Название фермы *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Местоположение *"
          name="location"
          value={formData.location}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Площадь (га) *"
          name="area_hectares"
          type="number"
          value={formData.area_hectares}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Цена за месяц (₽) *"
          name="price_per_month"
          type="number"
          value={formData.price_per_month}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Тип почвы"
          name="soil_type"
          value={formData.soil_type}
          onChange={handleChange}
          margin="normal"
          placeholder="Чернозем, Глинистый, Песчаный..."
        />

        <TextField
          fullWidth
          label="Описание"
          name="description"
          multiline
          rows={3}
          value={formData.description}
          onChange={handleChange}
          margin="normal"
        />

        <FormControlLabel
          control={
            <Switch
              name="water_access"
              checked={formData.water_access}
              onChange={handleChange}
            />
          }
          label="Наличие водоснабжения"
          sx={{ display: 'block', mt: 1 }}
        />

        <FormControlLabel
          control={
            <Switch
              name="electricity"
              checked={formData.electricity}
              onChange={handleChange}
            />
          }
          label="Наличие электричества"
          sx={{ display: 'block' }}
        />

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Оборудование
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            size="small"
            placeholder="Трактор, культиватор..."
            value={newEquipment}
            onChange={(e) => setNewEquipment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddEquipment()}
            sx={{ flex: 1 }}
          />
          <IconButton onClick={handleAddEquipment} color="primary">
            <AddIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {formData.equipment_list.map((item, idx) => (
            <Chip
              key={idx}
              label={item}
              onDelete={() => handleRemoveEquipment(item)}
              size="small"
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button variant="outlined" fullWidth onClick={onClose}>
            Отмена
          </Button>
          <Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading}>
            {loading ? 'Добавление...' : 'Добавить ферму'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}