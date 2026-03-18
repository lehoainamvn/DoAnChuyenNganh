import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getInvoicesByMonth } from "../../api/invoice.api";
import { getHouses } from "../../api/house.api";
import { FileText, Send, Copy, X } from "lucide-react";

export default function Invoices() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  /* ================= FILTER STATE ================= */
  const [year, setYear] = useState(
    Number(localStorage.getItem("invoice_year")) || currentYear
  );

  const [month, setMonth] = useState(
    localStorage.getItem("invoice_month") ||
      String(new Date().getMonth() + 1).padStart(2, "0")
  );

  const [houseId, setHouseId] = useState(
    localStorage.getItem("invoice_house") || ""
  );

  const [statusFilter, setStatusFilter] = useState(
    localStorage.getItem("invoice_status") || "ALL"
  );

  /* ================= DATA ================= */
  const [houses, setHouses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [zaloInvoice, setZaloInvoice] = useState(null);

  /* ================= SAVE FILTER ================= */
  useEffect(() => {
    localStorage.setItem("invoice_year", year);
    localStorage.setItem("invoice_month", month);
    localStorage.setItem("invoice_house", houseId);
    localStorage.setItem("invoice_status", statusFilter);
  }, [year, month, houseId, statusFilter]);

  /* ================= LOAD HOUSES ================= */
  useEffect(() => {
    getHouses().then(setHouses);
  }, []);

  /* ================= FETCH ================= */
  async function handleFetch() {
    try {
      setLoading(true);
      setError("");

      const monthParam = `${year}-${month}`;

      const data = await getInvoicesByMonth(
        monthParam,
        houseId
      );

      setInvoices(data);
    } catch (err) {
      setError(err.message || "Không tải được hóa đơn");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleFetch();
  }, []);

  /* ================= STATUS FILTER ================= */
  useEffect(() => {
    if (statusFilter === "ALL") {
      setFilteredInvoices(invoices);
    } else {
      setFilteredInvoices(
        invoices.filter((i) => i.status === statusFilter)
      );
    }
  }, [invoices, statusFilter]);

  /* ================= ZALO ================= */
  function buildMessage(invoice) {
    return `🏠 HÓA ĐƠN THÁNG ${invoice.month}

Phòng: ${invoice.room_name}
Người thuê: ${invoice.tenant_name}

💰 Tổng tiền: ${invoice.total_amount.toLocaleString("vi-VN")} đ
📅 Ngày tạo: ${new Date(invoice.created_at).toLocaleDateString()}

Trạng thái: ${
      invoice.status === "PAID"
        ? "Đã thanh toán"
        : "Chưa thanh toán"
    }

Vui lòng thanh toán trước ngày 10.`;
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(
      buildMessage(zaloInvoice)
    );
    toast.success("Đã copy nội dung hóa đơn");
  }

  function handleOpenZalo() {
    if (!zaloInvoice.tenant_phone) {
      toast.error("Khách thuê chưa có số điện thoại");
      return;
    }
    window.open(
      `https://zalo.me/${zaloInvoice.tenant_phone}`,
      "_blank"
    );
  }

  /* ================= UI ================= */
  const months = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Quản lý hóa đơn
            </h1>
            <p className="text-sm text-slate-500">
              Xem và quản lý danh sách hóa đơn
            </p>
          </div>
        </div>

        {/* ================= FILTER BOX ================= */}
        <div className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition p-6 flex flex-wrap gap-4 items-center">

          {/* YEAR */}
          <select
            value={year}
            onChange={(e) => setYear(+e.target.value)}
            className="border px-4 py-2 rounded-xl bg-white"
          >
            {Array.from({ length: 6 }, (_, i) => currentYear - 3 + i)
              .map((y) => (
                <option key={y}>{y}</option>
              ))}
          </select>

          {/* MONTH */}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border px-4 py-2 rounded-xl bg-white"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>

          {/* HOUSE */}
          <select
            value={houseId}
            onChange={(e) => setHouseId(e.target.value)}
            className="border px-4 py-2 rounded-xl bg-white"
          >
            <option value="">Tất cả nhà</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          {/* STATUS */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-4 py-2 rounded-xl bg-white"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="UNPAID">Chưa thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
          </select>

          <button
            onClick={handleFetch}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-semibold transition"
          >
            Lọc
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl">
            {error}
          </div>
        )}

        {/* ================= TABLE ================= */}
        {!loading && filteredInvoices.length > 0 && (
          <div className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-4 text-left">Phòng</th>
                  <th className="p-4 text-left">Người thuê</th>
                  <th className="p-4 text-right">Tổng tiền</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-center">Ngày tạo</th>
                  <th className="p-4 text-center">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map((i) => (
                  <tr key={i.id} className="border-t hover:bg-slate-50">
                    <td className="p-4">{i.room_name}</td>
                    <td className="p-4">{i.tenant_name}</td>
                    <td className="p-4 text-right font-semibold">
                      {i.total_amount.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          i.status === "PAID"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {i.status === "PAID"
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {new Date(i.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() =>
                          navigate(`/invoices/${i.id}`)
                        }
                        className="text-indigo-600 hover:text-indigo-700 font-semibold transition"
                      >
                        Chi tiết
                      </button>

                      <button
                        onClick={() => setZaloInvoice(i)}
                        className="bg-blue-500 hover:bg-blue-600 text-white
                                   px-3 py-1 rounded-lg text-xs font-semibold transition"
                      >
                        Gửi Zalo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredInvoices.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <FileText size={48} className="mx-auto mb-4 text-slate-300" />
            <p>Không có hóa đơn</p>
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {zaloInvoice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-sm hover:shadow-md transition space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Send size={20} />
              Nội dung gửi Zalo
            </h2>

            <textarea
              readOnly
              value={buildMessage(zaloInvoice)}
              className="w-full h-52 border rounded-xl p-3 text-sm"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setZaloInvoice(null)}
                className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-slate-50 transition"
              >
                <X size={16} />
                Đóng
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition"
              >
                <Copy size={16} />
                Copy
              </button>

              <button
                onClick={handleOpenZalo}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
              >
                <Send size={16} />
                Mở Zalo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}