import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, User, Mail, Phone, Lock } from "lucide-react";

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingTenant, setEditingTenant] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const emptyForm = { name: "", email: "", phone: "", password: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTenants(data);
    } catch {
      toast.error("Không tải được danh sách khách thuê");
    } finally {
      setLoading(false);
    }
  }

  function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isPhoneValid(phone) {
    return /^\d{9,12}$/.test(phone.replace(/\s+/g, ""));
  }

  function isDuplicate({ name, email, phone }, excludeId) {
    return tenants.some((t) => {
      if (excludeId && t.id === excludeId) return false;
      if (email && t.email?.toLowerCase() === email.toLowerCase()) return true;
      if (phone && t.phone === phone) return true;
      if (name && t.name?.toLowerCase() === name.toLowerCase()) return true;
      return false;
    });
  }

  async function handleAdd() {
    if (!form.name || !form.phone || !form.password) {
      return toast.error("Vui lòng điền đầy đủ tên, số điện thoại và mật khẩu");
    }

    if (!isPhoneValid(form.phone)) {
      return toast.error("Số điện thoại phải là 9-12 chữ số");
    }

    if (form.email && !isEmailValid(form.email)) {
      return toast.error("Địa chỉ email không hợp lệ");
    }

    if (isDuplicate(form)) {
      return toast.error("Tên/Email/Số điện thoại đã tồn tại");
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/clients", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Thêm khách thuê thất bại");
      }
      toast.success("Đã thêm khách thuê");
      setShowAddModal(false);
      setForm(emptyForm);
      fetchTenants();
    } catch (err) {
      toast.error(err.message || "Thêm khách thuê thất bại");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Bạn chắc chắn muốn xóa khách thuê này?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/clients/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      toast.success("Đã xóa khách thuê");
      setTenants((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      toast.error(err.message || "Xóa thất bại");
    }
  }

  function openEditModal(tenant) {
    setEditingTenant(tenant);
    setForm({
      name: tenant.name,
      email: tenant.email || "",
      phone: tenant.phone || "",
    });
  }

  async function handleUpdate() {
    if (!form.name || !form.phone) {
      return toast.error("Vui lòng điền tên và số điện thoại");
    }

    if (!isPhoneValid(form.phone)) {
      return toast.error("Số điện thoại phải là 9-12 chữ số");
    }

    if (form.email && !isEmailValid(form.email)) {
      return toast.error("Địa chỉ email không hợp lệ");
    }

    if (isDuplicate(form, editingTenant?.id)) {
      return toast.error("Tên/Email/Số điện thoại đã tồn tại");
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/clients/${editingTenant.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Cập nhật thất bại");
      }
      toast.success("Cập nhật thành công");
      setEditingTenant(null);
      setForm(emptyForm);
      fetchTenants();
    } catch (err) {
      toast.error(err.message || "Cập nhật thất bại");
    }
  }

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Đang tải danh sách...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý khách thuê</h1>
          <p className="text-sm text-slate-500">
            Quản lý danh sách khách thuê của bạn
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          <Plus size={16} />
          Thêm khách
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg bg-white"
        />
      </div>

      {/* TENANT LIST */}
      {filteredTenants.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <User size={48} className="mx-auto mb-4 text-slate-300" />
          <p>Không có khách thuê nào</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((t) => (
            <div
              key={t.id}
              className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              {/* AVATAR */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-white flex items-center justify-center text-xl font-bold">
                  {t.name?.charAt(0)?.toUpperCase()}
                </div>
              </div>

              {/* INFO */}
              <div className="text-center mb-4">
                <h3 className="font-semibold text-lg text-slate-800">{t.name}</h3>
                <div className="space-y-1 text-sm text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <Mail size={14} />
                    {t.email || "—"}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Phone size={14} />
                    {t.phone}
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(t)}
                  className="flex-1 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm"
                >
                  <Edit size={14} />
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="w-10 flex items-center justify-center bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      

      {showAddModal && (
        <Modal
        title="➕ Thêm khách thuê"
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        form={form}
        setForm={setForm}
        submitText="Thêm khách"
        isCreate={true}   // thêm dòng này
      />
      )}

      {editingTenant && (
        <Modal
          title="✏️ Chỉnh sửa thông tin khách thuê"
          onClose={() => setEditingTenant(null)}
          onSubmit={handleUpdate}
          form={form}
          setForm={setForm}
          submitText="Lưu thay đổi"
        />
      )}
    </div>
  );
}
function Modal({ title, onClose, onSubmit, form, setForm, isCreate }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

      <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4">

        <h3 className="text-lg font-semibold">{title}</h3>

        <input
          placeholder="Tên"
          className="w-full border px-3 py-2 rounded-lg"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          placeholder="Email"
          className="w-full border px-3 py-2 rounded-lg"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          placeholder="Số điện thoại"
          className="w-full border px-3 py-2 rounded-lg"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
        />

        {isCreate && (
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full border px-3 py-2 rounded-lg"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
        )}

        <div className="flex justify-end gap-3 pt-2">

          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Hủy
          </button>

          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Lưu
          </button>

        </div>
      </div>
    </div>
  );
}