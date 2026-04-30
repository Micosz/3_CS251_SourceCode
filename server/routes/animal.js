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


// ================= GET BY SPECIES & ENCLOSURE =================
router.get('/species/:speciesId/enclosure/:enclosureId', async (req, res) => {
  try {
    const { speciesId, enclosureId } = req.params;

    const [sp] = await pool.query('SELECT SpeciesName FROM Species WHERE SpeciesID = ?', [speciesId]);
    const speciesName = sp.length ? sp[0].SpeciesName : `สายพันธุ์ #${speciesId}`;

    const [rows] = await pool.query(`
      SELECT AnimalID, AnimalName, Gender, DATE_FORMAT(BirthDate, '%Y-%m-%d') as BirthDate, EnclosureID
      FROM Animal
      WHERE SpeciesID = ? AND EnclosureID = ?
      ORDER BY AnimalID ASC
    `, [speciesId, enclosureId]);

    res.json({ success: true, speciesName, data: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// ================= GET BY ID =================
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        a.AnimalID,
        a.EnclosureID,
        a.SpeciesID,
        a.AnimalName,
        a.Gender,
        DATE_FORMAT(a.BirthDate, '%Y-%m-%d') AS BirthDate,
        DATE_FORMAT(a.ArrivalDate, '%Y-%m-%d') AS ArrivalDate,
        a.FatherID,
        a.MotherID,
        s.SpeciesName,
        s.TaxonomyCategory,
        s.Origin,
        s.AverageLifespan,
        s.ScientificName,
        s.ConservationStatus,
        z.ZoneID,
        z.ZoneName
      FROM Animal a
      LEFT JOIN Species s ON a.SpeciesID = s.SpeciesID
      LEFT JOIN Enclosure e ON a.EnclosureID = e.EnclosureID
      LEFT JOIN Zone z ON e.ZoneID = z.ZoneID
      WHERE a.AnimalID = ?
      LIMIT 1`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found'
      });
    }

    res.json({ success: true, data: rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= CREATE =================
router.post('/', async (req, res) => {
  try {
    const { name, gender, speciesId, cageId, enclosureId, birthDate, entryDate, fatherId, motherId } = req.body;
    const encId = enclosureId || cageId;
    const fId = fatherId ? parseInt(fatherId) : null;
    const mId = motherId ? parseInt(motherId) : null;
    const arrival = entryDate ? new Date(entryDate) : new Date();

    const [result] = await pool.query(`
      INSERT INTO Animal (AnimalName, Gender, SpeciesID, EnclosureID, BirthDate, ArrivalDate, FatherID, MotherID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, gender, speciesId, encId, birthDate || null, arrival, fId, mId]);

    res.json({ success: true, id: result.insertId, message: 'เพิ่มข้อมูลสัตว์ตัวใหม่สำเร็จ!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// ================= UPDATE =================
router.put('/:id', async (req, res) => {
  try {
    const { name, zoneId, enclosureId } = req.body;

    // Validate enclosure belongs to zone (if both provided)
    if (zoneId && enclosureId) {
      const [enc] = await pool.query(
        'SELECT EnclosureID FROM Enclosure WHERE EnclosureID = ? AND ZoneID = ?',
        [enclosureId, zoneId]
      );
      if (!enc.length) {
        return res.status(400).json({ success: false, message: 'หมายเลขกรงไม่ตรงกับโซนที่ระบุ' });
      }
    }

    await pool.query(`
      UPDATE Animal
      SET AnimalName = ?, EnclosureID = ?
      WHERE AnimalID = ?
    `, [name, enclosureId, req.params.id]);

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
