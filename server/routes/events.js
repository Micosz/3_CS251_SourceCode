const router = require('express').Router();
const pool   = require('../db');

// ตารางการแสดงทั้งหมดที่ยังไม่ผ่าน
// กรองเฉพาะโชว์ในอนาคต ไม่โชว์ของเก่าให้โดนด่า
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT EventID, EventName, EventDate, EventTime, ZoneID, EventDetail
      FROM EventSchedule
      WHERE (EventDate > CURDATE()) OR (EventDate = CURDATE() AND EventTime >= CURTIME())
      ORDER BY EventDate ASC, EventTime ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ดึง event พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// กิจกรรมที่กำลังจะมาถึงใน 2 ชั่วโมง
// ประกอบ Date+Time เป็น TIMESTAMP แล้วเทียบกับ NOW()
router.get('/upcoming', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT EventID, EventName, EventDate, EventTime, ZoneID
      FROM EventSchedule
      WHERE TIMESTAMP(EventDate, EventTime) BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 HOUR)
      ORDER BY EventDate ASC, EventTime ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ดึง upcoming พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// สัตว์ที่ร่วมแสดงบ่อยที่สุด Top 5
router.get('/top-animals', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.AnimalID, a.AnimalName, COUNT(sr.EventID) AS EventCount
      FROM Animal a
      JOIN Show_Reference sr ON a.AnimalID = sr.AnimalID
      GROUP BY a.AnimalID, a.AnimalName
      ORDER BY EventCount DESC, a.AnimalName ASC
      LIMIT 5
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ดึง top animals พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// กรองตารางการแสดงตามวันที่
router.get('/date', async (req, res) => {
  try {
    const date = req.query.date;
    if (!date) return res.status(400).json({ success: false, message: 'ต้องระบุวันที่' });

    const [rows] = await pool.query(`
      SELECT EventID, EventName, EventTime, ZoneID, EventDetail
      FROM EventSchedule
      WHERE EventDate = ?
    `, [date]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('กรอง event ตามวันพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// ค้นหากิจกรรมจากชื่อหรือรายละเอียด prefix
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const [rows] = await pool.query(`
      SELECT EventID, EventName, EventDate, EventTime, ZoneID, EventDetail
      FROM EventSchedule
      WHERE EventName LIKE CONCAT(?, '%') OR EventDetail LIKE CONCAT(?, '%')
    `, [q, q]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ค้นหา event พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// รายละเอียดการแสดง + สัตว์ร่วมแสดง GROUP_CONCAT
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT es.EventID, es.EventName, es.EventDate, es.EventTime, es.EventDetail,
             z.ZoneName,
             GROUP_CONCAT(a.AnimalName SEPARATOR ', ') AS ParticipatingAnimals
      FROM EventSchedule es
      JOIN Zone z ON es.ZoneID = z.ZoneID
      LEFT JOIN Show_Reference sr ON es.EventID = sr.EventID
      LEFT JOIN Animal a ON sr.AnimalID = a.AnimalID
      WHERE es.EventID = ?
      GROUP BY es.EventID, es.EventName, es.EventDate, es.EventTime, es.EventDetail, z.ZoneName
    `, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'ไม่เจอกิจกรรมนี้' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('ดึงรายละเอียด event พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

module.exports = router;
