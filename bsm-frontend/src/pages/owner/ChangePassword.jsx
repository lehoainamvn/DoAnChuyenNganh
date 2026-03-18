import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { changePassword } from "../../api/user.api";
import { Lock, Save } from "lucide-react";

export default function ChangePassword() {

  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

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

  const role = roleMap[user?.role] || roleMap.TENANT;

  /* ================= SUBMIT ================= */

  async function handleSubmit(e) {

    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải tối thiểu 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp");
      return;
    }

    try {

      setLoading(true);

      await toast.promise(
        changePassword({
          oldPassword,
          newPassword
        }),
        {
          loading: "Đang đổi mật khẩu...",
          success: "Đổi mật khẩu thành công",
          error: "Đổi mật khẩu thất bại"
        }
      );

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate(-1), 800);

    } finally {
      setLoading(false);
    }

  }

  /* ================= UI ================= */

  return (

    <div className="p-8">

      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Đổi mật khẩu
          </h1>
          <p className="text-sm text-slate-500">
            Cập nhật mật khẩu tài khoản của bạn
          </p>
        </div>

        {/* CARD */}

        <div className="bg-white rounded-2xl shadow p-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* LEFT */}

            <div className="flex flex-col items-center text-center">

              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <p className="mt-4 font-semibold text-slate-800">
                {user?.name}
              </p>

              <p className="text-sm text-slate-500">
                {user?.email}
              </p>

              <span className={`mt-2 text-xs px-3 py-1 rounded-full ${role.style}`}>
                {role.label}
              </span>

            </div>

            {/* FORM */}

            <div className="md:col-span-2">

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* OLD */}

                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-500"/>
                    Mật khẩu hiện tại
                  </label>

                  <input
                    type={showOld ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full border border-slate-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-4 top-10 text-sm text-slate-500"
                  >
                    {showOld ? "Ẩn" : "Hiện"}
                  </button>
                </div>

                {/* NEW */}

                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-500"/>
                    Mật khẩu mới
                  </label>

                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-slate-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-10 text-sm text-slate-500"
                  >
                    {showNew ? "Ẩn" : "Hiện"}
                  </button>
                </div>

                {/* CONFIRM */}

                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-500"/>
                    Xác nhận mật khẩu
                  </label>

                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-slate-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-10 text-sm text-slate-500"
                  >
                    {showConfirm ? "Ẩn" : "Hiện"}
                  </button>
                </div>

                {/* ACTION */}

                <div className="flex justify-end pt-4">

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4"/>
                    {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
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