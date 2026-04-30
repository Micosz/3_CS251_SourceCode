-- =================================================================
-- ส่วนที่ 1: สร้างฐานข้อมูลและตั้งค่า
-- =================================================================
CREATE DATABASE IF NOT EXISTS zoo_management_db;
ALTER DATABASE zoo_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE zoo_management_db;

-- =================================================================
-- ส่วนที่ 2: สร้างตารางทั้งหมด (Tables Setup) - ครบ 13 Entities
-- =================================================================

-- 1. ตาราง Species
CREATE TABLE IF NOT EXISTS Species (
    SpeciesID INT AUTO_INCREMENT PRIMARY KEY,
    SpeciesName VARCHAR(30) NOT NULL,
    TaxonomyCategory VARCHAR(50),
    Origin VARCHAR(50),
    AverageLifespan INT,
    ScientificName VARCHAR(50),
    ConservationStatus ENUM('Least Concern', 'Near Threatened', 'Vulnerable', 'Endangered', 'Critically Endangered')
);

-- 2. ตาราง Zone
CREATE TABLE IF NOT EXISTS Zone (
    ZoneID INT AUTO_INCREMENT PRIMARY KEY,
    ZoneName VARCHAR(30) NOT NULL,
    ZoneDescrip VARCHAR(50),
    ZoneType VARCHAR(30)
);

-- 3. ตาราง Promotion
CREATE TABLE IF NOT EXISTS Promotion (
    PromotionID INT AUTO_INCREMENT PRIMARY KEY,
    PromotionCode VARCHAR(20) UNIQUE NOT NULL,
    DiscountAmount DECIMAL(7,2),
    Conditions VARCHAR(255),
    PromotionExpireDate DATETIME
);

-- 4. ตาราง Visitor
CREATE TABLE IF NOT EXISTS Visitor (
    VisitorID INT AUTO_INCREMENT PRIMARY KEY,
    VisitorFName VARCHAR(30) NOT NULL,
    VisitorLName VARCHAR(30) NOT NULL,
    VisitorDateOfBirth DATE,
    VisitorTel VARCHAR(12),
    VisitorEmail VARCHAR(50) UNIQUE NOT NULL
);

-- 5. ตาราง Admin
CREATE TABLE IF NOT EXISTS Admin (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(30) NOT NULL,
    Surname VARCHAR(30) NOT NULL,
    Email VARCHAR(50) UNIQUE NOT NULL,
    Salary INT,
    Address VARCHAR(100),
    HireDate DATE
);

-- 6. ตาราง Phone
CREATE TABLE IF NOT EXISTS Phone (
    Phone VARCHAR(12),
    AdminID INT,
    PRIMARY KEY (Phone, AdminID),
    FOREIGN KEY (AdminID) REFERENCES Admin(AdminID) ON DELETE CASCADE
);

-- 7. ตาราง Enclosure
CREATE TABLE IF NOT EXISTS Enclosure (
    EnclosureID INT AUTO_INCREMENT PRIMARY KEY,
    ZoneID INT,
    EnType ENUM('Indoor', 'Outdoor', 'Aquatic'),
    Status ENUM('พร้อมใช้งาน', 'กำลังปรับปรุง', 'ปิดใช้งาน'),
    Capacity INT,
    FOREIGN KEY (ZoneID) REFERENCES Zone(ZoneID) ON DELETE SET NULL
);

-- 8. ตาราง Animal
CREATE TABLE IF NOT EXISTS Animal (
    AnimalID INT AUTO_INCREMENT PRIMARY KEY,
    EnclosureID INT,
    SpeciesID INT,
    AnimalName VARCHAR(30) NOT NULL,
    Gender ENUM('Male', 'Female'),
    BirthDate DATE,
    ArrivalDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FatherID INT,
    MotherID INT,
    FOREIGN KEY (EnclosureID) REFERENCES Enclosure(EnclosureID) ON DELETE SET NULL,
    FOREIGN KEY (SpeciesID) REFERENCES Species(SpeciesID) ON DELETE SET NULL,
    FOREIGN KEY (FatherID) REFERENCES Animal(AnimalID) ON DELETE SET NULL,
    FOREIGN KEY (MotherID) REFERENCES Animal(AnimalID) ON DELETE SET NULL
);

-- 9. ตาราง EventSchedule
CREATE TABLE IF NOT EXISTS EventSchedule (
    EventID INT AUTO_INCREMENT PRIMARY KEY,
    EventName VARCHAR(50) NOT NULL,
    EventDate DATE,
    EventTime TIME,
    EventDetail VARCHAR(255),
    ZoneID INT,
    FOREIGN KEY (ZoneID) REFERENCES Zone(ZoneID) ON DELETE SET NULL
);

-- 10. ตาราง Show_Reference
CREATE TABLE IF NOT EXISTS Show_Reference (
    EventID INT,
    AnimalID INT,
    AnimalDetail VARCHAR(100),
    PRIMARY KEY (EventID, AnimalID),
    FOREIGN KEY (EventID) REFERENCES EventSchedule(EventID) ON DELETE CASCADE,
    FOREIGN KEY (AnimalID) REFERENCES Animal(AnimalID) ON DELETE CASCADE
);

-- 11. ตาราง Assigned_To
CREATE TABLE IF NOT EXISTS Assigned_To (
    ZoneID INT,
    AdminID INT,
    AssignedDate DATE,
    PRIMARY KEY (ZoneID, AdminID),
    FOREIGN KEY (ZoneID) REFERENCES Zone(ZoneID) ON DELETE CASCADE,
    FOREIGN KEY (AdminID) REFERENCES Admin(AdminID) ON DELETE CASCADE
);

-- 12. ตาราง UserAccount
CREATE TABLE IF NOT EXISTS UserAccount (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    VisitorID INT,
    AdminID INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    AccountStatus ENUM('ใช้งานอยู่', 'ถูกปิดใช้งาน') DEFAULT 'ใช้งานอยู่',
    Password VARCHAR(255) NOT NULL,
    Username VARCHAR(30) UNIQUE NOT NULL,
    Role VARCHAR(10) NOT NULL,
    FOREIGN KEY (VisitorID) REFERENCES Visitor(VisitorID) ON DELETE CASCADE,
    FOREIGN KEY (AdminID) REFERENCES Admin(AdminID) ON DELETE SET NULL
);

-- 13. ตาราง Ticket
CREATE TABLE IF NOT EXISTS Ticket (
    TicketID INT AUTO_INCREMENT PRIMARY KEY,
    VisitorID INT,
    PromotionID INT,
    TicketType VARCHAR(20) NOT NULL,
    VisitDate DATE,
    TicketExpireDate DATETIME,
    PurchaseChannel VARCHAR(50),
    PurchaseDate DATETIME,
    Price DECIMAL(7,2) NOT NULL,
    FOREIGN KEY (VisitorID) REFERENCES Visitor(VisitorID) ON DELETE CASCADE,
    FOREIGN KEY (PromotionID) REFERENCES Promotion(PromotionID) ON DELETE SET NULL
);

-- =================================================================
-- ส่วนที่ 3: ล้างข้อมูลเก่า (Cleanup)
-- =================================================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Ticket;
TRUNCATE TABLE UserAccount;
TRUNCATE TABLE Assigned_To;
TRUNCATE TABLE Show_Reference;
TRUNCATE TABLE EventSchedule;
TRUNCATE TABLE Animal;
TRUNCATE TABLE Enclosure;
TRUNCATE TABLE Phone;
TRUNCATE TABLE Admin;
TRUNCATE TABLE Visitor;
TRUNCATE TABLE Promotion;
TRUNCATE TABLE Zone;
TRUNCATE TABLE Species;
SET FOREIGN_KEY_CHECKS = 1;

-- =================================================================
-- ส่วนที่ 4: เพิ่มข้อมูล (Insert Data)
-- =================================================================

-- 1. Species (ข้อมูลชุดเดิม 12 ชนิด)
INSERT INTO Species (SpeciesID, SpeciesName, TaxonomyCategory, Origin, AverageLifespan, ScientificName, ConservationStatus) VALUES 
(101, 'สิงโตแอฟริกา', 'Mammal', 'Africa', 15, 'Panthera leo', 'Vulnerable'),
(102, 'ฮิปโปโปเตมัส', 'Mammal', 'Africa', 40, 'Hippopotamus amphibius', 'Vulnerable'),
(103, 'แรดขาว', 'Mammal', 'Africa', 50, 'Ceratotherium simum', 'Near Threatened'),
(104, 'คาปิบารา', 'Mammal', 'Africa', 10, 'Hydrochoerus hydrochaeris', 'Least Concern'),
(201, 'ช้างเอเชีย', 'Mammal', 'Asia', 60, 'Elephas maximus', 'Endangered'),
(202, 'เสือโคร่งขาว', 'Mammal', 'Asia', 15, 'Panthera tigris tigris', 'Endangered'),
(203, 'อุรังอุตัง', 'Mammal', 'Asia', 40, 'Pongo pygmaeus', 'Critically Endangered'),
(204, 'แพนด้า', 'Mammal', 'Asia', 20, 'Ailuropoda melanoleuca', 'Vulnerable'),
(301, 'หมีกริซลี', 'Mammal', 'America', 25, 'Ursus arctos horribilis', 'Least Concern'),
(302, 'หมาป่าสีเทา', 'Mammal', 'America', 10, 'Canis lupus', 'Least Concern'),
(303, 'บีเวอร์', 'Mammal', 'America', 12, 'Castor canadensis', 'Least Concern'),
(304, 'กวางมูส', 'Mammal', 'America', 15, 'Alces alces', 'Least Concern');

-- 2. Zone
INSERT INTO Zone (ZoneID, ZoneName, ZoneDescrip, ZoneType) VALUES 
(1, 'African Savanna', 'โซนจัดแสดงสัตว์ทวีปแอฟริกาและทุ่งหญ้าซาวันนา', 'Open Air'),
(2, 'Asian Tropical Forest', 'โซนจัดแสดงสัตว์ทวีปเอเชียและป่าดิบชื้น', 'Forest'),
(3, 'The Americas', 'โซนจัดแสดงสัตว์จากทวีปอเมริกาเหนือและใต้', 'Mixed');

-- 3. Promotion
INSERT INTO Promotion (PromotionID, PromotionCode, DiscountAmount, Conditions, PromotionExpireDate) VALUES
(1, '3SALE', 20.00, 'ส่วนลด ฿20 สำหรับทุกการซื้อ', '2026-12-31 23:59:59'),
(2, 'SUMMER50', 50.00, 'ส่วนลด ฿50 เมื่อซื้อครบ ฿200', '2026-08-31 23:59:59'),
(3, 'FAMILY20', 20.00, 'ส่วนลด 20% แพ็คเกจครอบครัว', '2026-12-31 23:59:59');

-- 4. Admin
INSERT INTO Admin (AdminID, FirstName, Surname, Email, Salary, Address, HireDate) VALUES 
(1, 'สุลต่านอ้น', 'เมืองใต้', 'SultanAon@email.com', 70000, 'พังงา', '2026-02-10'),
(2, 'มาหม้า', 'ใจดี', 'mama@email.com', 40000, 'นนทบุรี', '2026-02-09');

-- 5. Visitor (ข้อมูลชุดเดิม 8 คน)
INSERT INTO Visitor (VisitorID, VisitorFName, VisitorLName, VisitorDateOfBirth, VisitorTel, VisitorEmail) VALUES
(1, 'มิค', 'คาเอล', '2004-11-02', '0808080808', 'miks@zoo.th'),
(2, 'สมชาย', 'ใจดี', '1985-10-15', '0811112222', 'user@zoo.th'),
(3, 'นิภา', 'รักสัตว์', '1992-04-20', '0822223333', 'nipa@zoo.th'),
(4, 'วิชัย', 'ธรรมดี', '1978-11-05', '0833334444', 'wichai@zoo.th'),
(5, 'สุดา', 'พารวย', '1995-02-14', '0844445555', 'suda.p@zoo.th'),
(6, 'กิตติ', 'มุ่งมั่น', '1988-08-08', '0855556666', 'kitti.m@zoo.th'),
(7, 'อารยา', 'สดใส', '2001-12-25', '0866667777', 'araya.s@zoo.th'),
(8, 'ธนภูมิ', 'ยอดเยี่ยม', '1990-07-30', '0877778888', 'thanapoom@zoo.th');

-- 6. Phone
INSERT INTO Phone (Phone, AdminID) VALUES
('081-234-5678', 1),
('089-876-5432', 1),
('082-333-4444', 2);

-- 7. Enclosure (ข้อมูลชุดเดิมครบ 10 แห่ง)
INSERT INTO Enclosure (EnclosureID, ZoneID, EnType, Status, Capacity) VALUES
(101, 1, 'Outdoor', 'พร้อมใช้งาน', 5),
(102, 1, 'Aquatic', 'พร้อมใช้งาน', 3),
(103, 1, 'Outdoor', 'พร้อมใช้งาน', 10),
(201, 2, 'Outdoor', 'พร้อมใช้งาน', 8),
(202, 2, 'Outdoor', 'พร้อมใช้งาน', 2),
(203, 2, 'Outdoor', 'พร้อมใช้งาน', 5),
(204, 2, 'Indoor', 'พร้อมใช้งาน', 2),
(301, 3, 'Outdoor', 'พร้อมใช้งาน', 4),
(302, 3, 'Outdoor', 'พร้อมใช้งาน', 6),
(303, 3, 'Aquatic', 'พร้อมใช้งาน', 10);

-- 8. Assigned_To
INSERT INTO Assigned_To (ZoneID, AdminID, AssignedDate) VALUES 
(1, 1, '2026-03-01'),
(2, 1, '2026-03-01'),
(3, 2, '2026-03-05');

-- 9. Animal (ข้อมูลชุดเดิมครบ 15 ตัว)
INSERT INTO Animal (AnimalID, EnclosureID, SpeciesID, AnimalName, Gender, BirthDate, ArrivalDate, FatherID, MotherID) VALUES 
(1, 101, 101, 'ตาหวาน', 'Male', '2020-05-10', '2021-02-20', NULL, NULL),
(2, 102, 102, 'สายไหม', 'Female', '2020-01-15', '2021-02-20', NULL, NULL),
(3, 103, 103, 'แรด', 'Male', '2020-02-20', '2021-02-20', NULL, NULL),
(4, 103, 104, 'ชิล', 'Female', '2019-10-05', '2021-02-20', NULL, NULL),
(5, 201, 201, 'ก้านกล้วย', 'Male', '2015-08-12', '2018-01-15', NULL, NULL),
(6, 201, 201, 'ชบาแก้ว', 'Female', '2015-10-02', '2018-02-05', NULL, NULL),
(7, 201, 201, 'ต้นอ้อ', 'Male', '2023-09-12', '2023-12-25', 5, 6),
(8, 201, 201, 'กอแก้ว', 'Female', '2023-10-12', '2023-12-25', 5, 6),
(9, 202, 202, 'บิ๊ก', 'Male', '2017-10-13', '2018-01-15', NULL, NULL),
(10, 203, 203, 'หมวย', 'Female', '2025-12-13', '2025-12-30', NULL, NULL),
(11, 204, 204, 'อาโป', 'Male', '2025-11-19', '2025-12-30', NULL, NULL),
(12, 301, 301, 'กริซ', 'Male', '2014-10-29', '2015-11-20', NULL, NULL),
(13, 302, 302, 'ชาโดว', 'Male', '2014-11-19', '2015-11-20', NULL, NULL),
(14, 303, 303, 'เหยิน', 'Male', '2024-10-29', '2025-10-10', NULL, NULL),
(15, 303, 304, 'น้ำ', 'Female', '2025-11-09', '2025-10-10', NULL, NULL);

-- 10. EventSchedule (ข้อมูลชุดเดิมครบ 7 กิจกรรม)
INSERT INTO EventSchedule (EventID, EventName, EventDate, EventTime, EventDetail, ZoneID) VALUES 
(1, 'นาทีระทึก! หนูยักษ์ท้าตาย', '2026-04-28', '10:00:00', 'ร่วมลุ้นไปกับโชว์สุดหวาดเสียว ดูว่าคาปิบาร่าจะทรงตัวบนหัวจระเข้ได้นานแค่ไหนโดยไม่โดนงาบ!', 1),
(2, 'พยัคฆ์ขาวเหินเวหา', '2026-04-28', '11:30:00', 'ตื่นตาตื่นใจกับพละกำลังการกระโดดล่าเหยื่อกลางอากาศของเสือโคร่งขาวสุดสง่างาม', 2),
(3, 'มหกรรมแตงโมใต้น้ำ', '2026-04-28', '13:30:00', 'ชมความน่ารักและลีลาการดำน้ำสุดว่องไวเพื่อเขมือบแตงโมของน้องฮิปโปโปเตมัส', 1),
(4, 'บีเวอร์จ้าวสระสลาลม', '2026-04-28', '15:30:00', 'สนุกสนานไปกับความคล่องแคล่วของบีเวอร์ในการว่ายน้ำหลบหลีกสิ่งกีดขวางเหนือผิวน้ำ', 3),
(5, 'ช้างน้อยนักเตะแข้งทอง', '2026-04-29', '10:00:00', 'ทึ่งไปกับทักษะกีฬาและความแสนรู้ของช้างเอเชียในการควบคุมและเตะฟุตบอลทำประตู', 2),
(6, 'แพนด้าโรลลิ่งโชว์', '2026-04-29', '11:30:00', 'รับชมความซุกซนสุดป่วนของแพนด้าตอนม้วนตัวกลิ้งลงจากเนินเขาจำลอง รับรองว่าต้องอมยิ้ม', 2),
(7, 'ซุปตาร์อุรังอุตัง', '2026-04-29', '14:30:00', 'เตรียมกล้องให้พร้อมเพื่อเก็บภาพรอยยิ้มแฉ่งและลีลาการโพสท่าสุดกวนเลียนแบบคน', 2);

-- 11. Show_Reference
INSERT INTO Show_Reference (EventID, AnimalID, AnimalDetail) VALUES 
(1, 4, 'ชิล (คาปิบารา) ทรงตัวบนหัวจระเข้'), 
(2, 9, 'บิ๊ก (เสือโคร่งขาว) ตะปบเหยื่อ'),
(3, 2, 'สายไหม (ฮิปโป) กินแตงโมใต้น้ำ'),
(4, 14, 'เหยิน (บีเวอร์) ว่ายน้ำสลาลม'),
(5, 5, 'ก้านกล้วย (ช้าง) เตะฟุตบอล'),
(6, 11, 'อาโป (แพนด้า) ม้วนตัวกลิ้งลงเขา'),
(7, 10, 'หมวย (อุรังอุตัง) โพสท่าเลียนแบบคน');

-- 12. UserAccount
INSERT INTO UserAccount (VisitorID, AdminID, Password, Username, Role) VALUES 
(NULL, 1, 'AdminAon_ZA007', 'Sultan_Phuket', 'Admin'),
(NULL, 2, 'Mama_Zoo456', 'Mamalove_u', 'Admin'),
(1, NULL, 'Mik2004pass', 'mikael_v', 'Visitor'),
(2, NULL, 'Somchai1985', 'somchai_jai', 'Visitor'),
(2, NULL, 'Admin1234', 'Admin@zoo.th', 'Admin');

-- 13. Ticket (แก้ไขตามที่นายขอ: เหลือ 3 ใบ ผู้ใหญ่, เด็ก, ทารก)
INSERT INTO Ticket (VisitorID, PromotionID, TicketType, VisitDate, TicketExpireDate, PurchaseChannel, PurchaseDate, Price) VALUES
(1, NULL, 'Adult', '2026-05-01', '2026-05-01 18:00:00', 'Online', '2026-04-28 10:00:00', 100.00),
(2, NULL, 'Child', '2026-05-01', '2026-05-01 18:00:00', 'Online', '2026-04-28 11:00:00', 60.00),
(3, NULL, 'Infant', '2026-05-01', '2026-05-01 18:00:00', 'On-site', '2026-04-28 12:00:00', 0.00);