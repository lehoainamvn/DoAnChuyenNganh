import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInvoiceById, markInvoicePaid } from "../../api/invoice.api";
import toast from "react-hot-toast";

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const data = await getInvoiceById(id);
        setInvoice(data);
      } catch (err) {
        setError(err.message || "Không tải được hóa đơn");
        toast.error(err.message || "Không tải được hóa đơn");
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [id]);

  async function handleMarkPaid() {
    if (!invoice) return;
    if (!window.confirm("Xác nhận đã thu tiền hóa đơn này?")) return;

    try {
      await markInvoicePaid(invoice.id);
      setInvoice({
        ...invoice,
        status: "PAID",
        paid_at: new Date().toISOString()
      });
      toast.success("Đã cập nhật trạng thái hóa đơn thành công");
    } catch (err) {
      toast.error(err.message || "Cập nhật thất bại");
    }
  }

  const money = (n) => n.toLocaleString("vi-VN") + " đ";

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]
                      bg-gradient-to-br from-indigo-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12
                        border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="flex justify-center items-center h-[70vh]
                      bg-gradient-to-br from-indigo-50 to-pink-50">
        <div className="bg-red-50 border border-red-200
                        text-red-600 px-6 py-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  /* ================= MAIN ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* ===== BACK ===== */}
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 font-semibold hover:underline"
        >
          ← Quay lại danh sách hóa đơn
        </button>

        {/* ===== HEADER ===== */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">
              🧾 Hóa đơn tháng {invoice.month}
            </h1>
            <p className="text-slate-500 text-sm">
              Thông tin chi tiết & tình trạng thu tiền
            </p>
          </div>

          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold
              ${
                invoice.status === "PAID"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-rose-100 text-rose-600"
              }`}
          >
            {invoice.status === "PAID"
              ? "Đã thu tiền"
              : "Chưa thu tiền"}
          </span>
        </div>

        {/* ===== INFO ===== */}
        <div className="grid md:grid-cols-3 gap-6">
          <InfoCard label="Phòng" value={invoice.room_name} icon="🏠" />
          <InfoCard label="Người thuê" value={invoice.tenant_name} icon="👤" />
          <InfoCard
            label="Ngày tạo"
            value={new Date(invoice.created_at).toLocaleDateString()}
            icon="📅"
          />
        </div>

        {/* ===== COST ===== */}
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-md p-8">
          <h2 className="font-bold text-slate-700 mb-6">
            Chi tiết chi phí
          </h2>

          <div className="space-y-4">
            <CostRow label="Tiền phòng" value={money(invoice.room_price)} />
            <CostRow label="Tiền điện" value={money(invoice.electric_cost)} />
            <CostRow label="Tiền nước" value={money(invoice.water_cost)} />
          </div>
        </div>

        {/* ===== TOTAL ===== */}
        <div
          className="bg-indigo-600 text-white rounded-3xl p-8 shadow-lg
                     flex flex-col md:flex-row md:items-center
                     md:justify-between gap-6"
        >
          <div>
            <p className="text-sm opacity-80">Tổng tiền cần thu</p>
            <p className="text-3xl font-extrabold mt-1">
              {money(invoice.total_amount)}
            </p>
          </div>

          {invoice.status === "UNPAID" && (
            <button
              onClick={handleMarkPaid}
              className="bg-emerald-500 hover:bg-emerald-600
                         px-8 py-3 rounded-full font-semibold
                         shadow transition active:scale-95"
            >
              ✔ Xác nhận đã thu tiền
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */
function InfoCard({ label, value, icon }) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-3xl
                    shadow-md p-6">
      <p className="text-slate-500 text-sm mb-1">{label}</p>
      <p className="text-lg font-bold text-slate-800">
        {icon} {value}
      </p>
    </div>
  );
}

function CostRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}
