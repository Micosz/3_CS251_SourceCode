CREATE DATABASE IF NOT EXISTS zoo_management_db;

-- ตั้งค่าฐานข้อมูลให้รองรับภาษาไทยได้อย่างสมบูรณ์
ALTER DATABASE zoo_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE zoo_management_db;

-- 1. ตาราง Species (สายพันธุ์)
CREATE TABLE Species (
    SpeciesID INT AUTO_INCREMENT PRIMARY KEY,
    SpeciesName VARCHAR(30) NOT NULL,
    TaxonomyCategory VARCHAR(50),
    Origin VARCHAR(50),
    AverageLifespan INT,
    ScientificName VARCHAR(50),
    ConservationStatus ENUM('Least Concern', 'Near Threatened', 'Vulnerable', 'Endangered', 'Critically Endangered')
);

-- 2. ตาราง Zone (โซนภายในสวนสัตว์)
CREATE TABLE Zone (
    ZoneID INT AUTO_INCREMENT PRIMARY KEY,
    ZoneName VARCHAR(30) NOT NULL,
    ZoneDescrip VARCHAR(50),
    ZoneType VARCHAR(30)
);

-- 3. ตาราง Promotion (โปรโมชัน)
CREATE TABLE Promotion (
    PromotionID INT AUTO_INCREMENT PRIMARY KEY,
    PromotionCode VARCHAR(20) UNIQUE NOT NULL,
    DiscountAmount DECIMAL(7,2),
    Conditions VARCHAR(255),
    PromotionExpireDate DATETIME
);

-- 4. ตาราง Visitor (ผู้เข้าชม)
CREATE TABLE Visitor (
    VisitorID INT AUTO_INCREMENT PRIMARY KEY,
    VisitorFName VARCHAR(30) NOT NULL,
    VisitorLName VARCHAR(30) NOT NULL,
    VisitorDateOfBirth DATE,
    VisitorTel VARCHAR(12),
    VisitorEmail VARCHAR(50) UNIQUE NOT NULL
);

-- 5. ตาราง Admin (พนักงาน/ผู้ดูแลระบบ)
CREATE TABLE Admin (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(30) NOT NULL,
    Surname VARCHAR(30) NOT NULL,
    Email VARCHAR(50) UNIQUE NOT NULL,
    Salary INT,
    Address VARCHAR(100),
    HireDate DATE
);

-- 6. ตาราง Phone (เบอร์โทรศัพท์ของ Admin)
CREATE TABLE Phone (
    Phone VARCHAR(12),
    AdminID INT,
    PRIMARY KEY (Phone, AdminID),
    FOREIGN KEY (AdminID) REFERENCES Admin(AdminID) ON DELETE CASCADE
);

-- 7. ตาราง Enclosure (กรงจัดแสดง)
CREATE TABLE Enclosure (
    EnclosureID INT AUTO_INCREMENT PRIMARY KEY,
    ZoneID INT,
    EnType ENUM('Indoor', 'Outdoor', 'Aquatic'),
    Status ENUM('พร้อมใช้งาน', 'กำลังปรับปรุง', 'ปิดใช้งาน'),
    Capacity INT,
    FOREIGN KEY (ZoneID) REFERENCES Zone(ZoneID) ON DELETE SET NULL
);

-- 8. ตาราง Animal (สัตว์)
CREATE TABLE Animal (
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

-- 9. ตาราง EventSchedule (ตารางกิจกรรม)
CREATE TABLE EventSchedule (
    EventID INT AUTO_INCREMENT PRIMARY KEY,
    EventName VARCHAR(30) NOT NULL,
    EventDate DATE,
    EventTime TIME,
    EventDetail VARCHAR(255),
    ZoneID INT,
    FOREIGN KEY (ZoneID) REFERENCES Zone(ZoneID) ON DELETE SET NULL
);

-- 10. ตาราง Show_Reference (สัตว์ที่ร่วมกิจกรรม)
CREATE TABLE Show_Reference (
    EventID INT,
    AnimalID INT,
    AnimalDetail VARCHAR(100),
    PRIMARY KEY (EventID, AnimalID),
    FOREIGN KEY (EventID) REFERENCES EventSchedule(EventID) ON DELETE CASCADE,
    FOREIGN KEY (AnimalID) REFERENCES Animal(AnimalID) ON DELETE CASCADE
);

-- 11. ตาราง Assigned_To (พนักงานประจำโซน)
CREATE TABLE Assigned_To (
    ZoneID INT,
    AdminID INT,
    AssignedDate DATE,
    PRIMARY KEY (ZoneID, AdminID),
    FOREIGN KEY (ZoneID) REFERENCES Zone(ZoneID) ON DELETE CASCADE,
    FOREIGN KEY (AdminID) REFERENCES Admin(AdminID) ON DELETE CASCADE
);

-- 12. ตาราง UserAccount (บัญชีผู้ใช้งาน)
CREATE TABLE UserAccount (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    VisitorID INT,
    AdminID INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    AccountStatus ENUM('ใช้งานอยู่', 'ถูกปิดใช้งาน') DEFAULT 'ใช้งานอยู่',
    Password VARCHAR(255) NOT NULL, -- ปรับเป็น 255 เพื่อรองรับการ Hash รหัสผ่าน
    Username VARCHAR(30) UNIQUE NOT NULL,
    Role VARCHAR(10) NOT NULL,
    FOREIGN KEY (VisitorID) REFERENCES Visitor(VisitorID) ON DELETE CASCADE,
    FOREIGN KEY (AdminID) REFERENCES Admin(AdminID) ON DELETE SET NULL
);

-- 13. ตาราง Ticket (ตั๋วเข้าชม)
CREATE TABLE Ticket (
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