const router = require('express').Router();
const pool   = require('../db');

// ดึงสัตว์ทั้งหมด JOIN Species + Enclosure + Zone
// ใช้ LEFT JOIN กรงกับโซนเผื่อมันยังเร่ร่อนไม่มีที่อยู่
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.AnimalID, a.AnimalName, s.SpeciesName, s.ScientificName,
             a.Gender, a.BirthDate, a.ArrivalDate,
             e.EnclosureID, z.ZoneID, z.ZoneName, s.ConservationStatus
      FROM Animal a
      JOIN Species s ON a.SpeciesID = s.SpeciesID
      LEFT JOIN Enclosure e ON a.EnclosureID = e.EnclosureID
      LEFT JOIN Zone z ON e.ZoneID = z.ZoneID
      ORDER BY a.AnimalName ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ดึงสัตว์ทั้งหมดพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// สัตว์ใกล้สูญพันธุ์ แนะนำหน้าแรก
// ดึง 5 ตัวที่น่าสงสาร เรียง A-Z ไม่ใช้ RAND() เพราะช้า
router.get('/featured', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.AnimalID, a.AnimalName, s.SpeciesName
      FROM Animal a
      JOIN Species s ON a.SpeciesID = s.SpeciesID
      WHERE s.ConservationStatus IN ('Endangered', 'Critically Endangered')
      ORDER BY a.AnimalName ASC
      LIMIT 5
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ดึง featured พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// ค้นหาสัตว์จากชื่อ prefix
// ห้ามใส่ % ข้างหน้าเด็ดขาด ไม่งั้น index ไม่ทำงาน
router.get('/search', async (req, res) => {
  try {
    const name = req.query.name || '';
    const [rows] = await pool.query(`
      SELECT a.AnimalID, a.AnimalName, s.SpeciesName, s.ScientificName,
             a.Gender, a.BirthDate, s.ConservationStatus
      FROM Animal a
      JOIN Species s ON a.SpeciesID = s.SpeciesID
      WHERE a.AnimalName LIKE CONCAT(?, '%')
    `, [name]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ค้นหาสัตว์พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// ค้นจากสายพันธุ์ exact match
router.get('/species/:speciesId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.AnimalID, a.AnimalName, s.SpeciesID, s.SpeciesName
      FROM Animal a
      JOIN Species s ON a.SpeciesID = s.SpeciesID
      WHERE a.SpeciesID = ?
    `, [req.params.speciesId]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ค้นจาก species พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// ค้นสัตว์จากโซน ต้อง JOIN ขึ้นไป Animal -> Enclosure -> Zone
router.get('/zone/:zoneId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.AnimalID, a.AnimalName, s.SpeciesName, z.ZoneName
      FROM Animal a
      JOIN Species s ON a.SpeciesID = s.SpeciesID
      JOIN Enclosure e ON a.EnclosureID = e.EnclosureID
      JOIN Zone z ON e.ZoneID = z.ZoneID
      WHERE z.ZoneID = ?
    `, [req.params.zoneId]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ค้นจากโซนพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// กรองตาม Conservation Status
router.get('/status/:status', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.AnimalID, a.AnimalName, s.SpeciesName, s.ConservationStatus
      FROM Animal a
      JOIN Species s ON a.SpeciesID = s.SpeciesID
      WHERE s.ConservationStatus = ?
    `, [req.params.status]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('กรอง status พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// ดูรายละเอียดสัตว์เต็มแม็กซ์ รวมชื่อพ่อแม่
// Self-Join 2 ชั้น LEFT JOIN ไม่งั้นตัวกำพร้าหายไปจากผลลัพธ์
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a1.AnimalID, a1.AnimalName, a1.Gender, a1.BirthDate, a1.ArrivalDate,
             s.SpeciesName, s.ScientificName, s.TaxonomyCategory, s.Origin,
             s.AverageLifespan, s.ConservationStatus,
             sire.AnimalName AS FatherName,
             dam.AnimalName AS MotherName,
             e.EnclosureID, e.EnType, e.Status AS EnclosureStatus, e.Capacity,
             z.ZoneName
      FROM Animal a1
      JOIN Species s ON a1.SpeciesID = s.SpeciesID
      LEFT JOIN Animal sire ON a1.FatherID = sire.AnimalID
      LEFT JOIN Animal dam ON a1.MotherID = dam.AnimalID
      LEFT JOIN Enclosure e ON a1.EnclosureID = e.EnclosureID
      LEFT JOIN Zone z ON e.ZoneID = z.ZoneID
      WHERE a1.AnimalID = ?
    `, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'ไม่เจอสัตว์ตัวนี้' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('ดึงรายละเอียดสัตว์พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// แนะนำสัตว์สายพันธุ์เดียวกัน ไม่รวมตัวมันเอง
router.get('/:id/similar', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT a2.AnimalID, a2.AnimalName
      FROM Animal a1
      JOIN Animal a2 ON a1.SpeciesID = a2.SpeciesID AND a1.AnimalID <> a2.AnimalID
      WHERE a1.AnimalID = ?
      LIMIT 5
    `, [req.params.id]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('แนะนำสัตว์คล้ายพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// ==================== Admin CRUD สัตว์ ====================

// เพิ่มสัตว์ใหม่ ยัดๆ เข้าไป
router.post('/', async (req, res) => {
  try {
    const { enclosureId, speciesId, animalName, gender, birthDate, arrivalDate, fatherId, motherId } = req.body;
    if (!enclosureId || !speciesId || !animalName || !gender || !birthDate) {
      return res.status(400).json({ success: false, message: 'กรอกข้อมูลไม่ครบ' });
    }

    const [result] = await pool.query(`
      INSERT INTO Animal (EnclosureID, SpeciesID, AnimalName, Gender, BirthDate, ArrivalDate, FatherID, MotherID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [enclosureId, speciesId, animalName, gender, birthDate, arrivalDate || new Date(), fatherId || null, motherId || null]);

    res.json({ success: true, data: { AnimalID: result.insertId }, message: 'เพิ่มสัตว์สำเร็จ' });
  } catch (err) {
    console.error('เพิ่มสัตว์พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// แก้ไขข้อมูลสัตว์ แตะเฉพาะข้อมูลชีววิทยา
router.put('/:id', async (req, res) => {
  try {
    const { speciesId, animalName, gender, birthDate, arrivalDate, fatherId, motherId } = req.body;

    const [result] = await pool.query(`
      UPDATE Animal
      SET SpeciesID = ?, AnimalName = ?, Gender = ?, BirthDate = ?,
          ArrivalDate = ?, FatherID = ?, MotherID = ?
      WHERE AnimalID = ?
    `, [speciesId, animalName, gender, birthDate, arrivalDate, fatherId || null, motherId || null, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'ไม่เจอสัตว์ตัวนี้' });
    }
    res.json({ success: true, message: 'แก้ไขสำเร็จ' });
  } catch (err) {
    console.error('แก้ไขสัตว์พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// ย้ายกรง แยก function ชัดเจน
router.put('/:id/enclosure', async (req, res) => {
  try {
    const { enclosureId } = req.body;
    if (!enclosureId) return res.status(400).json({ success: false, message: 'ต้องระบุกรง' });

    const [result] = await pool.query(`
      UPDATE Animal SET EnclosureID = ? WHERE AnimalID = ?
    `, [enclosureId, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'ไม่เจอสัตว์ตัวนี้' });
    }
    res.json({ success: true, message: 'ย้ายกรงสำเร็จ' });
  } catch (err) {
    console.error('ย้ายกรงพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// ลบสัตว์ Hard Delete ระวังนะ FK อาจพัง
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(`
      DELETE FROM Animal WHERE AnimalID = ?
    `, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'ไม่เจอสัตว์ตัวนี้' });
    }
    res.json({ success: true, message: 'ลบสำเร็จ' });
  } catch (err) {
    console.error('ลบสัตว์พัง:', err);
    // FK constraint พังก็บอกตรงๆ
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ success: false, message: 'ลบไม่ได้ สัตว์ตัวนี้ยังมีข้อมูลผูกอยู่' });
    }
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

module.exports = router;

