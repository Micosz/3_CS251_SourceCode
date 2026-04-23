const router = require('express').Router();
const pool = require('../db');


// ================= GET ALL =================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.TicketID,
        t.TicketType,
        DATE_FORMAT(t.VisitDate, '%Y-%m-%d') AS VisitDate,
        t.Price,
        DATE_FORMAT(t.PurchaseDate, '%Y-%m-%d %H:%i:%s') AS PurchaseDate,
        v.VisitorFName,
        v.VisitorLName,
        p.PromotionCode
      FROM Ticket t
      LEFT JOIN Visitor v ON t.VisitorID = v.VisitorID
      LEFT JOIN Promotion p ON t.PromotionID = p.PromotionID
      ORDER BY t.PurchaseDate DESC
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
        TicketID,
        TicketType,
        DATE_FORMAT(VisitDate, '%Y-%m-%d') AS VisitDate,
        Price,
        DATE_FORMAT(PurchaseDate, '%Y-%m-%d %H:%i:%s') AS PurchaseDate
      FROM Ticket
      WHERE TicketID = ?
    `, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
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
      visitorId,
      promotionId,
      ticketType,
      visitDate,
      price
    } = req.body;

    if (!visitorId || !ticketType || !visitDate || !price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO Ticket 
      (VisitorID, PromotionID, TicketType, VisitDate, TicketExpireDate, PurchaseChannel, PurchaseDate, Price)
      VALUES (?, ?, ?, ?, DATE_ADD(?, INTERVAL 1 DAY), 'Online', NOW(), ?)
    `, [visitorId, promotionId || null, ticketType, visitDate, visitDate, price]);

    res.json({ success: true, id: result.insertId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= DELETE =================
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM Ticket WHERE TicketID = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= GET BY VISITOR =================
router.get('/visitor/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        TicketID,
        TicketType,
        DATE_FORMAT(VisitDate, '%Y-%m-%d') AS VisitDate,
        Price,
        DATE_FORMAT(PurchaseDate, '%Y-%m-%d %H:%i:%s') AS PurchaseDate
      FROM Ticket
      WHERE VisitorID = ?
      ORDER BY PurchaseDate DESC
    `, [req.params.id]);

    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= SUMMARY =================
router.get('/summary/total', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) AS totalTickets,
        SUM(Price) AS totalRevenue
      FROM Ticket
    `);

    res.json({ success: true, data: rows[0] });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;