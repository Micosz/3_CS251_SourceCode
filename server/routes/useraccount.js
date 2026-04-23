const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');


// ================= GET ALL USERS =================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ua.UserID,
        ua.Username,
        ua.Role,
        ua.AccountStatus,
        DATE_FORMAT(ua.CreatedAt, '%Y-%m-%d %H:%i:%s') AS CreatedAt,
        v.VisitorFName,
        v.VisitorLName,
        a.FirstName AS AdminName
      FROM UserAccount ua
      LEFT JOIN Visitor v ON ua.VisitorID = v.VisitorID
      LEFT JOIN Admin a ON ua.AdminID = a.AdminID
      ORDER BY ua.UserID ASC
    `);

    res.json({ success: true, data: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= GET BY ID =================
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        UserID,
        Username,
        Role,
        AccountStatus,
        DATE_FORMAT(CreatedAt, '%Y-%m-%d %H:%i:%s') AS CreatedAt
      FROM UserAccount
      WHERE UserID = ?
    `, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({ success: true, data: rows[0] });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= CREATE USER =================
router.post('/', async (req, res) => {
  try {
    const { visitorId, username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const hash = await bcrypt.hash(password, 12);

    const [result] = await pool.query(`
      INSERT INTO UserAccount 
      (VisitorID, AdminID, Password, Username, Role, AccountStatus)
      VALUES (?, NULL, ?, ?, ?, 'ใช้งานอยู่')
    `, [visitorId || null, hash, username, role]);

    res.json({ success: true, id: result.insertId });

  } catch (err) {
    console.error(err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.json({ success: false, message: 'Username already exists' });
    }

    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= CHANGE PASSWORD =================
router.put('/:id/password', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const hash = await bcrypt.hash(newPassword, 12);

    const [result] = await pool.query(`
      UPDATE UserAccount
      SET Password = ?
      WHERE UserID = ?
    `, [hash, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= CHANGE ROLE =================
router.put('/:id/role', async (req, res) => {
  try {
    const { role } = req.body;

    const [result] = await pool.query(`
      UPDATE UserAccount
      SET Role = ?
      WHERE UserID = ?
    `, [role, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= ENABLE / DISABLE =================
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const [result] = await pool.query(`
      UPDATE UserAccount
      SET AccountStatus = ?
      WHERE UserID = ?
    `, [status, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= DELETE =================
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM UserAccount WHERE UserID = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;