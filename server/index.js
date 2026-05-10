const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Подключение PostgreSQL
const sequelize = new Sequelize('agri_coworking', 'postgres', 'password', {
  host: 'localhost',
  dialect: 'postgres',
});

// Модели (упрощённо)
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password_hash: DataTypes.STRING,
  role: DataTypes.STRING,
});

const Farm = sequelize.define('Farm', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: DataTypes.STRING,
  area_hectares: DataTypes.FLOAT,
  price_per_month: DataTypes.FLOAT,
  location: DataTypes.TEXT,
  is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
});

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  start_date: DataTypes.DATE,
  end_date: DataTypes.DATE,
  total_price: DataTypes.FLOAT,
  status: DataTypes.STRING,
});

User.hasMany(Farm, { foreignKey: 'owner_id' });
Farm.belongsTo(User, { foreignKey: 'owner_id' });
User.hasMany(Booking, { foreignKey: 'farmer_id' });
Farm.hasMany(Booking);
Booking.belongsTo(Farm);
Booking.belongsTo(User, { foreignKey: 'farmer_id' });

// Middleware auth
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, 'secret_key');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// РЕГИСТРАЦИЯ
app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password_hash: hashed, role });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// ЛОГИН
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id, role: user.role }, 'secret_key', { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

// ПОЛУЧИТЬ ВСЕ ФЕРМЫ
app.get('/api/farms', async (req, res) => {
  const farms = await Farm.findAll({ include: [{ model: User, as: 'User', attributes: ['name', 'email'] }] });
  res.json(farms);
});

// ЗАБРОНИРОВАТЬ ФЕРМУ
app.post('/api/bookings', auth, async (req, res) => {
  const { farmId, startDate, endDate, totalPrice } = req.body;
  const booking = await Booking.create({
    farm_id: farmId,
    farmer_id: req.userId,
    start_date: startDate,
    end_date: endDate,
    total_price: totalPrice,
    status: 'pending',
  });
  res.json(booking);
});

// ОТЧЁТ ПО ФЕРМЕ (генерация)
app.get('/api/report/:farmId', auth, async (req, res) => {
  const { farmId } = req.params;
  const farm = await Farm.findByPk(farmId);
  const bookings = await Booking.findAll({ where: { farm_id: farmId } });
  const reportData = {
    farmName: farm.name,
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, b) => sum + (b.total_price || 0), 0),
    generatedAt: new Date(),
  };
  res.json(reportData);
});

sequelize.sync({ alter: true }).then(() => {
  app.listen(5000, () => console.log('Server on http://localhost:5000'));
});