const router = require('express').Router();
const pool = require('../db');


// ================= GET ALL =================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM Species
      ORDER BY SpeciesID ASC
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
      'SELECT * FROM Species WHERE SpeciesID = ?',
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
    const {
      name,
      taxonomy,
      origin,
      lifespan,
      scientificName,
      status
    } = req.body;

    const [result] = await pool.query(`
      INSERT INTO Species 
      (SpeciesName, TaxonomyCategory, Origin, AverageLifespan, ScientificName, ConservationStatus)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, taxonomy, origin, lifespan, scientificName, status]);

    res.json({ success: true, id: result.insertId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// ================= UPDATE =================
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      taxonomy,
      origin,
      lifespan,
      scientificName,
      status
    } = req.body;

    await pool.query(`
      UPDATE Species
      SET 
        SpeciesName = ?,
        TaxonomyCategory = ?,
        Origin = ?,
        AverageLifespan = ?,
        ScientificName = ?,
        ConservationStatus = ?
      WHERE SpeciesID = ?
    `, [name, taxonomy, origin, lifespan, scientificName, status, req.params.id]);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= DELETE =================
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM Species WHERE SpeciesID = ?',
      [req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= GET WITH ANIMALS =================
// ดู species + จำนวนสัตว์
router.get('/with/count', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.SpeciesID,
        s.SpeciesName,
        COUNT(a.AnimalID) AS AnimalCount
      FROM Species s
      LEFT JOIN Animal a ON s.SpeciesID = a.SpeciesID
      GROUP BY s.SpeciesID
    `);

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;