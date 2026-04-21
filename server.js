const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// 👇 serve static จาก root project (สำคัญ)
app.use(express.static(__dirname));

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