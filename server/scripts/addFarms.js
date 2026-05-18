const { sequelize, Farm, User } = require('../models/index');

const addFarms = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to DB');
    
    const owner = await User.findOne({ where: { email: 'ivan@example.com' } });
    if (!owner) {
      console.log('❌ Owner not found. Please register ivan@example.com first');
      process.exit(1);
    }
    
    console.log(`✅ Owner found: ${owner.id}`);
    
    const existingCount = await Farm.count();
    console.log(`📊 Current farms in DB: ${existingCount}`);
    
    const newFarms = [
      { name: 'AgroDolina', location: 'Minsk region, Molodechno', area_hectares: 15.5, price_per_month: 55000, soil_type: 'Chernozem', water_access: true, electricity: true, description: 'Large farm with excellent infrastructure', rating: 4.9, total_reviews: 32 },
      { name: 'Zeleny Lug', location: 'Minsk region, Pukhovichi', area_hectares: 8.2, price_per_month: 32000, soil_type: 'Loam', water_access: true, electricity: true, description: 'Perfect for organic farming', rating: 4.7, total_reviews: 18 },
      { name: 'Bobruisk Zori', location: 'Mogilev region, Bobruisk', area_hectares: 22.0, price_per_month: 68000, soil_type: 'Chernozem', water_access: true, electricity: true, description: 'Spacious fields for large-scale production', rating: 4.8, total_reviews: 25 },
      { name: 'Polesky Urozhay', location: 'Gomel region, Kalinkovichi', area_hectares: 11.5, price_per_month: 42000, soil_type: 'Peat', water_access: true, electricity: false, description: 'Rich peat soils for vegetables', rating: 4.5, total_reviews: 14 },
      { name: 'Dneprovskaya Niva', location: 'Mogilev region, Shklov', area_hectares: 9.8, price_per_month: 37000, soil_type: 'Loam', water_access: true, electricity: true, description: 'Picturesque place on the Dnieper', rating: 4.6, total_reviews: 12 },
      { name: 'Neman Agro', location: 'Grodno region, Mosty', area_hectares: 14.2, price_per_month: 48000, soil_type: 'Chernozem', water_access: true, electricity: true, description: 'Fertile lands in the Neman valley', rating: 4.9, total_reviews: 21 },
      { name: 'Vitebskaya Zastava', location: 'Vitebsk region, Liozno', area_hectares: 7.5, price_per_month: 29000, soil_type: 'Loam', water_access: false, electricity: true, description: 'Suitable for grain crops', rating: 4.4, total_reviews: 9 },
      { name: 'Pripyatskoe Razdolye', location: 'Gomel region, Zhitkovichi', area_hectares: 18.3, price_per_month: 58000, soil_type: 'Peat', water_access: true, electricity: false, description: 'Unique peat soils', rating: 4.7, total_reviews: 16 },
      { name: 'Grodnensky Start', location: 'Grodno region, Grodno', area_hectares: 4.5, price_per_month: 21000, soil_type: 'Sandy', water_access: true, electricity: true, description: 'For beginner farmers near the city', rating: 4.3, total_reviews: 7 },
      { name: 'Berezinsky Rassvet', location: 'Minsk region, Berezino', area_hectares: 12.8, price_per_month: 44000, soil_type: 'Chernozem', water_access: true, electricity: true, description: 'Environmentally friendly area', rating: 4.8, total_reviews: 19 },
      { name: 'Mstislavskie Luga', location: 'Mogilev region, Mstislavl', area_hectares: 6.5, price_per_month: 26000, soil_type: 'Loam', water_access: false, electricity: true, description: 'Small areas for targeted cultivation', rating: 4.5, total_reviews: 11 },
      { name: 'Zhodinsky Trakt', location: 'Minsk region, Zhodino', area_hectares: 5.8, price_per_month: 24000, soil_type: 'Chernozem', water_access: true, electricity: true, description: 'Convenient location for product delivery', rating: 4.6, total_reviews: 13 }
    ];
    
    let added = 0;
    for (const farm of newFarms) {
      const exists = await Farm.findOne({ where: { name: farm.name } });
      if (!exists) {
        await Farm.create({
          ...farm,
          owner_id: owner.id,
          is_available: true,
          images: ['https://images.pexels.com/photos/1500382017468/pexels-photo-1500382017468.jpeg?w=400']
        });
        added++;
        console.log(`✅ Added: ${farm.name}`);
      } else {
        console.log(`⏭️ Skipped (exists): ${farm.name}`);
      }
    }
    
    const totalFarms = await Farm.count();
    console.log(`\n🎉 Added ${added} new farms!`);
    console.log(`📊 Total farms in DB: ${totalFarms}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addFarms();