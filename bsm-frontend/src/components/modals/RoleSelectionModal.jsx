import { useState } from "react";
import { Building2, Users } from "lucide-react";

export default function RoleSelectionModal({ isOpen, onSelectRole, loading }) {
  const [selectedRole, setSelectedRole] = useState(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedRole) {
      onSelectRole(selectedRole);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
        {/* HEADER */}
        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Chọn vai trò</h2>
          <p className="text-sm text-slate-500">Bạn muốn đăng nhập với tư cách gì?</p>
        </div>

        {/* ROLE OPTIONS */}
        <div className="space-y-3 mb-8">
          {/* OWNER OPTION */}
          <button
            onClick={() => setSelectedRole("OWNER")}
            className={`w-full p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
              selectedRole === "OWNER"
                ? "border-indigo-600 bg-indigo-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className={`mt-1 ${selectedRole === "OWNER" ? "text-indigo-600" : "text-slate-400"}`}>
              <Building2 size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-800">Chủ nhà</h3>
              <p className="text-xs text-slate-500 mt-1">Quản lý nhà, phòng, hóa đơn và người thuê</p>
            </div>
          </button>

          {/* TENANT OPTION */}
          <button
            onClick={() => setSelectedRole("TENANT")}
            className={`w-full p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
              selectedRole === "TENANT"
                ? "border-indigo-600 bg-indigo-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className={`mt-1 ${selectedRole === "TENANT" ? "text-indigo-600" : "text-slate-400"}`}>
              <Users size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-800">Người thuê</h3>
              <p className="text-xs text-slate-500 mt-1">Xem hóa đơn, thông tin phòng và liên hệ chủ nhà</p>
            </div>
          </button>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3">
          <button
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedRole || loading}
            className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang xử lý...</span>
              </>
            ) : (
              "Tiếp tục"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
