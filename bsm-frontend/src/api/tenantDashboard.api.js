const API_URL = "http://localhost:5000/api/tenants";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getTenantDashboard() {
  const res = await fetch(`${API_URL}/dashboard`, {
    headers: getAuthHeader(),
  });

  if (!res.ok) {
    throw new Error("Fetch dashboard failed");
  }

  return res.json();
}