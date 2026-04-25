const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    // Allow file:// (origin=null), localhost, and no-origin requests (curl, Postman)
    if (!origin || origin === 'null' || /^http:\/\/localhost/.test(origin) || /^http:\/\/127\.0\.0\.1/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/animals', require('./routes/animals'));
app.use('/api/zones', require('./routes/zones'));
app.use('/api/events', require('./routes/events'));
app.use('/api/search', require('./routes/search'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Zoo API server running at http://localhost:${PORT}`);
});
