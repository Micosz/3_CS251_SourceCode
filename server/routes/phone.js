const router = require('express').Router();
const pool = require('../db');


// ================= GET ALL =================
// ดูเบอร์ทั้งหมด + ชื่อ admin
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.Phone,
        p.AdminID,
        a.FirstName,
        a.Surname
      FROM Phone p
      JOIN Admin a ON p.AdminID = a.AdminID
      ORDER BY a.AdminID
    `);

    res.json({ success: true, data: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// ================= GET BY ADMIN =================
// ดูเบอร์ของ admin คนเดียว
router.get('/admin/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT Phone FROM Phone WHERE AdminID = ?',
      [req.params.id]
    );

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= ADD PHONE =================
router.post('/', async (req, res) => {
  try {
    const { phone, adminId } = req.body;

    await pool.query(`
      INSERT INTO Phone (Phone, AdminID)
      VALUES (?, ?)
    `, [phone, adminId]);

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// ================= DELETE PHONE =================
// ลบเบอร์ (ต้องระบุทั้ง phone + adminId)
router.delete('/', async (req, res) => {
  try {
    const { phone, adminId } = req.body;

    await pool.query(`
      DELETE FROM Phone
      WHERE Phone = ? AND AdminID = ?
    `, [phone, adminId]);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;