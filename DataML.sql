USE BSM_Management
GO

DECLARE @roomId INT
DECLARE @tenantId INT
DECLARE @i INT
DECLARE @baseDate DATE = DATEADD(MONTH,-11,GETDATE())

DECLARE room_cursor CURSOR FOR
SELECT id FROM rooms

OPEN room_cursor
FETCH NEXT FROM room_cursor INTO @roomId

WHILE @@FETCH_STATUS = 0
BEGIN

    /* chọn tenant random */

    SELECT TOP 1 @tenantId = id
    FROM users
    WHERE role='TENANT'
    ORDER BY NEWID()

    UPDATE rooms
    SET status='OCCUPIED'
    WHERE id=@roomId

    IF NOT EXISTS (SELECT 1 FROM tenant_rooms WHERE room_id=@roomId)
    BEGIN
        INSERT INTO tenant_rooms(room_id,tenant_id,start_date)
        VALUES(@roomId,@tenantId,GETDATE())
    END

    SET @i = 0

    WHILE @i < 12
    BEGIN

        DECLARE @date DATE
        DECLARE @createdAt DATETIME
        DECLARE @monthStr NVARCHAR(7)

        DECLARE @roomPrice INT
        DECLARE @electric INT
        DECLARE @water INT
        DECLARE @electricCost INT
        DECLARE @waterCost INT
        DECLARE @total INT
        DECLARE @status NVARCHAR(20)

        /* tháng dữ liệu */

        SET @date = DATEADD(MONTH,@i,@baseDate)

        /* month format YYYY-MM */

        SET @monthStr =
        CAST(YEAR(@date) AS NVARCHAR) + '-' +
        RIGHT('0'+CAST(MONTH(@date) AS NVARCHAR),2)

        /* created_at = ngày đầu tháng */

        SET @createdAt = DATEFROMPARTS(YEAR(@date),MONTH(@date),1)

        /* giá phòng tăng nhẹ theo thời gian */

        SET @roomPrice =
        2500000 +
        (@i * 100000) +
        (ABS(CHECKSUM(NEWID())) % 300000)

        SET @electric = 80 + (ABS(CHECKSUM(NEWID())) % 60)
        SET @water = 10 + (ABS(CHECKSUM(NEWID())) % 10)

        SET @electricCost = @electric * 3500
        SET @waterCost = @water * 15000

        SET @total = @roomPrice + @electricCost + @waterCost

        IF RAND() > 0.25
            SET @status='PAID'
        ELSE
            SET @status='UNPAID'

        INSERT INTO invoices(
            room_id,
            tenant_id,
            month,
            room_price,
            electric_used,
            water_used,
            electric_cost,
            water_cost,
            total_amount,
            status,
            created_at
        )
        VALUES(
            @roomId,
            @tenantId,
            @monthStr,
            @roomPrice,
            @electric,
            @water,
            @electricCost,
            @waterCost,
            @total,
            @status,
            @createdAt
        )

        SET @i = @i + 1

    END

FETCH NEXT FROM room_cursor INTO @roomId
END

CLOSE room_cursor
DEALLOCATE room_cursor

select * from	 invoices
