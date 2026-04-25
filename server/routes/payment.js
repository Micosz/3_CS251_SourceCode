const router = require('express').Router();
const pool   = require('../db');

// ดึงข้อมูลตั๋วที่ต้องชำระ เฉพาะที่ยังไม่จ่าย
// PurchaseDate IS NULL แปลว่ายังค้างอยู่
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.TicketID, t.TicketToken, t.VisitorID, t.PromotionID, t.TicketType,
             t.VisitDate, t.TicketExpireDate, t.PurchaseChannel, t.PurchaseDate,
             t.Price AS OriginalPrice,
             IFNULL(p.DiscountAmount, 0) AS DiscountAmount,
             GREATEST(0, t.Price - IFNULL(p.DiscountAmount, 0)) AS NetPrice,
             CASE
               WHEN t.PurchaseDate IS NULL THEN 'PendingPayment'
               ELSE 'Paid'
             END AS PaymentStatus
      FROM Ticket t
      LEFT JOIN Promotion p ON t.PromotionID = p.PromotionID
      WHERE t.TicketID = ? AND t.PurchaseDate IS NULL
    `, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'ตั๋วนี้จ่ายแล้วหรือไม่มี' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('ดึงข้อมูลชำระเงินพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// เช็กสถานะการชำระเงิน derive จาก Nullability
router.get('/:id/status', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT TicketID, PurchaseDate,
             CASE
               WHEN PurchaseDate IS NULL THEN 'PendingPayment'
               ELSE 'Paid'
             END AS PaymentStatus
      FROM Ticket
      WHERE TicketID = ?
    `, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'ไม่เจอตั๋ว' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('เช็กสถานะชำระเงินพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// อัปเดตชำระเงินสำเร็จ
// AND PurchaseDate IS NULL กัน double payment แบบ idempotent
router.post('/:id/pay', async (req, res) => {
  try {
    const { purchaseChannel } = req.body;
    if (!purchaseChannel) {
      return res.status(400).json({ success: false, message: 'ต้องระบุช่องทางชำระ' });
    }

    const [result] = await pool.query(`
      UPDATE Ticket
      SET PurchaseChannel = ?, PurchaseDate = NOW()
      WHERE TicketID = ? AND PurchaseDate IS NULL
    `, [purchaseChannel, req.params.id]);

    if (result.affectedRows === 0) {
      return res.json({ success: false, message: 'ตั๋วนี้จ่ายไปแล้วหรือไม่มี' });
    }
    res.json({ success: true, message: 'ชำระเงินสำเร็จ' });
  } catch (err) {
    console.error('ชำระเงินพัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

// ผูก Promotion กับ Ticket จากโค้ดที่กรอก
// ล็อกว่าต้องยังไม่หมดอายุ และตั๋วยังไม่จ่ายเงิน
router.post('/:id/promo', async (req, res) => {
  try {
    const { promoCode } = req.body;
    if (!promoCode) {
      return res.status(400).json({ success: false, message: 'ต้องระบุโค้ด' });
    }

    const [result] = await pool.query(`
      UPDATE Ticket t
      JOIN Promotion p ON p.PromotionCode = ?
      SET t.PromotionID = p.PromotionID
      WHERE t.TicketID = ? AND t.PurchaseDate IS NULL AND p.PromotionExpireDate >= NOW()
    `, [promoCode.trim(), req.params.id]);

    if (result.affectedRows === 0) {
      return res.json({ success: false, message: 'โค้ดไม่ถูกหรือตั๋วจ่ายไปแล้ว' });
    }
    res.json({ success: true, message: 'ใช้โค้ดสำเร็จ' });
  } catch (err) {
    console.error('ผูก promo พัง:', err);
    res.status(500).json({ success: false, message: 'ระบบมีปัญหา' });
  }
});

module.exports = router;
