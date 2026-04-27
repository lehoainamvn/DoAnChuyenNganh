import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import HouseMap from "./HouseMap";
import { createHouse, updateHouse } from "../../api/houseApi";

export default function CreateHouseModal({
  house,
  onClose,
  onSuccess,
  existingHouses = [],
  excludeId,
}) {
  const isEdit = Boolean(house);

  const createdRooms = house?.created_rooms || 0;

  const [form, setForm] = useState({
    name: "",
    address: "",
    totalRooms: 1,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (house) {
      setForm({
        name: house.name,
        address: house.address,
        totalRooms: house.total_rooms,
      });
    }
  }, [house]);

  function normalize(str) {
    return (str || "").trim().toLowerCase();
  }

  function isDuplicate({ name, address }) {
    const nameNorm = normalize(name);
    const addressNorm = normalize(address);

    return existingHouses.some((h) => {
      if (excludeId && h.id === excludeId) return false;
      if (nameNorm && normalize(h.name) === nameNorm) return true;
      if (addressNorm && normalize(h.address) === addressNorm) return true;
      return false;
    });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    // Chỉ convert sang Number nếu là input type="number"
    const isNumberInput = e.target.type === "number";
    setForm((prev) => ({
      ...prev,
      [name]: isNumberInput && !Number.isNaN(Number(value)) ? Number(value) : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name || typeof form.name !== 'string' || !form.name.trim()) {
      setError("Tên nhà trọ không được để trống");
      return;
    }

    if (!form.address || typeof form.address !== 'string' || !form.address.trim()) {
      setError("Địa chỉ không được để trống");
      return;
    }

    if (!Number.isInteger(form.totalRooms) || form.totalRooms < 1) {
      setError("Giới hạn số phòng phải là số nguyên lớn hơn 0");
      return;
    }

    if (isEdit && form.totalRooms < createdRooms) {
      setError(`Giới hạn phòng không được nhỏ hơn ${createdRooms} (đã tạo)`);
      return;
    }

    if (isDuplicate(form)) {
      setError("Tên hoặc địa chỉ nhà trọ đã tồn tại");
      toast.error("Tên hoặc địa chỉ nhà trọ đã tồn tại");
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await updateHouse(house.id, form);
      } else {
        await createHouse(form);
      }
      onSuccess();
    } catch (err) {
      const message = err.message || "Có lỗi xảy ra";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md my-8 flex flex-col max-h-[90vh]">
        {/* Header - Fixed */}
        <div className="p-8 pb-4">
          <h2 className="text-2xl font-bold text-center">
            {isEdit ? "Chỉnh sửa nhà trọ" : "Tạo nhà trọ"}
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="px-8 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium">Tên nhà</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full mt-1 rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Địa chỉ</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full mt-1 rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nhập địa chỉ hoặc dán từ Google Maps"
              />
              <p className="text-xs text-slate-500 mt-1">
                Bạn có thể lấy địa chỉ từ <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" className="underline text-indigo-600 hover:text-indigo-700">Google Maps</a>.
              </p>
            </div>

            {form.address && typeof form.address === 'string' && form.address.trim() && (
              <div className="mb-4">
                <HouseMap address={form.address} />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">
                Giới hạn số phòng
              </label>

              <input
                type="number"
                name="totalRooms"
                min={createdRooms}
                value={form.totalRooms}
                onChange={handleChange}
                onInput={(e) => {
                  if (e.target.value.length > 1 && e.target.value.startsWith('0')) {
                    e.target.value = e.target.value.replace(/^0+/, '');
                  }
                }}
                className="w-full mt-1 rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {isEdit && (
                <p className="text-xs text-gray-500 mt-1">
                  Đã tạo: <b>{createdRooms}</b> phòng
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="p-8 pt-4 border-t bg-white rounded-b-3xl">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-300 rounded-xl py-2.5 font-medium hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
