const router = require('express').Router();
const pool   = require('../db');

// ดึงโซนทั้งหมด
// กวาดมาให้หมด โซนมีไม่เยอะหรอก ไม่ต้อง pagination
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ZoneID, ZoneName, ZoneDescrip, ZoneType
      FROM Zone
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ดึงโซนพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// ข้อมูลสำหรับ render แผนที่ ซ้ำกับอันแรกแต่ purpose ต่าง
router.get('/map', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ZoneID, ZoneName, ZoneType, ZoneDescrip
      FROM Zone
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ดึงแผนที่พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// ค้นหาโซนจากชื่อ prefix
// ไว้ทำ dropdown ให้คนหาโซน
router.get('/search', async (req, res) => {
  try {
    const name = req.query.name || '';
    const [rows] = await pool.query(`
      SELECT ZoneID, ZoneName
      FROM Zone
      WHERE ZoneName LIKE CONCAT(?, '%')
    `, [name]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ค้นโซนพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// รายละเอียดโซน + นับจำนวน Enclosure
// LEFT JOIN เผื่อโซนว่างๆ ไม่มีกรงก็ออก 0
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT z.ZoneID, z.ZoneName, z.ZoneDescrip, z.ZoneType,
             COUNT(e.EnclosureID) AS TotalEnclosures
      FROM Zone z
      LEFT JOIN Enclosure e ON z.ZoneID = e.ZoneID
      WHERE z.ZoneID = ?
      GROUP BY z.ZoneID, z.ZoneName, z.ZoneDescrip, z.ZoneType
    `, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'ไม่เจอโซนนี้' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('ดึงรายละเอียดโซนพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// สัตว์ทั้งหมดในโซน
// ดิ่งลงไปหา Animal จาก Zone -> Enclosure
router.get('/:id/animals', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.AnimalID, a.AnimalName, s.SpeciesName, e.EnclosureID
      FROM Animal a
      JOIN Species s ON a.SpeciesID = s.SpeciesID
      JOIN Enclosure e ON a.EnclosureID = e.EnclosureID
      WHERE e.ZoneID = ?
    `, [req.params.id]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ดึงสัตว์ในโซนพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// กิจกรรมที่จัดในโซน
router.get('/:id/events', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT EventID, EventName, EventDate, EventTime, EventDetail
      FROM EventSchedule
      WHERE ZoneID = ?
    `, [req.params.id]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ดึง event ในโซนพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

module.exports = router;
