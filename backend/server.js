require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://german-unlotted-jeanmarie.ngrok-free.dev',
    /\.vercel\.app$/,  // Allow any Vercel deployment
    /\.netlify\.app$/  // Allow any Netlify deployment
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected successfully'))
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/ai', require('./routes/ai'));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'EXE101 Group Management API',
    status: 'running',
    version: '1.0.0'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'EXE101 Group Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Initialize first moderator (for development)
app.post('/api/init-admin', async (req, res) => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    
    // Check if moderator exists
    const existingModerator = await User.findOne({ role: 'moderator' });
    if (existingModerator) {
      return res.status(400).json({ 
        success: false, 
        message: 'Moderator already exists' 
      });
    }

    // Create first moderator
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const moderator = new User({
      studentId: 'MOD001',
      email: 'admin@exe101.edu',
      password: hashedPassword,
      fullName: 'System Administrator',
      role: 'moderator',
      course: 'N/A',
      major: 'System Admin',
      phone: '+84912345678',
      isActive: true
    });

    await moderator.save();

    res.json({
      success: true,
      message: 'Moderator account created successfully',
      credentials: {
        email: 'admin@exe101.edu',
        password: 'admin123'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✓ Server is running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});
