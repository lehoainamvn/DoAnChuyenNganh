import { useEffect, useState } from "react";
import { getTenantInvoices } from "../../api/tenantInvoice.api";
import { useNavigate } from "react-router-dom";

export default function TenantInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      const data = await getTenantInvoices();
      setInvoices(data);
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

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Hóa đơn của tôi
        </h1>
        <p className="text-slate-500 text-sm">
          Danh sách hóa đơn theo từng tháng
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {invoices.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            Chưa có hóa đơn
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr className="text-left text-slate-500">
                <th className="px-6 py-4">Tháng</th>
                <th className="px-6 py-4">Tổng tiền</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-center">Chi tiết</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b hover:bg-slate-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {invoice.month}
                  </td>

                  <td className="px-6 py-4 text-indigo-600 font-semibold">
                    {formatMoney(invoice.total_amount)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        invoice.status === "PAID"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {formatDate(invoice.created_at)}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() =>
                        navigate(`/tenant/invoices/${invoice.id}`)
                      }
                      className="text-indigo-600 hover:underline font-medium"
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

/* FORMAT MONEY */
function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
}

/* FORMAT DATE */
function formatDate(date) {
  return new Date(date).toLocaleDateString("vi-VN");
}