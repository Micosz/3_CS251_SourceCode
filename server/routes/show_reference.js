const router = require('express').Router();
const pool = require('../db');


// ================= GET ALL =================
// ดูว่า event ไหนมีสัตว์อะไรบ้าง
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        sr.EventID,
        e.EventName,
        sr.AnimalID,
        a.AnimalName,
        sr.AnimalDetail
      FROM Show_Reference sr
      JOIN EventSchedule e ON sr.EventID = e.EventID
      JOIN Animal a ON sr.AnimalID = a.AnimalID
      ORDER BY sr.EventID
    `);

    res.json({ success: true, data: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// ================= GET BY EVENT =================
router.get('/event/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.AnimalID,
        a.AnimalName,
        sr.AnimalDetail
      FROM Show_Reference sr
      JOIN Animal a ON sr.AnimalID = a.AnimalID
      WHERE sr.EventID = ?
    `, [req.params.id]);

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= GET BY ANIMAL =================
router.get('/animal/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.EventID,
        e.EventName,
        sr.AnimalDetail
      FROM Show_Reference sr
      JOIN EventSchedule e ON sr.EventID = e.EventID
      WHERE sr.AnimalID = ?
    `, [req.params.id]);

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= ADD (ASSIGN ANIMAL TO EVENT) =================
router.post('/', async (req, res) => {
  try {
    const { eventId, animalId, detail } = req.body;

    await pool.query(`
      INSERT INTO Show_Reference (EventID, AnimalID, AnimalDetail)
      VALUES (?, ?, ?)
    `, [eventId, animalId, detail]);

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// ================= UPDATE DETAIL =================
router.put('/', async (req, res) => {
  try {
    const { eventId, animalId, detail } = req.body;

    await pool.query(`
      UPDATE Show_Reference
      SET AnimalDetail = ?
      WHERE EventID = ? AND AnimalID = ?
    `, [detail, eventId, animalId]);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= DELETE =================
router.delete('/', async (req, res) => {
  try {
    const { eventId, animalId } = req.body;

    await pool.query(`
      DELETE FROM Show_Reference
      WHERE EventID = ? AND AnimalID = ?
    `, [eventId, animalId]);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;