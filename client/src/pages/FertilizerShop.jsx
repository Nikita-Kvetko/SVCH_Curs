import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  Badge,
  Paper,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../api/axiosConfig';

// Данные удобрений
const fertilizers = [
  {
    id: 1,
    name: 'Аммиачная селитра',
    type: 'Азотное',
    price: 2500,
    unit: 'кг',
    description: 'Высококонцентрированное азотное удобрение для всех культур',
    image: 'https://images.unsplash.com/photo-1585921805752-5a2a2b6d4c3f?w=300',
    inStock: 500,
  },
  {
    id: 2,
    name: 'Суперфосфат',
    type: 'Фосфорное',
    price: 1800,
    unit: 'кг',
    description: 'Улучшает развитие корневой системы, повышает урожайность',
    image: 'https://images.unsplash.com/photo-1585921805752-5a2a2b6d4c3f?w=300',
    inStock: 300,
  },
  {
    id: 3,
    name: 'Калийная соль',
    type: 'Калийное',
    price: 2200,
    unit: 'кг',
    description: 'Повышает устойчивость к засухе и болезням',
    image: 'https://images.unsplash.com/photo-1585921805752-5a2a2b6d4c3f?w=300',
    inStock: 400,
  },
  {
    id: 4,
    name: 'Нитроаммофоска',
    type: 'Комплексное',
    price: 3000,
    unit: 'кг',
    description: 'Сбалансированное NPK 16:16:16 для всех типов почв',
    image: 'https://images.unsplash.com/photo-1585921805752-5a2a2b6d4c3f?w=300',
    inStock: 600,
  },
  {
    id: 5,
    name: 'Мочевина (Карбамид)',
    type: 'Азотное',
    price: 2800,
    unit: 'кг',
    description: 'Самое концентрированное азотное удобрение',
    image: 'https://images.unsplash.com/photo-1585921805752-5a2a2b6d4c3f?w=300',
    inStock: 350,
  },
  {
    id: 6,
    name: 'Калимагнезия',
    type: 'Калийное',
    price: 2000,
    unit: 'кг',
    description: 'Содержит калий и магний, для хлорофобных культур',
    image: 'https://images.unsplash.com/photo-1585921805752-5a2a2b6d4c3f?w=300',
    inStock: 250,
  },
];

export default function FertilizerShop() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderDialog, setOrderDialog] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Загрузка корзины из localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('fertilizerCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Сохранение корзины
  useEffect(() => {
    localStorage.setItem('fertilizerCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (fertilizer) => {
    const existing = cart.find(item => item.id === fertilizer.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === fertilizer.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...fertilizer, quantity: 1 }]);
    }
    setSnackbar({ open: true, message: `${fertilizer.name} добавлен в корзину`, severity: 'success' });
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (!deliveryAddress.trim()) {
      setSnackbar({ open: true, message: 'Укажите адрес доставки', severity: 'error' });
      return;
    }
    try {
      await axios.post('/fertilizer/order', {
        items: cart,
        total: getTotalPrice(),
        deliveryAddress,
      });
      setCart([]);
      setOrderDialog(false);
      setDeliveryAddress('');
      setSnackbar({ open: true, message: 'Заказ оформлен! Ожидайте доставку.', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Ошибка при оформлении заказа', severity: 'error' });
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Магазин удобрений
        </Typography>
        <Badge badgeContent={cartItemCount} color="primary">
          <IconButton onClick={() => setCartOpen(true)}>
            <ShoppingCartIcon />
          </IconButton>
        </Badge>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Качественные удобрения для повышения урожайности ваших ферм
      </Typography>

      <Grid container spacing={3}>
        {fertilizers.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardMedia
                component="img"
                height="180"
                image={item.image}
                alt={item.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {item.name}
                </Typography>
                <Chip label={item.type} size="small" color="primary" sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {item.price.toLocaleString()} ₽/{item.unit}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    В наличии: {item.inStock} {item.unit}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => addToCart(item)}
                  startIcon={<AddIcon />}
                >
                  В корзину
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Корзина */}
      <Dialog open={cartOpen} onClose={() => setCartOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Корзина</DialogTitle>
        <DialogContent>
          {cart.length === 0 ? (
            <Typography sx={{ py: 4, textAlign: 'center' }}>Корзина пуста</Typography>
          ) : (
            <>
              {cart.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, p: 1, borderBottom: '1px solid #eee' }}>
                  <Box sx={{ flex: 2 }}>
                    <Typography variant="subtitle1">{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.price} ₽/{item.unit}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" onClick={() => updateQuantity(item.id, -1)}>
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography>{item.quantity}</Typography>
                    <IconButton size="small" onClick={() => updateQuantity(item.id, 1)}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => removeFromCart(item.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography sx={{ minWidth: 80, textAlign: 'right' }}>
                    {(item.price * item.quantity).toLocaleString()} ₽
                  </Typography>
                </Box>
              ))}
              <Box sx={{ mt: 2, pt: 2, borderTop: '2px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Итого:</Typography>
                <Typography variant="h6" color="primary">{getTotalPrice().toLocaleString()} ₽</Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCartOpen(false)}>Продолжить покупки</Button>
          <Button
            variant="contained"
            onClick={() => {
              setCartOpen(false);
              setOrderDialog(true);
            }}
            disabled={cart.length === 0}
          >
            Оформить заказ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Оформление заказа */}
      <Dialog open={orderDialog} onClose={() => setOrderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Оформление заказа</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Адрес доставки"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            margin="normal"
            multiline
            rows={2}
            placeholder="Укажите адрес для доставки удобрений"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Сумма заказа: <strong>{getTotalPrice().toLocaleString()} ₽</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialog(false)}>Отмена</Button>
          <Button variant="contained" onClick={placeOrder}>Подтвердить заказ</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

// Добавим Chip
function Chip({ label, size, color, sx }) {
  return (
    <Box
      sx={{
        display: 'inline-block',
        px: 1,
        py: 0.5,
        fontSize: '0.75rem',
        borderRadius: 1,
        bgcolor: color === 'primary' ? '#e8f5e9' : '#f5f5f5',
        color: color === 'primary' ? '#2e7d32' : '#666',
        ...sx,
      }}
    >
      {label}
    </Box>
  );
}