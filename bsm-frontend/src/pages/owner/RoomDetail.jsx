import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function RoomDetail() {
  const { id } = useParams();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===== EDIT NAME ===== */
  const [editingName, setEditingName] = useState(false);
  const [roomName, setRoomName] = useState("");

  /* ===== PRICE ===== */
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceForm, setPriceForm] = useState({
    room_price: 0,
    electric_price: 0,
    water_type: "METER",
    water_price: 0,
    old_index: 0,
    new_index: 0,
    people_count: 1,
    water_price_per_person: 0,
  });

  /* ===== TENANT EXISTING ===== */
  const [email, setEmail] = useState("");
  const [foundTenant, setFoundTenant] = useState(null);
  const [error, setError] = useState("");

  /* ===== TENANT NEW ===== */
  const [isCreatingNewTenant, setIsCreatingNewTenant] = useState(false);
  const [newTenantForm, setNewTenantForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchRoom();
  }, [id]);

  /* ================= FETCH ROOM ================= */
  async function fetchRoom() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Không tải được phòng");

      const data = await res.json();
      setRoom(data);
      setRoomName(data.room_name);

      setPriceForm({
        room_price: data.room_price ?? 0,
        electric_price: data.electric_price ?? 0,
        water_type: data.water_type ?? "METER",
        water_price: data.water_price ?? 0,
        old_index: data.old_index ?? 0,
        new_index: data.new_index ?? 0,
        people_count: data.people_count ?? 1,
        water_price_per_person: data.water_price_per_person ?? 0,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ================= SAVE NAME ================= */
  async function saveRoomName() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/rooms/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ room_name: roomName }),
      });

      if (!res.ok) throw new Error();

      toast.success("Đã cập nhật tên phòng");
      setEditingName(false);
      fetchRoom();
    } catch {
      toast.error("Không thể cập nhật tên phòng");
    }
  }

  /* ================= SAVE PRICE ================= */
  async function savePrice() {
    try {
      const token = localStorage.getItem("token");

      const payload =
        priceForm.water_type === "PERSON"
          ? {
              room_price: Number(priceForm.room_price),
              electric_price: Number(priceForm.electric_price),
              water_type: "PERSON",
              people_count: Number(priceForm.people_count),
              water_price_per_person: Number(priceForm.water_price_per_person),
            }
          : {
              room_price: Number(priceForm.room_price),
              electric_price: Number(priceForm.electric_price),
              water_type: "METER",
              water_price: Number(priceForm.water_price),
            };

      const res = await fetch(`http://localhost:5000/api/rooms/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Đã lưu giá");
      setEditingPrice(false);
      fetchRoom();
    } catch (err) {
      toast.error(err.message || "Không thể lưu giá");
    }
  }

  /* ================= TENANT EXISTING ================= */
  async function handleCheckEmail() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/tenants/find-by-email?email=${email}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Không tìm thấy người thuê");

      const data = await res.json();
      setFoundTenant(data);
      setError("");
    } catch (err) {
      setFoundTenant(null);
      setError(err.message);
    }
  }

  async function handleAssignTenant() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/tenants/rooms/${id}/assign-tenant`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tenantType: "EXISTING",
            email: foundTenant.email,
            start_date: new Date().toISOString().slice(0, 10),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Gán người thuê thành công");
      fetchRoom();
    } catch (err) {
      toast.error(err.message);
    }
  }

  /* ================= REMOVE TENANT ================= */
  async function removeTenant() {
    if (!window.confirm("Xác nhận trả phòng?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/tenants/rooms/${id}/remove-tenant`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error();

      toast.success("Đã trả phòng");
      fetchRoom();
    } catch {
      toast.error("Không thể trả phòng");
    }
  }

  /* ================= CREATE + ASSIGN ================= */
  async function handleCreateAndAssignTenant() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/tenants/rooms/${id}/assign-tenant`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tenantType: "NEW",
            ...newTenantForm,
            start_date: new Date().toISOString().slice(0, 10),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Tạo & gán phòng thành công");
      setIsCreatingNewTenant(false);
      setNewTenantForm({ name: "", email: "", phone: "" });
      fetchRoom();
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Đang tải...
      </div>
    );

  if (!room)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Không tìm thấy phòng
      </div>
    );

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">

        {/* HEADER */}
        <div className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition p-6 flex justify-between items-center">
          {!editingName ? (
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                🏠 {room.room_name}
              </h1>
              <button
                onClick={() => setEditingName(true)}
                className="text-sm text-indigo-500 hover:underline"
              >
                Chỉnh sửa tên
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                className="px-4 py-2 border rounded-xl"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
              <button
                onClick={saveRoomName}
                className="px-5 py-2 bg-indigo-500 text-white rounded-xl"
              >
                Lưu
              </button>
              <button
                onClick={() => {
                  setRoomName(room.room_name);
                  setEditingName(false);
                }}
                className="px-5 py-2 border rounded-xl"
              >
                Hủy
              </button>
            </div>
          )}
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">💸 Giá dịch vụ</h3>
              {!editingPrice && (
                <button
                  onClick={() => setEditingPrice(true)}
                  className="text-indigo-500 text-sm"
                >
                  Chỉnh sửa
                </button>
              )}
            </div>

            {!editingPrice ? (
            <div className="text-slate-700 space-y-1">
              <p>Giá phòng: <b>{room.room_price} đ</b></p>
              <p>Giá điện: <b>{room.electric_price} đ/kWh</b></p>
              {room.water_type === "METER" ? (
                <p>Giá nước: <b>{room.water_price} đ/m³</b></p>
              ) : (
                <p>Nước: <b>{room.people_count} người × {room.water_price_per_person} đ</b></p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-700">
                ✏️ Cập nhật giá dịch vụ
              </h4>

              <div>
                <label className="text-sm text-slate-600">Giá phòng (đ)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border rounded-xl"
                  value={priceForm.room_price}
                  onChange={(e) =>
                    setPriceForm({ ...priceForm, room_price: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm text-slate-600">Giá điện (đ/kWh)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border rounded-xl"
                  value={priceForm.electric_price}
                  onChange={(e) =>
                    setPriceForm({ ...priceForm, electric_price: e.target.value })
                  }
                />
              </div>

              <h4 className="font-semibold text-slate-700">🚰 Tiền nước</h4>

              <div className="flex gap-6 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={priceForm.water_type === "METER"}
                    onChange={() =>
                      setPriceForm({ ...priceForm, water_type: "METER" })
                    }
                  />
                  Theo đồng hồ
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={priceForm.water_type === "PERSON"}
                    onChange={() =>
                      setPriceForm({ ...priceForm, water_type: "PERSON" })
                    }
                  />
                  Theo người
                </label>
              </div>

              {priceForm.water_type === "METER" ? (
                <div>
                  <label className="text-sm text-slate-600">
                    Giá nước (đ/m³)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border rounded-xl"
                    value={priceForm.water_price}
                    onChange={(e) =>
                      setPriceForm({ ...priceForm, water_price: e.target.value })
                    }
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-slate-600">Số người</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border rounded-xl"
                      value={priceForm.people_count}
                      onChange={(e) =>
                        setPriceForm({
                          ...priceForm,
                          people_count: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-600">Giá / người</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border rounded-xl"
                      value={priceForm.water_price_per_person}
                      onChange={(e) =>
                        setPriceForm({
                          ...priceForm,
                          water_price_per_person: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}

              <button
                onClick={savePrice}
                className="w-full bg-indigo-500 text-white py-2 rounded-xl"
              >
                Lưu giá
              </button>
            </div>
          )}
          </div>

          <div className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition p-6 space-y-4">
            <h3 className="font-semibold text-lg">👤 Người thuê</h3>

            {room.tenant ? (
              <div className="space-y-1 text-slate-700">
                <p>{room.tenant.name}</p>
                <p>{room.tenant.email}</p>
                <p>{room.tenant.phone}</p>
                <button
                  onClick={removeTenant}
                  className="mt-4 w-full bg-rose-100 text-rose-600 py-2 rounded-xl hover:bg-rose-200">
                  Trả phòng
                </button>
              </div>
            ) : (
              <>
                {!isCreatingNewTenant ? (
                  <div className="space-y-5">
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Đã có tài khoản</p>
                      <div className="flex gap-2">
                        <input className="flex-1 px-3 py-2 border rounded-xl"
                          placeholder="Email người thuê"
                          value={email}
                          onChange={(e)=>setEmail(e.target.value)}/>
                        <button onClick={handleCheckEmail}
                          className="px-4 py-2 border rounded-xl">Tìm</button>
                      </div>

                      {error && <p className="text-sm text-rose-500 mt-1">{error}</p>}

                      {foundTenant && (
                        <div className="mt-3 bg-indigo-50 p-3 rounded-xl text-sm">
                          <p>{foundTenant.name}</p>
                          <p>{foundTenant.email}</p>
                          <p>{foundTenant.phone}</p>
                          <button
                            onClick={handleAssignTenant}
                            className="mt-2 w-full bg-indigo-500 text-white py-1.5 rounded-xl">
                            Gán phòng
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-slate-500 mb-2">Chưa có tài khoản</p>
                      <button
                        onClick={()=>setIsCreatingNewTenant(true)}
                        className="w-full border py-2 rounded-xl">
                        Tạo người thuê mới
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {["name","email","phone"].map(k=>(
                      <input key={k} className="w-full px-4 py-2 border rounded-xl"
                        placeholder={k==="name"?"Tên":k==="email"?"Email":"SĐT"}
                        value={newTenantForm[k]}
                        onChange={(e)=>setNewTenantForm({...newTenantForm,[k]:e.target.value})}/>
                    ))}
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateAndAssignTenant}
                        className="flex-1 bg-indigo-500 text-white py-2 rounded-xl">
                        Tạo & Gán
                      </button>
                      <button
                        onClick={()=>setIsCreatingNewTenant(false)}
                        className="flex-1 border py-2 rounded-xl">
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
