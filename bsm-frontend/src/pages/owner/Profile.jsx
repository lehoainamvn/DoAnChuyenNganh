import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getProfile, updateProfile } from "../../api/profile.api";
import { User, Mail, Phone, Save } from "lucide-react";

export default function Profile() {

  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= ROLE MAP ================= */

 const roleMap = {
  OWNER: {
    label: "Chủ nhà",
    style: "bg-purple-100 text-purple-600"
  },
  TENANT: {
    label: "Người thuê",
    style: "bg-blue-100 text-blue-600"
  }
};

  const role = profile ? roleMap[profile.role] || roleMap.tenant : roleMap.tenant;

  /* ================= LOAD PROFILE ================= */

  async function fetchProfile() {

    try {

      const data = await toast.promise(
        getProfile(),
        {
          loading: "Đang tải thông tin...",
          success: "Tải thông tin thành công",
          error: "Không tải được thông tin cá nhân"
        }
      );

      setProfile(data);

      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || ""
      });

      localStorage.setItem("user", JSON.stringify(data));

    } finally {
      setLoading(false);
    }

  }

  useEffect(() => {
    fetchProfile();
  }, []);

  function handleChange(e) {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  }

  /* ================= UPDATE PROFILE ================= */

  async function handleSubmit(e) {

    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Tên không được để trống");
      return;
    }

    try {

      setSaving(true);

      await toast.promise(
        updateProfile({
          name: form.name,
          phone: form.phone
        }),
        {
          loading: "Đang cập nhật thông tin...",
          success: "Cập nhật thông tin thành công",
          error: "Cập nhật thất bại"
        }
      );

      const newProfile = {
        ...profile,
        name: form.name,
        phone: form.phone
      };

      setProfile(newProfile);

      localStorage.setItem("user", JSON.stringify(newProfile));

      window.dispatchEvent(new Event("user-updated"));

    } finally {
      setSaving(false);
    }

  }

  /* ================= LOADING ================= */

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">

        <div className="text-center">

          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>

          Đang tải thông tin...

        </div>

      </div>
    );

  }

  /* ================= UI ================= */

  return (

    <div className="p-8">

      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}

        <div>

          <h1 className="text-2xl font-bold text-slate-800">
            Hồ sơ cá nhân
          </h1>

          <p className="text-sm text-slate-500">
            Quản lý thông tin tài khoản của bạn
          </p>

        </div>

        {/* CARD */}

        <div className="bg-white rounded-2xl shadow p-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* PROFILE LEFT */}

            <div className="flex flex-col items-center text-center">

              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-semibold">
                {profile.name?.charAt(0).toUpperCase()}
              </div>

              <p className="mt-4 font-semibold text-slate-800">
                {profile.name}
              </p>

              <p className="text-sm text-slate-500">
                {profile.email}
              </p>

              <span className={`mt-2 text-xs px-3 py-1 rounded-full ${role.style}`}>
                {role.label}
              </span>

            </div>

            {/* FORM */}

            <div className="md:col-span-2">

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                {/* NAME */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500"/>
                    Họ và tên
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên"
                    className="w-full border border-slate-300 px-4 py-3 rounded-xl
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />

                </div>

                {/* EMAIL */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500"/>
                    Email
                  </label>

                  <input
                    value={form.email}
                    disabled
                    className="w-full border bg-gray-100 px-4 py-3
                    rounded-xl cursor-not-allowed text-slate-500"
                  />

                </div>

                {/* PHONE */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500"/>
                    Số điện thoại
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    className="w-full border border-slate-300 px-4 py-3 rounded-xl
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />

                </div>

                {/* ACTION */}

                <div className="flex justify-end pt-4">

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700
                    text-white font-semibold transition disabled:opacity-60 flex items-center gap-2"
                  >

                    <Save className="w-4 h-4"/>

                    {saving ? "Đang lưu..." : "Lưu thay đổi"}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}