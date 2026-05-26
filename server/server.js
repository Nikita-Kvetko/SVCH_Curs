const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const { sequelize, User, Farm, Booking, Task, Report, Message, FertilizerOrder, Review, Crop } = require('./models/index');

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
      id: uuidv4(),
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
    const { 
      search, 
      minPrice, 
      maxPrice, 
      minArea, 
      maxArea, 
      soilType, 
      waterAccess, 
      electricity, 
      minRating,
      sortBy 
    } = req.query;
    
    let whereClause = { is_available: true };
    
    if (search && search.trim() !== '') {
      whereClause.name = { [Op.iLike]: `%${search.trim()}%` };
    }
    
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      whereClause.price_per_month = { [Op.gte]: parseFloat(minPrice) };
    }
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      whereClause.price_per_month = { 
        ...whereClause.price_per_month,
        [Op.lte]: parseFloat(maxPrice) 
      };
    }
    
    if (minArea && !isNaN(parseFloat(minArea))) {
      whereClause.area_hectares = { [Op.gte]: parseFloat(minArea) };
    }
    if (maxArea && !isNaN(parseFloat(maxArea))) {
      whereClause.area_hectares = { 
        ...whereClause.area_hectares,
        [Op.lte]: parseFloat(maxArea) 
      };
    }
    
    if (soilType && soilType !== '') {
      whereClause.soil_type = soilType;
    }
    
    if (waterAccess === 'true') {
      whereClause.water_access = true;
    }
    
    if (electricity === 'true') {
      whereClause.electricity = true;
    }
    
    if (minRating && !isNaN(parseFloat(minRating))) {
      whereClause.rating = { [Op.gte]: parseFloat(minRating) };
    }
    
    let order = [];
    if (sortBy === 'price_asc') {
      order = [['price_per_month', 'ASC']];
    } else if (sortBy === 'price_desc') {
      order = [['price_per_month', 'DESC']];
    } else if (sortBy === 'area_asc') {
      order = [['area_hectares', 'ASC']];
    } else if (sortBy === 'area_desc') {
      order = [['area_hectares', 'DESC']];
    } else if (sortBy === 'rating') {
      order = [['rating', 'DESC']];
    } else {
      order = [['createdAt', 'DESC']];
    }
    
    const farms = await Farm.findAll({
      where: whereClause,
      order: order,
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone'] }]
    });
    
    res.json(farms);
  } catch (error) {
    console.error('Error in /api/farms:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/farms/my', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    let farms = [];
    
    if (user.role === 'landowner') {
      farms = await Farm.findAll({
        where: { owner_id: req.userId },
        include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }]
      });
    } else if (user.role === 'farm_admin') {
      if (user.managed_farm_id) {
        const farm = await Farm.findOne({
          where: { id: user.managed_farm_id },
          include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }]
        });
        if (farm) farms = [farm];
      }
    } else {
      farms = await Farm.findAll({
        where: { is_available: true },
        include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
        order: [['name', 'ASC']],
        limit: 100
      });
    }
    
    res.json(farms);
  } catch (error) {
    console.error('Error in /api/farms/my:', error);
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

// ========== Tasks endpoints ==========
app.get('/api/tasks', auth, async (req, res) => {
  try {
    console.log('GET /api/tasks - User ID:', req.userId);
    
    const tasks = await Task.findAll({
      where: { assigned_to: req.userId },
      include: [{ model: Farm, as: 'farm', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Found ${tasks.length} tasks`);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
  }
});

app.post('/api/tasks', auth, async (req, res) => {
  try {
    const { title, description, due_date, priority, task_type, farm_id } = req.body;
    
    console.log('POST /api/tasks - User ID:', req.userId);
    console.log('Request body:', req.body);
    
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Название задачи обязательно' });
    }
    
    // Проверяем существование пользователя
    const user = await User.findByPk(req.userId);
    if (!user) {
      console.error('User not found:', req.userId);
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Проверяем ферму если указана
    if (farm_id) {
      const farm = await Farm.findByPk(farm_id);
      if (!farm) {
        return res.status(404).json({ error: 'Ферма не найдена' });
      }
    }
    
    const task = await Task.create({
      id: uuidv4(),
      title: title.trim(),
      description: description || null,
      due_date: due_date || null,
      priority: priority || 'medium',
      task_type: task_type || 'other',
      farm_id: farm_id || null,
      assigned_to: req.userId,
      is_completed: false,
      completed_at: null
    });
    
    const taskWithFarm = await Task.findOne({
      where: { id: task.id },
      include: [{ model: Farm, as: 'farm', attributes: ['id', 'name'] }]
    });
    
    console.log('Task created successfully:', task.id);
    res.status(201).json(taskWithFarm);
    
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Ошибка при создании задачи: ' + error.message });
  }
});

app.put('/api/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }
    
    if (task.assigned_to !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Нет доступа к этой задаче' });
    }
    
    const { title, description, due_date, priority, task_type, farm_id, is_completed } = req.body;
    
    await task.update({
      title: title || task.title,
      description: description !== undefined ? description : task.description,
      due_date: due_date || task.due_date,
      priority: priority || task.priority,
      task_type: task_type || task.task_type,
      farm_id: farm_id !== undefined ? farm_id : task.farm_id,
      is_completed: is_completed !== undefined ? is_completed : task.is_completed,
      completed_at: is_completed && !task.is_completed ? new Date() : task.completed_at
    });
    
    const updatedTask = await Task.findOne({
      where: { id: task.id },
      include: [{ model: Farm, as: 'farm', attributes: ['id', 'name'] }]
    });
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Ошибка при обновлении задачи' });
  }
});

app.delete('/api/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }
    
    if (task.assigned_to !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Нет доступа к этой задаче' });
    }
    
    await task.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Ошибка при удалении задачи' });
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
        include: [{ model: Farm, as: 'farm' }],
        order: [['createdAt', 'DESC']]
      });
    } else if (user.role === 'landowner') {
      const userFarms = await Farm.findAll({ where: { owner_id: req.userId } });
      const farmIds = userFarms.map(f => f.id);
      bookings = await Booking.findAll({
        where: { farm_id: farmIds },
        include: [{ model: Farm, as: 'farm' }, { model: User, as: 'farmer' }],
        order: [['createdAt', 'DESC']]
      });
    } else {
      bookings = await Booking.findAll({
        include: [{ model: Farm, as: 'farm' }, { model: User, as: 'farmer' }],
        order: [['createdAt', 'DESC']]
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
      id: uuidv4(),
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
    const { status, cancel_reason } = req.body;
    const booking = await Booking.findByPk(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }
    await booking.update({ status, cancel_reason });
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/bookings/farm/:farmId', auth, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { farm_id: req.params.farmId },
      include: [
        { model: Farm, as: 'farm' },
        { model: User, as: 'farmer', attributes: ['id', 'name', 'email'] }
      ],
      order: [['start_date', 'ASC']]
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching farm bookings:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== Reviews endpoints ==========
app.get('/api/reviews/farm/:farmId', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { farm_id: req.params.farmId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar_url'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/reviews', auth, async (req, res) => {
  try {
    const { farm_id, rating, comment } = req.body;
    
    const hasCompletedBooking = await Booking.findOne({
      where: {
        farm_id: farm_id,
        farmer_id: req.userId,
        status: 'completed'
      }
    });
    
    if (!hasCompletedBooking && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Вы можете оставить отзыв только после завершения бронирования' });
    }
    
    const existingReview = await Review.findOne({
      where: {
        farm_id: farm_id,
        user_id: req.userId
      }
    });
    
    if (existingReview && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Вы уже оставляли отзыв на эту ферму' });
    }
    
    const review = await Review.create({
      id: uuidv4(),
      farm_id,
      user_id: req.userId,
      rating,
      comment
    });
    
    const allReviews = await Review.findAll({ where: { farm_id } });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await Farm.update(
      { 
        rating: parseFloat(avgRating.toFixed(1)),
        total_reviews: allReviews.length
      },
      { where: { id: farm_id } }
    );
    
    res.json({ success: true, review, message: 'Спасибо за отзыв!' });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== Reports endpoints ==========
app.get('/api/reports/financial', auth, async (req, res) => {
  try {
    const { startDate, endDate, farmId } = req.query;
    let whereClause = {};
    
    if (farmId && farmId !== '') whereClause.farm_id = farmId;
    if (startDate) whereClause.start_date = { [Op.gte]: startDate };
    if (endDate) whereClause.end_date = { [Op.lte]: endDate };
    
    const bookings = await Booking.findAll({
      where: whereClause,
      include: [{ model: Farm, as: 'farm' }],
      order: [['createdAt', 'DESC']]
    });
    
    const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.total_price), 0);
    
    res.json({
      bookings: bookings.map(b => ({
        id: b.id,
        farm_name: b.farm?.name,
        start_date: b.start_date,
        end_date: b.end_date,
        total_price: b.total_price,
        status: b.status,
        created_at: b.createdAt
      })),
      summary: {
        total_bookings: bookings.length,
        total_revenue: totalRevenue,
        average_booking_value: bookings.length ? totalRevenue / bookings.length : 0
      }
    });
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/reports/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { assigned_to: req.userId },
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

app.get('/api/reports/yield', auth, async (req, res) => {
  try {
    const farms = await Farm.findAll({
      where: { is_available: true },
      limit: 5
    });
    
    const cropsData = farms.map((farm, index) => ({
      id: `crop_${index}`,
      crop_name: ['Пшеница', 'Кукуруза', 'Подсолнечник'][index % 3],
      farm_name: farm.name,
      area_hectares: parseFloat(farm.area_hectares),
      yield_kg: Math.round(parseFloat(farm.area_hectares) * 3500),
      yield_per_hectare: 3500,
      target_yield: 4000
    }));
    
    res.json({
      crops: cropsData,
      summary: {
        total_crops: cropsData.length,
        total_yield: cropsData.reduce((sum, c) => sum + c.yield_kg, 0),
        avg_yield: 3500
      }
    });
  } catch (error) {
    console.error('Error generating yield report:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/reports', auth, async (req, res) => {
  try {
    const report = await Report.create({
      id: uuidv4(),
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
      where: { id: { [Op.ne]: req.userId } },
      attributes: ['id', 'name', 'role', 'email', 'phone', 'location']
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
        [Op.or]: [
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
      id: uuidv4(),
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
    { id: 1, name: 'Аммиачная селитра', type: 'Азотное', price: 2500, unit: 'кг', inStock: 500, rating: 4.8, image: 'https://images.unsplash.com/photo-1585921805752-5a2a2b6d4c3f?w=300' },
    { id: 2, name: 'Суперфосфат', type: 'Фосфорное', price: 1800, unit: 'кг', inStock: 300, rating: 4.6, image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300' },
    { id: 3, name: 'Калийная соль', type: 'Калийное', price: 2200, unit: 'кг', inStock: 400, rating: 4.7, image: 'https://images.unsplash.com/photo-1585921805752-5a2a2b6d4c3f?w=300' },
    { id: 4, name: 'Нитроаммофоска', type: 'Комплексное', price: 3000, unit: 'кг', inStock: 600, rating: 4.9, image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300' }
  ];
  res.json(products);
});

app.post('/api/fertilizer/order', auth, async (req, res) => {
  try {
    const { items, total, delivery_address } = req.body;
    const order = await FertilizerOrder.create({
      id: uuidv4(),
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

app.post('/api/admin/farms', auth, adminAuth, async (req, res) => {
  try {
    const {
      name,
      location,
      area_hectares,
      price_per_month,
      soil_type,
      water_access,
      electricity,
      description,
      owner_id
    } = req.body;

    if (!name || !location || !area_hectares || !price_per_month) {
      return res.status(400).json({ error: 'Заполните обязательные поля' });
    }

    const farm = await Farm.create({
      id: uuidv4(),
      name,
      location,
      area_hectares: parseFloat(area_hectares),
      price_per_month: parseFloat(price_per_month),
      soil_type: soil_type || null,
      water_access: water_access || false,
      electricity: electricity || false,
      description: description || null,
      owner_id: owner_id || null,
      is_available: true,
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'],
      rating: 0,
      total_reviews: 0
    });

    res.status(201).json({ success: true, farm, message: 'Ферма успешно создана' });
  } catch (error) {
    console.error('Error creating farm:', error);
    res.status(500).json({ error: 'Ошибка при создании фермы' });
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
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ bookings, total: bookings.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/admin/bookings', auth, adminAuth, async (req, res) => {
  try {
    const {
      farm_id,
      farmer_id,
      start_date,
      end_date,
      total_price,
      notes,
      status
    } = req.body;

    if (!farm_id || !farmer_id || !start_date || !end_date || !total_price) {
      return res.status(400).json({ error: 'Заполните обязательные поля' });
    }

    const booking = await Booking.create({
      id: uuidv4(),
      farm_id,
      farmer_id,
      start_date,
      end_date,
      total_price: parseFloat(total_price),
      notes: notes || null,
      status: status || 'pending'
    });

    res.status(201).json({ success: true, booking, message: 'Бронирование успешно создано' });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Ошибка при создании бронирования' });
  }
});

app.delete('/api/admin/bookings/:bookingId', auth, adminAuth, async (req, res) => {
  try {
    await Booking.destroy({ where: { id: req.params.bookingId } });
    res.status(204).send();
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

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log('📋 Доступные эндпоинты:');
  console.log('   POST /api/login');
  console.log('   POST /api/register');
  console.log('   GET  /api/farms');
  console.log('   GET  /api/tasks');
  console.log('   POST /api/tasks');
  console.log('   GET  /api/bookings/my');
  console.log('   GET  /api/reports/financial');
  console.log('   GET  /api/reports/tasks');
});