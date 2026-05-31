const { sequelize, Farm } = require('../models/index');

// Гарантированно работающие изображения с Pexels
const farmImages = {
  'AgroDolina': [
    'https://images.pexels.com/photos/258117/pexels-photo-258117.jpeg?w=600',
    'https://images.pexels.com/photos/164504/pexels-photo-164504.jpeg?w=600'
  ],
  'Zeleny Lug': [
    'https://images.pexels.com/photos/235725/pexels-photo-235725.jpeg?w=600',
    'https://images.pexels.com/photos/258117/pexels-photo-258117.jpeg?w=600'
  ],
  'Bobruisk Zori': [
    'https://images.pexels.com/photos/164504/pexels-photo-164504.jpeg?w=600',
    'https://images.pexels.com/photos/1114014/pexels-photo-1114014.jpeg?w=600'
  ],
  'Polesky Urozhay': [
    'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?w=600',
    'https://images.pexels.com/photos/258117/pexels-photo-258117.jpeg?w=600'
  ],
  'Dneprovskaya Niva': [
    'https://images.pexels.com/photos/1114014/pexels-photo-1114014.jpeg?w=600',
    'https://images.pexels.com/photos/164504/pexels-photo-164504.jpeg?w=600'
  ],
  'Neman Agro': [
    'https://images.pexels.com/photos/258117/pexels-photo-258117.jpeg?w=600',
    'https://images.pexels.com/photos/235725/pexels-photo-235725.jpeg?w=600'
  ],
  'Vitebskaya Zastava': [
    'https://images.pexels.com/photos/164504/pexels-photo-164504.jpeg?w=600',
    'https://images.pexels.com/photos/258117/pexels-photo-258117.jpeg?w=600'
  ],
  'Pripyatskoe Razdolye': [
    'https://images.pexels.com/photos/235725/pexels-photo-235725.jpeg?w=600',
    'https://images.pexels.com/photos/1114014/pexels-photo-1114014.jpeg?w=600'
  ],
  'Berezinsky Rassvet': [
    'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?w=600',
    'https://images.pexels.com/photos/258117/pexels-photo-258117.jpeg?w=600'
  ],
  'Mstislavskie Luga': [
    'https://images.pexels.com/photos/164504/pexels-photo-164504.jpeg?w=600',
    'https://images.pexels.com/photos/235725/pexels-photo-235725.jpeg?w=600'
  ],
  'Zhodinsky Trakt': [
    'https://images.pexels.com/photos/258117/pexels-photo-258117.jpeg?w=600',
    'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?w=600'
  ]
};

// Изображение по умолчанию для всех ферм
const DEFAULT_IMAGE = 'https://images.pexels.com/photos/258117/pexels-photo-258117.jpeg?w=600';

const addMissingImages = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключено к БД\n');

    const farms = await Farm.findAll();
    let updated = 0;
    let skipped = 0;

    for (const farm of farms) {
      // Проверяем, есть ли уже изображения
      const hasImages = farm.images && farm.images.length > 0 && farm.images[0] !== null;
      
      if (!hasImages || farmImages[farm.name]) {
        const newImages = farmImages[farm.name] || [DEFAULT_IMAGE];
        await farm.update({ images: newImages });
        console.log(`✅ Обновлены изображения для: ${farm.name}`);
        updated++;
      } else {
        console.log(`⏭️ Пропущено (уже есть): ${farm.name}`);
        skipped++;
      }
    }

    console.log(`\n📊 Результат:`);
    console.log(`   Обновлено ферм: ${updated}`);
    console.log(`   Пропущено ферм: ${skipped}`);
    console.log(`   Всего ферм: ${farms.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
};

addMissingImages();