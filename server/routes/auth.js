const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const pool    = require('../db');


// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบ' });
    }

    const [rows] = await pool.query(
      `SELECT ua.UserID, ua.Password, ua.Role, ua.AccountStatus,
              v.VisitorFName, v.VisitorLName, v.VisitorEmail
       FROM UserAccount ua
       JOIN Visitor v ON ua.VisitorID = v.VisitorID
       WHERE ua.Username = ?`,
      [email.trim().toLowerCase()]
    );

    if (!rows.length) {
      return res.json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const row = rows[0];

    if (row.AccountStatus === 'ถูกปิดใช้งาน') {
      return res.json({ success: false, message: 'บัญชีนี้ถูกระงับการใช้งาน' });
    }

    const match = await bcrypt.compare(password, row.Password);
    if (!match) {
      return res.json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const session = {
      id:        row.UserID,
      name:      `${row.VisitorFName} ${row.VisitorLName}`,
      firstName: row.VisitorFName,
      email:     row.VisitorEmail,
      role:      row.Role.toLowerCase(),
      loginAt:   new Date().toISOString()
    };

    res.json({ success: true, user: session });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดของระบบ' });
  }
});


// ================= REGISTER =================
router.post('/register', async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const { firstName, lastName, dob, phone, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบ' });
    }

    const normalEmail = email.trim().toLowerCase();

    const [exists] = await conn.query(
      'SELECT UserID FROM UserAccount WHERE Username = ?',
      [normalEmail]
    );

    if (exists.length) {
      return res.json({ success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    const hash = await bcrypt.hash(password, 12);

    await conn.beginTransaction();

    const [visitorResult] = await conn.query(
      `INSERT INTO Visitor (VisitorFName, VisitorLName, VisitorDateOfBirth, VisitorTel, VisitorEmail)
       VALUES (?, ?, ?, ?, ?)`,
      [firstName, lastName, dob || null, phone || null, normalEmail]
    );

    const newVisitorID = visitorResult.insertId;

    const [userResult] = await conn.query(
      `INSERT INTO UserAccount (VisitorID, AdminID, Password, Username, Role, AccountStatus)
       VALUES (?, NULL, ?, ?, 'user', 'ใช้งานอยู่')`,
      [newVisitorID, hash, normalEmail]
    );

    const newUserID = userResult.insertId;

    await conn.commit();

    const session = {
      id:        newUserID,
      name:      `${firstName} ${lastName}`,
      firstName: firstName,
      email:     normalEmail,
      role:      'user',
      loginAt:   new Date().toISOString()
    };

    res.json({ success: true, user: session });

  } catch (err) {
    await conn.rollback();
    console.error('Register error:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.json({ success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดของระบบ' });

  } finally {
    conn.release();
  }
});


// ================= GET USERS (NEW) =================
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT UserID, Username, Role, AccountStatus, CreatedAt
      FROM UserAccount
      ORDER BY UserID ASC
    `);

    res.json({ success: true, data: rows });

  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดของระบบ' });
  }
});


module.exports = router;