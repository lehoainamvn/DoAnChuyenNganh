const API_URL = "http://localhost:5000/api/tenants";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getTenantInvoices() {
  const res = await fetch(`${API_URL}/invoices`, {
    headers: getAuthHeader(),
  });

  if (!res.ok) {
    throw new Error("Fetch invoices failed");
  }

  return res.json();
}