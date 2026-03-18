import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  forgotPasswordApi,
  resetPasswordApi
} from "../../api/auth.api";

export default function ForgotPassword() {

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    if (!email) return toast.error("Vui lòng nhập email");

    try {
      setLoading(true);

      await forgotPasswordApi(email);

      toast.success("OTP đã được gửi về email");
      setStep(2);

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESET PASSWORD ================= */
  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      return toast.error("Vui lòng nhập đầy đủ thông tin");
    }

    try {
      setLoading(true);

      await resetPasswordApi({
        email,
        otp,
        newPassword
      });

      toast.success("Đổi mật khẩu thành công");

      // reset form
      setStep(1);
      setOtp("");
      setNewPassword("");

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50 flex items-center justify-center px-4">

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-center bg-white border-r p-10 space-y-6">
          <h1 className="text-3xl font-extrabold text-slate-800">
            BSM Management
          </h1>

          <p className="text-slate-500">
            Hệ thống quản lý nhà trọ chuyên nghiệp
          </p>

          <div className="space-y-3 text-sm text-slate-600">
            <p>✔ Quản lý phòng & khách thuê</p>
            <p>✔ Theo dõi hóa đơn</p>
            <p>✔ Thống kê doanh thu</p>
            <p>✔ Nhắc thanh toán tự động</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-10 space-y-6">

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Quên mật khẩu
            </h2>
            <p className="text-sm text-slate-500">
              Nhập email để nhận OTP
            </p>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">

              <input
                type="email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700
                           text-white py-3 rounded-xl font-semibold
                           transition disabled:opacity-60"
              >
                {loading ? "Đang gửi..." : "Gửi OTP"}
              </button>

            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">

              <input
                placeholder="Nhập OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              <input
                type="password"
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700
                           text-white py-3 rounded-xl font-semibold
                           transition disabled:opacity-60"
              >
                {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>

            </div>
          )}

          {/* FOOTER */}
          <div className="flex justify-between text-sm pt-2">
            <Link to="/" className="text-indigo-600 hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}