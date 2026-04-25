const router = require('express').Router();
const pool   = require('../db');

// ดึงประเภทตั๋วที่เคยมีในระบบ
// ไม่มีตาราง TicketType แยก ก็ DISTINCT มาจากที่เคยขายไป
router.get('/types', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT TicketType
      FROM Ticket
      ORDER BY TicketType ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('ดึงประเภทตั๋วพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// ตรวจสอบโปรโมชั่น โค้ดต้องตรงและยังไม่หมดอายุ
router.get('/promo', async (req, res) => {
  try {
    const code = req.query.code || '';
    if (!code.trim()) return res.status(400).json({ success: false, message: 'ต้องระบุโค้ด' });

    const [rows] = await pool.query(`
      SELECT PromotionID, PromotionCode, DiscountAmount, Conditions, PromotionExpireDate
      FROM Promotion
      WHERE PromotionCode = ? AND PromotionExpireDate >= NOW()
    `, [code.trim()]);

    if (!rows.length) {
      return res.json({ success: false, message: 'โค้ดไม่ถูกต้องหรือหมดอายุแล้ว' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('ตรวจโปรโมชั่นพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// สร้างตั๋วใหม่ ยัด UUID ไว้กัน IDOR
// PurchaseChannel กับ PurchaseDate ปล่อย NULL ไว้ รอจ่ายเงินค่อยมาอัปเดต
router.post('/', async (req, res) => {
  try {
    const { visitorId, promotionId, ticketType, visitDate, expireDate, price } = req.body;

    if (!visitorId || !ticketType || !visitDate || !expireDate || price === undefined) {
      return res.status(400).json({ success: false, message: 'กรอกข้อมูลไม่ครบ' });
    }

    const [result] = await pool.query(`
      INSERT INTO Ticket (VisitorID, PromotionID, TicketType, VisitDate, TicketExpireDate,
                          PurchaseChannel, PurchaseDate, Price, TicketToken)
      VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, UUID())
    `, [visitorId, promotionId || null, ticketType, visitDate, expireDate, price]);

    const ticketId = result.insertId;

    // ดึงตั๋วที่เพิ่งสร้างกลับมาโชว์ พร้อมคำนวณ NetPrice
    const [rows] = await pool.query(`
      SELECT t.TicketID, t.TicketToken, t.VisitorID, t.PromotionID, t.TicketType,
             t.VisitDate, t.TicketExpireDate,
             t.Price AS OriginalPrice,
             IFNULL(p.DiscountAmount, 0) AS DiscountAmount,
             GREATEST(0, t.Price - IFNULL(p.DiscountAmount, 0)) AS NetPrice
      FROM Ticket t
      LEFT JOIN Promotion p ON t.PromotionID = p.PromotionID
      WHERE t.TicketID = ?
    `, [ticketId]);

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('สร้างตั๋วพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// ดูรายละเอียดตั๋ว 1 ใบ พร้อม NetPrice
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.TicketID, t.TicketToken, t.VisitorID, t.PromotionID, t.TicketType,
             t.VisitDate, t.TicketExpireDate,
             t.Price AS OriginalPrice,
             IFNULL(p.DiscountAmount, 0) AS DiscountAmount,
             GREATEST(0, t.Price - IFNULL(p.DiscountAmount, 0)) AS NetPrice
      FROM Ticket t
      LEFT JOIN Promotion p ON t.PromotionID = p.PromotionID
      WHERE t.TicketID = ?
    `, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'ไม่เจอตั๋วใบนี้' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('ดึงรายละเอียดตั๋วพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

module.exports = router;
