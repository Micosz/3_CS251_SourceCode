const router = require('express').Router();
const pool   = require('../db');

// ดึงบัญชีทั้งหมดสำหรับ Admin
// JOIN ไปหา Visitor ตรงๆ กรองเฉพาะที่ 'ใช้งานอยู่'
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ua.UserID, ua.Username, ua.AccountStatus, ua.CreatedAt,
             ua.VisitorID,
             v.VisitorFName, v.VisitorLName, v.VisitorEmail
      FROM UserAccount ua
      JOIN Visitor v ON ua.VisitorID = v.VisitorID
      WHERE ua.AccountStatus = 'ใช้งานอยู่'
      ORDER BY ua.CreatedAt DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ดึงบัญชีทั้งหมดพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// ค้นหาบัญชีตาม Username prefix
// LIKE 'prefix%' ใช้ index ได้ อย่าใส่ % ข้างหน้า
router.get('/users/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const [rows] = await pool.query(`
      SELECT ua.UserID, ua.Username, ua.AccountStatus, ua.CreatedAt,
             v.VisitorEmail
      FROM UserAccount ua
      JOIN Visitor v ON ua.VisitorID = v.VisitorID
      WHERE ua.AccountStatus = 'ใช้งานอยู่' AND ua.Username LIKE CONCAT(?, '%')
    `, [q]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ค้นหาบัญชีพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// อัปเดตสถานะบัญชี แบน/ปลดแบน
router.put('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'ต้องระบุสถานะ' });

    const [result] = await pool.query(`
      UPDATE UserAccount
      SET AccountStatus = ?
      WHERE UserID = ?
    `, [status, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'ไม่เจอบัญชีนี้' });
    }
    res.json({ success: true, message: 'อัปเดตสถานะสำเร็จ' });
  } catch (err) {
    console.error('อัปเดตสถานะบัญชีพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// บันทึก audit trail ว่า admin คนไหนแก้บัญชีใด
router.post('/users/:id/audit', async (req, res) => {
  try {
    const { adminId, detail } = req.body;
    if (!adminId || !detail) {
      return res.status(400).json({ success: false, message: 'ต้องระบุ adminId และรายละเอียด' });
    }

    await pool.query(`
      INSERT INTO Manage_By (AdminID, UserID, Edit_date, Edit_detail)
      VALUES (?, ?, CURDATE(), ?)
    `, [adminId, req.params.id, detail]);

    res.json({ success: true, message: 'บันทึก audit สำเร็จ' });
  } catch (err) {
    console.error('บันทึก audit พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// soft delete บัญชี
router.delete('/users/:id', async (req, res) => {
  try {
    const [result] = await pool.query(`
      UPDATE UserAccount
      SET AccountStatus = 'ถูกปิดใช้งาน'
      WHERE UserID = ?
    `, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'ไม่เจอบัญชีนี้' });
    }
    res.json({ success: true, message: 'ปิดบัญชีสำเร็จ' });
  } catch (err) {
    console.error('ปิดบัญชีพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

module.exports = router;
