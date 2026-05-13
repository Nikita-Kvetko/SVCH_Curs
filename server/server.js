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

// Mock tasks data
let mockTasks = [
  {
    id: 't1',
    title: 'Полив томатов',
    description: 'Полить теплицу с томатами, примерно 200 литров',
    due_date: '2024-06-15',
    priority: 'high',
    task_type: 'watering',
    farm_id: '1',
    farm: { name: 'Зелёная долина' },
    is_completed: false,
    created_at: '2024-06-01T08:00:00Z',
  },
  {
    id: 't2',
    title: 'Внесение удобрений',
    description: 'Внести азотные удобрения под пшеницу',
    due_date: '2024-06-20',
    priority: 'medium',
    task_type: 'fertilizing',
    farm_id: '2',
    farm: { name: 'Урожайное поле' },
    is_completed: false,
    created_at: '2024-06-02T10:00:00Z',
  },
  {
    id: 't3',
    title: 'Проверка оборудования',
    description: 'Проверить трактор перед сезоном',
    due_date: '2024-06-05',
    priority: 'high',
    task_type: 'maintenance',
    farm_id: '1',
    farm: { name: 'Зелёная долина' },
    is_completed: true,
    completed_at: '2024-06-04T16:00:00Z',
    created_at: '2024-06-01T09:00:00Z',
  },
];

// Get tasks
app.get('/api/tasks', (req, res) => {
  let tasks = [...mockTasks];
  const { status, priority, farm_id } = req.query;
  
  if (status === 'completed') {
    tasks = tasks.filter(t => t.is_completed);
  } else if (status === 'pending') {
    tasks = tasks.filter(t => !t.is_completed);
  }
  
  if (priority && priority !== 'all') {
    tasks = tasks.filter(t => t.priority === priority);
  }
  
  if (farm_id && farm_id !== 'all') {
    tasks = tasks.filter(t => t.farm_id === farm_id);
  }
  
  res.json(tasks);
});

// Create task
app.post('/api/tasks', (req, res) => {
  const newTask = {
    id: Date.now().toString(),
    ...req.body,
    is_completed: false,
    created_at: new Date().toISOString(),
  };
  mockTasks.unshift(newTask);
  res.json(newTask);
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  const index = mockTasks.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    mockTasks[index] = { ...mockTasks[index], ...req.body };
    res.json(mockTasks[index]);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  mockTasks = mockTasks.filter(t => t.id !== req.params.id);
  res.status(204).send();
});

// Toggle complete
app.patch('/api/tasks/:id/complete', (req, res) => {
  const index = mockTasks.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    mockTasks[index].is_completed = req.body.is_completed;
    if (req.body.is_completed) {
      mockTasks[index].completed_at = new Date().toISOString();
    } else {
      delete mockTasks[index].completed_at;
    }
    res.json(mockTasks[index]);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});