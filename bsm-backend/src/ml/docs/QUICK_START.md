# ⚡ Quick Start Guide - ML Module

## 🚀 Chạy Nhanh Trong 5 Phút

### Bước 1: Cài Đặt (1 phút)
```bash
cd bsm-backend/src/ml
py -m pip install -r requirements.txt
```

### Bước 2: Kiểm Tra Kết Nối (30 giây)
```bash
py test_connection.py
```

### Bước 3: Tạo Dữ Liệu (2 phút)
1. Mở SSMS
2. Mở file `generate_training_data.sql`
3. Sửa dòng 48:
   ```sql
   DECLARE @houseId INT = 14;  -- Thay bằng house_id của bạn
   ```
4. Nhấn F5 (Execute)

### Bước 4: Test Mô Hình (1 phút)
```bash
py test_ml_model.py
```

### Bước 5: Xem Kết Quả
- Console: Metrics chi tiết
- Files: 3 file PNG trong thư mục `ml/`

---

## 📊 Kết Quả Mong Đợi

```
✅ Kết nối SQL Server thành công!
📊 Đã đọc 190 records từ database

🎯 TRAIN SET:
  R² Score:  0.9335 (93.35%)  ← Xuất sắc!
  MAE:       40,066 VNĐ
  MAPE:      7.96%

🧪 TEST SET:
  R² Score:  0.9273 (92.73%)  ← Xuất sắc!
  MAE:       53,285 VNĐ
  MAPE:      10.34%

✅ Không overfitting
```

---

## 🎯 Các Lệnh Quan Trọng

```bash
# Kiểm tra kết nối
py test_connection.py

# Test mô hình đầy đủ
py test_ml_model.py

# Phân tích chất lượng dữ liệu
py analyze_data_quality.py

# Kiểm tra Python version
py --version

# Kiểm tra ODBC drivers
py -c "import pyodbc; print(pyodbc.drivers())"
```

---

## 🐛 Fix Lỗi Nhanh

### Lỗi: "pip not found"
```bash
py -m pip install -r requirements.txt
```

### Lỗi: "Data source name not found"
```bash
py test_connection.py  # Tự động thử các drivers
```

### Lỗi: "Dữ liệu không đủ"
```sql
-- Tăng @months trong generate_training_data.sql
DECLARE @months INT = 60;
```

---

## 📚 Đọc Thêm

- `README.md` - Tổng quan đầy đủ
- `TEST_RESULTS.md` - Kết quả chi tiết
- `HUONG_DAN_CHAY.md` - Hướng dẫn từng bước

---

**Thời gian**: 5 phút  
**Độ khó**: ⭐⭐ (Dễ)  
**Kết quả**: Mô hình ML hoạt động với R² > 90%
