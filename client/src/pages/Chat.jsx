import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Paper,
  Box,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  CircularProgress,
  Drawer,
  useMediaQuery,
  useTheme,
  InputBase,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import axios from '../api/axiosConfig';
import dayjs from 'dayjs';

export default function Chat({ open, onClose, selectedUser, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(selectedUser || null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Загрузка списка пользователей для чата
  useEffect(() => {
    fetchChatUsers();
  }, []);

  // Загрузка сообщений при выборе пользователя
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
    }
  }, [activeChat]);

  // Автоскролл вниз
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Фокус на поле ввода при открытии чата
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [open]);

  const fetchChatUsers = async () => {
    try {
      const response = await axios.get('/chat/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await axios.get(`/chat/messages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    const messageText = inputRef.current?.value?.trim();
    if (!messageText || !activeChat || sending) return;
    
    setSending(true);
    
    // Очищаем поле ввода
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    
    try {
      const response = await axios.post('/chat/send', {
        to_user_id: activeChat.id,
        message: messageText,
      });
      setMessages(prev => [...prev, response.data]);
      
      // Возвращаем фокус
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } catch (error) {
      console.error('Error sending message:', error);
      // Восстанавливаем текст при ошибке
      if (inputRef.current) {
        inputRef.current.value = messageText;
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSelectChat = (user) => {
    setActiveChat(user);
    // Очищаем поле ввода при смене чата
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const ChatList = () => (
    <Box sx={{ width: isMobile ? '100%' : 300, height: '100%', borderRight: isMobile ? 'none' : '1px solid #e0e0e0' }}>
      <Box sx={{ p: 2, bgcolor: '#2e7d32', color: 'white' }}>
        <Typography variant="h6">Чаты</Typography>
      </Box>
      <List sx={{ height: 'calc(100% - 60px)', overflow: 'auto' }}>
        {users.map((user) => (
          <ListItem
            key={user.id}
            button
            selected={activeChat?.id === user.id}
            onClick={() => handleSelectChat(user)}
            sx={{
              bgcolor: activeChat?.id === user.id ? '#e8f5e9' : 'transparent',
              '&:hover': { bgcolor: '#f5f5f5' },
              cursor: 'pointer'
            }}
          >
            <ListItemAvatar>
              <Badge
                color="success"
                variant="dot"
                invisible={!user.online}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <Avatar sx={{ bgcolor: '#2e7d32' }}>
                  {user.name?.[0]?.toUpperCase()}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={user.name}
              secondary={user.last_message || 'Напишите сообщение'}
              secondaryTypographyProps={{ noWrap: true, style: { maxWidth: 150 } }}
            />
          </ListItem>
        ))}
        {users.length === 0 && !loading && (
          <Typography sx={{ p: 2, textAlign: 'center' }} color="text.secondary">
            Нет активных чатов
          </Typography>
        )}
      </List>
    </Box>
  );

  const ChatArea = () => (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {activeChat ? (
        <>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#2e7d32' }}>
              {activeChat.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {activeChat.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activeChat.role === 'landowner' ? 'Владелец земли' : activeChat.role === 'farmer' ? 'Фермер' : 'Администратор'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#fafafa' }}>
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  justifyContent: msg.from_user_id === currentUser?.id ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Paper
                  sx={{
                    maxWidth: '70%',
                    p: 1.5,
                    bgcolor: msg.from_user_id === currentUser?.id ? '#2e7d32' : 'white',
                    color: msg.from_user_id === currentUser?.id ? 'white' : 'inherit',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ wordBreak: 'break-word', direction: 'ltr', textAlign: 'left' }}>
                    {msg.message}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, opacity: 0.7 }}>
                    {dayjs(msg.created_at).format('HH:mm')}
                  </Typography>
                </Paper>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <InputBase
                inputRef={inputRef}
                fullWidth
                placeholder="Введите сообщение..."
                onKeyPress={handleKeyPress}
                disabled={sending}
                multiline
                maxRows={3}
                sx={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '20px',
                  border: '1px solid #e0e0e0',
                  '&:hover': {
                    borderColor: '#2e7d32',
                  },
                  '&.Mui-focused': {
                    borderColor: '#2e7d32',
                  },
                  '& .MuiInputBase-input': {
                    direction: 'ltr',
                    textAlign: 'left',
                    padding: '8px 0',
                  }
                }}
              />
              <IconButton 
                color="primary" 
                onClick={sendMessage}
                disabled={sending}
                sx={{ 
                  alignSelf: 'center', 
                  bgcolor: '#e8f5e9', 
                  '&:hover': { bgcolor: '#c8e8c9' },
                  '&.Mui-disabled': { bgcolor: '#f5f5f5' }
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="text.secondary">Выберите чат для начала общения</Typography>
        </Box>
      )}
    </Box>
  );

  if (open === undefined) {
    // Полноценная страница чата
    return (
      <Container maxWidth="xl" sx={{ py: 4, height: 'calc(100vh - 120px)' }}>
        <Paper sx={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
          <ChatList />
          <ChatArea />
        </Paper>
      </Container>
    );
  }

  // Drawer для модального окна
  return (
    <Drawer 
      anchor="right" 
      open={open} 
      onClose={onClose} 
      sx={{ '& .MuiDrawer-paper': { width: isMobile ? '100%' : 500, height: '100%' } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ p: 2, bgcolor: '#2e7d32', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Сообщения</Typography>
          <IconButton color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <ChatList />
          <ChatArea />
        </Box>
      </Box>
    </Drawer>
  );
}