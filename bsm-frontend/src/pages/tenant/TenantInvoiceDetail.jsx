import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api/tenants";

export default function TenantInvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    loadDetail();
  }, []);

  async function loadDetail() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/invoices/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setInvoice(data);
  }

  if (!invoice) return <div>Loading...</div>;

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Chi tiết hóa đơn</h1>

      <div className="bg-white rounded-2xl shadow border p-6 space-y-3">

        <Row label="Tháng" value={invoice.month} />
        <Row label="Phòng" value={invoice.room_name} />

        <Row
          label="Tiền phòng"
          value={formatMoney(invoice.room_price)}
        />

        <Row
          label="Điện sử dụng"
          value={`${invoice.electric_used} kWh`}
        />

        <Row
          label="Tiền điện"
          value={`${invoice.electric_used} × ${formatMoney(
            invoice.electric_cost / invoice.electric_used
          )} = ${formatMoney(invoice.electric_cost)}`}
        />

        <Row
          label="Nước sử dụng"
          value={`${invoice.water_used} m³`}
        />

        <Row
          label="Tiền nước"
          value={`${invoice.water_used} × ${formatMoney(
            invoice.water_cost / invoice.water_used
          )} = ${formatMoney(invoice.water_cost)}`}
        />

        <div className="border-t pt-4">
          <Row
            label="Tổng tiền"
            value={formatMoney(invoice.total_amount)}
            highlight
          />
        </div>

      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span
        className={`font-medium ${
          highlight ? "text-indigo-600 text-lg" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
}