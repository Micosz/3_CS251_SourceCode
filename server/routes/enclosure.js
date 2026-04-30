const router = require('express').Router();
const pool = require('../db');


// ================= GET ALL ENCLOSURES =================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.EnclosureID,
        e.EnType,
        e.Status,
        e.Capacity,
        z.ZoneID,
        z.ZoneName
      FROM Enclosure e
      LEFT JOIN Zone z ON e.ZoneID = z.ZoneID
      ORDER BY e.EnclosureID ASC
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
      'SELECT * FROM Enclosure WHERE EnclosureID = ?',
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
    const { zoneId, enType, status, capacity } = req.body;

    const [result] = await pool.query(`
      INSERT INTO Enclosure (ZoneID, EnType, Status, Capacity)
      VALUES (?, ?, ?, ?)
    `, [zoneId, enType, status, capacity]);

    res.json({ success: true, id: result.insertId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// ================= UPDATE =================
router.put('/:id', async (req, res) => {
  try {
    const { zoneId, enType, status, capacity } = req.body;

    await pool.query(`
      UPDATE Enclosure
      SET ZoneID = ?, EnType = ?, Status = ?, Capacity = ?
      WHERE EnclosureID = ?
    `, [zoneId, enType, status, capacity, req.params.id]);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= DELETE =================
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM Enclosure WHERE EnclosureID = ?',
      [req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;