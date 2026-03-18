import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Zap, Droplet, Home, Wrench, Save, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function RoomBill() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const room = state?.room;

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition p-10 text-center">
          <p className="mb-6 text-slate-600">Không có dữ liệu phòng</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-500 text-white rounded-xl font-semibold"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  /* ===== TIME ===== */
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const monthStr = `${year}-${String(month).padStart(2, "0")}`;

  /* ===== STATE ===== */
  const [oldElectric, setOldElectric] = useState(0);
  const [newElectric, setNewElectric] = useState(0);

  const [oldWater, setOldWater] = useState(0);
  const [newWater, setNewWater] = useState(0);

  const [waterType, setWaterType] = useState(room.water_type || "METER");
  const [peopleCount, setPeopleCount] = useState(room.people_count || 1);
  const [serviceFee, setServiceFee] = useState(0);

  const [saving, setSaving] = useState(false);

  /* ===== CALC ===== */
  const electricUsed = Math.max(newElectric - oldElectric, 0);
  const electricCost = electricUsed * room.electric_price;

  const waterUsed =
    waterType === "METER"
      ? Math.max(newWater - oldWater, 0)
      : 0;

  const waterCost =
    waterType === "PERSON"
      ? peopleCount * (room.water_price_per_person || 0)
      : waterUsed * room.water_price;

  const total =
    room.room_price +
    electricCost +
    waterCost +
    Number(serviceFee);

  const money = (n) => n.toLocaleString("vi-VN") + " đ";

  /* ===== SAVE BILL ===== */
  async function handleSaveInvoice() {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_id: room.id,
          month: monthStr,

          electric_old: oldElectric,
          electric_new: newElectric,
          water_old: oldWater,
          water_new: newWater,

          room_price: room.room_price,
          electric_used: electricUsed,
          water_used: waterUsed,
          electric_cost: electricCost,
          water_cost: waterCost,
          total_amount: total,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lưu hóa đơn thất bại");
      }

      toast.success("Đã lưu hóa đơn");
      navigate(-1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  /* ===== UI ===== */
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Tính tiền phòng {room.room_name}
            </h1>
            <p className="text-sm text-slate-500">
              Tháng {monthStr}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
        </div>

        {/* ROOM PRICE */}
        <div className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition p-6">
          <div className="flex items-center gap-2 mb-2">
            <Home className="text-indigo-600" size={20} />
            <p className="text-slate-600 font-semibold">Tiền phòng</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {money(room.room_price)}
          </p>
        </div>

        {/* ELECTRIC */}
        <div className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="text-yellow-500" size={20} />
            <h2 className="font-semibold text-lg">Điện</h2>
          </div>
          <input
            type="number"
            placeholder="Số cũ"
            onChange={(e) => setOldElectric(+e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
          />
          <input
            type="number"
            placeholder="Số mới"
            onChange={(e) => setNewElectric(+e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
          />
          <p className="text-right font-semibold">
            = {money(electricCost)}
          </p>
        </div>

        {/* WATER */}
        <div className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Droplet className="text-blue-500" size={20} />
            <h2 className="font-semibold text-lg">Nước</h2>
          </div>

          <select
            value={waterType}
            onChange={(e) => setWaterType(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
          >
            <option value="METER">Theo đồng hồ</option>
            <option value="PERSON">Theo người</option>
          </select>

          {waterType === "METER" && (
            <>
              <input
                type="number"
                placeholder="Số cũ"
                onChange={(e) => setOldWater(+e.target.value)}
                className="w-full px-4 py-2 border rounded-xl"
              />
              <input
                type="number"
                placeholder="Số mới"
                onChange={(e) => setNewWater(+e.target.value)}
                className="w-full px-4 py-2 border rounded-xl"
              />
            </>
          )}

          {waterType === "PERSON" && (
            <input
              type="number"
              min={1}
              value={peopleCount}
              onChange={(e) => setPeopleCount(+e.target.value)}
              className="w-full px-4 py-2 border rounded-xl"
            />
          )}

          <p className="text-right font-semibold">
            = {money(waterCost)}
          </p>
        </div>

        {/* SERVICE */}
        <div className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Wrench className="text-green-500" size={20} />
            <h2 className="font-semibold text-lg">Dịch vụ</h2>
          </div>
          <input
            type="number"
            placeholder="Tiền dịch vụ"
            onChange={(e) => setServiceFee(+e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
          />
        </div>

        {/* TOTAL */}
        <div className="bg-indigo-600 text-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
          <p className="text-sm opacity-80">Tổng tiền cần thu</p>
          <p className="text-3xl font-extrabold mt-1">
            {money(total)}
          </p>
        </div>

        {/* SAVE */}
        <button
          onClick={handleSaveInvoice}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition"
        >
          <Save size={16} />
          {saving ? "Đang lưu..." : "Lưu hóa đơn"}
        </button>
      </div>
    </div>
  );
}
