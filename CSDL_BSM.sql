/* =========================
   TẠO DATABASE
========================= */
CREATE DATABASE BSM_Management;
GO
USE BSM_Management;
GO

/* =========================
   USERS (CHỦ TRỌ + NGƯỜI THUÊ)
========================= */
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) CHECK (role IN ('OWNER', 'TENANT')) NOT NULL,
    phone NVARCHAR(20),
    created_at DATETIME DEFAULT GETDATE()
);

/* =========================
   HOUSES (NHÀ TRỌ / TÒA NHÀ)
========================= */
CREATE TABLE houses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    owner_id INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    address NVARCHAR(255) NOT NULL,
    total_rooms INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (owner_id) REFERENCES users(id)
);

/* =========================
   ROOMS (PHÒNG TRỌ)
========================= */
CREATE TABLE rooms (
    id INT IDENTITY(1,1) PRIMARY KEY,
    house_id INT NOT NULL,
    owner_id INT NOT NULL,

    room_name NVARCHAR(50) NOT NULL,

    room_price DECIMAL(12,2) DEFAULT 0,
    electric_price DECIMAL(12,2) DEFAULT 0,

    /* ===== WATER CONFIG ===== */
    water_type NVARCHAR(10)
        CHECK (water_type IN ('METER', 'PERSON'))
        DEFAULT 'METER',

    water_price DECIMAL(12,2) DEFAULT 0,          -- giá / m3
    water_price_per_person DECIMAL(12,2) DEFAULT 0, -- giá / người
    people_count INT DEFAULT 1,                   -- số người (nếu PERSON)

    status NVARCHAR(20)
        CHECK (status IN ('EMPTY', 'OCCUPIED'))
        DEFAULT 'EMPTY',

    note NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (house_id) REFERENCES houses(id),
    FOREIGN KEY (owner_id) REFERENCES users(id)
);


/* =========================
   TENANT_ROOMS (AI Ở PHÒNG NÀO)
========================= */
CREATE TABLE tenant_rooms (
    id INT IDENTITY(1,1) PRIMARY KEY,
    room_id INT NOT NULL,
    tenant_id INT NOT NULL,

    start_date DATE NOT NULL,
    end_date DATE NULL,

    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (tenant_id) REFERENCES users(id)
);

/* =========================
   METER_READINGS (CHỈ SỐ ĐIỆN NƯỚC)
========================= */
CREATE TABLE meter_readings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    room_id INT NOT NULL,

    month NVARCHAR(7) NOT NULL, -- YYYY-MM
    electric_old INT NOT NULL,
    electric_new INT NOT NULL,
    water_old INT NOT NULL,
    water_new INT NOT NULL,

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

/* =========================
   INVOICES (HÓA ĐƠN)
========================= */
CREATE TABLE invoices (
    id INT IDENTITY(1,1) PRIMARY KEY,
    room_id INT NOT NULL,
    tenant_id INT NOT NULL,

    month NVARCHAR(7) NOT NULL,
    room_price DECIMAL(12,2) NOT NULL,
    electric_used INT NOT NULL,
    water_used INT NOT NULL,
    electric_cost DECIMAL(12,2) NOT NULL,
    water_cost DECIMAL(12,2) NOT NULL,

    total_amount DECIMAL(12,2) NOT NULL,
    status NVARCHAR(20)
        CHECK (status IN ('UNPAID', 'PAID'))
        DEFAULT 'UNPAID',

    created_at DATETIME DEFAULT GETDATE(),
    paid_at DATETIME NULL,

    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (tenant_id) REFERENCES users(id)
);

/* =========================
   NOTIFICATIONS (THÔNG BÁO)
========================= */
CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,

    title NVARCHAR(100),
    content NVARCHAR(255),
    is_read BIT DEFAULT 0,

    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(id)
);

/* =========================
   PAYMENTS (THANH TOÁN)
========================= */
CREATE TABLE payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    invoice_id INT NOT NULL,

    amount DECIMAL(12,2) NOT NULL,
    method NVARCHAR(50),
    paid_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

CREATE TABLE Otps (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL,
    otp NVARCHAR(10) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

