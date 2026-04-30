const router = require('express').Router();
const pool = require('../db');


// ================= GET ALL =================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.AdminID,
        a.FirstName,
        a.Surname,
        z.ZoneID,
        z.ZoneName,
        DATE_FORMAT(at.AssignedDate, '%Y-%m-%d') AS AssignedDate
      FROM Assigned_To at
      JOIN Admin a ON at.AdminID = a.AdminID
      JOIN Zone z ON at.ZoneID = z.ZoneID
      ORDER BY at.AssignedDate DESC
    `);

    res.json({ success: true, data: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// ================= GET BY ADMIN =================
router.get('/admin/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        z.ZoneID, 
        z.ZoneName, 
        DATE_FORMAT(at.AssignedDate, '%Y-%m-%d') AS AssignedDate
      FROM Assigned_To at
      JOIN Zone z ON at.ZoneID = z.ZoneID
      WHERE at.AdminID = ?
    `, [req.params.id]);

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= GET BY ZONE =================
router.get('/zone/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.AdminID, 
        a.FirstName, 
        a.Surname, 
        DATE_FORMAT(at.AssignedDate, '%Y-%m-%d') AS AssignedDate
      FROM Assigned_To at
      JOIN Admin a ON at.AdminID = a.AdminID
      WHERE at.ZoneID = ?
    `, [req.params.id]);

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= CREATE =================
router.post('/', async (req, res) => {
  try {
    const { adminId, zoneId, assignedDate } = req.body;

    await pool.query(`
      INSERT INTO Assigned_To (AdminID, ZoneID, AssignedDate)
      VALUES (?, ?, ?)
    `, [adminId, zoneId, assignedDate]);

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// ================= DELETE =================
router.delete('/', async (req, res) => {
  try {
    const { adminId, zoneId } = req.body;

    await pool.query(`
      DELETE FROM Assigned_To
      WHERE AdminID = ? AND ZoneID = ?
    `, [adminId, zoneId]);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;