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

// Mock saved reports
let mockSavedReports = [];

// Financial report
app.get('/api/reports/financial', (req, res) => {
  const { startDate, endDate, farmId } = req.query;
  
  const mockData = {
    bookings: [
      {
        id: 'b1',
        farm_name: 'Зелёная долина',
        start_date: '2024-06-01',
        end_date: '2024-06-30',
        total_price: 25000,
        status: 'approved',
      },
      {
        id: 'b2',
        farm_name: 'Урожайное поле',
        start_date: '2024-06-15',
        end_date: '2024-07-15',
        total_price: 45000,
        status: 'pending',
      },
      {
        id: 'b3',
        farm_name: 'Лесная поляна',
        start_date: '2024-05-10',
        end_date: '2024-06-10',
        total_price: 18000,
        status: 'completed',
      },
    ],
    summary: {
      total_bookings: 3,
      total_revenue: 88000,
      average_booking_value: 29333,
    },
  };
  
  res.json(mockData);
});

// Tasks report
app.get('/api/reports/tasks', (req, res) => {
  const mockData = {
    tasks: [
      { id: 't1', title: 'Полив томатов', farm_name: 'Зелёная долина', due_date: '2024-06-15', priority: 'high', is_completed: false, overdue: false },
      { id: 't2', title: 'Внесение удобрений', farm_name: 'Урожайное поле', due_date: '2024-06-20', priority: 'medium', is_completed: false, overdue: false },
      { id: 't3', title: 'Проверка оборудования', farm_name: 'Зелёная долина', due_date: '2024-06-05', priority: 'high', is_completed: true, overdue: false },
      { id: 't4', title: 'Сбор урожая', farm_name: 'Приволье', due_date: '2024-05-25', priority: 'high', is_completed: false, overdue: true },
    ],
    summary: {
      total: 4,
      completed: 1,
      pending: 2,
      overdue: 1,
    },
  };
  res.json(mockData);
});

// Crops report
app.get('/api/reports/crops', (req, res) => {
  const mockData = {
    crops: [
      { id: 'c1', crop_name: 'Пшеница', farm_name: 'Урожайное поле', area_hectares: 10, yield_kg: 35000, yield_per_hectare: 3500, target_yield: 4000 },
      { id: 'c2', crop_name: 'Томаты', farm_name: 'Зелёная долина', area_hectares: 2, yield_kg: 12000, yield_per_hectare: 6000, target_yield: 5000 },
      { id: 'c3', crop_name: 'Подсолнечник', farm_name: 'Приволье', area_hectares: 5, yield_kg: 10000, yield_per_hectare: 2000, target_yield: 2500 },
    ],
    summary: {
      total_crops: 3,
      total_yield: 57000,
      avg_yield: 3833,
    },
  };
  res.json(mockData);
});

// Save report
app.post('/api/reports', (req, res) => {
  const newReport = {
    id: Date.now().toString(),
    ...req.body,
    created_at: new Date().toISOString(),
  };
  mockSavedReports.unshift(newReport);
  res.json(newReport);
});

// Get saved reports
app.get('/api/reports/my', (req, res) => {
  res.json(mockSavedReports);
});

// Admin middleware (mock)
const adminAuth = (req, res, next) => {
  // В реальном проекте проверяйте роль из JWT
  next();
};

// Get all users (admin)
app.get('/api/admin/users', adminAuth, (req, res) => {
  const mockUsers = [
    { id: '1', name: 'Администратор', email: 'admin@agri.com', phone: '+7 (999) 111-22-33', location: 'Москва', role: 'admin', is_blocked: false, created_at: '2024-01-01' },
    { id: '2', name: 'Иван Петров', email: 'ivan@example.com', phone: '+7 (999) 123-45-67', location: 'Московская обл.', role: 'landowner', is_blocked: false, created_at: '2024-02-15' },
    { id: '3', name: 'Екатерина Смирнова', email: 'ekaterina@example.com', phone: '+7 (888) 765-43-21', location: 'Краснодар', role: 'farmer', is_blocked: false, created_at: '2024-03-10' },
    { id: '4', name: 'Алексей Новиков', email: 'alexey@example.com', phone: '+7 (777) 111-22-33', location: 'СПб', role: 'farmer', is_blocked: true, created_at: '2024-01-20' },
  ];
  res.json({ users: mockUsers, total: mockUsers.length });
});

// Update user role
app.put('/api/admin/users/:userId/role', adminAuth, (req, res) => {
  const { role } = req.body;
  res.json({ id: req.params.userId, role, name: 'Тестовый пользователь', email: 'test@test.com', is_blocked: false, created_at: '2024-01-01' });
});

// Toggle user block
app.patch('/api/admin/users/:userId/block', adminAuth, (req, res) => {
  const { isBlocked } = req.body;
  res.json({ id: req.params.userId, is_blocked: isBlocked, name: 'Тестовый пользователь', email: 'test@test.com', role: 'farmer', created_at: '2024-01-01' });
});

// Delete user
app.delete('/api/admin/users/:userId', adminAuth, (req, res) => {
  res.status(204).send();
});

// Get all farms (admin)
app.get('/api/admin/farms', adminAuth, (req, res) => {
  res.json({ farms: mockFarms.map(f => ({ ...f, owner: { name: 'Иван Петров' } })), total: mockFarms.length });
});

// Update farm (admin)
app.put('/api/admin/farms/:farmId', adminAuth, (req, res) => {
  const farm = mockFarms.find(f => f.id === req.params.farmId);
  res.json({ ...farm, ...req.body });
});

// Delete farm (admin)
app.delete('/api/admin/farms/:farmId', adminAuth, (req, res) => {
  res.status(204).send();
});

// Get all bookings (admin)
app.get('/api/admin/bookings', adminAuth, (req, res) => {
  const mockBookings = [
    { id: 'b1', farm: { name: 'Зелёная долина' }, farmer: { name: 'Екатерина Смирнова' }, start_date: '2024-06-01', end_date: '2024-06-30', total_price: 25000, status: 'approved', created_at: '2024-05-01' },
    { id: 'b2', farm: { name: 'Урожайное поле' }, farmer: { name: 'Алексей Новиков' }, start_date: '2024-07-15', end_date: '2024-08-15', total_price: 45000, status: 'pending', created_at: '2024-05-10' },
  ];
  res.json({ bookings: mockBookings, total: mockBookings.length });
});

// Platform stats
app.get('/api/admin/stats', adminAuth, (req, res) => {
  res.json({
    total_users: 124,
    total_farms: 18,
    total_bookings: 156,
    total_revenue: 2450000,
    active_users: 89,
    completed_tasks: 234,
  });
});