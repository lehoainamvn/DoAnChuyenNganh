# 🤖 Machine Learning Module - Revenue Prediction

## 📁 Cấu Trúc Thư Mục

```
bsm-backend/src/ml/
│
├── 📄 README.md                    # File này - Tổng quan
├── 📄 requirements.txt             # Python dependencies
├── 🐍 predict_revenue.py           # ⭐ PRODUCTION - Mô hình chính
│
├── 📘 docs/                        # Documentation
│   ├── README_ML_TESTING.md        # Chi tiết về testing
│   ├── QUICK_START.md              # Hướng dẫn nhanh 5 phút
│   ├── HUONG_DAN_CHAY.md           # Hướng dẫn tiếng Việt
│   ├── TEST_RESULTS.md             # Kết quả test chi tiết
│   └── FALLBACK_STRATEGY.md        # Chiến lược 2 mô hình
│
├── 🗄️ scripts/                     # SQL & utility scripts
│   ├── generate_training_data.sql  # Tạo dữ liệu giả lập
│   └── split_train_test.sql        # Chia train/test
│
├── 🤖 models/                      # Model training & management
│   ├── train_global_model.py       # Train mô hình tổng quát
│   ├── global_model.pkl            # Mô hình tổng quát (sau khi train)
│   ├── global_model_features.pkl   # Features list
│   └── global_model_metadata.json  # Metadata (R², MAE, etc.)
│
├── 🧪 tests/                       # Testing & analysis
│   ├── test_ml_model.py            # Test & đánh giá mô hình
│   ├── test_connection.py          # Kiểm tra kết nối SQL
│   ├── analyze_data_quality.py     # Phân tích chất lượng dữ liệu
│   ├── model_evaluation.png        # Output: 4 biểu đồ đánh giá
│   ├── confusion_matrix.png        # Output: Ma trận nhầm lẫn
│   ├── time_series_comparison.png  # Output: So sánh time series
│   └── data_quality_analysis.png   # Output: Phân tích dữ liệu
│
└── 📊 data/                        # Data files (optional)
    └── (CSV exports, backups, etc.)
```

---

## 🎯 Mục Đích & Chức Năng

### 🌟 Core Files

#### 1. `predict_revenue.py` ⭐ **PRODUCTION**
**Mục đích**: Mô hình chính đang chạy trong production

**Chức năng:**
- ✅ Owner-Based Learning (cá nhân hóa theo từng chủ trọ)
- ✅ Dự đoán doanh thu 1-12 tháng tới
- ✅ Phân tích xu hướng, mùa vụ, occupancy
- ✅ Real-time training (train mỗi lần predict)

**Được gọi bởi**: `predictRoutes.js` → API `/api/ai/predict-revenue`

**Yêu cầu dữ liệu:**
- **Tối thiểu**: 3 tháng (độ tin cậy 50-60%)
- **Khuyến nghị**: 6-12 tháng (độ tin cậy 70-95%)
- **Tối ưu**: 24+ tháng (độ tin cậy 90-95%)

---

### 📘 Documentation (`docs/`)

| File | Mục Đích | Đọc Khi Nào |
|------|----------|-------------|
| `QUICK_START.md` | Hướng dẫn nhanh 5 phút | Lần đầu setup |
| `HUONG_DAN_CHAY.md` | Hướng dẫn chi tiết tiếng Việt | Cần hướng dẫn từng bước |
| `README_ML_TESTING.md` | Chi tiết về testing & metrics | Cần hiểu sâu về mô hình |
| `TEST_RESULTS.md` | Kết quả test gần nhất | Muốn xem performance |
| `DATA_REQUIREMENTS.md` | Yêu cầu dữ liệu chi tiết | Muốn hiểu ngưỡng dữ liệu |

---

### 🗄️ Scripts (`scripts/`)

#### 1. `generate_training_data.sql`
**Mục đích**: Tạo dữ liệu giả lập có quy luật cho training

**Đặc điểm:**
- ✅ Seasonality (mùa vụ): Tháng 9-10 cao điểm, 5-7 thấp điểm
- ✅ Trend (xu hướng): Giá tăng 0.5%/tháng
- ✅ Occupancy: 85% lấp đầy, 15% trống
- ✅ Price Impact: Phòng giá cao khó thuê hơn
- ✅ Noise: Random ±50k

**Cách dùng:**
```sql
-- Sửa 2 biến:
DECLARE @houseId INT = 14;   -- ID nhà trọ
DECLARE @months INT = 60;    -- Số tháng (khuyến nghị 36-60)
-- Execute trong SSMS
```

#### 2. `split_train_test.sql`
**Mục đích**: Chia dữ liệu thành 2 bảng riêng (80/20)

**Lưu ý**: Optional - Python có thể tự động chia

---

### 🤖 Models (`models/`)

**Lưu ý**: Thư mục này trống vì hệ thống sử dụng **real-time training**.

**Cách hoạt động:**
- Mỗi lần user request → Đọc data của user
- Train model mới với Random Forest
- Dự đoán và trả kết quả
- Model bị xóa sau khi dùng

**Ưu điểm:**
- ✅ Luôn cập nhật với dữ liệu mới nhất
- ✅ Cá nhân hóa 100% cho từng user
- ✅ Không cần lưu trữ model files

**Nhược điểm:**
- ⚠️ Chậm hơn pre-trained model (~2-3s)
- ⚠️ Cần tối thiểu 3 tháng dữ liệu

---

### 🧪 Tests (`tests/`)

#### 1. `test_ml_model.py` 🔬
**Mục đích**: Test & đánh giá mô hình đầy đủ

**Chức năng:**
- ✅ Kết nối SQL và đọc dữ liệu
- ✅ Chia train/test (80/20)
- ✅ Huấn luyện Random Forest
- ✅ Đánh giá: R², MAE, RMSE, MAPE
- ✅ Cross Validation (5-fold)
- ✅ Feature Importance
- ✅ Vẽ 3 biểu đồ

**Cách chạy:**
```bash
py tests/test_ml_model.py
```

**Output:**
- Console: Metrics chi tiết
- `tests/model_evaluation.png`
- `tests/confusion_matrix.png`
- `tests/time_series_comparison.png`

#### 2. `test_connection.py` 🔌
**Mục đích**: Kiểm tra kết nối SQL nhanh

**Chức năng:**
- Liệt kê ODBC drivers
- Thử kết nối với nhiều drivers
- Kiểm tra database & tables
- Đếm số records

**Cách chạy:**
```bash
py tests/test_connection.py
```

#### 3. `analyze_data_quality.py` 📊
**Mục đích**: Phân tích chất lượng dữ liệu

**Chức năng:**
- Kiểm tra NULL values
- Phân tích phòng trống (revenue = 0)
- Phân bố revenue & classes
- Phát hiện outliers
- Correlation analysis
- Vẽ 6 biểu đồ

**Cách chạy:**
```bash
py tests/analyze_data_quality.py
```

**Output:**
- Console: Báo cáo chi tiết
- `tests/data_quality_analysis.png`

---

## 🚀 Quick Start

### 1. Cài Đặt (1 phút)
```bash
cd bsm-backend/src/ml
py -m pip install -r requirements.txt
```

### 2. Kiểm Tra Kết Nối (30 giây)
```bash
py tests/test_connection.py
```

### 3. Tạo Dữ Liệu (2 phút)
```sql
-- Mở scripts/generate_training_data.sql trong SSMS
-- Sửa @houseId và Execute
```

### 4. Test Mô Hình (1 phút)
```bash
py tests/test_ml_model.py
```

### 5. Train Global Model (2 phút)
```bash
py models/train_global_model.py
```

---

## 🎯 Workflow Sử Dụng

### 🆕 Lần Đầu Setup
```bash
# 1. Cài đặt
py -m pip install -r requirements.txt

# 2. Kiểm tra kết nối
py tests/test_connection.py

# 3. Tạo dữ liệu (chạy SQL)
# Mở scripts/generate_training_data.sql và Execute

# 4. Phân tích dữ liệu
py tests/analyze_data_quality.py

# 5. Test mô hình
py tests/test_ml_model.py

# 6. Train global model
py models/train_global_model.py
```

### 🔄 Khi Cần Cải Thiện
```bash
# 1. Phân tích dữ liệu hiện tại
py tests/analyze_data_quality.py

# 2. Tạo thêm dữ liệu nếu cần
# Chạy scripts/generate_training_data.sql với @months lớn hơn

# 3. Test lại
py tests/test_ml_model.py

# 4. Train lại global model
py models/train_global_model.py
```

### 📊 Production
```javascript
// Frontend gọi API như bình thường
const response = await fetch('/api/ai/predict-revenue?house=14&months=6');

// Backend tự động:
// - Nếu ≥ 6 tháng data → Owner-Based Model
// - Nếu < 6 tháng data → Global Model
```

---

## 📊 Kết Quả Hiện Tại

### Owner-Based Model
| Metric | Train | Test | Đánh Giá |
|--------|-------|------|----------|
| R² Score | 93.35% | 92.73% | ⭐⭐⭐⭐⭐ |
| MAE | 40,066 VNĐ | 53,285 VNĐ | ⭐⭐⭐⭐⭐ |
| MAPE | 7.96% | 10.34% | ⭐⭐⭐⭐ |

### Global Model
| Metric | Giá Trị | Đánh Giá |
|--------|---------|----------|
| R² Score | ~82% | ⭐⭐⭐⭐ |
| MAE | ~65,000 VNĐ | ⭐⭐⭐⭐ |

---

## 🔧 Configuration

### Database Connection
```python
SERVER = 'NGOCHA'
DATABASE = 'BSM_Management'
USER = 'bsm_user'
PASSWORD = '123456'
```

### Model Hyperparameters
```python
RandomForestRegressor(
    n_estimators=200,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42
)
```

---

## 📚 Đọc Thêm

- `docs/QUICK_START.md` - Bắt đầu nhanh
- `docs/FALLBACK_STRATEGY.md` - Hiểu cơ chế 2 mô hình
- `docs/TEST_RESULTS.md` - Xem kết quả chi tiết

---

## 🐛 Troubleshooting

```bash
# Lỗi: pip not found
py -m pip install -r requirements.txt

# Lỗi: Kết nối SQL
py tests/test_connection.py

# Lỗi: Dữ liệu không đủ
# Chạy scripts/generate_training_data.sql với @months = 60
```

---

**Version**: 2.0.0  
**Last Updated**: 2026-05-06  
**Status**: ✅ Production Ready
