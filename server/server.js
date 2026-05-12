// Get my bookings
app.get('/api/bookings/my', (req, res) => {
  res.json([
    {
      id: 'b1',
      farm_id: '1',
      farm: { name: 'Зелёная долина', location: 'Московская обл.' },
      start_date: '2024-06-01',
      end_date: '2024-06-30',
      total_price: 25000,
      status: 'approved',
      notes: 'Планирую выращивать овощи',
      created_at: '2024-05-01T10:00:00Z',
    },
    {
      id: 'b2',
      farm_id: '2',
      farm: { name: 'Урожайное поле', location: 'Краснодарский край' },
      start_date: '2024-07-15',
      end_date: '2024-08-15',
      total_price: 45000,
      status: 'pending',
      notes: 'Для посадки пшеницы',
      created_at: '2024-05-10T14:30:00Z',
    },
  ]);
});

// Get my farms (for landowner)
app.get('/api/farms/my', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Зелёная долина',
      location: 'Московская обл., Сергиев Посад',
      area_hectares: 5.5,
      price_per_month: 25000,
      soil_type: 'Чернозем',
      water_access: true,
      electricity: true,
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'],
      is_available: true,
      created_at: '2024-01-01',
    },
  ]);
});

// Update booking status
app.put('/api/bookings/:bookingId/status', (req, res) => {
  const { status } = req.body;
  res.json({
    id: req.params.bookingId,
    status,
    farm: { name: 'Зелёная долина', location: 'Московская обл.' },
    start_date: '2024-06-01',
    end_date: '2024-06-30',
    total_price: 25000,
    notes: 'Тест',
  });
});

// Create farm
app.post('/api/farms', (req, res) => {
  const newFarm = {
    id: Date.now().toString(),
    ...req.body,
    images: [],
    is_available: true,
    created_at: new Date().toISOString(),
  };
  res.json(newFarm);
});

// Delete farm
app.delete('/api/farms/:id', (req, res) => {
  res.status(204).send();
});