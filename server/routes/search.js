const router = require('express').Router();
const pool   = require('../db');

// Global Search ค้น 3 ตารางพร้อมกัน UNION
// โคตร overhead แต่ user อยากค้นปุ่มเดียวเจอทุกอย่าง
router.get('/', async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) return res.json({ success: true, data: [] });

    const [rows] = await pool.query(`
      SELECT 'Animal' AS Type, a.AnimalID AS ID, a.AnimalName AS Name
      FROM Animal a
      WHERE a.AnimalName LIKE CONCAT(?, '%')
      UNION
      SELECT 'Zone' AS Type, z.ZoneID AS ID, z.ZoneName AS Name
      FROM Zone z
      WHERE z.ZoneName LIKE CONCAT(?, '%')
      UNION
      SELECT 'Event' AS Type, es.EventID AS ID, es.EventName AS Name
      FROM EventSchedule es
      WHERE es.EventName LIKE CONCAT(?, '%')
    `, [q, q, q]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('global search พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

module.exports = router;
