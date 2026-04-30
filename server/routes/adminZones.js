const router = require('express').Router();
const pool = require('../db');

// 1. GET /api/admin/zones - ดึงข้อมูลโซนทั้งหมดพร้อมจำนวนกรงและสัตว์รวม
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT 
        z.ZoneID, 
        z.ZoneName, 
        z.ZoneDescrip,
        COUNT(DISTINCT e.EnclosureID) AS EnclosureCount,
        COUNT(DISTINCT a.AnimalID) AS AnimalCount
      FROM Zone z
      LEFT JOIN Enclosure e ON z.ZoneID = e.ZoneID
      LEFT JOIN Animal a ON e.EnclosureID = a.EnclosureID
      GROUP BY z.ZoneID
      ORDER BY z.ZoneID ASC
    `);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('Error fetching zones:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 2. GET /api/admin/zones/:id/species - ดึงรายชื่อสายพันธุ์, จำนวนสัตว์ และกรงที่อยู่ในโซนที่ระบุ
router.get('/:id/species', async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT 
        s.SpeciesID,
        s.SpeciesName,
        e.EnclosureID,
        COUNT(a.AnimalID) AS AnimalCount
      FROM Species s
      JOIN Animal a ON s.SpeciesID = a.SpeciesID
      JOIN Enclosure e ON a.EnclosureID = e.EnclosureID
      WHERE e.ZoneID = ?
      GROUP BY s.SpeciesID, s.SpeciesName, e.EnclosureID
      ORDER BY e.EnclosureID ASC
    `, [req.params.id]);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('Error fetching species in zone:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;