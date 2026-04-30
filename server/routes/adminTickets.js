const router = require('express').Router();
const pool = require('../db');

// 1. GET /api/admin/tickets - ดึงรายการตั๋วทั้งหมด
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT t.TicketID, t.VisitorID, t.TicketType, t.Price,
             p.PromotionCode, t.VisitDate
      FROM Ticket t
      LEFT JOIN Promotion p ON t.PromotionID = p.PromotionID
      ORDER BY t.TicketID DESC
    `);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('Error fetching tickets:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 2. DELETE /api/admin/tickets/:id - ยกเลิกตั๋ว (เมื่อแอดมินปรับจำนวนเหลือ 0)
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM Ticket WHERE TicketID = ?', [req.params.id]);
        res.json({ success: true, message: 'ยกเลิกตั๋วเรียบร้อยแล้ว' });
    } catch (err) {
        console.error('Error deleting ticket:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;