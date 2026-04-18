# 🦁 Khao Mai Rak Zoo (สวนสัตว์เขาไม่รัก)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**Khao Mai Rak Zoo** เป็นเว็บแอปพลิเคชันจัดการสวนสัตว์สมัยใหม่ที่เน้นประสบการณ์การใช้งานที่พรีเมียมและสวยงาม พัฒนาขึ้นด้วยเทคโนโลยีเว็บพื้นฐาน (Vanilla Web Tech) เพื่อให้ความลื่นไหลและประยุกต์ใช้งานได้ง่าย

---

## ✨ ฟีเจอร์ (Feature)

### 🎟️ ระบบจองบัตรออนไลน์ (Online Ticketing)
- เลือกซื้อบัตรตามประเภท: เด็กทารก, เด็ก, และผู้ใหญ่
- ระบบตะกร้าสินค้า (Shopping Cart) ที่คำนวณราคาสุทธิโดยอัตโนมัติ
- รองรับการชำระเงินจำลองพร้อมรับ QR Code สำหรับเข้าชม

### 🦁 ข้อมูลสัตว์ (Animal Information)
- แกลเลอรีสัตว์ที่แบ่งตามโซน (แอฟริกา, เอเชีย, อเมริกา)
- หน้าแสดงรายละเอียดสัตว์พร้อมวิดีโอประกอบ
- ระบบ "Featured Animals" บนหน้าหลักที่ดึงข้อมูลแบบไดนามิก

### 🔐 ระบบสมาชิกและหลังบ้าน (Auth & Admin Dashboard)
- **User Role**: สั่งซื้อบัตรและตรวจสอบประวัติการซื้อของตัวเองได้
- **Admin Role**: ระบบจัดการผู้ใช้ (จัดการสิทธิ์ Admin/User) และดูภาพรวมระบบ
- **Premium UI**: หน้า Login พร้อมเอฟเฟกต์ "Soul Leaving Body" และดีไซน์แบบ Glassmorphism

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend**: HTML5, Vanilla CSS3 (Custom Variables & Animations)
- **Logic**: Vanilla JavaScript (ES6+)
- **Data Management**: Mock Data System & LocalStorage (สำหรับ Session และตะกร้าสินค้า)

---

## 🚀 วิธีเริ่มใช้งาน (Getting Started)

1. **Clone Repo**:
   ```bash
   git clone https://github.com/YourUsername/ZooWEBAPP.git
   ```
2. **เปิดใช้งาน**:
   เปิดไฟล์ `index.html` ด้วยเว็บเบราว์เซอร์ (แนะนำให้ใช้ Extension **Live Server** ใน VS Code เพื่อผลลัพธ์ที่ดีที่สุด)

### 🔑 บัญชีสำหรับทดสอบ (Test Credentials)
| บทบาท (Role) | อีเมล (Email) | รหัสผ่าน (Password) |
| :--- | :--- | :--- |
| **ผู้ดูแลระบบ (Admin)** | `admin@zoo.th` | `Admin1234` |
| **ผู้ใช้งาน (User)** | `user@zoo.th` | `User1234` |

---

## 📝 ข้อมูลเพิ่มเติม
โปรเจกต์นี้เป็นส่วนหนึ่งของรายวิชาวิชาวิทยาการคอมพิวเตอร์ (CS251) มหาวิทยาลัยธรรมศาสตร์
