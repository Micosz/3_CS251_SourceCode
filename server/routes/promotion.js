const router = require('express').Router();
const pool = require('../db');


// helper กันกรณี driver ยังแปลงเป็น Date
const formatDateTime = (val) => {
  if (!val) return null;

  if (typeof val === 'string') return val;

  const d = new Date(val);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ` +
         `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};


// ================= GET ALL =================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        PromotionID,
        PromotionCode,
        DiscountAmount,
        Conditions,
        DATE_FORMAT(PromotionExpireDate, '%Y-%m-%d %H:%i:%s') AS PromotionExpireDate
      FROM Promotion
      ORDER BY PromotionExpireDate DESC
    `);

    const data = rows.map(r => ({
      ...r,
      PromotionExpireDate: formatDateTime(r.PromotionExpireDate)
    }));

    res.json({ success: true, data });

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
        PromotionID,
        PromotionCode,
        DiscountAmount,
        Conditions,
        DATE_FORMAT(PromotionExpireDate, '%Y-%m-%d %H:%i:%s') AS PromotionExpireDate
      FROM Promotion
      WHERE PromotionID = ?
    `, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    const data = {
      ...rows[0],
      PromotionExpireDate: formatDateTime(rows[0].PromotionExpireDate)
    };

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= CREATE =================
router.post('/', async (req, res) => {
  try {
    const { code, discount, conditions, expireDate } = req.body;

    if (!code || !discount || !expireDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO Promotion (PromotionCode, DiscountAmount, Conditions, PromotionExpireDate)
      VALUES (?, ?, ?, ?)
    `, [code, discount, conditions, expireDate]);

    res.json({ success: true, id: result.insertId });

  } catch (err) {
    console.error(err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.json({ success: false, message: 'โค้ดนี้ถูกใช้แล้ว' });
    }

    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= UPDATE =================
router.put('/:id', async (req, res) => {
  try {
    const { code, discount, conditions, expireDate } = req.body;

    const [result] = await pool.query(`
      UPDATE Promotion
      SET PromotionCode = ?, DiscountAmount = ?, Conditions = ?, PromotionExpireDate = ?
      WHERE PromotionID = ?
    `, [code, discount, conditions, expireDate, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
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
      'DELETE FROM Promotion WHERE PromotionID = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= VALIDATE =================
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;

    const [rows] = await pool.query(`
      SELECT 
        PromotionID,
        PromotionCode,
        DiscountAmount,
        Conditions,
        DATE_FORMAT(PromotionExpireDate, '%Y-%m-%d %H:%i:%s') AS PromotionExpireDate
      FROM Promotion
      WHERE PromotionCode = ?
      AND PromotionExpireDate > NOW()
    `, [code]);

    if (!rows.length) {
      return res.json({ success: false, message: 'โค้ดไม่ถูกต้องหรือหมดอายุ' });
    }

    const data = {
      ...rows[0],
      PromotionExpireDate: formatDateTime(rows[0].PromotionExpireDate)
    };

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;