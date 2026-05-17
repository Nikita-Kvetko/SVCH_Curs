import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  Divider,
  CircularProgress,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import axios from '../api/axiosConfig';
import dayjs from 'dayjs';

export default function Chat({ open, onClose, selectedUser, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(selectedUser || null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
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
    if (!newMessage.trim() || !activeChat) return;
    try {
      const response = await axios.post('/chat/send', {
        to_user_id: activeChat.id,
        message: newMessage,
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
            onClick={() => setActiveChat(user)}
            sx={{
              bgcolor: activeChat?.id === user.id ? '#e8f5e9' : 'transparent',
              '&:hover': { bgcolor: '#f5f5f5' },
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
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                  <Typography variant="body2">{msg.message}</Typography>
                  <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, opacity: 0.7 }}>
                    {dayjs(msg.created_at).format('HH:mm')}
                  </Typography>
                </Paper>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Введите сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              size="small"
              multiline
              maxRows={3}
            />
            <IconButton color="primary" onClick={sendMessage}>
              <SendIcon />
            </IconButton>
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ height: 'calc(100vh - 120px)', display: 'flex', overflow: 'hidden' }}>
          <ChatList />
          <ChatArea />
        </Paper>
      </Container>
    );
  }

  // Drawer для модального окна
  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ '& .MuiDrawer-paper': { width: isMobile ? '100%' : 500, height: '100%' } }}>
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