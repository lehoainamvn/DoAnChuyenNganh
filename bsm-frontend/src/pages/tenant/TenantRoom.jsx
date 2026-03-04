import { useEffect, useState } from "react";
import { getTenantDashboard } from "../../api/tenantDashboard.api";

export default function TenantRoom() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await getTenantDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!data || !data.room) {
    return (
      <div className="text-center text-slate-500 py-16">
        Bạn chưa được gán phòng.
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ===== PAGE HEADER ===== */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Phòng của tôi
        </h1>
        <p className="text-slate-500 text-sm">
          Thông tin chi tiết phòng trọ của bạn
        </p>
      </div>

      {/* ===== HOUSE INFO ===== */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="font-semibold text-slate-700 mb-4">
          🏢 Thông tin nhà trọ
        </h3>

        <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-600">
          <Info label="Tên nhà trọ" value={data.house.name} />
          <Info label="Địa chỉ" value={data.house.address} />
        </div>
      </div>

      {/* ===== ROOM INFO ===== */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="font-semibold text-slate-700 mb-4">
          🛏 Thông tin phòng
        </h3>

        <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-600">
          <Info label="Tên phòng" value={data.room.name} />
          <Info label="Giá phòng" value={formatMoney(data.room.price)} />
          <Info label="Số người" value={data.room.people_count} />
          <Info
            label="Trạng thái"
            value={
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  data.room.status === "OCCUPIED"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {data.room.status}
              </span>
            }
          />
        </div>
      </div>

      {/* ===== UTILITY CONFIG ===== */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="font-semibold text-slate-700 mb-4">
          ⚡ Cấu hình điện nước
        </h3>

        <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-600">

          <Info
            label="Giá điện"
            value={`${formatMoney(data.room.electric_price)} / kWh`}
          />

          {data.room.water_type === "METER" ? (
            <Info
              label="Giá nước (theo m³)"
              value={`${formatMoney(data.room.water_price)} / m³`}
            />
          ) : (
            <Info
              label="Giá nước (theo người)"
              value={`${formatMoney(data.room.water_price_per_person)} / người`}
            />
          )}

        </div>
      </div>

    </div>
  );
}

/* ===== COMPONENT INFO ===== */
function Info({ label, value }) {
  return (
    <div>
      <p className="text-slate-400 text-xs uppercase tracking-wide">
        {label}
      </p>
      <p className="font-medium text-slate-700 mt-1">
        {value}
      </p>
    </div>
  );
}

/* ===== FORMAT MONEY ===== */
function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
}