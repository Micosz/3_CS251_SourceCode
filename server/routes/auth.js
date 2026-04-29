/* ============================================================
   ZOO WEB APP - AUTH ROUTES
   Fixes:
   - Login uses username + plain-text password as requested.
   - LEFT JOIN supports admin accounts that may not have a Visitor row.
   - Always returns consistent JSON for frontend redirect/session handling.
   ============================================================ */

const router = require('express').Router();
const pool = require('../db');

function normalizeRole(role) {
  return String(role || 'user').trim().toLowerCase();
}

function buildSession(row) {
  const role = normalizeRole(row.Role);
  const firstName = row.VisitorFName || row.AdminFirstName || row.Username;
  const lastName = row.VisitorLName || row.AdminLastName || '';

  return {
    id: row.UserID,
    visitorId: row.VisitorID || null,
    adminId: row.AdminID || null,
    username: row.Username,
    name: String(firstName + ' ' + lastName).trim(),
    firstName: firstName,
    email: row.VisitorEmail || row.AdminEmail || row.Username,
    role: role,
    loginAt: new Date().toISOString()
  };
}

router.post('/login', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter username and password.'
      });
    }

    const [rows] = await pool.query(
      `SELECT
          ua.UserID,
          ua.VisitorID,
          ua.AdminID,
          ua.Username,
          ua.Password,
          ua.Role,
          ua.AccountStatus,
          v.VisitorFName,
          v.VisitorLName,
          v.VisitorEmail,
          a.FirstName AS AdminFirstName,
          a.Surname AS AdminLastName,
          a.Email AS AdminEmail
       FROM UserAccount ua
       LEFT JOIN Visitor v ON ua.VisitorID = v.VisitorID
       LEFT JOIN Admin a ON ua.AdminID = a.AdminID
       WHERE ua.Username = ?
       LIMIT 1`,
      [username]
    );

    if (!rows.length || password !== String(rows[0].Password || '')) {
      return res.status(401).json({
        success: false,
        message: 'Username or password is incorrect.'
      });
    }

    const row = rows[0];
    const status = String(row.AccountStatus || '');

    if (status.includes('ปิด') || status.toLowerCase() === 'disabled') {
      return res.status(403).json({
        success: false,
        message: 'This account is disabled.'
      });
    }

    return res.json({
      success: true,
      user: buildSession(row)
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'System error while logging in.'
    });
  }
});

router.post('/register', async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const firstName = String(req.body.firstName || '').trim();
    const lastName = String(req.body.lastName || '').trim();
    const dob = req.body.dob || null;
    const phone = req.body.phone || null;
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields.'
      });
    }

    const [exists] = await conn.query(
      'SELECT UserID FROM UserAccount WHERE Username = ? LIMIT 1',
      [email]
    );

    if (exists.length) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered.'
      });
    }

    await conn.beginTransaction();

    const [visitorResult] = await conn.query(
      `INSERT INTO Visitor
        (VisitorFName, VisitorLName, VisitorDateOfBirth, VisitorTel, VisitorEmail)
       VALUES (?, ?, ?, ?, ?)`,
      [firstName, lastName, dob, phone, email]
    );

    const visitorId = visitorResult.insertId;

    const [userResult] = await conn.query(
      `INSERT INTO UserAccount
        (VisitorID, AdminID, Password, Username, Role, AccountStatus)
       VALUES (?, NULL, ?, ?, 'user', 'ใช้งานอยู่')`,
      [visitorId, password, email]
    );

    await conn.commit();

    return res.json({
      success: true,
      user: {
        id: userResult.insertId,
        visitorId: visitorId,
        adminId: null,
        username: email,
        name: firstName + ' ' + lastName,
        firstName: firstName,
        email: email,
        role: 'user',
        loginAt: new Date().toISOString()
      }
    });
  } catch (err) {
    await conn.rollback();
    console.error('Register error:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'System error while registering.'
    });
  } finally {
    conn.release();
  }
});

router.get('/users', async (req, res) => {
  try {
    const search = req.query.search || '';
    let query = `
      SELECT u.UserID, u.Username, u.Role, u.AccountStatus, u.CreatedAt,
             v.VisitorFName, v.VisitorLName,
             a.FirstName AS AdminFirstName, a.Surname AS AdminLastName
      FROM UserAccount u
      LEFT JOIN Visitor v ON u.VisitorID = v.VisitorID
      LEFT JOIN Admin a ON u.AdminID = a.AdminID
    `;
    const params = [];

    if (search) {
      query += ` WHERE u.Username LIKE ?`;
      params.push('%' + search + '%');
    }

    query += ` ORDER BY u.UserID ASC`;

    const [rows] = await pool.query(query, params);

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({
      success: false,
      message: 'System error while loading users.'
    });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const userId = req.params.id;
    const { role, requesterUsername } = req.body;

    if (requesterUsername !== 'admin@zoo.th') {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์: เฉพาะ admin@zoo.th เท่านั้นที่สามารถเปลี่ยน Role ได้' });
    }

    await pool.query('UPDATE UserAccount SET Role = ? WHERE UserID = ?', [role, userId]);
    return res.json({ success: true, message: 'เปลี่ยน Role เป็น ' + role + ' สำเร็จ' });
  } catch (err) {
    console.error('Update role error:', err);
    return res.status(500).json({ success: false, message: 'System error while updating role.' });
  }
});

module.exports = router;
