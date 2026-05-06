"""
Script phân tích chất lượng dữ liệu
Kiểm tra các vấn đề tiềm ẩn trong dataset
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pyodbc

def connect_to_sql():
    """Kết nối đến SQL Server"""
    try:
        conn = pyodbc.connect(
            'DRIVER={SQL Server};'
            'SERVER=NGOCHA;'
            'DATABASE=BSM_Management;'
            'UID=bsm_user;'
            'PWD=123456;'
            'TrustServerCertificate=yes;'
        )
        return conn
    except Exception as e:
        print(f"❌ Lỗi kết nối: {e}")
        return None

def analyze_data_quality(house_id=14):
    """Phân tích chất lượng dữ liệu"""
    
    print("="*70)
    print("🔍 PHÂN TÍCH CHẤT LƯỢNG DỮ LIỆU")
    print("="*70)
    
    # Kết nối
    conn = connect_to_sql()
    if not conn:
        return
    
    # Đọc dữ liệu
    query = f"""
    SELECT 
        i.id,
        i.room_id,
        i.[month],
        i.month_num,
        i.quarter,
        i.occupancy_rate,
        i.room_price,
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
    conn.close()
    
    print(f"\n📊 TỔNG QUAN DỮ LIỆU")
    print(f"  Tổng số records: {len(df)}")
    print(f"  Khoảng thời gian: {df['created_at'].min()} → {df['created_at'].max()}")
    print(f"  Số phòng: {df['room_id'].nunique()}")
    
    # === 1. KIỂM TRA GIÁ TRỊ NULL ===
    print(f"\n{'='*70}")
    print("1️⃣ KIỂM TRA GIÁ TRỊ NULL")
    print(f"{'='*70}")
    null_counts = df.isnull().sum()
    if null_counts.sum() == 0:
        print("  ✅ Không có giá trị NULL")
    else:
        print("  ❌ Có giá trị NULL:")
        for col, count in null_counts[null_counts > 0].items():
            print(f"    - {col}: {count} ({count/len(df)*100:.1f}%)")
    
    # === 2. KIỂM TRA GIÁ TRỊ 0 (PHÒNG TRỐNG) ===
    print(f"\n{'='*70}")
    print("2️⃣ KIỂM TRA PHÒNG TRỐNG (Revenue = 0)")
    print(f"{'='*70}")
    zero_revenue = df[df['revenue'] == 0]
    zero_occupancy = df[df['occupancy_rate'] == 0]
    
    print(f"  Revenue = 0: {len(zero_revenue)} records ({len(zero_revenue)/len(df)*100:.1f}%)")
    print(f"  Occupancy = 0: {len(zero_occupancy)} records ({len(zero_occupancy)/len(df)*100:.1f}%)")
    
    if len(zero_revenue) > 0:
        print(f"\n  ⚠️ CẢNH BÁO: Có {len(zero_revenue)} records với revenue = 0")
        print(f"  → Gây ra lỗi MAPE = inf khi tính metrics")
        print(f"  💡 Giải pháp:")
        print(f"    1. Loại bỏ records này khi tính MAPE")
        print(f"    2. Hoặc thay thế 0 bằng giá trị nhỏ (1 VNĐ)")
    
    # === 3. PHÂN BỐ REVENUE ===
    print(f"\n{'='*70}")
    print("3️⃣ PHÂN BỐ REVENUE")
    print(f"{'='*70}")
    
    revenue_stats = df['revenue'].describe()
    print(f"  Mean:   {revenue_stats['mean']:,.0f} VNĐ")
    print(f"  Median: {df['revenue'].median():,.0f} VNĐ")
    print(f"  Std:    {revenue_stats['std']:,.0f} VNĐ")
    print(f"  Min:    {revenue_stats['min']:,.0f} VNĐ")
    print(f"  Max:    {revenue_stats['max']:,.0f} VNĐ")
    
    # Kiểm tra skewness
    skewness = df['revenue'].skew()
    print(f"\n  Skewness: {skewness:.2f}")
    if abs(skewness) > 1:
        print(f"  ⚠️ Dữ liệu lệch {'phải' if skewness > 0 else 'trái'} mạnh")
        print(f"  💡 Khuyến nghị: Cân nhắc log transform")
    else:
        print(f"  ✅ Phân bố tương đối cân đối")
    
    # === 4. PHÂN BỐ CLASSES (LOW/MEDIUM/HIGH) ===
    print(f"\n{'='*70}")
    print("4️⃣ PHÂN BỐ CLASSES")
    print(f"{'='*70}")
    
    q33 = df['revenue'].quantile(0.33)
    q66 = df['revenue'].quantile(0.66)
    
    def categorize(rev):
        if rev < q33:
            return 'Low'
        elif rev < q66:
            return 'Medium'
        else:
            return 'High'
    
    df['class'] = df['revenue'].apply(categorize)
    class_dist = df['class'].value_counts()
    
    print(f"  Ngưỡng:")
    print(f"    Low:    < {q33:,.0f} VNĐ")
    print(f"    Medium: {q33:,.0f} - {q66:,.0f} VNĐ")
    print(f"    High:   > {q66:,.0f} VNĐ")
    
    print(f"\n  Phân bố:")
    for cls, count in class_dist.items():
        print(f"    {cls:8s}: {count:3d} records ({count/len(df)*100:5.1f}%)")
    
    # Kiểm tra imbalance
    max_ratio = class_dist.max() / class_dist.min()
    if max_ratio > 3:
        print(f"\n  ⚠️ CẢNH BÁO: Dữ liệu mất cân bằng (tỷ lệ {max_ratio:.1f}:1)")
        print(f"  💡 Khuyến nghị: Sử dụng stratified split hoặc SMOTE")
    else:
        print(f"\n  ✅ Dữ liệu cân bằng tốt (tỷ lệ {max_ratio:.1f}:1)")
    
    # === 5. OUTLIERS ===
    print(f"\n{'='*70}")
    print("5️⃣ KIỂM TRA OUTLIERS")
    print(f"{'='*70}")
    
    Q1 = df['revenue'].quantile(0.25)
    Q3 = df['revenue'].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    outliers = df[(df['revenue'] < lower_bound) | (df['revenue'] > upper_bound)]
    
    print(f"  IQR Method:")
    print(f"    Lower bound: {lower_bound:,.0f} VNĐ")
    print(f"    Upper bound: {upper_bound:,.0f} VNĐ")
    print(f"    Outliers: {len(outliers)} records ({len(outliers)/len(df)*100:.1f}%)")
    
    if len(outliers) > 0:
        print(f"\n  ⚠️ Có {len(outliers)} outliers")
        print(f"  💡 Khuyến nghị: Kiểm tra xem có phải lỗi dữ liệu không")
    else:
        print(f"  ✅ Không có outliers đáng kể")
    
    # === 6. CORRELATION ===
    print(f"\n{'='*70}")
    print("6️⃣ CORRELATION ANALYSIS")
    print(f"{'='*70}")
    
    corr_features = ['occupancy_rate', 'room_price', 'month_num', 'quarter', 'revenue']
    corr_matrix = df[corr_features].corr()
    
    print(f"\n  Correlation với Revenue:")
    revenue_corr = corr_matrix['revenue'].sort_values(ascending=False)
    for feature, corr in revenue_corr.items():
        if feature != 'revenue':
            emoji = "🔥" if abs(corr) > 0.7 else "✅" if abs(corr) > 0.3 else "⚠️"
            print(f"    {emoji} {feature:20s}: {corr:6.3f}")
    
    # === 7. VẼ BIỂU ĐỒ ===
    print(f"\n{'='*70}")
    print("7️⃣ TẠO BIỂU ĐỒ PHÂN TÍCH")
    print(f"{'='*70}")
    
    fig, axes = plt.subplots(2, 3, figsize=(18, 10))
    
    # 1. Revenue Distribution
    axes[0, 0].hist(df['revenue'], bins=30, edgecolor='black', alpha=0.7)
    axes[0, 0].axvline(df['revenue'].mean(), color='red', linestyle='--', label='Mean')
    axes[0, 0].axvline(df['revenue'].median(), color='green', linestyle='--', label='Median')
    axes[0, 0].set_xlabel('Revenue (VNĐ)')
    axes[0, 0].set_ylabel('Frequency')
    axes[0, 0].set_title('Revenue Distribution')
    axes[0, 0].legend()
    axes[0, 0].grid(True, alpha=0.3)
    
    # 2. Class Distribution
    class_dist.plot(kind='bar', ax=axes[0, 1], color=['#ff9999', '#66b3ff', '#99ff99'])
    axes[0, 1].set_xlabel('Class')
    axes[0, 1].set_ylabel('Count')
    axes[0, 1].set_title('Class Distribution')
    axes[0, 1].tick_params(axis='x', rotation=0)
    axes[0, 1].grid(True, alpha=0.3, axis='y')
    
    # 3. Boxplot
    axes[0, 2].boxplot(df['revenue'], vert=True)
    axes[0, 2].set_ylabel('Revenue (VNĐ)')
    axes[0, 2].set_title('Revenue Boxplot (Outliers)')
    axes[0, 2].grid(True, alpha=0.3, axis='y')
    
    # 4. Occupancy vs Revenue
    axes[1, 0].scatter(df['occupancy_rate'], df['revenue'], alpha=0.5)
    axes[1, 0].set_xlabel('Occupancy Rate')
    axes[1, 0].set_ylabel('Revenue (VNĐ)')
    axes[1, 0].set_title('Occupancy vs Revenue')
    axes[1, 0].grid(True, alpha=0.3)
    
    # 5. Room Price vs Revenue
    axes[1, 1].scatter(df['room_price'], df['revenue'], alpha=0.5, color='orange')
    axes[1, 1].set_xlabel('Room Price (VNĐ)')
    axes[1, 1].set_ylabel('Revenue (VNĐ)')
    axes[1, 1].set_title('Room Price vs Revenue')
    axes[1, 1].grid(True, alpha=0.3)
    
    # 6. Correlation Heatmap
    sns.heatmap(corr_matrix, annot=True, fmt='.2f', cmap='coolwarm', 
                center=0, ax=axes[1, 2], cbar_kws={'label': 'Correlation'})
    axes[1, 2].set_title('Correlation Matrix')
    
    plt.tight_layout()
    plt.savefig('data_quality_analysis.png', dpi=300, bbox_inches='tight')
    print("  ✅ Đã lưu: data_quality_analysis.png")
    plt.show()
    
    # === 8. KẾT LUẬN ===
    print(f"\n{'='*70}")
    print("📋 KẾT LUẬN & KHUYẾN NGHỊ")
    print(f"{'='*70}")
    
    issues = []
    if len(zero_revenue) > len(df) * 0.1:
        issues.append(f"❌ Có {len(zero_revenue)/len(df)*100:.1f}% records với revenue = 0")
    
    if abs(skewness) > 1:
        issues.append(f"⚠️ Dữ liệu lệch mạnh (skewness = {skewness:.2f})")
    
    if max_ratio > 3:
        issues.append(f"⚠️ Classes mất cân bằng (tỷ lệ {max_ratio:.1f}:1)")
    
    if len(df) < 200:
        issues.append(f"⚠️ Dữ liệu ít ({len(df)} records, khuyến nghị > 200)")
    
    if len(outliers) > len(df) * 0.05:
        issues.append(f"⚠️ Có {len(outliers)/len(df)*100:.1f}% outliers")
    
    if issues:
        print("\n  Các vấn đề cần xử lý:")
        for i, issue in enumerate(issues, 1):
            print(f"    {i}. {issue}")
    else:
        print("\n  ✅ Dữ liệu có chất lượng tốt!")
    
    print(f"\n{'='*70}")
    print("✅ HOÀN TẤT PHÂN TÍCH!")
    print(f"{'='*70}")

if __name__ == "__main__":
    analyze_data_quality(house_id=14)
