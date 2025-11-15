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
  const msg = req.query.msg || '';
  const query = search ? { title: { $regex: search, $options: 'i' } } : {};
  const todos = await db.collection(TODOS_COLL).find(query).toArray();
  res.render('todos', {
    todos,
    search,
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
    { $set: { title: req.body.title, description: req.body.description } }
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

