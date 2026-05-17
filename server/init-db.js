const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('agri_coworking', 'postgres', 'ваш_пароль', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

// Определение моделей (8 таблиц)
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('farmer', 'landowner', 'farm_admin', 'admin'), defaultValue: 'farmer' },
  phone: DataTypes.STRING,
  location: DataTypes.STRING,
  is_blocked: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

const Farm = sequelize.define('Farm', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  location: DataTypes.STRING,
  area_hectares: DataTypes.DECIMAL(10,2),
  price_per_month: DataTypes.DECIMAL(10,2),
  soil_type: DataTypes.STRING,
  water_access: { type: DataTypes.BOOLEAN, defaultValue: false },
  electricity: { type: DataTypes.BOOLEAN, defaultValue: false },
  images: DataTypes.ARRAY(DataTypes.TEXT),
  description: DataTypes.TEXT,
  is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
  rating: { type: DataTypes.FLOAT, defaultValue: 0 },
}, { timestamps: true });

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  start_date: DataTypes.DATEONLY,
  end_date: DataTypes.DATEONLY,
  total_price: DataTypes.DECIMAL(10,2),
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled'), defaultValue: 'pending' },
  notes: DataTypes.TEXT,
}, { timestamps: true });

const Crop = sequelize.define('Crop', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: DataTypes.STRING,
  type: DataTypes.STRING,
  planting_season: DataTypes.STRING,
  harvest_season: DataTypes.STRING,
  avg_yield_per_hectare: DataTypes.DECIMAL(10,2),
}, { timestamps: true });

const Task = sequelize.define('Task', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  due_date: DataTypes.DATEONLY,
  priority: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
  task_type: { type: DataTypes.ENUM('planting', 'watering', 'fertilizing', 'harvesting', 'maintenance', 'other'), defaultValue: 'other' },
  is_completed: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

const Report = sequelize.define('Report', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  report_type: { type: DataTypes.ENUM('financial', 'tasks', 'yield', 'farm') },
  data: DataTypes.JSONB,
  period_start: DataTypes.DATEONLY,
  period_end: DataTypes.DATEONLY,
}, { timestamps: true });

const Message = sequelize.define('Message', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  message: DataTypes.TEXT,
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

const FertilizerOrder = sequelize.define('FertilizerOrder', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  items: DataTypes.JSONB,
  total: DataTypes.DECIMAL(10,2),
  delivery_address: DataTypes.TEXT,
  status: { type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered'), defaultValue: 'pending' },
}, { timestamps: true });

// Связи между таблицами
User.hasMany(Farm, { foreignKey: 'owner_id' });
Farm.belongsTo(User, { foreignKey: 'owner_id' });

User.hasMany(Booking, { foreignKey: 'user_id' });
Farm.hasMany(Booking, { foreignKey: 'farm_id' });
Booking.belongsTo(Farm);
Booking.belongsTo(User);

User.hasMany(Task, { foreignKey: 'user_id' });
Farm.hasMany(Task, { foreignKey: 'farm_id' });
Task.belongsTo(Farm);
Task.belongsTo(User);

User.hasMany(Report, { foreignKey: 'user_id' });
Farm.hasMany(Report, { foreignKey: 'farm_id' });

User.hasMany(Message, { foreignKey: 'from_user_id' });
User.hasMany(Message, { foreignKey: 'to_user_id' });

User.hasMany(FertilizerOrder, { foreignKey: 'user_id' });

async function initDb() {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключение к PostgreSQL установлено');
    
    await sequelize.sync({ force: true });
    console.log('✅ Таблицы созданы');
    
    console.log('📊 Создано таблиц: 8 (Users, Farms, Bookings, Crops, Tasks, Reports, Messages, FertilizerOrders)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

initDb();