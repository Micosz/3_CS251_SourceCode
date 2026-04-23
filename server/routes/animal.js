const router = require('express').Router();
const pool = require('../db');


// ================= GET ALL =================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.AnimalID,
        a.AnimalName,
        a.Gender,
        a.BirthDate,
        s.SpeciesName,
        z.ZoneID,
        z.ZoneName
      FROM Animal a
      LEFT JOIN Species s ON a.SpeciesID = s.SpeciesID
      LEFT JOIN Enclosure e ON a.EnclosureID = e.EnclosureID
      LEFT JOIN Zone z ON e.ZoneID = z.ZoneID
      ORDER BY a.AnimalID ASC
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
      'SELECT * FROM Animal WHERE AnimalID = ?',
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
    const { name, gender, speciesId, enclosureId } = req.body;

    const [result] = await pool.query(`
      INSERT INTO Animal (AnimalName, Gender, SpeciesID, EnclosureID)
      VALUES (?, ?, ?, ?)
    `, [name, gender, speciesId, enclosureId]);

    res.json({ success: true, id: result.insertId });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= UPDATE =================
router.put('/:id', async (req, res) => {
  try {
    const { name, gender } = req.body;

    await pool.query(`
      UPDATE Animal
      SET AnimalName = ?, Gender = ?
      WHERE AnimalID = ?
    `, [name, gender, req.params.id]);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= DELETE =================
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM Animal WHERE AnimalID = ?',
      [req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;