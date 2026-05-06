-- ================================
-- SCRIPT TẠO DỮ LIỆU HUẤN LUYỆN ML
-- Mục đích: Tạo dataset chuẩn cho mô hình dự đoán doanh thu
-- Features: occupancy_rate, month_of_year, quarter, trend
-- ================================

-- 0. DỌN CURSOR AN TOÀN
IF CURSOR_STATUS('global', 'room_cursor') >= -1
BEGIN
    CLOSE room_cursor;
    DEALLOCATE room_cursor;
END
GO

-- ================================
-- 1. THÊM CỘT PHỤC VỤ AI (NẾU CHƯA CÓ)
-- ================================
IF COL_LENGTH('invoices', 'occupancy_rate') IS NULL
BEGIN
    ALTER TABLE invoices ADD occupancy_rate FLOAT;
END

IF COL_LENGTH('invoices', 'month_num') IS NULL
BEGIN
    ALTER TABLE invoices ADD month_num INT;
END

IF COL_LENGTH('invoices', 'quarter') IS NULL
BEGIN
    ALTER TABLE invoices ADD quarter INT;
END

IF COL_LENGTH('invoices', 'month_index') IS NULL
BEGIN
    ALTER TABLE invoices ADD month_index INT;
END
GO

-- ================================
-- 2. KHAI BÁO BIẾN
-- ================================
DECLARE @houseId INT = 14;  -- Thay đổi theo house_id của bạn
DECLARE @months INT = 60;   -- Tạo 36 tháng dữ liệu (3 năm)
DECLARE @currentRoomId INT, @tenantId INT;
DECLARE @roomPrice DECIMAL(12,2), @totalAmt DECIMAL(12,2);
DECLARE @i INT, @invoiceDate DATETIME, @monthStr NVARCHAR(7);
DECLARE @monthNum INT, @quarter INT, @monthIndex INT;
DECLARE @electricUsed INT, @waterUsed INT;
DECLARE @eCost DECIMAL(12,2), @wCost DECIMAL(12,2);
DECLARE @seasonFactor FLOAT, @trendFactor FLOAT, @occupancy FLOAT;
DECLARE @randomSeed FLOAT, @priceImpact FLOAT;

-- ================================
-- 3. XÓA DỮ LIỆU CŨ (TÙY CHỌN)
-- ================================
-- DELETE FROM invoices WHERE room_id IN (SELECT id FROM rooms WHERE house_id = @houseId);
-- PRINT N'🗑️ Đã xóa dữ liệu cũ';

-- ================================
-- 4. CURSOR PHÒNG
-- ================================
DECLARE room_cursor CURSOR GLOBAL FOR 
    SELECT id, room_price 
    FROM rooms 
    WHERE house_id = @houseId;

OPEN room_cursor;
FETCH NEXT FROM room_cursor INTO @currentRoomId, @roomPrice;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Lấy tenant_id (nếu có)
    SELECT TOP 1 @tenantId = tenant_id 
    FROM tenant_rooms 
    WHERE room_id = @currentRoomId;
    
    IF @tenantId IS NULL
        SELECT TOP 1 @tenantId = tenant_id FROM tenant_rooms;
    
    IF @tenantId IS NOT NULL
    BEGIN
        SET @i = 1;
        
        WHILE @i <= @months
        BEGIN
            -- =========================
            -- 5. TÍNH TOÁN THỜI GIAN
            -- =========================
            SET @invoiceDate = DATEADD(MONTH, -@i, GETDATE());
            SET @monthStr = FORMAT(@invoiceDate, 'yyyy-MM');
            SET @monthNum = MONTH(@invoiceDate);
            SET @quarter = ((@monthNum - 1) / 3) + 1;
            SET @monthIndex = @months - @i;  -- Index tăng dần theo thời gian
            
            -- =========================
            -- 6. OCCUPANCY RATE (TỶ LỆ LẤP ĐẦY)
            -- Mô phỏng: 85% khả năng có người thuê
            -- =========================
            SET @randomSeed = RAND(CHECKSUM(NEWID()));
            SET @occupancy = CASE 
                WHEN @randomSeed > 0.15 THEN 1.0  -- 85% có người thuê
                ELSE 0.0  -- 15% trống phòng
            END;
            
            -- =========================
            -- 7. SEASONAL FACTOR (YẾU TỐ MÙA VỤ)
            -- Tháng 9-10: Cao điểm (sinh viên nhập học)
            -- Tháng 5-7: Thấp điểm (hè, sinh viên về quê)
            -- Tháng 1-2: Giảm (Tết)
            -- =========================
            SET @seasonFactor = 1.0;
            
            IF @monthNum IN (9, 10)  -- Cao điểm tháng 9-10
                SET @seasonFactor = 1.3;
            ELSE IF @monthNum IN (5, 6, 7)  -- Thấp điểm mùa hè
                SET @seasonFactor = 0.7;
            ELSE IF @monthNum IN (1, 2)  -- Tết
                SET @seasonFactor = 0.75;
            ELSE IF @monthNum IN (3, 4, 8, 11, 12)  -- Bình thường
                SET @seasonFactor = 1.0;
            
            -- =========================
            -- 8. TREND FACTOR (XU HƯỚNG TĂNG GIÁ)
            -- Giá tăng 0.5% mỗi tháng (6% mỗi năm)
            -- =========================
            SET @trendFactor = 1.0 + (@monthIndex * 0.005);
            
            -- =========================
            -- 9. PRICE IMPACT (GIÁ CAO → KHÓ THUÊ HƠN)
            -- Phòng giá cao có xu hướng trống nhiều hơn
            -- =========================
            SET @priceImpact = 1.0;
            IF @roomPrice > 4000000
                SET @priceImpact = 0.85;  -- Giảm 15% khả năng thuê
            ELSE IF @roomPrice > 3000000
                SET @priceImpact = 0.92;  -- Giảm 8% khả năng thuê
            
            -- Áp dụng price impact vào occupancy
            IF @occupancy = 1.0 AND RAND(CHECKSUM(NEWID())) > @priceImpact
                SET @occupancy = 0.0;
            
            -- =========================
            -- 10. ĐIỆN NƯỚC (CÓ QUY LUẬT)
            -- Điện: Cao hơn vào mùa hè (dùng điều hòa)
            -- Nước: Tương đối ổn định
            -- =========================
            SET @electricUsed = CAST((80 + (RAND(CHECKSUM(NEWID())) * 40)) * @seasonFactor AS INT);
            SET @waterUsed = CAST((5 + (RAND(CHECKSUM(NEWID())) * 3)) AS INT);
            SET @eCost = @electricUsed * 3500;
            SET @wCost = @waterUsed * 15000;
            
            -- =========================
            -- 11. TỔNG TIỀN + NOISE
            -- =========================
            SET @totalAmt = (
                (@roomPrice * @trendFactor)  -- Giá phòng có xu hướng
                + @eCost                      -- Chi phí điện
                + @wCost                      -- Chi phí nước
                + (RAND(CHECKSUM(NEWID())) * 100000 - 50000)  -- Noise ±50k
            );
            
            -- Áp dụng occupancy (nếu trống phòng thì revenue = 0)
            SET @totalAmt = @totalAmt * @occupancy;
            
            -- =========================
            -- 12. INSERT DỮ LIỆU
            -- =========================
            INSERT INTO invoices (
                room_id, tenant_id, [month], month_num, quarter, month_index,
                room_price, electric_used, water_used,
                electric_cost, water_cost, total_amount, 
                occupancy_rate, status, created_at, paid_at
            )
            VALUES (
                @currentRoomId, @tenantId, @monthStr, @monthNum, @quarter, @monthIndex,
                @roomPrice, @electricUsed, @waterUsed,
                @eCost, @wCost, @totalAmt,
                @occupancy, 'PAID', @invoiceDate, @invoiceDate
            );
            
            SET @i = @i + 1;
        END
    END
    
    FETCH NEXT FROM room_cursor INTO @currentRoomId, @roomPrice;
END

CLOSE room_cursor;
DEALLOCATE room_cursor;

PRINT N'✅ ĐÃ TẠO DATASET CHUẨN AI';
PRINT N'📊 Số tháng: ' + CAST(@months AS NVARCHAR(10));
PRINT N'🏠 House ID: ' + CAST(@houseId AS NVARCHAR(10));
GO

-- ================================
-- 13. KIỂM TRA DỮ LIỆU
-- ================================
SELECT TOP 10
    room_id,
    [month],
    month_num,
    quarter,
    month_index,
    occupancy_rate,
    total_amount,
    status
FROM invoices
WHERE room_id IN (SELECT id FROM rooms WHERE house_id = 14)
ORDER BY created_at DESC;

-- ================================
-- 14. THỐNG KÊ TỔNG QUAN
-- ================================
SELECT 
    COUNT(*) as total_records,
    AVG(occupancy_rate) as avg_occupancy,
    AVG(total_amount) as avg_revenue,
    MIN(created_at) as earliest_date,
    MAX(created_at) as latest_date
FROM invoices
WHERE room_id IN (SELECT id FROM rooms WHERE house_id = 14);
