const router = require('express').Router();
const pool = require('../db');

// 1. GET /api/admin/animals/species/:speciesId/enclosure/:enclosureId 
// ดึงรายชื่อสัตว์เฉพาะสายพันธุ์และกรงที่ระบุ
router.get('/species/:speciesId/enclosure/:enclosureId', async (req, res) => {
    try {
        const { speciesId, enclosureId } = req.params;

        // ดึงชื่อสายพันธุ์มาโชว์ที่ Header
        const [sp] = await pool.query('SELECT SpeciesName FROM Species WHERE SpeciesID = ?', [speciesId]);
        const speciesName = sp.length ? sp[0].SpeciesName : `สายพันธุ์ #${speciesId}`;

        // ดึงตัวสัตว์ทั้งหมด
        const [rows] = await pool.query(`
      SELECT AnimalID, AnimalName, Gender, DATE_FORMAT(BirthDate, '%Y-%m-%d') as BirthDate, EnclosureID
      FROM Animal
      WHERE SpeciesID = ? AND EnclosureID = ?
      ORDER BY AnimalID ASC
    `, [speciesId, enclosureId]);

        res.json({ success: true, speciesName, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 2. POST /api/admin/animals
// เพิ่มสัตว์ตัวใหม่ลงฐานข้อมูล
router.post('/', async (req, res) => {
    try {
        const { cageId, speciesId, name, gender, birthDate, entryDate, fatherId, motherId } = req.body;

        const query = `
      INSERT INTO Animal (EnclosureID, SpeciesID, AnimalName, Gender, BirthDate, ArrivalDate, FatherID, MotherID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const fId = fatherId ? parseInt(fatherId) : null;
        const mId = motherId ? parseInt(motherId) : null;
        const arrival = entryDate ? new Date(entryDate) : new Date(); // ถ้าไม่กรอกให้เป็นเวลาปัจจุบัน

        await pool.query(query, [cageId, speciesId, name, gender, birthDate, arrival, fId, mId]);

        res.json({ success: true, message: 'เพิ่มข้อมูลสัตว์ตัวใหม่สำเร็จ!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    }
});

module.exports = router;