const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { sequelize, User } = require('../models/index');

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключено к БД');
    
    const existing = await User.findOne({ where: { email: 'admin@agri.com' } });
    
    if (!existing) {
      await User.create({
        id: uuidv4(),
        name: 'Администратор',
        email: 'admin@agri.com',
        password_hash: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        phone: '89991112233',  // Простой формат без спецсимволов
        location: 'Москва',
        is_blocked: false
      });
      console.log('✅ Администратор создан: admin@agri.com / admin123');
    } else {
      console.log('⚠️ Администратор уже существует');
    }
    
    const users = await User.findAll();
    console.log('\n📋 Все пользователи:');
    users.forEach(u => {
      console.log(`  - ${u.email} | роль: ${u.role}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error('Детали:', error.errors);
    process.exit(1);
  }
};

createAdmin();