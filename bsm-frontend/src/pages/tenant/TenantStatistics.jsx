import { useEffect, useState } from "react";
import { getTenantStatistics } from "../../api/tenantStatistics.api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function TenantStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getTenantStatistics();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-slate-500 py-16">
        Không có dữ liệu thống kê
      </div>
    );
  }

  const electricData = {
    labels: stats.electric.map((e) => e.month),
    datasets: [
      {
        label: "Điện (kWh)",
        data: stats.electric.map((e) => e.used),
        borderColor: "#f97316",
        backgroundColor: "#fdba74",
        tension: 0.4,
      },
    ],
  };

  const waterData = {
    labels: stats.water.map((w) => w.month),
    datasets: [
      {
        label: "Nước (m³)",
        data: stats.water.map((w) => w.used),
        borderColor: "#3b82f6",
        backgroundColor: "#93c5fd",
        tension: 0.4,
      },
    ],
  };

  const electricChange = calculateChange(stats.electric);
  const waterChange = calculateChange(stats.water);

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Thống kê điện nước
        </h1>
        <p className="text-slate-500 text-sm">
          Theo dõi mức tiêu thụ theo từng tháng
        </p>
      </div>

      {/* CHANGE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <StatCard
          title="Điện tháng này"
          change={electricChange}
          color="orange"
        />

        <StatCard
          title="Nước tháng này"
          change={waterChange}
          color="blue"
        />

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold mb-4">Biểu đồ điện</h3>
          <Line data={electricData} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold mb-4">Biểu đồ nước</h3>
          <Line data={waterData} />
        </div>

      </div>
    </div>
  );
}

/* COMPONENT CARD */
function StatCard({ title, change, color }) {
  const isIncrease = change >= 0;

  const colorMap = {
    orange: isIncrease
      ? "text-red-500"
      : "text-green-500",
    blue: isIncrease
      ? "text-red-500"
      : "text-green-500",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <p className="text-slate-500 text-sm">{title}</p>
      <p className={`text-xl font-bold mt-2 ${colorMap[color]}`}>
        {change > 0 ? "+" : ""}
        {change}%
      </p>
    </div>
  );
}

/* TÍNH % TĂNG GIẢM */
function calculateChange(data) {
  if (data.length < 2) return 0;

  const last = data[data.length - 1].used;
  const prev = data[data.length - 2].used;

  if (prev === 0) return 0;

  return (((last - prev) / prev) * 100).toFixed(1);
}