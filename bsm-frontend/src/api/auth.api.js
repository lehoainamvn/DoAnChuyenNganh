const API_BASE_URL = "http://localhost:5000/api/auth";

/**
 * LOGIN (GIỮ NGUYÊN)
 */
export const login = async ({ phone, password }) => {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      identifier: phone,
      password
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Đăng nhập thất bại");
  }

  return res.json();
};

/**
 * REGISTER (GIỮ NGUYÊN)
 */
export async function registerApi(user) {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Đăng ký thất bại");
  }

  return data;
}

/**
 * 📩 FORGOT PASSWORD (GỬI OTP)
 */
export async function forgotPasswordApi(email) {
  const res = await fetch(`${API_BASE_URL}/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Gửi OTP thất bại");
  }

  return data;
}

/**
 * 🔄 RESET PASSWORD
 */
export async function resetPasswordApi({ email, otp, newPassword }) {
  const res = await fetch(`${API_BASE_URL}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, otp, newPassword })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Đổi mật khẩu thất bại");
  }

  return data;
}