import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { 
  Brain, TrendingUp, AlertCircle, CheckCircle2, 
  Target, Zap, ShieldCheck, BarChart3, 
  Lightbulb, Activity, ChevronRight 
} from "lucide-react";

export default function RevenuePrediction() {
  const [houses, setHouses] = useState([]);
  const [houseId, setHouseId] = useState("");
  const [months, setMonths] = useState(12);
  const [simOccupancy, setSimOccupancy] = useState(90);
  const [chartData, setChartData] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadHouses(); }, []);

  async function loadHouses() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/houses", { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      if (data.length > 0) { 
        setHouses(data); 
        setHouseId(data[0].id); 
      }
    } catch (err) { toast.error("Lỗi tải danh sách nhà"); }
  }

  async function runPrediction(isSim = false) {
    setLoading(true);
    const toastId = toast.loading(isSim ? "Đang giả lập kịch bản..." : "AI đang tính toán...");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/predict-revenue?house=${houseId}&months=${months}&simOccupancy=${simOccupancy}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      
      setResult(data);
      
      // Nếu có lỗi từ server (Ví dụ: Ít hơn 6 tháng dữ liệu)
      if (data.error) {
        setChartData([]);
        toast.error(data.error, { id: toastId });
        return;
      }

      // Xử lý dữ liệu biểu đồ an toàn với Optional Chaining
      const history = (data.history || []).map(i => ({
        month: i.month.substring(0, 7),
        "Thực tế": parseFloat(i.revenue),
      }));

      const lastReal = history.length > 0 ? history[history.length - 1]["Thực tế"] : 0;
      
      const predictions = (data.predictions || []).map(i => ({
        month: i.month,
        "Dự báo AI": i.realistic,
        "Kịch bản Tốt": i.optimistic,
        "Kịch bản Rủi ro": i.pessimistic
      }));

      // Nối điểm để biểu đồ không bị đứt đoạn
      if (history.length > 0 && predictions.length > 0) {
        predictions.unshift({ 
          month: history[history.length-1].month, 
          "Dự báo AI": lastReal, 
          "Kịch bản Tốt": lastReal, 
          "Kịch bản Rủi ro": lastReal 
        });
      }

      setChartData([...history, ...predictions]);
      toast.success("Dữ liệu đã sẵn sàng!", { id: toastId });
    } catch (err) { 
      toast.error("Lỗi kết nối với hệ thống AI", { id: toastId }); 
      setResult(null);
    } finally { 
      setLoading(false); 
    }
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-20 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP BAR */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <Brain size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">AI PREDICTION LAB</h1>
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                <Activity size={14}/> HỆ THỐNG ĐANG HOẠT ĐỘNG
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <select 
              value={houseId} 
              onChange={(e) => setHouseId(e.target.value)} 
              className="bg-white border-none rounded-xl px-4 py-2 font-bold text-slate-700 shadow-sm focus:ring-2 ring-indigo-500 outline-none"
            >
              {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            <button 
              onClick={() => runPrediction(false)} 
              disabled={loading} 
              className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black hover:bg-black transition-all flex items-center gap-2"
            >
              {loading ? "ĐANG TÍNH..." : "CHẠY PHÂN TÍCH"} <Zap size={16} fill="currentColor"/>
            </button>
          </div>
        </div>

        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* KIỂM TRA LỖI TRƯỚC KHI HIỂN THỊ CHI TIẾT */}
            {result.error ? (
              <div className="lg:col-span-12 bg-orange-50 border-2 border-orange-100 p-10 rounded-[2.5rem] text-center">
                <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  <AlertCircle size={32}/>
                </div>
                <h2 className="text-2xl font-black text-orange-900 mb-2">Không đủ dữ liệu</h2>
                <p className="text-orange-700 font-medium">{result.error}</p>
              </div>
            ) : (
              <>
                {/* LEFT SIDE: MAIN CHART & SIMULATOR */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/60">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-8">
                       <TrendingUp className="text-indigo-600"/> Dự báo dòng tiền đa kịch bản
                    </h3>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} tickFormatter={(v) => (v/1000000).toFixed(1) + 'M'} />
                          <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                          <Legend iconType="circle" verticalAlign="top" align="right" wrapperStyle={{paddingBottom: '20px', fontSize: '12px', fontWeight: 'bold'}}/>
                          <Area type="monotone" dataKey="Thực tế" stroke="#10b981" strokeWidth={4} fillOpacity={0.1} fill="#10b981" />
                          <Area type="monotone" dataKey="Dự báo AI" stroke="#6366f1" strokeWidth={5} fillOpacity={0.1} fill="#6366f1" />
                          <Area type="monotone" dataKey="Kịch bản Tốt" stroke="#34d399" strokeWidth={2} strokeDasharray="6 6" fill="transparent" />
                          <Area type="monotone" dataKey="Kịch bản Rủi ro" stroke="#f43f5e" strokeWidth={2} strokeDasharray="6 6" fill="transparent" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 opacity-10"><Target size={250}/></div>
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                      <div className="space-y-6">
                        <h2 className="text-3xl font-black">Giả lập Lấp đầy</h2>
                        <div className="flex justify-between text-2xl font-black">
                          <span>Mục tiêu:</span> <span className="text-yellow-400">{simOccupancy}%</span>
                        </div>
                        <input type="range" min="50" max="100" value={simOccupancy} onChange={(e) => setSimOccupancy(e.target.value)}
                          className="w-full h-3 bg-indigo-800 rounded-lg appearance-none cursor-pointer accent-white" />
                        <button onClick={() => runPrediction(true)} className="w-full bg-white text-indigo-900 py-4 rounded-xl font-black text-lg hover:scale-[1.02] transition-all">CẬP NHẬT KỊCH BẢN</button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                          <ShieldCheck className="text-emerald-400 mb-2" size={20}/>
                          <p className="text-indigo-300 text-[10px] font-bold uppercase">Độ tin cậy</p>
                          <p className="text-2xl font-black">{result.accuracy?.r2_score ?? 0}%</p>
                        </div>
                        <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                          <AlertCircle className="text-orange-400 mb-2" size={20}/>
                          <p className="text-indigo-300 text-[10px] font-bold uppercase">Sai số MAE</p>
                          <p className="text-sm font-black">±{(result.accuracy?.mae/1000 || 0).toFixed(0)}K</p>
                        </div>
                        <div className="col-span-2 bg-white/10 p-5 rounded-2xl border border-white/10 flex items-center justify-between">
                           <div>
                              <p className="text-indigo-300 text-[10px] font-bold uppercase">Trọng số Lấp đầy</p>
                              <p className="text-xl font-black text-indigo-100">{result.insight?.factorWeights?.["Lấp đầy"] ?? 0}%</p>
                           </div>
                           <BarChart3 size={32} className="text-indigo-400 opacity-50"/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE: ALERTS & INSIGHTS */}
                <div className="lg:col-span-4 space-y-6">
                  {/* INSIGHTS CARD */}
                  <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100">
                    <h4 className="font-black text-slate-800 flex items-center gap-2 uppercase text-xs tracking-widest mb-6">
                      <Lightbulb size={18} className="text-yellow-500"/> Giải mã dữ liệu
                    </h4>
                    <div className="space-y-6">
                      {result.insight?.factorWeights && Object.entries(result.insight.factorWeights).map(([key, val]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                            <span>{key}</span> <span className="text-indigo-600">{val}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{width: `${val}%`}}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ADVICE CARD */}
                  <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[2rem] text-white shadow-xl">
                    <h4 className="font-black mb-4 flex items-center gap-2 text-xs uppercase tracking-widest"><CheckCircle2 size={16}/> Khuyến nghị từ AI</h4>
                    <div className="space-y-3">
                      {result.explanations?.map((text, i) => (
                        <div key={i} className="flex gap-3 items-start bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5">
                           <div className="mt-1 text-yellow-400"><ChevronRight size={14} strokeWidth={4}/></div>
                           <p className="text-[12px] font-medium leading-relaxed italic">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}