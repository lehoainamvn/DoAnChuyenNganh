"""
SCRIPT KIỂM TRA MÔ HÌNH HỌC MÁY
- Đọc dữ liệu từ SQL Server
- Chia train/test (80/20)
- Huấn luyện mô hình Random Forest
- Đánh giá với các metrics: R², MAE, RMSE, MAPE
- Vẽ ma trận nhầm lẫn (cho bài toán phân loại)
- Vẽ biểu đồ so sánh predicted vs actual
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    r2_score, 
    mean_absolute_error, 
    mean_squared_error,
    confusion_matrix,
    classification_report
)
from sklearn.model_selection import train_test_split, cross_val_score
import pyodbc
import warnings
warnings.filterwarnings('ignore')

# ================================
# 1. KẾT NỐI SQL SERVER
# ================================
def connect_to_sql():
    """Kết nối đến SQL Server"""
    try:
        conn = pyodbc.connect(
            'DRIVER={ODBC Driver 17 for SQL Server};'
            'SERVER=NGOCHA;'
            'DATABASE=BSM_Management;'
            'UID=bsm_user;'
            'PWD=123456;'
            'TrustServerCertificate=yes;'
        )
        print("✅ Kết nối SQL Server thành công!")
        return conn
    except Exception as e:
        print(f"❌ Lỗi kết nối SQL Server: {e}")
        print(f"💡 Thử các giải pháp sau:")
        print(f"   1. Kiểm tra SQL Server đang chạy")
        print(f"   2. Thử DRIVER={{SQL Server}} thay vì ODBC Driver 17")
        print(f"   3. Thử SERVER=NGOCHA\\SQLEXPRESS nếu dùng SQL Express")
        return None

# ================================
# 2. ĐỌC DỮ LIỆU
# ================================
def load_data_from_sql(conn, house_id=14):
    """Đọc dữ liệu từ SQL Server"""
    query = f"""
    SELECT 
        i.id,
        i.room_id,
        i.[month],
        i.month_num,
        i.quarter,
        i.month_index,
        i.occupancy_rate,
        i.room_price,
        i.electric_used,
        i.water_used,
        i.electric_cost,
        i.water_cost,
        i.total_amount as revenue,
        i.created_at,
        r.house_id
    FROM invoices i
    JOIN rooms r ON i.room_id = r.id
    WHERE r.house_id = {house_id}
        AND i.status = 'PAID'
    ORDER BY i.created_at ASC
    """
    
    df = pd.read_sql(query, conn)
    print(f"📊 Đã đọc {len(df)} records từ database")
    return df

# ================================
# 3. TIỀN XỬ LÝ DỮ LIỆU
# ================================
def preprocess_data(df):
    """Tiền xử lý dữ liệu"""
    # Chuyển đổi kiểu dữ liệu
    df['created_at'] = pd.to_datetime(df['created_at'])
    df['revenue'] = df['revenue'].astype(float)
    df['occupancy_rate'] = df['occupancy_rate'].astype(float)
    
    # Tạo thêm features
    df['month_of_year'] = df['created_at'].dt.month
    df['year'] = df['created_at'].dt.year
    df['is_peak_season'] = df['month_of_year'].isin([9, 10]).astype(int)
    df['is_low_season'] = df['month_of_year'].isin([5, 6, 7]).astype(int)
    
    # Tính revenue per room
    df['revenue_per_room'] = df['revenue'] / df['room_price']
    
    print("✅ Tiền xử lý dữ liệu hoàn tất")
    print(f"📈 Khoảng thời gian: {df['created_at'].min()} đến {df['created_at'].max()}")
    print(f"💰 Revenue trung bình: {df['revenue'].mean():,.0f} VNĐ")
    print(f"🏠 Occupancy trung bình: {df['occupancy_rate'].mean()*100:.1f}%")
    
    return df

# ================================
# 4. CHIA TRAIN/TEST
# ================================
def split_data(df, test_size=0.2):
    """Chia dữ liệu train/test theo thời gian"""
    # Features
    feature_cols = [
        'month_index', 'month_of_year', 'quarter', 'occupancy_rate',
        'room_price', 'is_peak_season', 'is_low_season'
    ]
    
    X = df[feature_cols]
    y = df['revenue']
    
    # Chia theo thời gian (80% đầu = train, 20% cuối = test)
    split_idx = int(len(df) * (1 - test_size))
    
    X_train = X.iloc[:split_idx]
    X_test = X.iloc[split_idx:]
    y_train = y.iloc[:split_idx]
    y_test = y.iloc[split_idx:]
    
    print(f"\n📚 Train size: {len(X_train)} ({len(X_train)/len(df)*100:.1f}%)")
    print(f"🧪 Test size: {len(X_test)} ({len(X_test)/len(df)*100:.1f}%)")
    
    return X_train, X_test, y_train, y_test, feature_cols

# ================================
# 5. HUẤN LUYỆN MÔ HÌNH
# ================================
def train_model(X_train, y_train):
    """Huấn luyện mô hình Random Forest"""
    print("\n🤖 Đang huấn luyện mô hình Random Forest...")
    
    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    print("✅ Huấn luyện hoàn tất!")
    
    return model

# ================================
# 6. ĐÁNH GIÁ MÔ HÌNH
# ================================
def evaluate_model(model, X_train, X_test, y_train, y_test, feature_cols):
    """Đánh giá mô hình với nhiều metrics"""
    print("\n" + "="*60)
    print("📊 ĐÁNH GIÁ MÔ HÌNH")
    print("="*60)
    
    # Dự đoán
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    
    # === METRICS CHO TẬP TRAIN ===
    print("\n🎯 TRAIN SET:")
    train_r2 = r2_score(y_train, y_train_pred)
    train_mae = mean_absolute_error(y_train, y_train_pred)
    train_rmse = np.sqrt(mean_squared_error(y_train, y_train_pred))
    
    # Xử lý MAPE đúng cách: Chỉ tính với records có revenue > 0
    mask_train = y_train > 0
    if mask_train.sum() > 0:
        train_mape = np.mean(np.abs((y_train[mask_train] - y_train_pred[mask_train]) / y_train[mask_train])) * 100
    else:
        train_mape = 0.0
    
    print(f"  R² Score:  {train_r2:.4f} ({train_r2*100:.2f}%)")
    print(f"  MAE:       {train_mae:,.0f} VNĐ")
    print(f"  RMSE:      {train_rmse:,.0f} VNĐ")
    print(f"  MAPE:      {train_mape:.2f}% (chỉ tính trên {mask_train.sum()}/{len(y_train)} records có revenue > 0)")
    
    # === METRICS CHO TẬP TEST ===
    print("\n🧪 TEST SET:")
    test_r2 = r2_score(y_test, y_test_pred)
    test_mae = mean_absolute_error(y_test, y_test_pred)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))
    
    # Xử lý MAPE đúng cách: Chỉ tính với records có revenue > 0
    mask_test = y_test > 0
    if mask_test.sum() > 0:
        test_mape = np.mean(np.abs((y_test[mask_test] - y_test_pred[mask_test]) / y_test[mask_test])) * 100
    else:
        test_mape = 0.0
    
    print(f"  R² Score:  {test_r2:.4f} ({test_r2*100:.2f}%)")
    print(f"  MAE:       {test_mae:,.0f} VNĐ")
    print(f"  RMSE:      {test_rmse:,.0f} VNĐ")
    print(f"  MAPE:      {test_mape:.2f}% (chỉ tính trên {mask_test.sum()}/{len(y_test)} records có revenue > 0)")
    
    # === CROSS VALIDATION ===
    print("\n🔄 CROSS VALIDATION (5-fold):")
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, 
                                 scoring='r2', n_jobs=-1)
    print(f"  CV R² Scores: {cv_scores}")
    print(f"  CV R² Mean:   {cv_scores.mean():.4f} (±{cv_scores.std():.4f})")
    
    # === FEATURE IMPORTANCE ===
    print("\n🎯 FEATURE IMPORTANCE:")
    feature_importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    for idx, row in feature_importance.iterrows():
        print(f"  {row['feature']:20s}: {row['importance']*100:6.2f}%")
    
    # === ĐÁNH GIÁ OVERFITTING ===
    print("\n⚠️ KIỂM TRA OVERFITTING:")
    diff = train_r2 - test_r2
    if diff > 0.1:
        print(f"  ❌ Có dấu hiệu overfitting (Train R² - Test R² = {diff:.4f})")
    elif diff > 0.05:
        print(f"  ⚠️ Overfitting nhẹ (Train R² - Test R² = {diff:.4f})")
    else:
        print(f"  ✅ Không overfitting (Train R² - Test R² = {diff:.4f})")
    
    return {
        'train_r2': train_r2, 'train_mae': train_mae, 'train_rmse': train_rmse,
        'test_r2': test_r2, 'test_mae': test_mae, 'test_rmse': test_rmse,
        'y_train_pred': y_train_pred, 'y_test_pred': y_test_pred,
        'feature_importance': feature_importance
    }

# ================================
# 7. MA TRẬN NHẦM LẪN (CHO PHÂN LOẠI)
# ================================
def plot_confusion_matrix_classification(y_test, y_test_pred):
    """
    Vẽ ma trận nhầm lẫn cho bài toán phân loại
    Chuyển regression thành classification: Low/Medium/High revenue
    """
    print("\n" + "="*60)
    print("📊 MA TRẬN NHẦM LẪN (CLASSIFICATION)")
    print("="*60)
    
    # Chuyển đổi revenue thành 3 classes với ngưỡng động
    revenue_values = pd.concat([y_test, pd.Series(y_test_pred)])
    q33 = revenue_values.quantile(0.33)
    q66 = revenue_values.quantile(0.66)
    
    print(f"\n📏 Ngưỡng phân loại:")
    print(f"  Low:    Revenue < {q33:,.0f} VNĐ")
    print(f"  Medium: {q33:,.0f} - {q66:,.0f} VNĐ")
    print(f"  High:   Revenue > {q66:,.0f} VNĐ")
    
    def categorize_revenue(revenue):
        if revenue < q33:
            return 'Low'
        elif revenue < q66:
            return 'Medium'
        else:
            return 'High'
    
    y_test_cat = y_test.apply(categorize_revenue)
    y_pred_cat = pd.Series(y_test_pred).apply(categorize_revenue)
    
    # Kiểm tra số lượng classes
    unique_actual = y_test_cat.unique()
    unique_pred = y_pred_cat.unique()
    
    print(f"\n📊 Phân bố classes trong Test Set:")
    print(f"  Actual: {dict(y_test_cat.value_counts())}")
    print(f"  Predicted: {dict(y_pred_cat.value_counts())}")
    
    if len(unique_actual) < 2:
        print(f"\n⚠️ CẢNH BÁO: Test set chỉ có {len(unique_actual)} class!")
        print(f"  → Ma trận nhầm lẫn không có ý nghĩa thống kê")
        print(f"  💡 Khuyến nghị: Tăng số lượng dữ liệu hoặc điều chỉnh cách chia train/test")
    
    # Tạo confusion matrix với tất cả 3 classes
    all_labels = ['Low', 'Medium', 'High']
    cm = confusion_matrix(y_test_cat, y_pred_cat, labels=all_labels)
    
    # Vẽ heatmap
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=all_labels,
                yticklabels=all_labels,
                cbar_kws={'label': 'Số lượng'})
    plt.title('Ma Trận Nhầm Lẫn - Phân Loại Doanh Thu', fontsize=16, fontweight='bold')
    plt.ylabel('Actual', fontsize=12)
    plt.xlabel('Predicted', fontsize=12)
    
    # Thêm text box với thông tin
    textstr = f'Total: {len(y_test)} samples\n'
    textstr += f'Classes: {len(unique_actual)} actual, {len(unique_pred)} predicted'
    props = dict(boxstyle='round', facecolor='wheat', alpha=0.5)
    plt.text(0.02, 0.98, textstr, transform=plt.gca().transAxes, fontsize=10,
             verticalalignment='top', bbox=props)
    
    plt.tight_layout()
    plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
    print("\n✅ Đã lưu: confusion_matrix.png")
    
    # Classification report (chỉ với classes có trong data)
    if len(unique_actual) >= 2:
        print("\n📋 CLASSIFICATION REPORT:")
        print(classification_report(y_test_cat, y_pred_cat, zero_division=0))
    else:
        print("\n⚠️ Bỏ qua Classification Report (chỉ có 1 class)")
    
    plt.show()

# ================================
# 8. VẼ BIỂU ĐỒ SO SÁNH
# ================================
def plot_predictions(y_train, y_train_pred, y_test, y_test_pred, metrics):
    """Vẽ biểu đồ so sánh predicted vs actual"""
    
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    
    # === 1. TRAIN: Predicted vs Actual ===
    axes[0, 0].scatter(y_train, y_train_pred, alpha=0.5, s=30)
    axes[0, 0].plot([y_train.min(), y_train.max()], 
                    [y_train.min(), y_train.max()], 
                    'r--', lw=2, label='Perfect Prediction')
    axes[0, 0].set_xlabel('Actual Revenue (VNĐ)', fontsize=11)
    axes[0, 0].set_ylabel('Predicted Revenue (VNĐ)', fontsize=11)
    axes[0, 0].set_title(f'Train Set: R²={metrics["train_r2"]:.4f}, MAE={metrics["train_mae"]:,.0f}', 
                         fontsize=12, fontweight='bold')
    axes[0, 0].legend()
    axes[0, 0].grid(True, alpha=0.3)
    
    # === 2. TEST: Predicted vs Actual ===
    axes[0, 1].scatter(y_test, y_test_pred, alpha=0.5, s=30, color='orange')
    axes[0, 1].plot([y_test.min(), y_test.max()], 
                    [y_test.min(), y_test.max()], 
                    'r--', lw=2, label='Perfect Prediction')
    axes[0, 1].set_xlabel('Actual Revenue (VNĐ)', fontsize=11)
    axes[0, 1].set_ylabel('Predicted Revenue (VNĐ)', fontsize=11)
    axes[0, 1].set_title(f'Test Set: R²={metrics["test_r2"]:.4f}, MAE={metrics["test_mae"]:,.0f}', 
                         fontsize=12, fontweight='bold')
    axes[0, 1].legend()
    axes[0, 1].grid(True, alpha=0.3)
    
    # === 3. RESIDUALS (Train) ===
    residuals_train = y_train - y_train_pred
    axes[1, 0].scatter(y_train_pred, residuals_train, alpha=0.5, s=30)
    axes[1, 0].axhline(y=0, color='r', linestyle='--', lw=2)
    axes[1, 0].set_xlabel('Predicted Revenue (VNĐ)', fontsize=11)
    axes[1, 0].set_ylabel('Residuals (VNĐ)', fontsize=11)
    axes[1, 0].set_title('Train Set: Residual Plot', fontsize=12, fontweight='bold')
    axes[1, 0].grid(True, alpha=0.3)
    
    # === 4. FEATURE IMPORTANCE ===
    feature_imp = metrics['feature_importance'].head(7)
    axes[1, 1].barh(feature_imp['feature'], feature_imp['importance'])
    axes[1, 1].set_xlabel('Importance', fontsize=11)
    axes[1, 1].set_title('Top 7 Feature Importance', fontsize=12, fontweight='bold')
    axes[1, 1].grid(True, alpha=0.3, axis='x')
    
    plt.tight_layout()
    plt.savefig('model_evaluation.png', dpi=300, bbox_inches='tight')
    print("\n✅ Đã lưu: model_evaluation.png")
    plt.show()

# ================================
# 9. VẼ TIME SERIES COMPARISON
# ================================
def plot_time_series(df, y_test, y_test_pred, test_size=0.2):
    """Vẽ biểu đồ time series so sánh actual vs predicted"""
    
    split_idx = int(len(df) * (1 - test_size))
    test_dates = df['created_at'].iloc[split_idx:].values
    
    plt.figure(figsize=(16, 6))
    plt.plot(test_dates, y_test.values, 'o-', label='Actual Revenue', 
             linewidth=2, markersize=6)
    plt.plot(test_dates, y_test_pred, 's--', label='Predicted Revenue', 
             linewidth=2, markersize=6, alpha=0.7)
    plt.xlabel('Date', fontsize=12)
    plt.ylabel('Revenue (VNĐ)', fontsize=12)
    plt.title('Time Series: Actual vs Predicted Revenue (Test Set)', 
              fontsize=14, fontweight='bold')
    plt.legend(fontsize=11)
    plt.grid(True, alpha=0.3)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig('time_series_comparison.png', dpi=300, bbox_inches='tight')
    print("✅ Đã lưu: time_series_comparison.png")
    plt.show()

# ================================
# 10. MAIN FUNCTION
# ================================
def main():
    """Hàm chính"""
    print("="*60)
    print("🚀 BẮT ĐẦU KIỂM TRA MÔ HÌNH HỌC MÁY")
    print("="*60)
    
    # 1. Kết nối SQL
    conn = connect_to_sql()
    if conn is None:
        print("❌ Không thể kết nối SQL Server. Thoát chương trình.")
        return
    
    # 2. Đọc dữ liệu
    df = load_data_from_sql(conn, house_id=14)
    conn.close()
    
    if len(df) < 10:
        print("❌ Dữ liệu không đủ để huấn luyện (cần tối thiểu 10 records)")
        return
    
    # 3. Tiền xử lý
    df = preprocess_data(df)
    
    # 4. Chia train/test
    X_train, X_test, y_train, y_test, feature_cols = split_data(df, test_size=0.2)
    
    # 5. Huấn luyện
    model = train_model(X_train, y_train)
    
    # 6. Đánh giá
    metrics = evaluate_model(model, X_train, X_test, y_train, y_test, feature_cols)
    
    # 7. Vẽ biểu đồ
    plot_predictions(y_train, metrics['y_train_pred'], 
                     y_test, metrics['y_test_pred'], metrics)
    
    # 8. Ma trận nhầm lẫn
    plot_confusion_matrix_classification(y_test, metrics['y_test_pred'])
    
    # 9. Time series
    plot_time_series(df, y_test, metrics['y_test_pred'])
    
    print("\n" + "="*60)
    print("✅ HOÀN TẤT KIỂM TRA MÔ HÌNH!")
    print("="*60)
    print("\n📁 Các file đã tạo:")
    print("  - model_evaluation.png")
    print("  - confusion_matrix.png")
    print("  - time_series_comparison.png")

if __name__ == "__main__":
    main()
