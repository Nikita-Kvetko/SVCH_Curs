import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Checkbox,
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';

dayjs.extend(relativeTime);
dayjs.locale('ru');

const priorityConfig = {
  low: { label: 'Низкий', color: '#2e7d32', bg: '#e8f5e9' },
  medium: { label: 'Средний', color: '#ed6c02', bg: '#fff3e0' },
  high: { label: 'Высокий', color: '#d32f2f', bg: '#ffebee' },
};

const taskTypeConfig = {
  planting: '🌱 Посадка',
  watering: '💧 Полив',
  fertilizing: '🌿 Удобрение',
  harvesting: '🌾 Сбор урожая',
  maintenance: '🔧 Обслуживание',
  other: '📋 Другое',
};

export default function TaskCard({ task, farms, onUpdate, onDelete, onToggleComplete }) {
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description || '',
    due_date: task.due_date,
    priority: task.priority,
    task_type: task.task_type,
    farm_id: task.farm_id,
  });

  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const isOverdue = !task.is_completed && dayjs(task.due_date).isBefore(dayjs(), 'day');
  const dueDate = dayjs(task.due_date);

  const handleUpdate = async () => {
    await onUpdate(task.id, editForm);
    setEditOpen(false);
  };

  return (
    <>
      <Card
        sx={{
          mb: 2,
          opacity: task.is_completed ? 0.7 : 1,
          borderLeft: 4,
          borderColor: isOverdue ? '#d32f2f' : priority.color,
          '&:hover': { boxShadow: 3 },
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Checkbox
              checked={task.is_completed}
              onChange={() => onToggleComplete(task.id, task.is_completed)}
              sx={{ mt: -1 }}
            />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography
                  variant="subtitle1"
                  component="h3"
                  sx={{
                    textDecoration: task.is_completed ? 'line-through' : 'none',
                    fontWeight: 'medium',
                  }}
                >
                  {task.title}
                </Typography>
                <Chip
                  label={priority.label}
                  size="small"
                  sx={{ bgcolor: priority.bg, color: priority.color }}
                />
                <Chip
                  label={taskTypeConfig[task.task_type] || taskTypeConfig.other}
                  size="small"
                  variant="outlined"
                />
                {isOverdue && !task.is_completed && (
                  <Chip label="Просрочена" size="small" color="error" />
                )}
              </Box>

              {task.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {task.description}
                </Typography>
              )}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  📅 Срок: {dueDate.format('DD MMMM YYYY')}
                  {!task.is_completed && (
                    <span style={{ marginLeft: 8 }}>
                      {dueDate.isBefore(dayjs(), 'day')
                        ? ` (просрочена на ${dueDate.fromNow()})`
                        : dueDate.isAfter(dayjs(), 'day')
                        ? ` (осталось ${dueDate.fromNow(true)})`
                        : ' (сегодня)'}
                    </span>
                  )}
                </Typography>
                {task.farm && (
                  <Typography variant="caption" color="text.secondary">
                    🚜 Ферма: {task.farm.name}
                  </Typography>
                )}
                {task.is_completed && task.completed_at && (
                  <Typography variant="caption" color="text.secondary">
                    ✅ Выполнена: {dayjs(task.completed_at).format('DD.MM.YYYY')}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box>
              <IconButton size="small" onClick={() => setEditOpen(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => onDelete(task.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Редактировать задачу
          <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setEditOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Название задачи"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Описание"
            multiline
            rows={2}
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Срок выполнения"
            type="date"
            value={editForm.due_date}
            onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Приоритет</InputLabel>
            <Select
              value={editForm.priority}
              onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
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
              value={editForm.task_type}
              onChange={(e) => setEditForm({ ...editForm, task_type: e.target.value })}
              label="Тип задачи"
            >
              <MenuItem value="planting">Посадка</MenuItem>
              <MenuItem value="watering">Полив</MenuItem>
              <MenuItem value="fertilizing">Удобрение</MenuItem>
              <MenuItem value="harvesting">Сбор урожая</MenuItem>
              <MenuItem value="maintenance">Обслуживание</MenuItem>
              <MenuItem value="other">Другое</MenuItem>
            </Select>
          </FormControl>
          {farms.length > 0 && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Ферма</InputLabel>
              <Select
                value={editForm.farm_id}
                onChange={(e) => setEditForm({ ...editForm, farm_id: e.target.value })}
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
          <Button onClick={() => setEditOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleUpdate}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}