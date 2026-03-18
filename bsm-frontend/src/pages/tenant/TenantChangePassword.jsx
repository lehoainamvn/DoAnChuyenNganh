import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { changePassword } from "../../api/user.api";
import { getProfile } from "../../api/profile.api";

export default function ChangePassword() {

  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      toast.error(err.message);
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

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải tối thiểu 6 ký tự");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp");
      return;
    }

    try {
      setLoading(true);

      await changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      });

      toast.success("Đổi mật khẩu thành công");

      setForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

    } catch (err) {
      toast.error(err.message || "Đổi mật khẩu thất bại");
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
            Đổi mật khẩu
          </h1>
          <p className="text-gray-500 text-sm">
            Cập nhật mật khẩu tài khoản của bạn
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* LEFT PROFILE */}
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

            {/* FORM */}
            <div className="md:col-span-2">

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* OLD PASSWORD */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Mật khẩu hiện tại
                  </label>

                  <input
                    type="password"
                    name="oldPassword"
                    value={form.oldPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* NEW PASSWORD */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Mật khẩu mới
                  </label>

                  <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Xác nhận mật khẩu mới
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* BUTTON */}
                <div className="pt-4 flex gap-3">

                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    {loading ? "Đang đổi..." : "Đổi mật khẩu"}
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