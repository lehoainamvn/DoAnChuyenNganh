# 📊 Kết Quả Kiểm Tra Mô Hình ML

**Ngày test**: 2026-05-06  
**House ID**: 14  
**Số records**: 190 (152 train, 38 test)  
**Khoảng thời gian**: 2021-05-06 → 2026-04-06 (5 năm)

---

## 📈 1. REGRESSION METRICS

### Train Set
| Metric | Giá Trị | Đánh Giá |
|--------|---------|----------|
| R² Score | 93.35% | ⭐⭐⭐⭐⭐ Xuất sắc |
| MAE | 40,066 VNĐ | ⭐⭐⭐⭐⭐ Xuất sắc |
| RMSE | 54,865 VNĐ | ⭐⭐⭐⭐ Tốt |
| MAPE | 7.96% | ⭐⭐⭐⭐⭐ Xuất sắc |

### Test Set
| Metric | Giá Trị | Đánh Giá |
|--------|---------|----------|
| R² Score | 92.73% | ⭐⭐⭐⭐⭐ Xuất sắc |
| MAE | 53,285 VNĐ | ⭐⭐⭐⭐⭐ Xuất sắc |
| RMSE | 65,271 VNĐ | ⭐⭐⭐⭐ Tốt |
| MAPE | 10.34% | ⭐⭐⭐⭐ Tốt |

### Cross Validation (5-fold)
```
CV Scores: [95.08%, 94.67%, 77.33%, 69.69%, 80.67%]
CV Mean:   83.49% (±9.96%)
```

**Nhận xét:**
- ✅ R² > 90% → Mô hình dự đoán rất chính xác
- ✅ MAPE < 10% → Sai số phần trăm thấp
- ✅ Train R² ≈ Test R² → Không overfitting
- ⚠️ CV có độ lệch chuẩn cao (±10%) → Cần thêm dữ liệu

---

## 🎯 2. FEATURE IMPORTANCE

| Feature | Importance | Ý Nghĩa |
|---------|-----------|---------|
| **occupancy_rate** | 64.98% | Tỷ lệ lấp đầy là yếu tố quan trọng nhất |
| **room_price** | 20.37% | Giá phòng ảnh hưởng đáng kể |
| **month_of_year** | 7.17% | Mùa vụ có tác động |
| **month_index** | 4.07% | Xu hướng theo thời gian |
| **is_peak_season** | 1.43% | Cao điểm (tháng 9-10) |
| **quarter** | 1.23% | Quý trong năm |
| **is_low_season** | 0.74% | Thấp điểm (tháng 5-7) |

**Nhận xét:**
- ✅ Occupancy rate chiếm 65% → Hợp lý vì phòng trống = 0 revenue
- ✅ Room price chiếm 20% → Giá cao = revenue cao
- ✅ Seasonality (month_of_year + peak/low season) = 9.34% → Có ảnh hưởng

---

## 🔢 3. CLASSIFICATION METRICS

### Ngưỡng Phân Loại
```
Low:    Revenue < 413,396 VNĐ
Medium: 413,396 - 670,759 VNĐ
High:   Revenue > 670,759 VNĐ
```

### Phân Bố Classes (Test Set)
| Class | Actual | Predicted |
|-------|--------|-----------|
| Low | 9 (23.7%) | 16 (42.1%) |
| Medium | 16 (42.1%) | 9 (23.7%) |
| High | 13 (34.2%) | 13 (34.2%) |

### Classification Report
```
              precision    recall  f1-score   support

High              0.85      0.85      0.85        13
Low               0.50      0.89      0.64         9
Medium            0.67      0.38      0.48        16

accuracy                              0.66        38
macro avg         0.67      0.70      0.66        38
weighted avg      0.69      0.66      0.64        38
```

**Nhận xét:**
- ✅ **High class**: Dự đoán tốt (85% precision & recall)
- ⚠️ **Low class**: Recall cao (89%) nhưng precision thấp (50%)
  - Model có xu hướng dự đoán "Low" quá nhiều
  - 16 predicted vs 9 actual
- ❌ **Medium class**: Recall thấp (38%)
  - Model khó phân biệt Medium với Low/High
  - Chỉ đoán đúng 6/16 cases

**Overall Accuracy**: 66% (25/38 đúng)

---

## ⚠️ 4. VẤN ĐỀ ĐÃ PHÁT HIỆN

### 1. Revenue = 0 (Phòng Trống)
```
Train: 12/152 records (7.9%) có revenue = 0
Test:  4/38 records (10.5%) có revenue = 0
```

**Tác động:**
- ❌ Gây MAPE = inf nếu không xử lý
- ✅ ĐÃ FIX: Chỉ tính MAPE trên records có revenue > 0

**Giải pháp đã áp dụng:**
```python
mask = y_test > 0
mape = np.mean(np.abs((y_test[mask] - y_pred[mask]) / y_test[mask])) * 100
```

### 2. Cross Validation Không Ổn Định
```
CV Scores: [95%, 95%, 77%, 70%, 81%]
Std Dev: ±9.96%
```

**Nguyên nhân:**
- Dữ liệu ít (190 records)
- Phân bố không đều theo thời gian

**Giải pháp:**
- Tăng dữ liệu lên 300-500 records
- Chạy `generate_training_data.sql` với `@months = 60`

### 3. Classification Accuracy Thấp (66%)
**Nguyên nhân:**
- Medium class khó phân biệt
- Ngưỡng phân loại động (quantile) có thể không tối ưu

**Giải pháp:**
- Thêm features: rolling average, lag features
- Thử ngưỡng cố định thay vì quantile
- Dùng ensemble methods (XGBoost, LightGBM)

---

## ✅ 5. KẾT LUẬN

### Mô Hình CÓ ỔN KHÔNG?

**✅ CÓ - Mô hình đủ tốt cho production**

### Điểm Mạnh
1. ✅ R² > 90% → Dự đoán rất chính xác
2. ✅ MAPE ~10% → Sai số chấp nhận được
3. ✅ Không overfitting → Tổng quát hóa tốt
4. ✅ Feature importance hợp lý
5. ✅ MAE ~53k VNĐ (chỉ 9.6% so với revenue TB)

### Điểm Yếu
1. ⚠️ CV không ổn định (±10%)
2. ⚠️ Classification accuracy chỉ 66%
3. ⚠️ Dữ liệu ít (190 records)
4. ⚠️ 10% records có revenue = 0

### Tổng Điểm: **4.3/5.0** ⭐⭐⭐⭐

---

## 💡 6. KHUYẾN NGHỊ

### Ngắn Hạn (Có thể dùng ngay)
- ✅ Deploy mô hình vào production
- ✅ Sử dụng cho dự đoán doanh thu
- ⚠️ Lưu ý: Accuracy có thể dao động ±10%

### Trung Hạn (1-2 tuần)
1. **Tăng dữ liệu**
   ```sql
   DECLARE @months INT = 60;  -- Tăng từ 36 lên 60 tháng
   ```

2. **Thêm features**
   - Rolling average (3 tháng, 6 tháng)
   - Lag features (revenue tháng trước)
   - Tỷ lệ tăng trưởng

3. **Tune hyperparameters**
   - Grid search để tìm n_estimators, max_depth tối ưu

### Dài Hạn (1-2 tháng)
1. **Thử mô hình khác**
   - XGBoost
   - LightGBM
   - Neural Networks

2. **Ensemble methods**
   - Kết hợp nhiều mô hình
   - Voting/Stacking

3. **Real-time learning**
   - Cập nhật mô hình khi có dữ liệu mới
   - Online learning

---

## 📊 7. BIỂU ĐỒ

### Files Đã Tạo
1. ✅ `model_evaluation.png` - 4 biểu đồ:
   - Train: Predicted vs Actual
   - Test: Predicted vs Actual
   - Residual Plot
   - Feature Importance

2. ✅ `confusion_matrix.png` - Ma trận nhầm lẫn:
   - 3x3 matrix (Low/Medium/High)
   - Heatmap với số lượng

3. ✅ `time_series_comparison.png` - Time series:
   - Actual revenue (blue line)
   - Predicted revenue (orange dashed)

---

## 🔄 8. SO SÁNH VỚI MỤC TIÊU

| Tiêu Chí | Mục Tiêu | Thực Tế | Status |
|----------|----------|---------|--------|
| R² Score | > 80% | 92.73% | ✅ Vượt |
| MAE | < 100k VNĐ | 53k VNĐ | ✅ Vượt |
| MAPE | < 15% | 10.34% | ✅ Vượt |
| Overfitting | Không | Không | ✅ Đạt |
| CV Stability | ±5% | ±10% | ⚠️ Chưa đạt |
| Classification | > 70% | 66% | ⚠️ Chưa đạt |

**Tổng kết**: 4/6 tiêu chí đạt, 2/6 cần cải thiện

---

## 📝 9. NOTES

### Cấu Hình Mô Hình
```python
RandomForestRegressor(
    n_estimators=200,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42
)
```

### Database
```
Server: NGOCHA
Database: BSM_Management
Records: 190 invoices
Time Range: 5 years (2021-2026)
```

### Lệnh Chạy Test
```bash
cd bsm-backend/src/ml
py test_ml_model.py
```

---

**Kết luận cuối cùng**: Mô hình **ĐỦ TỐT** để sử dụng trong production, nhưng nên cải thiện thêm để tăng độ ổn định. 🚀
