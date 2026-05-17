const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { sequelize, User, Farm, Booking, Task, Report, Message, FertilizerOrder } = require('./models/index');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

// Проверка подключения к БД
sequelize.authenticate()
  .then(() => console.log('✅ PostgreSQL подключена'))
  .catch(err => console.error('❌ Ошибка подключения:', err));

// Middleware для аутентификации
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет доступа' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ error: 'Недействительный токен' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Требуются права администратора' });
  }
  next();
};

// ========== Auth endpoints ==========
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, location } = req.body;
    
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email уже используется' });
    }
    
    const user = await User.create({
      name,
      email,
      password_hash: bcrypt.hashSync(password, 10),
      role: role || 'farmer',
      phone,
      location
    });
    
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    res.json({ 
      token, 
      user: { id: user.id, name, email, role: user.role, phone, location } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    if (user.is_blocked) {
      return res.status(403).json({ error: 'Пользователь заблокирован' });
    }
    
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, location: user.location } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== Farms endpoints ==========
app.get('/api/farms', async (req, res) => {
  try {
    const farms = await Farm.findAll({
      where: { is_available: true },
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }]
    });
    res.json(farms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/farms/my', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    let farms = [];
    
    if (user.role === 'landowner') {
      farms = await Farm.findAll({
        where: { owner_id: req.userId },
        include: [{ model: User, as: 'owner' }]
      });
    } else if (user.role === 'farm_admin' && user.managed_farm_id) {
      farms = await Farm.findAll({
        where: { id: user.managed_farm_id },
        include: [{ model: User, as: 'owner' }]
      });
    }
    
    res.json(farms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/farms/:id', async (req, res) => {
  try {
    const farm = await Farm.findByPk(req.params.id, {
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone'] }]
    });
    if (!farm) {
      return res.status(404).json({ error: 'Ферма не найдена' });
    }
    res.json(farm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== Bookings endpoints ==========
app.get('/api/bookings/my', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    let bookings = [];
    
    if (user.role === 'farmer') {
      bookings = await Booking.findAll({
        where: { farmer_id: req.userId },
        include: [{ model: Farm, as: 'farm' }]
      });
    } else if (user.role === 'landowner') {
      const userFarms = await Farm.findAll({ where: { owner_id: req.userId } });
      const farmIds = userFarms.map(f => f.id);
      bookings = await Booking.findAll({
        where: { farm_id: farmIds },
        include: [{ model: Farm, as: 'farm' }, { model: User, as: 'farmer' }]
      });
    } else {
      bookings = await Booking.findAll({
        include: [{ model: Farm, as: 'farm' }, { model: User, as: 'farmer' }]
      });
    }
    
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/bookings', auth, async (req, res) => {
  try {
    const { farm_id, start_date, end_date, total_price, notes } = req.body;
    const booking = await Booking.create({
      farm_id,
      farmer_id: req.userId,
      start_date,
      end_date,
      total_price,
      notes,
      status: 'pending'
    });
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/api/bookings/:bookingId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }
    await booking.update({ status });
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== Tasks endpoints ==========
app.get('/api/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [{ model: Farm, as: 'farm' }]
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/tasks', auth, async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      assigned_to: req.userId
    });
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/api/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }
    await task.update(req.body);
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/tasks/:id', auth, async (req, res) => {
  try {
    await Task.destroy({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== Reports endpoints ==========
app.get('/api/reports/financial', auth, async (req, res) => {
  try {
    const { startDate, endDate, farmId } = req.query;
    let whereClause = {};
    if (farmId && farmId !== '') whereClause.farm_id = farmId;
    
    const bookings = await Booking.findAll({
      where: whereClause,
      include: [{ model: Farm, as: 'farm' }]
    });
    
    const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.total_price), 0);
    
    res.json({
      bookings: bookings.map(b => ({
        ...b.toJSON(),
        farm_name: b.farm?.name
      })),
      summary: {
        total_bookings: bookings.length,
        total_revenue: totalRevenue,
        average_booking_value: bookings.length ? totalRevenue / bookings.length : 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/reports/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [{ model: Farm, as: 'farm' }]
    });
    
    res.json({
      tasks: tasks.map(t => ({
        ...t.toJSON(),
        farm_name: t.farm?.name
      })),
      summary: {
        total: tasks.length,
        completed: tasks.filter(t => t.is_completed).length,
        pending: tasks.filter(t => !t.is_completed).length,
        overdue: tasks.filter(t => !t.is_completed && new Date(t.due_date) < new Date()).length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/reports', auth, async (req, res) => {
  try {
    const report = await Report.create({
      ...req.body,
      user_id: req.userId
    });
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/reports/my', auth, async (req, res) => {
  try {
    const reports = await Report.findAll({
      where: { user_id: req.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== Chat endpoints ==========
app.get('/api/chat/users', auth, async (req, res) => {
  try {
    const users = await User.findAll({
      where: { id: { [require('sequelize').Op.ne]: req.userId } },
      attributes: ['id', 'name', 'role', 'email']
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/chat/messages/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { from_user_id: req.userId, to_user_id: req.params.userId },
          { from_user_id: req.params.userId, to_user_id: req.userId }
        ]
      },
      order: [['createdAt', 'ASC']]
    });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/chat/send', auth, async (req, res) => {
  try {
    const { to_user_id, message } = req.body;
    const newMessage = await Message.create({
      from_user_id: req.userId,
      to_user_id,
      message,
      is_read: false
    });
    res.json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== Fertilizer Shop endpoints ==========
app.get('/api/fertilizer/products', async (req, res) => {
  const products = [
    { id: 1, name: 'Аммиачная селитра', type: 'Азотное', price: 2500, unit: 'кг', inStock: 500 },
    { id: 2, name: 'Суперфосфат', type: 'Фосфорное', price: 1800, unit: 'кг', inStock: 300 },
    { id: 3, name: 'Калийная соль', type: 'Калийное', price: 2200, unit: 'кг', inStock: 400 },
    { id: 4, name: 'Нитроаммофоска', type: 'Комплексное', price: 3000, unit: 'кг', inStock: 600 },
    { id: 5, name: 'Мочевина', type: 'Азотное', price: 2800, unit: 'кг', inStock: 350 }
  ];
  res.json(products);
});

app.post('/api/fertilizer/order', auth, async (req, res) => {
  try {
    const { items, total, delivery_address } = req.body;
    const order = await FertilizerOrder.create({
      user_id: req.userId,
      items,
      total,
      delivery_address,
      status: 'pending'
    });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== Admin endpoints ==========
app.get('/api/admin/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] }
    });
    res.json({ users, total: users.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/api/admin/users/:userId/role', auth, adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    await user.update({ role });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.patch('/api/admin/users/:userId/block', auth, adminAuth, async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    await user.update({ is_blocked: isBlocked });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/admin/users/:userId', auth, adminAuth, async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.userId } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/admin/farms', auth, adminAuth, async (req, res) => {
  try {
    const farms = await Farm.findAll({
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }]
    });
    res.json({ farms, total: farms.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/admin/farms/:farmId', auth, adminAuth, async (req, res) => {
  try {
    await Farm.destroy({ where: { id: req.params.farmId } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/admin/bookings', auth, adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Farm, as: 'farm' },
        { model: User, as: 'farmer', attributes: ['id', 'name', 'email'] }
      ]
    });
    res.json({ bookings, total: bookings.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/admin/stats', auth, adminAuth, async (req, res) => {
  try {
    const total_users = await User.count();
    const total_farms = await Farm.count();
    const total_bookings = await Booking.count();
    const bookings = await Booking.findAll();
    const total_revenue = bookings.reduce((sum, b) => sum + Number(b.total_price), 0);
    
    res.json({
      total_users,
      total_farms,
      total_bookings,
      total_revenue,
      active_users: await User.count({ where: { is_blocked: false } }),
      completed_tasks: await Task.count({ where: { is_completed: true } })
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== Reviews endpoints ==========
app.post('/api/reviews', auth, async (req, res) => {
  try {
    const { farm_id, rating, comment } = req.body;
    
    // Обновляем рейтинг фермы
    const farm = await Farm.findByPk(farm_id);
    if (farm) {
      const newRating = (farm.rating * farm.total_reviews + rating) / (farm.total_reviews + 1);
      await farm.update({
        rating: parseFloat(newRating.toFixed(1)),
        total_reviews: farm.total_reviews + 1
      });
    }
    
    res.json({ success: true, message: 'Спасибо за отзыв!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});