import React, { useState } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';

export default function AddTaskFab({ farms, onCreate }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: dayjs().format('YYYY-MM-DD'),
    priority: 'medium',
    task_type: 'other',
    farm_id: farms.length === 1 ? farms[0].id : '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert('Введите название задачи');
      return;
    }
    setLoading(true);
    await onCreate(formData);
    setLoading(false);
    setOpen(false);
    setFormData({
      title: '',
      description: '',
      due_date: dayjs().format('YYYY-MM-DD'),
      priority: 'medium',
      task_type: 'other',
      farm_id: farms.length === 1 ? farms[0].id : '',
    });
  };

  return (
    <>
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setOpen(true)}
      >
        <AddIcon />
      </Fab>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Новая задача
          <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Название задачи *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Описание"
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Срок выполнения"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Приоритет</InputLabel>
            <Select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              label="Приоритет"
            >
              <MenuItem value="low">Низкий</MenuItem>
              <MenuItem value="medium">Средний</MenuItem>
              <MenuItem value="high">Высокий</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Тип задачи</InputLabel>
            <Select
              value={formData.task_type}
              onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
              label="Тип задачи"
            >
              <MenuItem value="planting">🌱 Посадка</MenuItem>
              <MenuItem value="watering">💧 Полив</MenuItem>
              <MenuItem value="fertilizing">🌿 Удобрение</MenuItem>
              <MenuItem value="harvesting">🌾 Сбор урожая</MenuItem>
              <MenuItem value="maintenance">🔧 Обслуживание</MenuItem>
              <MenuItem value="other">📋 Другое</MenuItem>
            </Select>
          </FormControl>
          {farms.length > 0 && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Ферма</InputLabel>
              <Select
                value={formData.farm_id}
                onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                label="Ферма"
              >
                {farms.map((farm) => (
                  <MenuItem key={farm.id} value={farm.id}>{farm.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Создание...' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}