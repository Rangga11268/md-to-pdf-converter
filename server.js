require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser with 10mb limit
app.use(express.json({ limit: '10mb' }));

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Import Vercel serverless handlers
const healthHandler = require('./api/health');
const reviewCvHandler = require('./api/review-cv');
const convertHandler = require('./api/convert');

// Map Express routes to handlers
app.get('/api/health', healthHandler);
app.post('/api/review-cv', reviewCvHandler);
app.post('/api/convert', convertHandler);

// Start local server
app.listen(PORT, () => {
    console.log(`Server MD2CV berjalan sukses di http://localhost:${PORT}`);
});

module.exports = app;
