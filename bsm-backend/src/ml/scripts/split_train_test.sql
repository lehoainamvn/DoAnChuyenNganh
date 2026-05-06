-- ================================
-- SCRIPT CHIA TRAIN / TEST (80/20)
-- KHÔNG INSERT IDENTITY
-- ================================



-- ================================
-- 1. XÓA BẢNG CŨ (NẾU CÓ)
-- ================================
IF OBJECT_ID('invoices_train', 'U') IS NOT NULL
    DROP TABLE invoices_train;

IF OBJECT_ID('invoices_test', 'U') IS NOT NULL
    DROP TABLE invoices_test;
GO

-- ================================
-- 2. TẠO BẢNG MỚI (KHÔNG COPY IDENTITY)
-- ================================
CREATE TABLE invoices_train (
    id INT IDENTITY(1,1) PRIMARY KEY,
    room_id INT,
    tenant_id INT,
    [month] NVARCHAR(7),
    month_num INT,
    room_price DECIMAL(12,2),
    electric_used INT,
    water_used INT,
    electric_cost DECIMAL(12,2),
    water_cost DECIMAL(12,2),
    total_amount DECIMAL(12,2),
    occupancy_rate FLOAT,
    status NVARCHAR(20),
    created_at DATETIME,
    paid_at DATETIME
);

CREATE TABLE invoices_test (
    id INT IDENTITY(1,1) PRIMARY KEY,
    room_id INT,
    tenant_id INT,
    [month] NVARCHAR(7),
    month_num INT,
    room_price DECIMAL(12,2),
    electric_used INT,
    water_used INT,
    electric_cost DECIMAL(12,2),
    water_cost DECIMAL(12,2),
    total_amount DECIMAL(12,2),
    occupancy_rate FLOAT,
    status NVARCHAR(20),
    created_at DATETIME,
    paid_at DATETIME
);

PRINT N'✅ Đã tạo bảng invoices_train và invoices_test';
GO

-- ================================
-- 3. CHIA DỮ LIỆU
-- ================================
DECLARE @houseId INT = 14;
DECLARE @totalRecords INT;
DECLARE @trainSize INT;

-- Tổng record
SELECT @totalRecords = COUNT(*)
FROM invoices i
JOIN rooms r ON i.room_id = r.id
WHERE r.house_id = @houseId;

SET @trainSize = CAST(@totalRecords * 0.8 AS INT);

PRINT N'📊 Tổng: ' + CAST(@totalRecords AS NVARCHAR);
PRINT N'📚 Train: ' + CAST(@trainSize AS NVARCHAR);
PRINT N'🧪 Test: ' + CAST(@totalRecords - @trainSize AS NVARCHAR);

-- ================================
-- 4. INSERT TRAIN (80% CŨ)
-- ================================
INSERT INTO invoices_train (
    room_id, tenant_id, [month], month_num,
    room_price, electric_used, water_used,
    electric_cost, water_cost,
    total_amount, occupancy_rate,
    status, created_at, paid_at
)
SELECT TOP (@trainSize)
    i.room_id, i.tenant_id, i.[month], i.month_num,
    i.room_price, i.electric_used, i.water_used,
    i.electric_cost, i.water_cost,
    i.total_amount, i.occupancy_rate,
    i.status, i.created_at, i.paid_at
FROM invoices i
JOIN rooms r ON i.room_id = r.id
WHERE r.house_id = @houseId
ORDER BY i.created_at ASC;

-- ================================
-- 5. INSERT TEST (20% MỚI)
-- ================================
INSERT INTO invoices_test (
    room_id, tenant_id, [month], month_num,
    room_price, electric_used, water_used,
    electric_cost, water_cost,
    total_amount, occupancy_rate,
    status, created_at, paid_at
)
SELECT 
    i.room_id, i.tenant_id, i.[month], i.month_num,
    i.room_price, i.electric_used, i.water_used,
    i.electric_cost, i.water_cost,
    i.total_amount, i.occupancy_rate,
    i.status, i.created_at, i.paid_at
FROM invoices i
JOIN rooms r ON i.room_id = r.id
WHERE r.house_id = @houseId
  AND NOT EXISTS (
        SELECT 1 
        FROM invoices_train t 
        WHERE t.room_id = i.room_id
          AND t.created_at = i.created_at
    )
ORDER BY i.created_at ASC;

PRINT N'✅ Đã chia train/test thành công';
GO

-- ================================
-- 6. KIỂM TRA
-- ================================
SELECT 
    'TRAIN' as dataset,
    COUNT(*) as total_records,
    AVG(occupancy_rate) as avg_occupancy,
    AVG(total_amount) as avg_revenue,
    MIN(created_at) as earliest_date,
    MAX(created_at) as latest_date
FROM invoices_train

UNION ALL

SELECT 
    'TEST',
    COUNT(*),
    AVG(occupancy_rate),
    AVG(total_amount),
    MIN(created_at),
    MAX(created_at)
FROM invoices_test;
GO

-- ================================
-- 7. EXPORT (OPTIONAL)
-- ================================
PRINT N'';
PRINT N'📝 Export CSV:';
PRINT N'bcp "SELECT * FROM invoices_train" queryout "train.csv" -c -t, -S SERVER -d DB -U USER -P PASS';
PRINT N'bcp "SELECT * FROM invoices_test" queryout "test.csv" -c -t, -S SERVER -d DB -U USER -P PASS';
PRINT N'';
PRINT N'🚀 READY FOR AI TRAINING!';
