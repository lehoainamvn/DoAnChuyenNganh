import { useEffect, useState, useRef } from "react"
import toast from "react-hot-toast"

import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
CartesianGrid,
ResponsiveContainer,
Legend
} from "recharts"

import { Brain, TrendingUp } from "lucide-react"

export default function RevenuePrediction(){

const [houses,setHouses] = useState([])
const [houseId,setHouseId] = useState("")
const [months,setMonths] = useState(3)

const [chartData,setChartData] = useState([])
const [insight,setInsight] = useState({})

const [loading,setLoading] = useState(false)

/* ===== FIX STRICT MODE ===== */

const loadedRef = useRef(false)

/* =========================
   LOAD HOUSES
========================= */

useEffect(()=>{

if(loadedRef.current) return
loadedRef.current = true

loadHouses()

},[])

async function loadHouses(){

try{

const token = localStorage.getItem("token")

const data = await toast.promise(

fetch(
"http://localhost:5000/api/houses",
{
headers:{
Authorization:`Bearer ${token}`
}
}
).then(r=>r.json()),

{
loading:"Đang tải danh sách nhà trọ...",
success:"Tải danh sách nhà trọ thành công",
error:"Không tải được danh sách nhà trọ"
}

)

if(Array.isArray(data)){

setHouses(data)

if(data.length>0){
setHouseId(data[0].id)
}

}

}catch(err){

console.error(err)

}

}

/* =========================
   FORMAT DATA
========================= */

function formatRevenue(i){
return Number(
i.revenue ||
i.total ||
i.total_amount ||
0
)
}

function formatMonth(i){
return i.month || i.date || ""
}

/* =========================
   RUN PREDICTION
========================= */

async function runPrediction(){

if(!houseId){

toast.error("Vui lòng chọn nhà trọ")
return

}

setLoading(true)

try{

const token = localStorage.getItem("token")

const data = await toast.promise(

fetch(
`http://localhost:5000/api/predict-revenue?house=${houseId}&months=${months}`,
{
headers:{
Authorization:`Bearer ${token}`
}
}
).then(r=>r.json()),

{
loading:"AI đang phân tích doanh thu...",
success:"Dự đoán doanh thu thành công",
error:"Không thể dự đoán doanh thu"
}

)

setInsight(data.insights || {})

const historyData = (data.history || []).map(i=>({

month:formatMonth(i),
history:formatRevenue(i),
prediction:null

}))

const predictData = (data.prediction || []).map(i=>({

month:formatMonth(i),
history:null,
prediction:formatRevenue(i)

}))

setChartData([...historyData,...predictData])

}catch(err){

console.error(err)

}finally{

setLoading(false)

}

}

return(

<div className="min-h-screen">

<div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

{/* HEADER */}

<div>

<h1 className="text-2xl font-bold text-slate-800">
Dự đoán doanh thu nhà trọ
</h1>

<p className="text-sm text-slate-500">
Phân tích AI và dự đoán doanh thu nhà trọ
</p>

</div>

{/* FILTER */}

<div className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition p-6">

<div className="grid grid-cols-3 gap-6 items-end">

{/* HOUSE */}

<div>

<label className="text-sm text-slate-500">
Nhà trọ
</label>

<select
value={houseId}
onChange={(e)=>setHouseId(e.target.value)}
className="w-full border rounded-lg px-3 py-2 mt-1 bg-white"
>

{houses.map(h=>(

<option key={h.id} value={h.id}>
{h.name}
</option>

))}

</select>

</div>

{/* MONTH */}

<div>

<label className="text-sm text-slate-500">
Khoảng dự đoán
</label>

<div className="flex gap-6 mt-2">

<label className="flex gap-2 items-center">

<input
type="radio"
checked={months===1}
onChange={()=>setMonths(1)}
/>

1 tháng

</label>

<label className="flex gap-2 items-center">

<input
type="radio"
checked={months===3}
onChange={()=>setMonths(3)}
/>

3 tháng

</label>

<label className="flex gap-2 items-center">

<input
type="radio"
checked={months===6}
onChange={()=>setMonths(6)}
/>

6 tháng

</label>

</div>

</div>

{/* BUTTON */}

<div className="flex justify-end">

<button
onClick={runPrediction}
disabled={loading}
className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition disabled:opacity-60"
>

<Brain size={16} />

{loading ? "AI đang phân tích..." : "Dự đoán"}

</button>

</div>

</div>

</div>

{/* AI INSIGHT */}

<div className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition p-6">

<div className="flex justify-between items-center">

<div className="flex items-center gap-2">

<TrendingUp className="text-indigo-600" size={20} />

<div>

<p className="text-sm text-slate-500">
AI Insight
</p>

<h2 className="text-lg font-semibold text-slate-800 mt-1">
Doanh thu tháng tới dự kiến tăng
</h2>

</div>

</div>

<div className="text-3xl font-bold text-indigo-600">

+{insight?.nextMonthGrowth || 0}%

</div>

</div>

</div>

{/* CHART */}

<div className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition p-6">

<h2 className="font-semibold text-slate-700 mb-4">
Biểu đồ doanh thu
</h2>

<ResponsiveContainer width="100%" height={420}>

<LineChart data={chartData}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="month"/>

<YAxis/>

<Tooltip formatter={(v)=>Number(v).toLocaleString()+" đ"}/>

<Legend/>

<Line
type="monotone"
dataKey="history"
name="Doanh thu thực tế"
stroke="#22c55e"
strokeWidth={3}
/>

<Line
type="monotone"
dataKey="prediction"
name="Dự đoán"
stroke="#6366f1"
strokeDasharray="6 6"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

</div>

</div>

</div>

)

}