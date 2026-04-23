const router = require('express').Router();
const pool = require('../db');


// ================= HELPER =================
// format date ให้เป็น YYYY-MM-DD
const formatDate = (date) => {
  if (!date) return null;

  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};


// ================= GET ALL ADMINS =================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT AdminID, FirstName, Surname, Email, Salary, Address, HireDate
      FROM Admin
      ORDER BY AdminID ASC
    `);

    // ✅ แก้ timezone ตรงนี้
    const formatted = rows.map(r => ({
      ...r,
      HireDate: formatDate(r.HireDate)
    }));

    res.json({ success: true, data: formatted });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= GET ADMIN BY ID =================
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Admin WHERE AdminID = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const admin = {
      ...rows[0],
      HireDate: formatDate(rows[0].HireDate)
    };

    res.json({ success: true, data: admin });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= CREATE ADMIN =================
router.post('/', async (req, res) => {
  try {
    const { firstName, surname, email, salary, address, hireDate } = req.body;

    // ✅ validate
    if (!firstName || !surname || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO Admin (FirstName, Surname, Email, Salary, Address, HireDate)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [firstName, surname, email, salary, address, hireDate]);

    res.json({ success: true, id: result.insertId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= UPDATE ADMIN =================
router.put('/:id', async (req, res) => {
  try {
    const { firstName, surname, email, salary, address } = req.body;

    const [result] = await pool.query(`
      UPDATE Admin
      SET FirstName = ?, Surname = ?, Email = ?, Salary = ?, Address = ?
      WHERE AdminID = ?
    `, [firstName, surname, email, salary, address, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= DELETE ADMIN =================
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM Admin WHERE AdminID = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;