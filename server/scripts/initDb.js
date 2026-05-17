const bcrypt = require('bcryptjs');
const {
  sequelize,
  User,
  Farm,
  Booking,
  Crop,
  Task
} = require('../models/index');

const initDatabase = async () => {
  try {
    // Синхронизация таблиц (force: true пересоздаст таблицы)
    await sequelize.sync({ force: true });
    console.log('✅ Таблицы созданы');

    // Создание пользователей
    const users = await User.bulkCreate([
      {
        name: 'Администратор',
        email: 'admin@agri.com',
        password_hash: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        phone: '+7 (999) 111-22-33',
        location: 'Москва'
      },
      {
        name: 'Иван Петров',
        email: 'ivan@example.com',
        password_hash: bcrypt.hashSync('123456', 10),
        role: 'landowner',
        phone: '+7 (999) 123-45-67',
        location: 'Московская обл.'
      },
      {
        name: 'Екатерина Смирнова',
        email: 'ekaterina@example.com',
        password_hash: bcrypt.hashSync('123456', 10),
        role: 'farmer',
        phone: '+7 (888) 765-43-21',
        location: 'Краснодар'
      },
      {
        name: 'Сергей Михайлов',
        email: 'farmadmin@agri.com',
        password_hash: bcrypt.hashSync('admin123', 10),
        role: 'farm_admin',
        phone: '+7 (999) 555-66-77',
        location: 'Московская обл.',
        managed_farm_id: null
      }
    ]);
    console.log(`✅ Создано ${users.length} пользователей`);

    // Создание ферм
    const farms = await Farm.bulkCreate([
      {
        name: 'Зелёная долина',
        location: 'Московская обл., Сергиев Посад',
        area_hectares: 5.5,
        price_per_month: 25000,
        soil_type: 'Чернозем',
        water_access: true,
        electricity: true,
        images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'],
        description: 'Прекрасное место для органического земледелия',
        owner_id: users[1].id,
        rating: 4.8,
        total_reviews: 23
      },
      {
        name: 'Урожайное поле',
        location: 'Краснодарский край',
        area_hectares: 12.0,
        price_per_month: 45000,
        soil_type: 'Чернозем',
        water_access: true,
        electricity: true,
        images: ['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400'],
        description: 'Идеально для выращивания зерновых',
        owner_id: users[1].id,
        rating: 4.5,
        total_reviews: 15
      },
      {
        name: 'Лесная поляна',
        location: 'Ленинградская обл.',
        area_hectares: 3.2,
        price_per_month: 18000,
        soil_type: 'Суглинок',
        water_access: false,
        electricity: true,
        images: ['https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400'],
        description: 'Уединённое место в лесу',
        owner_id: users[1].id,
        rating: 4.2,
        total_reviews: 8
      }
    ]);
    console.log(`✅ Создано ${farms.length} ферм`);

    // Обновляем farm_admin, привязываем к первой ферме
    await users[3].update({ managed_farm_id: farms[0].id });

    // Создание культур
    const crops = await Crop.bulkCreate([
      { name: 'Пшеница', type: 'Зерновые', planting_season: 'Весна', harvest_season: 'Лето', avg_yield_per_hectare: 45, growing_days: 120 },
      { name: 'Кукуруза', type: 'Зерновые', planting_season: 'Весна', harvest_season: 'Осень', avg_yield_per_hectare: 80, growing_days: 140 },
      { name: 'Подсолнечник', type: 'Масличные', planting_season: 'Весна', harvest_season: 'Осень', avg_yield_per_hectare: 25, growing_days: 110 }
    ]);
    console.log(`✅ Создано ${crops.length} культур`);

    // Создание бронирований
    const bookings = await Booking.bulkCreate([
      {
        farm_id: farms[0].id,
        farmer_id: users[2].id,
        start_date: '2024-06-01',
        end_date: '2024-06-30',
        total_price: 25000,
        status: 'approved',
        notes: 'Для посадки овощей'
      },
      {
        farm_id: farms[0].id,
        farmer_id: users[2].id,
        start_date: '2024-07-01',
        end_date: '2024-07-31',
        total_price: 25000,
        status: 'pending',
        notes: 'Для посадки зерновых'
      }
    ]);
    console.log(`✅ Создано ${bookings.length} бронирований`);

    // Создание задач
    const tasks = await Task.bulkCreate([
      {
        title: 'Полив томатов',
        description: 'Полить теплицу с томатами',
        due_date: '2024-06-15',
        priority: 'high',
        task_type: 'watering',
        farm_id: farms[0].id,
        assigned_to: users[2].id,
        is_completed: false
      },
      {
        title: 'Внесение удобрений',
        description: 'Внести азотные удобрения',
        due_date: '2024-06-20',
        priority: 'medium',
        task_type: 'fertilizing',
        farm_id: farms[1].id,
        assigned_to: users[2].id,
        is_completed: false
      }
    ]);
    console.log(`✅ Создано ${tasks.length} задач`);

    console.log('\n🎉 База данных успешно инициализирована!');
    console.log('📝 Данные для входа:');
    console.log('   Админ: admin@agri.com / admin123');
    console.log('   Владелец: ivan@example.com / 123456');
    console.log('   Фермер: ekaterina@example.com / 123456');
    console.log('   Админ фермы: farmadmin@agri.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при инициализации БД:', error);
    process.exit(1);
  }
};

initDatabase();