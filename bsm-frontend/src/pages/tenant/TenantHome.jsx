import { useEffect, useState } from "react";
import { getTenantDashboard } from "../../api/tenantDashboard.api";

export default function TenantHome() {
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

  if (!data || !data.profile) {
    return (
      <div className="text-center text-slate-500 py-16">
        Bạn chưa được gán phòng.
      </div>
    );
  }

  const invoice = data.latest_invoice;

  return (
    <div className="space-y-8">

      {/* ===== HEADER ===== */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Dashboard
        </h1>
        <p className="text-slate-500 text-sm">
          Tổng quan phòng trọ của bạn
        </p>
      </div>

      {/* ===== OVERVIEW CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* TOTAL */}
        <Card
          title="Tổng tiền tháng này"
          value={invoice ? formatMoney(invoice.total_amount) : "—"}
          color="text-indigo-600"
        />

        {/* ELECTRIC */}
        <Card
          title="Tiền điện"
          value={
            invoice
              ? formatMoney(invoice.electric_cost)
              : "—"
          }
          color="text-orange-500"
        />

        {/* WATER */}
        <Card
          title="Tiền nước"
          value={
            invoice
              ? formatMoney(invoice.water_cost)
              : "—"
          }
          color="text-blue-500"
        />

        {/* STATUS */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <p className="text-slate-500 text-sm">Trạng thái thanh toán</p>
          {invoice ? (
            <span
              className={`inline-block mt-3 px-4 py-1 text-sm rounded-full font-semibold ${
                invoice.status === "PAID"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {invoice.status}
            </span>
          ) : (
            <p className="mt-3 text-slate-400">Chưa có hóa đơn</p>
          )}
        </div>

      </div>

      {/* ===== DETAIL GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LATEST INVOICE */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold text-slate-700 mb-4">
            Hóa đơn gần nhất
          </h3>

          {invoice ? (
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium">Tháng:</span>{" "}
                {invoice.month}
              </p>
              <p>
                <span className="font-medium">Tiền phòng:</span>{" "}
                {formatMoney(invoice.room_price)}
              </p>
              <p>
                <span className="font-medium">Điện sử dụng:</span>{" "}
                {invoice.electric_used} kWh
              </p>
              <p>
                <span className="font-medium">Nước sử dụng:</span>{" "}
                {invoice.water_used} m³
              </p>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">
              Chưa có dữ liệu hóa đơn
            </p>
          )}
        </div>

        {/* NOTIFICATIONS */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold text-slate-700 mb-4">
            Thông báo
          </h3>

          {data.notifications.length === 0 ? (
            <p className="text-slate-400 text-sm">
              Không có thông báo
            </p>
          ) : (
            <div className="space-y-3">
              {data.notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-xl bg-slate-50 border text-sm"
                >
                  <p className="font-semibold text-slate-700">
                    {n.title}
                  </p>
                  <p className="text-slate-500 mt-1">
                    {n.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ===== CARD COMPONENT ===== */
function Card({ title, value, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <p className="text-slate-500 text-sm">{title}</p>
      <h2 className={`text-xl font-bold mt-3 ${color}`}>
        {value}
      </h2>
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