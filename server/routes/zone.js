const router = require('express').Router();
const pool = require('../db');


// ================= GET ALL ZONES =================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ZoneID, ZoneName, ZoneDescrip, ZoneType
      FROM Zone
      ORDER BY ZoneID ASC
    `);

    res.json({ success: true, data: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// ================= GET BY ID =================
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Zone WHERE ZoneID = ?',
      [req.params.id]
    );

    res.json({ success: true, data: rows[0] });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= CREATE =================
router.post('/', async (req, res) => {
  try {
    const { zoneName, zoneDescrip, zoneType } = req.body;

    const [result] = await pool.query(`
      INSERT INTO Zone (ZoneName, ZoneDescrip, ZoneType)
      VALUES (?, ?, ?)
    `, [zoneName, zoneDescrip, zoneType]);

    res.json({ success: true, id: result.insertId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// ================= UPDATE =================
router.put('/:id', async (req, res) => {
  try {
    const { zoneName, zoneDescrip, zoneType } = req.body;

    await pool.query(`
      UPDATE Zone
      SET ZoneName = ?, ZoneDescrip = ?, ZoneType = ?
      WHERE ZoneID = ?
    `, [zoneName, zoneDescrip, zoneType, req.params.id]);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= DELETE =================
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM Zone WHERE ZoneID = ?',
      [req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;