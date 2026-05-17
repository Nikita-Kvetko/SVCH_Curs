import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Box,
  Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

export default function AdminFarmRow({ farm, onUpdate, onDelete }) {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: farm.name,
    location: farm.location,
    area_hectares: farm.area_hectares,
    price_per_month: farm.price_per_month,
    is_available: farm.is_available,
    description: farm.description || '',
  });

  const handleUpdate = async () => {
    await onUpdate(farm.id, editForm);
    setEditOpen(false);
  };

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              src={farm.images?.[0]}
              sx={{ width: 40, height: 40, borderRadius: 1 }}
              variant="rounded"
            >
              {farm.name?.[0]}
            </Avatar>
            <Box>
              <strong>{farm.name}</strong>
              <br />
              <span style={{ fontSize: '12px', color: '#666' }}>{farm.location}</span>
            </Box>
          </Box>
        </TableCell>
        <TableCell>{farm.owner?.name || '—'}</TableCell>
        <TableCell>{farm.area_hectares} га</TableCell>
        <TableCell>{Number(farm.price_per_month).toLocaleString()} ₽/мес</TableCell>
        <TableCell>
          <Chip
            label={farm.is_available ? 'Доступна' : 'Недоступна'}
            size="small"
            color={farm.is_available ? 'success' : 'default'}
          />
        </TableCell>
        <TableCell>{dayjs(farm.created_at).format('DD.MM.YYYY')}</TableCell>
        <TableCell align="center">
          <IconButton size="small" onClick={() => navigate(`/farm/${farm.id}`)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="primary" onClick={() => setEditOpen(true)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setDeleteConfirmOpen(true)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать ферму</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Название"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Местоположение"
            value={editForm.location}
            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Площадь (га)"
            type="number"
            value={editForm.area_hectares}
            onChange={(e) => setEditForm({ ...editForm, area_hectares: parseFloat(e.target.value) })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Цена за месяц (₽)"
            type="number"
            value={editForm.price_per_month}
            onChange={(e) => setEditForm({ ...editForm, price_per_month: parseFloat(e.target.value) })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Описание"
            multiline
            rows={3}
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            margin="normal"
          />
          <FormControlLabel
            control={
              <Switch
                checked={editForm.is_available}
                onChange={(e) => setEditForm({ ...editForm, is_available: e.target.checked })}
              />
            }
            label="Ферма доступна для бронирования"
            sx={{ mt: 2, display: 'block' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleUpdate}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Удаление фермы</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить ферму "{farm.name}"? Это действие необратимо.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Отмена</Button>
          <Button variant="contained" color="error" onClick={() => onDelete(farm.id)}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}