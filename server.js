const express = require('express');
const path = require('path');
const cors = require('cors');

const authRoutes = require('./server/routes/auth'); 
const animalRoutes = require('./server/routes/animal');
const adminRoutes = require('./server/routes/admin');
const enclosureRoutes = require('./server/routes/enclosure');
const zoneRoutes = require('./server/routes/zone');
const assignedRoutes = require('./server/routes/assigned_to');
const eventRoutes = require('./server/routes/eventschedule');
const phoneRoutes = require('./server/routes/phone');
const promotionRoutes = require('./server/routes/promotion');

const app = express();

app.use(cors());
app.use(express.json());

// serve static
app.use(express.static(__dirname));

// เชื่อม route backend
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/enclosures', enclosureRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/assignments', assignedRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/phones', phoneRoutes);
app.use('/api/promotions', promotionRoutes);

// ================= ROUTES =================

// หน้าแรก
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// register
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

// animals
app.get('/animals', (req, res) => {
  res.sendFile(path.join(__dirname, 'animals.html'));
});

// cart
app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'cart.html'));
});

// tickets
app.get('/tickets', (req, res) => {
  res.sendFile(path.join(__dirname, 'tickets.html'));
});

// ================= START =================
app.listen(3000, () => {
  console.log("🚀 http://localhost:3000");
});