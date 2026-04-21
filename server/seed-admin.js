const bcrypt = require('bcryptjs');
const pool   = require('./db');

async function seed() {
  const conn = await pool.getConnection();
  try {
    // ตรวจว่ามี admin อยู่แล้วหรือไม่
    const [existing] = await conn.query(
      "SELECT UserID FROM UserAccount WHERE Username = 'admin@zoo.th'"
    );
    if (existing.length) {
      console.log('Admin account already exists. Skipping.');
      return;
    }

    const hash = await bcrypt.hash('Admin1234', 12);

    await conn.beginTransaction();

    const [v] = await conn.query(
      `INSERT INTO Visitor (VisitorFName, VisitorLName, VisitorEmail)
       VALUES ('ผู้ดูแล', 'ระบบ', 'admin@zoo.th')`
    );

    await conn.query(
      `INSERT INTO UserAccount (VisitorID, AdminID, Password, Username, Role, AccountStatus)
       VALUES (?, NULL, ?, 'admin@zoo.th', 'admin', 'ใช้งานอยู่')`,
      [v.insertId, hash]
    );

    await conn.commit();
    console.log('Admin account created successfully.');
    console.log('  Email:    admin@zoo.th');
    console.log('  Password: Admin1234');

  } catch (err) {
    await conn.rollback();
    console.error('Seed error:', err.message);
  } finally {
    conn.release();
    pool.end();
  }
}

seed();
