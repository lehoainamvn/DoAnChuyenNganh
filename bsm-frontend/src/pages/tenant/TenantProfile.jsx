import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getProfile, updateProfile } from "../../api/profile.api";

export default function TenantProfile() {

  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await getProfile();

      setProfile(data);

      setForm({
        name: data.name || "",
        phone: data.phone || ""
      });

    } catch (err) {
      toast.error(err?.message || "Không thể tải hồ sơ");
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.phone) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (!/^[0-9]{9,11}$/.test(form.phone)) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }

    try {

      setLoading(true);

      await toast.promise(
        updateProfile({
          name: form.name,
          phone: form.phone
        }),
        {
          loading: "Đang cập nhật...",
          success: "Cập nhật hồ sơ thành công",
          error: (err) =>
            err?.response?.data?.message ||
            err?.message ||
            "Cập nhật thất bại"
        }
      );

      await loadProfile();

    } finally {
      setLoading(false);
    }
  }

  if (!profile) {
    return (
      <div className="p-10 text-center text-gray-500">
        Đang tải thông tin...
      </div>
    );
  }

  return (
    <div className="p-8">

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Hồ sơ cá nhân
          </h1>

          <p className="text-gray-500 text-sm">
            Quản lý thông tin tài khoản của bạn
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Avatar */}
            <div className="flex flex-col items-center">

              <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-semibold">
                {profile.name?.charAt(0).toUpperCase()}
              </div>

              <p className="mt-4 font-semibold text-gray-800">
                {profile.name}
              </p>

              <p className="text-sm text-gray-500">
                {profile.email}
              </p>

              <span className="mt-2 text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                Người thuê
              </span>

            </div>

            {/* Form */}
            <div className="md:col-span-2">

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Tên
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Số điện thoại
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Email
                  </label>

                  <input
                    type="text"
                    value={profile.email}
                    disabled
                    className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2"
                  />
                </div>

                {/* Button */}
                <div className="pt-4">

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-60"
                  >
                    {loading ? "Đang lưu..." : "Cập nhật thông tin"}
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