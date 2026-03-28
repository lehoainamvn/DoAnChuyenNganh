import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error
import numpy as np
import sys
import json
from datetime import datetime
from dateutil.relativedelta import relativedelta

# 1. NHẬN DỮ LIỆU
try:
    input_str = sys.stdin.read()
    input_data = json.loads(input_str)
    data = input_data.get("data", [])
    months_to_predict = int(input_data.get("months", 3))
    sim_occupancy = input_data.get("simOccupancy", None) 
except Exception:
    print(json.dumps({"error": "Dữ liệu không hợp lệ"}))
    sys.exit(1)
# Cho phép chạy từ 3 tháng, nếu ít hơn nữa thì mới báo lỗi
if len(data) < 3:
    print(json.dumps({
        "error": "Dữ liệu quá ít (dưới 3 tháng), AI không thể đưa ra dự báo.",
        "history": [],
        "predictions": [],
        "accuracy": {"r2_score": 0, "mae": 0},
        "insight": {"factorWeights": {"Xu hướng": 0, "Mùa vụ": 0, "Lấp đầy": 0}},
        "explanations": ["Cần thêm dữ liệu để kích hoạt tư vấn chiến lược."]
    }))
    sys.exit(0)
if len(data) < 6:
    print(json.dumps({"error": "Cần tối thiểu 6 tháng dữ liệu để AI đạt độ tin cậy khoa học."}))
    sys.exit(0)

df = pd.DataFrame(data)
df['date'] = pd.to_datetime(df['month'] if 'month' in df.columns else df['date'])
df = df.sort_values('date')
df['revenue'] = df['total_amount'] if 'total_amount' in df.columns else df.get('revenue', 0)
if 'occupancy_rate' not in df.columns: 
    # Tính tỷ lệ lấp đầy tương đối dựa vào tháng có doanh thu cao nhất
    # Việc này tạo ra sự biến động (variance) đồng biến với doanh thu, giúp AI học được quy luật
    max_rev = df['revenue'].max()
    
    # Tránh chia cho 0 nếu chưa có doanh thu
    if max_rev > 0:
        df['occupancy_rate'] = df['revenue'] / max_rev
    else:
        df['occupancy_rate'] = 0.85
# 2. FEATURE ENGINEERING
df['month_index'] = range(len(df))
df['month_of_year'] = df['date'].dt.month
X = df[['month_index', 'month_of_year', 'occupancy_rate']]
y = df['revenue']

# 3. ĐO LƯỜNG & BACKTESTING
train_size = int(len(df) * 0.8)
X_train, X_test = X.iloc[:train_size], X.iloc[train_size:]
y_train, y_test = y.iloc[:train_size], y.iloc[train_size:]

eval_model = RandomForestRegressor(n_estimators=100, random_state=42)
eval_model.fit(X_train, y_train)
y_pred_test = eval_model.predict(X_test)

r2 = max(0, r2_score(y_test, y_pred_test))
mae = mean_absolute_error(y_test, y_pred_test)

# 4. PHÁT HIỆN BẤT THƯỜNG (ANOMALY DETECTION)
anomalies = []
threshold = np.std(y_test - y_pred_test) * 1.5 # Ngưỡng nhạy cảm
for i in range(len(y_test)):
    error = y_test.iloc[i] - y_pred_test[i]
    if abs(error) > threshold:
        anomalies.append({
            "month": str(df['date'].iloc[train_size + i])[:7],
            "type": "Tăng đột biến" if error > 0 else "Sụt giảm bất thường",
            "deviation": round(float(abs(error)), 0),
            "reason": "Có thể do chi phí sửa chữa hoặc biến động khách thuê"
        })

# 5. DỰ BÁO TƯƠNG LAI (MÔ PHỎNG)
# 5. DỰ BÁO TƯƠNG LAI (MÔ PHỎNG)
final_model = RandomForestRegressor(n_estimators=100, random_state=42)
final_model.fit(X, y)

# Lấy lấp đầy trung bình của lịch sử
current_avg_occ = df['occupancy_rate'].mean()

# Xác định mục tiêu lấp đầy từ thanh trượt
target_occ = float(sim_occupancy) / 100 if sim_occupancy else current_avg_occ

# TÍNH HỆ SỐ ĐIỀU CHỈNH: Nếu thanh trượt thấp hơn lịch sử -> giảm doanh thu và ngược lại
adjustment_ratio = target_occ / current_avg_occ if current_avg_occ > 0 else 1.0

future_predictions = []
last_date = df['date'].iloc[-1]
for i in range(1, months_to_predict + 1):
    next_date = last_date + relativedelta(months=i)
    
    # AI dự báo dựa trên logic thông thường
    # Bọc dữ liệu trong DataFrame để tránh cảnh báo UserWarning của sklearn
    input_features = pd.DataFrame([[len(df)+i-1, next_date.month, target_occ]], columns=['month_index', 'month_of_year', 'occupancy_rate'])
    base_pred = final_model.predict(input_features)[0]
    
    # Ép kết quả mô phỏng thay đổi tuyến tính theo hệ số điều chỉnh của thanh trượt
    # Điều này giúp phá vỡ giới hạn "không biết ngoại suy" của Random Forest
    adjusted_pred = base_pred * adjustment_ratio

    future_predictions.append({
        "month": next_date.strftime('%Y-%m'),
        "realistic": round(float(adjusted_pred), 0),
        "optimistic": round(float(adjusted_pred * 1.1), 0),
        "pessimistic": round(float(adjusted_pred * 0.85), 0)
    })
# 6. GIẢI THÍCH (XAI) & LỜI KHUYÊN
weights = final_model.feature_importances_
explanations = []
if weights[2] > 0.4: explanations.append("Lấp đầy là yếu tố then chốt. Hãy tập trung giữ chân khách cũ.")
if weights[1] > 0.3: explanations.append("Phát hiện tính chu kỳ theo mùa. Doanh thu thường biến động vào thời điểm này.")
if target_occ < 0.8: explanations.append("Cảnh báo: Tỷ lệ lấp đầy dưới 80% đang kéo lùi lợi nhuận tiềm năng.")

# 7. TRẢ KẾT QUẢ TỔNG HỢP
print(json.dumps({
    "history": df[['date', 'revenue']].rename(columns={'date': 'month'}).astype(str).to_dict(orient='records'),
    "predictions": future_predictions,
    "accuracy": {"r2_score": round(r2 * 100, 1), "mae": round(mae, 0)},
    "anomalies": anomalies,
    "explanations": explanations,
    "insight": {
        "factorWeights": {
            "Xu hướng": round(weights[0]*100, 1),
            "Mùa vụ": round(weights[1]*100, 1),
            "Lấp đầy": round(weights[2]*100, 1)
        }
    }
}))