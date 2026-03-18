const API_URL = "http://localhost:5000/api/profile";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

async function safeJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text || "Server error");
  }
}

export async function getProfile() {
  const res = await fetch(API_URL, {
    headers: getAuthHeader()
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Load profile failed");
  return data;
}

export async function updateProfile({ name, phone }) {
  const res = await fetch(API_URL, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify({ name, phone })
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.message || "Update failed");
  return data;
}

