const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 8099;

// MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://SamuelChan:20050426Hei@cluster0.ygdaiku.mongodb.net/?appName=Cluster0';
const DB_NAME = 'todoApp';
const USERS_COLL = 'users';
const TODOS_COLL = 'todos';

let db;

MongoClient.connect(MONGO_URI)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(DB_NAME);
  })
  .catch(err => {
    console.error('MongoDB Error:', err);
    process.exit(1);
  });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}));

const requireAuth = (req, res, next) => {
  if (req.session.userId) return next();
  res.redirect('/login');
};

// Routes
app.get('/', (req, res) => res.redirect(req.session.userId ? '/todos' : '/login'));

// Login
app.get('/login', (req, res) => res.render('login', { error: null }));
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.collection(USERS_COLL).findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user._id.toString();
      req.session.username = username;
      return res.redirect('/todos');
    }
    res.render('login', { error: 'Invalid username or password' });
  } catch (err) {
    res.render('login', { error: 'Server error' });
  }
});

// Signup
app.get('/signup', (req, res) => res.render('signup', { error: null, success: null }));
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    if (await db.collection(USERS_COLL).findOne({ username })) {
      return res.render('signup', { error: 'Username already exists', success: null });
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.collection(USERS_COLL).insertOne({ username, password: hashed });
    res.render('signup', { success: 'Account created! Please log in.', error: null });
  } catch (err) {
    res.render('signup', { error: 'Signup failed', success: null });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session = null;
  res.render('logout');
});

// Todos Page
app.get('/todos', requireAuth, async (req, res) => {
  const search = req.query.search || '';
  const searchDate = req.query.searchDate || '';
  const msg = req.query.msg || '';

  let query = {};
  if (search) query.title = { $regex: search, $options: 'i' };
  if (searchDate) {
    const start = new Date(searchDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(searchDate);
    end.setHours(23, 59, 59, 999);
    query.dueDate = { $gte: start, $lte: end };
  }

  const todos = await db.collection(TODOS_COLL)
    .find(query)
    .sort({ dueDate: 1 }) // Sort by time
    .toArray();

  res.render('todos', {
    todos,
    search,
    searchDate,
    msg,
    username: req.session.username
  });
});

app.post('/todos', requireAuth, async (req, res) => {
  await db.collection(TODOS_COLL).insertOne({
    title: req.body.title,
    description: req.body.description,
    userId: req.session.userId,
    username: req.session.username,
    createdAt: new Date() // ← NEW: HKT time
  });
  res.redirect('/todos?msg=created');
});

app.get('/todos/edit/:id', requireAuth, async (req, res) => {
  const todo = await db.collection(TODOS_COLL).findOne({ _id: new ObjectId(req.params.id) });
  if (!todo) return res.redirect('/todos');
  res.render('edit', { todo });
});

app.post('/todos/update/:id', requireAuth, async (req, res) => {
  await db.collection(TODOS_COLL).updateOne(
    { _id: new ObjectId(req.params.id) },
    { 
      $set: { 
        title: req.body.title, 
        description: req.body.description,
        updatedAt: new Date(),
        updatedBy: req.session.username
      } 
    }
  );
  res.redirect('/todos?msg=updated');
});

app.post('/todos/delete/:id', requireAuth, async (req, res) => {
  await db.collection(TODOS_COLL).deleteOne({ _id: new ObjectId(req.params.id) });
  res.redirect('/todos?msg=deleted');
});

// REST APIs
app.get('/api/todos', async (req, res) => {
  const search = req.query.search || '';
  const query = search ? { title: { $regex: search, $options: 'i' } } : {};
  const todos = await db.collection(TODOS_COLL).find(query).toArray();
  res.json(todos);
});

app.post('/api/todos', async (req, res) => {
  const { title, description } = req.body;
  const result = await db.collection(TODOS_COLL).insertOne({ title, description });
  res.json({ id: result.insertedId });
});

app.put('/api/todos/:id', async (req, res) => {
  const { title, description } = req.body;
  await db.collection(TODOS_COLL).updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { title, description } }
  );
  res.json({ success: true });
});

app.delete('/api/todos/:id', async (req, res) => {
  await db.collection(TODOS_COLL).deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ success: true });
});

// === PREVIEW: CREATE TODO ===
app.get('/todos/preview', requireAuth, (req, res) => {
  const { title, description, dueDate, dueTime } = req.query;
  res.render('preview-create', { 
    title, 
    description: description || '(none)',
    dueDate: dueDate || '',
    dueTime: dueTime || ''
  });
});

app.post('/todos/confirm', requireAuth, async (req, res) => {
  const { title, description, dueDate, dueTime } = req.body;
  let fullDueDate = null;
  if (dueDate) {
    fullDueDate = new Date(dueDate);
    if (dueTime) {
      const [hours, minutes] = dueTime.split(':');
      fullDueDate.setHours(hours, minutes, 0);
    }
  }
  await db.collection(TODOS_COLL).insertOne({
    title,
    description: description || null,
    dueDate: fullDueDate,
    userId: req.session.userId,
    username: req.session.username,
    createdAt: new Date()
  });
  res.redirect('/todos?msg=created');
});

// === PREVIEW: EDIT TODO ===
app.post('/todos/edit-preview/:id', requireAuth, async (req, res) => {
  const { title, description, dueDate, dueTime } = req.body;
  const todo = await db.collection(TODOS_COLL).findOne({ _id: new ObjectId(req.params.id) });
  if (!todo) return res.redirect('/todos');
  res.render('preview-edit', { 
    title, 
    description: description || '(none)',
    dueDate: dueDate || '',
    dueTime: dueTime || '',
    id: req.params.id 
  });
});

app.get('/todos/edit-preview/:id', requireAuth, async (req, res) => {
  const todo = await db.collection(TODOS_COLL).findOne({ _id: new ObjectId(req.params.id) });
  if (!todo) return res.redirect('/todos');
  res.render('preview-edit', { 
    title: todo.title, 
    description: todo.description || '', 
    id: req.params.id 
  });
});

app.post('/todos/update-confirm/:id', requireAuth, async (req, res) => {
  const { title, description, dueDate, dueTime } = req.body;
  let fullDueDate = null;
  if (dueDate) {
    fullDueDate = new Date(dueDate);
    if (dueTime) {
      const [hours, minutes] = dueTime.split(':');
      fullDueDate.setHours(hours, minutes, 0);
    }
  }
  await db.collection(TODOS_COLL).updateOne(
    { _id: new ObjectId(req.params.id) },
    { 
      $set: { 
        title, 
        description: description || null,
        dueDate: fullDueDate,
        updatedAt: new Date(),
        updatedBy: req.session.username
      } 
    }
  );
  res.redirect('/todos?msg=updated');
});

// ========================================
// RESTful APIs – USERS (NO AUTHENTICATION)
// ========================================

// GET /api/users - List all users (hide password)
app.get('/api/users', async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = search ? { username: { $regex: search, $options: 'i' } } : {};
    const users = await db.collection(USERS_COLL)
      .find(query, { projection: { password: 0 } })
      .toArray();

    // Convert ObjectId to string
    const safeUsers = users.map(user => ({
      id: user._id.toString(),
      username: user.username
    }));

    res.json(safeUsers);
  } catch (err) {
    console.error('GET /api/users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users - Create new user
app.post('/api/users', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    const existing = await db.collection(USERS_COLL).findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.collection(USERS_COLL).insertOne({ username, password: hashed });
    res.json({ id: result.insertedId.toString(), username });
  } catch (err) {
    console.error('POST /api/users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/users/:id - Update password
app.put('/api/users/:id', async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.collection(USERS_COLL).updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { password: hashed } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /api/users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/users/:id - Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const result = await db.collection(USERS_COLL).deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
