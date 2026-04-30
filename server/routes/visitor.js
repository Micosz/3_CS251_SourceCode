const router = require('express').Router();
const pool = require('../db');


// ================= GET ALL =================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        VisitorID,
        VisitorFName,
        VisitorLName,
        VisitorEmail,
        VisitorTel,
        DATE_FORMAT(VisitorDateOfBirth, '%Y-%m-%d') AS VisitorDateOfBirth
      FROM Visitor
      ORDER BY VisitorID ASC
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
        VisitorID,
        VisitorFName,
        VisitorLName,
        VisitorEmail,
        VisitorTel,
        DATE_FORMAT(VisitorDateOfBirth, '%Y-%m-%d') AS VisitorDateOfBirth
      FROM Visitor
      WHERE VisitorID = ?
    `, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    res.json({ success: true, data: rows[0] });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= CREATE =================
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dob,
      tel,
      email
    } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO Visitor 
      (VisitorFName, VisitorLName, VisitorDateOfBirth, VisitorTel, VisitorEmail)
      VALUES (?, ?, ?, ?, ?)
    `, [firstName, lastName, dob || null, tel || null, email]);

    res.json({ success: true, id: result.insertId });

  } catch (err) {
    console.error(err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.json({ success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= UPDATE =================
router.put('/:id', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dob,
      tel,
      email
    } = req.body;

    const [result] = await pool.query(`
      UPDATE Visitor
      SET 
        VisitorFName = ?,
        VisitorLName = ?,
        VisitorDateOfBirth = ?,
        VisitorTel = ?,
        VisitorEmail = ?
      WHERE VisitorID = ?
    `, [firstName, lastName, dob, tel, email, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
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
      'DELETE FROM Visitor WHERE VisitorID = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= GET WITH TICKETS =================
router.get('/with/tickets', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        v.VisitorID,
        v.VisitorFName,
        v.VisitorLName,
        COUNT(t.TicketID) AS TicketCount
      FROM Visitor v
      LEFT JOIN Ticket t ON v.VisitorID = t.VisitorID
      GROUP BY v.VisitorID
    `);

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;