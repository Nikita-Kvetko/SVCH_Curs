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
  Chip,
  Rating,
  Divider,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from '../api/axiosConfig';

// Данные удобрений с реальными картинками
const fertilizers = [
  {
    id: 1,
    name: 'Аммиачная селитра',
    type: 'Азотное',
    price: 2500,
    unit: 'кг',
    description: 'Высококонцентрированное азотное удобрение для всех культур. Обеспечивает быстрый рост зеленой массы.',
    image: 'https://images.unsplash.com/photo-1585921805752-5a2a2b6d4c3f?w=300',
    inStock: 500,
    rating: 4.8,
    benefits: ['Увеличивает урожайность на 25%', 'Улучшает качество зерна', 'Быстрое действие'],
  },
  {
    id: 2,
    name: 'Суперфосфат',
    type: 'Фосфорное',
    price: 1800,
    unit: 'кг',
    description: 'Улучшает развитие корневой системы, повышает урожайность и зимостойкость растений.',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300',
    inStock: 300,
    rating: 4.6,
    benefits: ['Развитие корней', 'Повышает иммунитет', 'Увеличивает засухоустойчивость'],
  },
  {
    id: 3,
    name: 'Калийная соль',
    type: 'Калийное',
    price: 2200,
    unit: 'кг',
    description: 'Повышает устойчивость к засухе и болезням, улучшает вкусовые качества плодов.',
    image: 'https://images.unsplash.com/photo-1585921805752-5a2a2b6d4c3f?w=300',
    inStock: 400,
    rating: 4.7,
    benefits: ['Устойчивость к стрессам', 'Улучшает вкус', 'Увеличивает срок хранения'],
  },
  {
    id: 4,
    name: 'Нитроаммофоска',
    type: 'Комплексное',
    price: 3000,
    unit: 'кг',
    description: 'Сбалансированное NPK 16:16:16 для всех типов почв и культур.',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300',
    inStock: 600,
    rating: 4.9,
    benefits: ['Комплексное питание', 'Универсальность', 'Высокая эффективность'],
  },
  {
    id: 5,
    name: 'Мочевина (Карбамид)',
    type: 'Азотное',
    price: 2800,
    unit: 'кг',
    description: 'Самое концентрированное азотное удобрение с содержанием азота до 46%.',
    image: 'https://images.unsplash.com/photo-1585921805752-5a2a2b6d4c3f?w=300',
    inStock: 350,
    rating: 4.8,
    benefits: ['Максимум азота', 'Экономия на доставке', 'Отлично для подкормок'],
  },
  {
    id: 6,
    name: 'Калимагнезия',
    type: 'Калийное',
    price: 2000,
    unit: 'кг',
    description: 'Содержит калий и магний, рекомендуется для хлорофобных культур (картофель, гречиха).',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300',
    inStock: 250,
    rating: 4.5,
    benefits: ['Магний в составе', 'Отлично для картофеля', 'Улучшает фотосинтез'],
  },
  {
    id: 7,
    name: 'Азофоска',
    type: 'Комплексное',
    price: 3200,
    unit: 'кг',
    description: 'Гранулированное комплексное удобрение с микроэлементами (бор, цинк, марганец).',
    image: 'https://images.unsplash.com/photo-1585921805752-5a2a2b6d4c3f?w=300',
    inStock: 450,
    rating: 4.9,
    benefits: ['Микроэлементы', 'Пролонгированное действие', 'Высокая усвояемость'],
  },
  {
    id: 8,
    name: 'Селитра кальциевая',
    type: 'Азотное',
    price: 3500,
    unit: 'кг',
    description: 'Подщелачивает почву, идеально для теплиц и кислых почв.',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300',
    inStock: 200,
    rating: 4.7,
    benefits: ['Снижает кислотность', 'Укрепляет клетки', 'Идеально для томатов'],
  },
];

// Компонент Chip
function CustomChip({ label, color, sx }) {
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
        items: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
        total: getTotalPrice(),
        delivery_address: deliveryAddress,
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
        <Box>
          <Typography variant="h4" component="h1">
            Магазин удобрений
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Качественные удобрения для повышения урожайности ваших ферм
          </Typography>
        </Box>
        <Badge badgeContent={cartItemCount} color="primary">
          <IconButton onClick={() => setCartOpen(true)} sx={{ bgcolor: '#e8f5e9' }}>
            <ShoppingCartIcon />
          </IconButton>
        </Badge>
      </Box>

      <Grid container spacing={3}>
        {fertilizers.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
            }}>
              <CardMedia
                component="img"
                height="200"
                image={item.image}
                alt={item.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {item.name}
                  </Typography>
                  <Rating value={item.rating} readOnly size="small" />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <CustomChip label={item.type} color="primary" />
                  <CustomChip label={`${item.unit} упаковка`} />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.description}
                </Typography>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Box>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {item.price.toLocaleString()} ₽
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      за {item.unit}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color={item.inStock > 100 ? 'success.main' : 'warning.main'}>
                    {item.inStock > 100 ? '✓ Много' : item.inStock > 50 ? 'В наличии' : 'Осталось мало'}
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

      {/* Преимущества магазина */}
      <Paper sx={{ mt: 6, p: 3, bgcolor: '#e8f5e9' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
            <LocalShippingIcon sx={{ fontSize: 40, color: '#2e7d32', mb: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">Быстрая доставка</Typography>
            <Typography variant="caption" color="text.secondary">По всей Беларуси за 1-3 дня</Typography>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
            <PaymentIcon sx={{ fontSize: 40, color: '#2e7d32', mb: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">Удобная оплата</Typography>
            <Typography variant="caption" color="text.secondary">Картой онлайн или наличными</Typography>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 40, color: '#2e7d32', mb: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">Гарантия качества</Typography>
            <Typography variant="caption" color="text.secondary">Сертифицированная продукция</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Корзина */}
      <Dialog open={cartOpen} onClose={() => setCartOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">Корзина ({cartItemCount} товаров)</Typography>
        </DialogTitle>
        <DialogContent>
          {cart.length === 0 ? (
            <Typography sx={{ py: 4, textAlign: 'center' }}>Корзина пуста</Typography>
          ) : (
            <>
              {cart.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, p: 1, borderBottom: '1px solid #eee' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 2 }}>
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.name}
                      sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                    />
                    <Box>
                      <Typography variant="subtitle1">{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.price.toLocaleString()} ₽/{item.unit}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" onClick={() => updateQuantity(item.id, -1)}>
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ minWidth: 30, textAlign: 'center' }}>{item.quantity}</Typography>
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