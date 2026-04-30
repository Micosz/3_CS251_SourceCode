const router = require('express').Router();
const pool = require('../db');


// ================= GET ALL EVENTS =================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.EventID,
        e.EventName,
        DATE_FORMAT(e.EventDate, '%Y-%m-%d') AS EventDate,
        e.EventTime,
        e.EventDetail,
        z.ZoneID,
        z.ZoneName
      FROM EventSchedule e
      LEFT JOIN Zone z ON e.ZoneID = z.ZoneID
      ORDER BY e.EventDate, e.EventTime
    `);

    res.json({ success: true, data: rows });

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
        EventID,
        EventName,
        DATE_FORMAT(EventDate, '%Y-%m-%d') AS EventDate,
        EventTime,
        EventDetail,
        ZoneID
      FROM EventSchedule
      WHERE EventID = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({ success: true, data: rows[0] });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= CREATE EVENT =================
router.post('/', async (req, res) => {
  try {
    const { name, date, time, detail, zoneId } = req.body;

    if (!name || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO EventSchedule (EventName, EventDate, EventTime, EventDetail, ZoneID)
      VALUES (?, ?, ?, ?, ?)
    `, [name, date, time, detail, zoneId]);

    res.json({ success: true, id: result.insertId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= UPDATE =================
router.put('/:id', async (req, res) => {
  try {
    const { name, date, time, detail, zoneId } = req.body;

    const [result] = await pool.query(`
      UPDATE EventSchedule
      SET EventName = ?, EventDate = ?, EventTime = ?, EventDetail = ?, ZoneID = ?
      WHERE EventID = ?
    `, [name, date, time, detail, zoneId, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
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
      'DELETE FROM EventSchedule WHERE EventID = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;