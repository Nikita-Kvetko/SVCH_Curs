const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'agri_coworking',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 1. Пользователи
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('farmer', 'landowner', 'farm_admin', 'admin'),
    defaultValue: 'farmer'
  },
  phone: {
    type: DataTypes.STRING,
    validate: {
      is: /^\+?[\d\s-]{10,}$/
    }
  },
  location: DataTypes.STRING,
  avatar_url: DataTypes.TEXT,
  is_blocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  managed_farm_id: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'users'
});

// 2. Фермы
const Farm = sequelize.define('Farm', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: DataTypes.STRING,
  area_hectares: {
    type: DataTypes.DECIMAL(10, 2),
    validate: {
      min: 0.01
    }
  },
  price_per_month: {
    type: DataTypes.DECIMAL(10, 2),
    validate: {
      min: 0
    }
  },
  soil_type: DataTypes.STRING,
  water_access: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  electricity: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  description: DataTypes.TEXT,
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  total_reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'farms'
});

// 3. Бронирования
const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  notes: DataTypes.TEXT,
  cancel_reason: DataTypes.TEXT
}, {
  timestamps: true,
  tableName: 'bookings'
});

// 4. Культуры
const Crop = sequelize.define('Crop', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: DataTypes.STRING,
  planting_season: DataTypes.STRING,
  harvest_season: DataTypes.STRING,
  avg_yield_per_hectare: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  growing_days: DataTypes.INTEGER
}, {
  timestamps: true,
  tableName: 'crops'
});

// 5. Задачи
const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  due_date: DataTypes.DATEONLY,
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  task_type: {
    type: DataTypes.ENUM('planting', 'watering', 'fertilizing', 'harvesting', 'maintenance', 'other'),
    defaultValue: 'other'
  },
  is_completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completed_at: DataTypes.DATE
}, {
  timestamps: true,
  tableName: 'tasks'
});

// 6. Отчеты
const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  report_type: {
    type: DataTypes.ENUM('financial', 'tasks', 'yield', 'farm'),
    allowNull: false
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  period_start: DataTypes.DATEONLY,
  period_end: DataTypes.DATEONLY
}, {
  timestamps: true,
  tableName: 'reports'
});

// 7. Сообщения чата
const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  read_at: DataTypes.DATE
}, {
  timestamps: true,
  tableName: 'messages'
});

// 8. Отзывы
const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'reviews'
});

// ========== СВЯЗИ МЕЖДУ ТАБЛИЦАМИ ==========

// User -> Farm (владелец фермы)
User.hasMany(Farm, { foreignKey: 'owner_id', as: 'owned_farms' });
Farm.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// User -> Booking (арендатор)
User.hasMany(Booking, { foreignKey: 'farmer_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'farmer_id', as: 'farmer' });

// Farm -> Booking
Farm.hasMany(Booking, { foreignKey: 'farm_id', as: 'bookings' });
Booking.belongsTo(Farm, { foreignKey: 'farm_id', as: 'farm' });

// Farm -> Crop (культуры на ферме)
Farm.belongsToMany(Crop, { through: 'FarmCrops', foreignKey: 'farm_id', as: 'crops' });
Crop.belongsToMany(Farm, { through: 'FarmCrops', foreignKey: 'crop_id', as: 'farms' });

// User -> Task
User.hasMany(Task, { foreignKey: 'assigned_to', as: 'assigned_tasks' });
Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

// Farm -> Task
Farm.hasMany(Task, { foreignKey: 'farm_id', as: 'tasks' });
Task.belongsTo(Farm, { foreignKey: 'farm_id', as: 'farm' });

// User -> Report
User.hasMany(Report, { foreignKey: 'user_id', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Farm -> Report
Farm.hasMany(Report, { foreignKey: 'farm_id', as: 'reports' });
Report.belongsTo(Farm, { foreignKey: 'farm_id', as: 'farm' });

// User -> Message
User.hasMany(Message, { foreignKey: 'from_user_id', as: 'sent_messages' });
User.hasMany(Message, { foreignKey: 'to_user_id', as: 'received_messages' });
Message.belongsTo(User, { foreignKey: 'from_user_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'to_user_id', as: 'receiver' });

// User -> Review
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Farm -> Review
Farm.hasMany(Review, { foreignKey: 'farm_id', as: 'reviews' });
Review.belongsTo(Farm, { foreignKey: 'farm_id', as: 'farm' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Farm,
  Booking,
  Crop,
  Task,
  Report,
  Message,
  Review
};