require('dotenv').config();
const express = require('express');
const cors = require('cors');
const locationRoutes = require('./routes/locationRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use('/api/locations', locationRoutes);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/ads', require('./routes/adsRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LizAffaire API is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Une erreur est survenue'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 API endpoints:`);
  console.log(`   - GET http://localhost:${PORT}/api/health`);
  console.log(`   - GET http://localhost:${PORT}/api/locations/regions`);
  console.log(`   - GET http://localhost:${PORT}/api/locations/regions-with-cities`);
  console.log(`   - GET http://localhost:${PORT}/api/locations/regions/:id/cities`);
});
