const router  = require('express').Router();
const bcrypt   = require('bcryptjs');
const pool     = require('../db');

// POST /api/auth/login
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

// POST /api/auth/register
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

// ==================== จัดการโปรไฟล์ ====================

// ดูข้อมูลส่วนตัว JOIN Visitor กับ UserAccount
router.get('/profile/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ua.UserID, ua.Username, ua.AccountStatus, ua.CreatedAt,
             v.VisitorID, v.VisitorFName, v.VisitorLName,
             v.VisitorDateOfBirth, v.VisitorTel, v.VisitorEmail
      FROM UserAccount ua
      JOIN Visitor v ON ua.VisitorID = v.VisitorID
      WHERE ua.UserID = ? AND ua.AccountStatus = 'ใช้งานอยู่'
    `, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'ไม่เจอบัญชีนี้' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('ดึงโปรไฟล์พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// แก้ไขข้อมูลส่วนตัว JOIN UPDATE
router.put('/profile/:id', async (req, res) => {
  try {
    const { phone, email } = req.body;

    const [result] = await pool.query(`
      UPDATE Visitor v
      JOIN UserAccount ua ON v.VisitorID = ua.VisitorID
      SET v.VisitorTel = ?, v.VisitorEmail = ?
      WHERE ua.UserID = ? AND ua.AccountStatus = 'ใช้งานอยู่'
    `, [phone, email, req.params.id]);

    if (result.affectedRows === 0) {
      return res.json({ success: false, message: 'แก้ไม่ได้ บัญชีอาจถูกปิด' });
    }
    res.json({ success: true, message: 'แก้ข้อมูลสำเร็จ' });
  } catch (err) {
    console.error('แก้โปรไฟล์พัง:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.json({ success: false, message: 'อีเมลนี้ถูกใช้แล้ว' });
    }
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// เปลี่ยนรหัสผ่าน
// ไม่ตรวจ old password ใน SQL เป็นหน้าที่ของ bcrypt.compare ฝั่ง app
router.put('/password/:id', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'กรอกรหัสให้ครบ' });
    }

    // ดึง hash เก่ามาเช็กก่อน
    const [rows] = await pool.query(
      `SELECT Password FROM UserAccount WHERE UserID = ? AND AccountStatus = 'ใช้งานอยู่'`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'ไม่เจอบัญชี' });
    }

    const match = await bcrypt.compare(oldPassword, rows[0].Password);
    if (!match) {
      return res.json({ success: false, message: 'รหัสผ่านเก่าไม่ถูกต้อง' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      `UPDATE UserAccount SET Password = ? WHERE UserID = ? AND AccountStatus = 'ใช้งานอยู่'`,
      [hash, req.params.id]
    );
    res.json({ success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } catch (err) {
    console.error('เปลี่ยนรหัสพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// ยกเลิกบัญชี soft delete
router.delete('/account/:id', async (req, res) => {
  try {
    const [result] = await pool.query(`
      UPDATE UserAccount SET AccountStatus = 'ถูกปิดใช้งาน' WHERE UserID = ?
    `, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'ไม่เจอบัญชี' });
    }
    res.json({ success: true, message: 'ยกเลิกบัญชีสำเร็จ' });
  } catch (err) {
    console.error('ยกเลิกบัญชีพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// Re-verify token เช็กสิทธิ์จาก UserID
router.get('/verify/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ua.UserID, ua.Username, ua.AccountStatus, ua.VisitorID,
             ua.Role
      FROM UserAccount ua
      WHERE ua.UserID = ? AND ua.AccountStatus = 'ใช้งานอยู่'
      LIMIT 1
    `, [req.params.id]);

    if (!rows.length) {
      return res.json({ success: false, message: 'บัญชีไม่ active' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('verify พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

module.exports = router;

