# 📊 Yêu Cầu Dữ Liệu - Data Requirements

## 🎯 Tổng Quan

Hệ thống ML cần dữ liệu lịch sử để học và dự đoán. Số lượng dữ liệu ảnh hưởng trực tiếp đến **độ chính xác** của dự đoán.

---

## 📈 Bảng Ngưỡng Dữ Liệu

| Số Tháng | Mô Hình | Độ Tin Cậy | Độ Chính Xác (R²) | Trạng Thái | Ghi Chú |
|----------|---------|------------|-------------------|------------|---------|
| **0-2** | ❌ Không có | 0% | - | ❌ Không dự đoán được | Cần fallback Global Model |
| **3-5** | Owner-Based | 50-60% | 60-70% | ⚠️ Rất thấp | Chỉ thấy xu hướng cơ bản |
| **6-8** | Owner-Based | 70-80% | 75-85% | ⚠️ Trung bình | Bắt đầu học được pattern |
| **9-11** | Owner-Based | 80-85% | 80-90% | ✅ Tốt | Gần đủ để tin tưởng |
| **12-23** | Owner-Based | 85-95% | 85-95% | ✅ Rất tốt | **Khuyến nghị** (1 năm) |
| **24+** | Owner-Based | 90-95% | 90-95% | ⭐ Xuất sắc | Tối ưu (2+ năm) |

---

## 🔍 Chi Tiết Từng Mức

### ❌ 0-2 Tháng: KHÔNG ĐỦ

**Tình trạng:**
- Không thể dự đoán với Owner-Based Model
- Cần sử dụng Global Model (nếu có)

**Lý do:**
- Không đủ để phát hiện xu hướng
- Không thể học seasonality
- Dữ liệu quá ít, dễ overfitting

**Giải pháp:**
```
→ Sử dụng Global Model (fallback)
→ Hoặc chờ tích lũy thêm dữ liệu
```

**Message từ hệ thống:**
```json
{
  "error": "Cần tối thiểu 3 tháng dữ liệu...",
  "current_months": 2,
  "required_months": 3,
  "fallback_available": true/false
}
```

---

### ⚠️ 3-5 Tháng: TỐI THIỂU (Độ tin cậy thấp)

**Tình trạng:**
- ✅ Có thể dự đoán
- ⚠️ Độ chính xác thấp (50-60%)
- ⚠️ Chỉ thấy xu hướng cơ bản

**Có thể học được:**
- ✅ Xu hướng tăng/giảm cơ bản
- ⚠️ Occupancy rate trung bình
- ❌ Seasonality (chưa đủ)
- ❌ Pattern lặp lại

**Không thể học được:**
- ❌ Mùa vụ (cần ít nhất 6-12 tháng)
- ❌ Chu kỳ năm
- ❌ Sự kiện đặc biệt

**Ví dụ:**
```
Tháng 1: 3,000,000 VNĐ
Tháng 2: 3,200,000 VNĐ
Tháng 3: 3,100,000 VNĐ

→ AI chỉ thấy: "Doanh thu dao động quanh 3,100,000"
→ Dự đoán: 3,100,000 ± 200,000 (sai số lớn)
```

**Warning từ hệ thống:**
```
⚠️ Chỉ có 3 tháng dữ liệu. 
Độ tin cậy thấp (50-60%). 
Khuyến nghị có ít nhất 6 tháng để độ chính xác tốt hơn.
```

---

### ⚠️ 6-8 Tháng: TRUNG BÌNH

**Tình trạng:**
- ✅ Có thể dự đoán tốt hơn
- ✅ Độ chính xác trung bình (70-80%)
- ✅ Bắt đầu thấy pattern

**Có thể học được:**
- ✅ Xu hướng rõ ràng
- ✅ Occupancy rate pattern
- ✅ Một số mùa vụ (nếu có trong 6-8 tháng)
- ⚠️ Chưa xác nhận được chu kỳ lặp lại

**Ví dụ:**
```
Tháng 1: 3,000,000 (Tết - thấp)
Tháng 2: 3,200,000
Tháng 3: 3,400,000
Tháng 4: 3,300,000
Tháng 5: 2,800,000 (Hè - thấp)
Tháng 6: 2,900,000

→ AI thấy: "Tháng 1 và 5-6 thấp hơn"
→ Dự đoán: Có tính đến mùa vụ, nhưng chưa chắc chắn
```

**Warning từ hệ thống:**
```
⚠️ Chỉ có 6 tháng dữ liệu. 
Độ tin cậy trung bình (70-80%). 
Khuyến nghị có ít nhất 12 tháng để độ chính xác cao nhất.
```

---

### ✅ 9-11 Tháng: TỐT

**Tình trạng:**
- ✅ Dự đoán tốt
- ✅ Độ chính xác cao (80-85%)
- ✅ Gần đủ 1 năm

**Có thể học được:**
- ✅ Xu hướng chính xác
- ✅ Seasonality rõ ràng
- ✅ Occupancy pattern
- ⚠️ Chưa xác nhận chu kỳ năm lặp lại

**Ví dụ:**
```
9 tháng data → Thấy được:
- Tháng 1-2: Tết (thấp)
- Tháng 5-7: Hè (thấp)
- Tháng 9: Cao điểm (sinh viên)

→ Dự đoán tháng 10-12: Có tính mùa vụ chính xác
```

**Warning từ hệ thống:**
```
⚠️ Chỉ có 9 tháng dữ liệu. 
Độ tin cậy tốt (80-85%). 
Khuyến nghị có ít nhất 12 tháng để độ chính xác cao nhất.
```

---

### ⭐ 12-23 Tháng: RẤT TỐT (Khuyến nghị)

**Tình trạng:**
- ✅ Dự đoán rất tốt
- ✅ Độ chính xác rất cao (85-95%)
- ✅ **ĐÂY LÀ MỨC KHUYẾN NGHỊ**

**Có thể học được:**
- ✅ Xu hướng chính xác
- ✅ Seasonality đầy đủ (cả năm)
- ✅ Occupancy pattern
- ✅ Chu kỳ năm hoàn chỉnh
- ✅ Sự kiện đặc biệt (Tết, hè, tựu trường)

**Ví dụ:**
```
12 tháng data → Thấy được:
- Tháng 1-2: Tết (thấp 20%)
- Tháng 5-7: Hè (thấp 30%)
- Tháng 9-10: Cao điểm (cao 40%)
- Tháng 11-12: Ổn định

→ Dự đoán 6 tháng tới: Rất chính xác (±10%)
```

**Message từ hệ thống:**
```
✅ Có 12 tháng dữ liệu. 
Độ tin cậy cao (85-95%). 
Dự đoán đáng tin cậy.
```

---

### 🌟 24+ Tháng: XUẤT SẮC

**Tình trạng:**
- ⭐ Dự đoán xuất sắc
- ⭐ Độ chính xác tối đa (90-95%)
- ⭐ Xác nhận pattern lặp lại

**Có thể học được:**
- ✅ Tất cả như 12 tháng
- ✅ Xác nhận chu kỳ lặp lại qua nhiều năm
- ✅ Phát hiện trend dài hạn
- ✅ Dự đoán chính xác hơn

**Ví dụ:**
```
24 tháng data → Thấy được:
- Năm 1: Tết thấp 20%, Hè thấp 30%
- Năm 2: Tết thấp 18%, Hè thấp 28%

→ Xác nhận: Pattern lặp lại
→ Dự đoán năm 3: Rất chính xác (±5%)
```

---

## 🎯 Khuyến Nghị Thực Tế

### Cho Chủ Trọ Mới (0-2 tháng)
```
❌ Chưa thể dự đoán cá nhân hóa
→ Sử dụng Global Model (nếu có)
→ Hoặc chờ 1-2 tháng nữa
```

### Cho Chủ Trọ Mới Bắt Đầu (3-5 tháng)
```
⚠️ Có thể dự đoán nhưng độ tin cậy thấp
→ Dùng để tham khảo, không nên dựa vào hoàn toàn
→ Tích lũy thêm 3-6 tháng nữa
```

### Cho Chủ Trọ Đang Phát Triển (6-11 tháng)
```
✅ Có thể dự đoán tốt
→ Dùng để lập kế hoạch ngắn hạn (3-6 tháng)
→ Tích lũy đủ 12 tháng để tối ưu
```

### Cho Chủ Trọ Có Kinh Nghiệm (12+ tháng)
```
⭐ Dự đoán rất chính xác
→ Dùng để lập kế hoạch dài hạn (6-12 tháng)
→ Tin tưởng vào dự đoán của AI
```

---

## 📊 So Sánh Độ Chính Xác

### Ví Dụ Thực Tế

**Scenario**: Dự đoán doanh thu tháng 10 (thực tế: 4,000,000 VNĐ)

| Số Tháng Data | Dự Đoán | Sai Số | Sai Số % |
|---------------|---------|--------|----------|
| 3 tháng | 3,200,000 | 800,000 | 20% |
| 6 tháng | 3,600,000 | 400,000 | 10% |
| 12 tháng | 3,900,000 | 100,000 | 2.5% |
| 24 tháng | 3,950,000 | 50,000 | 1.25% |

---

## 💡 Tips Tích Lũy Dữ Liệu

### 1. Nhập Dữ Liệu Lịch Sử
```
Nếu bạn có sổ sách cũ:
→ Nhập vào hệ thống
→ Ngay lập tức có thể dự đoán
```

### 2. Đảm Bảo Dữ Liệu Chất Lượng
```
✅ Cập nhật hóa đơn đúng hạn
✅ Đánh dấu "Đã thanh toán" chính xác
✅ Ghi nhận occupancy rate đúng
```

### 3. Kiên Nhẫn
```
Tháng 1-3: Chưa dự đoán được
Tháng 4-6: Bắt đầu có dự đoán
Tháng 7-12: Dự đoán ngày càng chính xác
```

---

## 🔄 Fallback Strategy

```
User có < 3 tháng data
    ↓
Kiểm tra Global Model
    ↓
    ├─→ Có Global Model? → Dùng Global Model (70-80% accuracy)
    │
    └─→ Không có? → Báo lỗi "Cần tối thiểu 3 tháng"
```

---

## 📞 FAQ

**Q: Tôi chỉ có 2 tháng data, có cách nào dự đoán không?**  
A: Có, nếu hệ thống có Global Model. Liên hệ admin để cài đặt.

**Q: Tôi có 5 tháng data, dự đoán có chính xác không?**  
A: Độ chính xác ~60-70%. Dùng để tham khảo, không nên dựa vào hoàn toàn.

**Q: Bao nhiêu tháng thì đủ tốt?**  
A: **12 tháng** là mức khuyến nghị (85-95% accuracy).

**Q: Tôi có 24 tháng, có cần thêm không?**  
A: Không cần. 24 tháng đã xuất sắc rồi!

---

**Kết luận**: Càng nhiều dữ liệu, càng chính xác. Tối thiểu 3 tháng, khuyến nghị 12 tháng! 📊
