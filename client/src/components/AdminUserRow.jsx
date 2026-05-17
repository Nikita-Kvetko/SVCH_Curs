import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import dayjs from 'dayjs';

const roleColors = {
  admin: { color: '#d32f2f', label: 'Администратор' },
  landowner: { color: '#2e7d32', label: 'Владелец земли' },
  farmer: { color: '#0288d1', label: 'Фермер' },
};

export default function AdminUserRow({ user, onRoleChange, onToggleBlock, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [action, setAction] = useState(null);

  const roleConfig = roleColors[user.role] || roleColors.farmer;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (actionType) => {
    setAction(actionType);
    setConfirmOpen(true);
    handleMenuClose();
  };

  const confirmAction = () => {
    if (action === 'role') {
      const newRole = user.role === 'admin' ? 'farmer' : 
                      user.role === 'landowner' ? 'admin' : 'landowner';
      onRoleChange(user.id, newRole);
    } else if (action === 'block') {
      onToggleBlock(user.id, !user.is_blocked);
    } else if (action === 'delete') {
      onDelete(user.id);
    }
    setConfirmOpen(false);
    setAction(null);
  };

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: roleConfig.color }}>
              {user.name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell>{user.phone || '—'}</TableCell>
        <TableCell>{user.location || '—'}</TableCell>
        <TableCell>
          <Chip
            label={roleConfig.label}
            size="small"
            sx={{ bgcolor: roleConfig.color + '20', color: roleConfig.color }}
          />
        </TableCell>
        <TableCell>
          {user.is_blocked ? (
            <Chip label="Заблокирован" size="small" color="error" variant="outlined" />
          ) : (
            <Chip label="Активен" size="small" color="success" variant="outlined" />
          )}
        </TableCell>
        <TableCell>{dayjs(user.created_at).format('DD.MM.YYYY')}</TableCell>
        <TableCell align="center">
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => handleAction('role')}>
              {user.role === 'admin' ? <PersonIcon fontSize="small" sx={{ mr: 1 }} /> : 
               user.role === 'landowner' ? <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 1 }} /> :
               <AgricultureIcon fontSize="small" sx={{ mr: 1 }} />}
              Сменить роль на {user.role === 'admin' ? 'фермера' : 
                               user.role === 'landowner' ? 'администратора' : 'владельца'}
            </MenuItem>
            <MenuItem onClick={() => handleAction('block')}>
              {user.is_blocked ? (
                <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: '#2e7d32' }} />
              ) : (
                <BlockIcon fontSize="small" sx={{ mr: 1, color: '#d32f2f' }} />
              )}
              {user.is_blocked ? 'Разблокировать' : 'Заблокировать'}
            </MenuItem>
            <MenuItem onClick={() => handleAction('delete')} sx={{ color: '#d32f2f' }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Удалить
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Подтверждение действия</DialogTitle>
        <DialogContent>
          <Typography>
            {action === 'role' && `Вы уверены, что хотите изменить роль пользователя "${user.name}"?`}
            {action === 'block' && `Вы уверены, что хотите ${user.is_blocked ? 'разблокировать' : 'заблокировать'} пользователя "${user.name}"?`}
            {action === 'delete' && `Вы уверены, что хотите удалить пользователя "${user.name}"? Это действие необратимо.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Отмена</Button>
          <Button variant="contained" color={action === 'delete' ? 'error' : 'primary'} onClick={confirmAction}>
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}