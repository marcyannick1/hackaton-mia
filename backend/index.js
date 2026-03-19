require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');

// Import models
const User = require('./models/User');
const Company = require('./models/Company');
const RawZone = require('./models/RawZone');
const CleanZone = require('./models/CleanZone');
const CuratedZone = require('./models/CuratedZone');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Document Processing Platform API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      rawzone: '/api/rawzone',
      cleanzone: '/api/cleanzone',
      curatedzone: '/api/curatedzone',
    },
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', database: 'MongoDB connected' });
});

// Basic CRUD endpoints for Users
app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Basic CRUD endpoints for Companies
app.post('/api/companies', async (req, res) => {
  try {
    const company = new Company(req.body);
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/companies', async (req, res) => {
  try {
    const companies = await Company.find().populate('rawZone');
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Basic CRUD endpoints for RawZone
app.post('/api/rawzone', async (req, res) => {
  try {
    const rawZone = new RawZone(req.body);
    await rawZone.save();
    res.status(201).json(rawZone);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/rawzone', async (req, res) => {
  try {
    const rawZones = await RawZone.find()
      .populate('company')
      .populate('uploadedBy', '-password')
      .populate('cleanZone')
      .populate('curatedZone');
    res.json(rawZones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Basic CRUD endpoints for CleanZone
app.post('/api/cleanzone', async (req, res) => {
  try {
    const cleanZone = new CleanZone(req.body);
    await cleanZone.save();
    res.status(201).json(cleanZone);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/cleanzone', async (req, res) => {
  try {
    const cleanZones = await CleanZone.find()
      .populate('rawZone')
      .populate('curatedZone');
    res.json(cleanZones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Basic CRUD endpoints for CuratedZone
app.post('/api/curatedzone', async (req, res) => {
  try {
    const curatedZone = new CuratedZone(req.body);
    await curatedZone.save();
    res.status(201).json(curatedZone);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/curatedzone', async (req, res) => {
  try {
    const curatedZones = await CuratedZone.find()
      .populate('rawZone')
      .populate('cleanZone')
      .populate('reviewedBy', '-password');
    res.json(curatedZones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`✓ Server running at http://localhost:${port}/`);
});
