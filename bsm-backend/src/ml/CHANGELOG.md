# 📝 Changelog - ML Module

## [2.1.0] - 2026-05-06 ⭐ Current

### 🎉 Simplification - Đơn Giản Hóa

**Quyết định**: Chỉ giữ 1 mô hình Owner-Based, loại bỏ Global Model

**Lý do:**
- ✅ Đơn giản hơn, dễ maintain
- ✅ Owner-Based luôn chính xác hơn
- ✅ Hầu hết user có ít nhất 3 tháng data
- ✅ Không cần lưu trữ model files

### 🗑️ Removed
- `models/train_global_model.py`
- `docs/FALLBACK_STRATEGY.md`
- `INDEX.md`
- Global Model files (.pkl, .json)

### 🔧 Changes
- **Logic**: Đơn giản hóa check dữ liệu
- **Error messages**: Rõ ràng hơn
- **Documentation**: Cập nhật phản ánh 1 mô hình

### 📊 Architecture
```
User Request
    ↓
Check data >= 3 months?
    ├─→ Yes → Owner-Based Model (Real-time training)
    └─→ No  → Error "Cần tối thiểu 3 tháng"
```

---

## [2.0.0] - 2026-05-06

### 🎉 Major Changes
- ✅ Tổ chức lại cấu trúc thư mục
- ✅ Fix MAPE = inf
- ✅ Fix Classification
- ✅ Thêm documentation đầy đủ

### 📊 Performance
- R² Score: 92.73%
- MAE: 53,285 VNĐ
- MAPE: 10.34%

---

## [1.0.0] - 2026-05-05

### 🎉 Initial Release
- ✅ Owner-Based Learning
- ✅ Random Forest Regressor
- ✅ Feature Engineering
- ✅ Basic testing

---

**Current Version**: 2.1.0  
**Status**: ✅ Production Ready  
**Model**: Owner-Based Only (Real-time training)
