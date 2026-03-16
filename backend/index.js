require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');

// Import models
const User = require('./models/User');
const Company = require('./models/Company');
const Document = require('./models/Document');
const Extraction = require('./models/Extraction');

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
      companies: '/api/companies',
      documents: '/api/documents',
      extractions: '/api/extractions',
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
    const companies = await Company.find().populate('documents');
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Basic CRUD endpoints for Documents
app.post('/api/documents', async (req, res) => {
  try {
    const document = new Document(req.body);
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/documents', async (req, res) => {
  try {
    const documents = await Document.find()
      .populate('company')
      .populate('uploadedBy', '-password')
      .populate('extractedData');
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Basic CRUD endpoints for Extractions
app.post('/api/extractions', async (req, res) => {
  try {
    const extraction = new Extraction(req.body);
    await extraction.save();
    res.status(201).json(extraction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/extractions', async (req, res) => {
  try {
    const extractions = await Extraction.find()
      .populate('document')
      .populate('reviewedBy', '-password');
    res.json(extractions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`✓ Server running at http://localhost:${port}/`);
});
