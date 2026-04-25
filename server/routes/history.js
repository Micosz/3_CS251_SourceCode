const router = require('express').Router();
const pool   = require('../db');

// ==================== ประวัติตั๋ว ====================

// ดึงตั๋วทั้งหมดของ Visitor พร้อม derive TicketStatus 3 สถานะ
router.get('/visitor/:visitorId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.TicketID, t.TicketToken, t.TicketType, t.VisitDate, t.PurchaseDate,
             t.Price AS OriginalPrice,
             IFNULL(p.DiscountAmount, 0) AS DiscountAmount,
             GREATEST(0, t.Price - IFNULL(p.DiscountAmount, 0)) AS NetPrice,
             CASE
               WHEN t.PurchaseDate IS NULL THEN 'PendingPayment'
               WHEN t.TicketExpireDate IS NOT NULL AND t.TicketExpireDate < NOW() THEN 'Expired'
               ELSE 'Valid'
             END AS TicketStatus
      FROM Ticket t
      LEFT JOIN Promotion p ON t.PromotionID = p.PromotionID
      WHERE t.VisitorID = ?
    `, [req.params.visitorId]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ดึงตั๋วของ visitor พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// รายละเอียดตั๋ว 1 ใบ ต้อง match ทั้ง ticket และ visitor กันคนอื่นแอบดู
router.get('/visitor/:visitorId/:ticketId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.TicketID, t.TicketToken, t.TicketType, t.VisitDate, t.TicketExpireDate,
             t.Price AS OriginalPrice,
             IFNULL(p.DiscountAmount, 0) AS DiscountAmount,
             GREATEST(0, t.Price - IFNULL(p.DiscountAmount, 0)) AS NetPrice,
             t.PurchaseChannel, t.PurchaseDate,
             CASE
               WHEN t.PurchaseDate IS NULL THEN 'PendingPayment'
               WHEN t.TicketExpireDate IS NOT NULL AND t.TicketExpireDate < NOW() THEN 'Expired'
               ELSE 'Valid'
             END AS TicketStatus,
             p.PromotionCode
      FROM Ticket t
      LEFT JOIN Promotion p ON t.PromotionID = p.PromotionID
      WHERE t.TicketID = ? AND t.VisitorID = ?
    `, [req.params.ticketId, req.params.visitorId]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'ไม่เจอตั๋วหรือไม่มีสิทธิ์ดู' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('ดึงรายละเอียดตั๋วพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// ประวัติการซื้อ เฉพาะที่จ่ายแล้ว เรียงจากใหม่ไปเก่า
router.get('/visitor/:visitorId/purchases', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.TicketID, t.TicketToken, t.TicketType, t.PurchaseDate,
             t.Price AS OriginalPrice,
             IFNULL(p.DiscountAmount, 0) AS DiscountAmount,
             GREATEST(0, t.Price - IFNULL(p.DiscountAmount, 0)) AS NetPrice
      FROM Ticket t
      LEFT JOIN Promotion p ON t.PromotionID = p.PromotionID
      WHERE t.VisitorID = ? AND t.PurchaseDate IS NOT NULL
      ORDER BY t.PurchaseDate DESC
    `, [req.params.visitorId]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ดึงประวัติซื้อพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// ==================== E-Ticket (ดึงจาก Token กัน IDOR) ====================

// ข้อมูลตั๋วจาก TicketToken ต้องจ่ายแล้วเท่านั้น
router.get('/eticket/:token', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.TicketID, t.TicketToken AS TicketCode, t.TicketType,
             t.VisitDate, t.TicketExpireDate,
             t.Price AS OriginalPrice,
             IFNULL(p.DiscountAmount, 0) AS DiscountAmount,
             GREATEST(0, t.Price - IFNULL(p.DiscountAmount, 0)) AS NetPrice,
             t.PurchaseChannel, t.PurchaseDate
      FROM Ticket t
      LEFT JOIN Promotion p ON t.PromotionID = p.PromotionID
      WHERE t.TicketToken = ? AND t.PurchaseDate IS NOT NULL
    `, [req.params.token]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'ไม่เจอตั๋วหรือยังไม่จ่ายเงิน' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('ดึง eticket พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// เจ้าของตั๋วจาก Token
router.get('/eticket/:token/visitor', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT v.VisitorFName, v.VisitorLName, v.VisitorEmail
      FROM Visitor v
      JOIN Ticket t ON v.VisitorID = t.VisitorID
      WHERE t.TicketToken = ? AND t.PurchaseDate IS NOT NULL
    `, [req.params.token]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'ไม่เจอ' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('ดึง visitor จาก token พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// โปรโมชั่นของตั๋ว
router.get('/eticket/:token/promo', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.PromotionCode, p.DiscountAmount, p.Conditions
      FROM Ticket t
      LEFT JOIN Promotion p ON p.PromotionID = t.PromotionID
      WHERE t.TicketToken = ? AND t.PurchaseDate IS NOT NULL
    `, [req.params.token]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'ไม่เจอ' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('ดึง promo จาก token พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// ข้อมูลครบถ้วนสำหรับ E-Ticket Master Query
// ดึงทีเดียวครบ ตั๋ว + ลูกค้า + โปรโมชั่น + NetPrice
router.get('/eticket/:token/full', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.TicketID, t.TicketToken AS TicketCode, t.TicketType,
             t.VisitDate, t.TicketExpireDate,
             t.Price AS OriginalPrice,
             IFNULL(p.DiscountAmount, 0) AS DiscountAmount,
             GREATEST(0, t.Price - IFNULL(p.DiscountAmount, 0)) AS NetPrice,
             t.PurchaseChannel, t.PurchaseDate,
             v.VisitorFName, v.VisitorLName, v.VisitorEmail,
             p.PromotionCode
      FROM Ticket t
      JOIN Visitor v ON t.VisitorID = v.VisitorID
      LEFT JOIN Promotion p ON t.PromotionID = p.PromotionID
      WHERE t.TicketToken = ? AND t.PurchaseDate IS NOT NULL
    `, [req.params.token]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'ไม่เจอ E-Ticket' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('ดึง full eticket พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

module.exports = router;
