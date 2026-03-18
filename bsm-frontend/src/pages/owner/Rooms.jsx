import { useEffect, useState, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import toast from "react-hot-toast"

import {
  BedDouble,
  Trash2,
  Wallet,
  Eye,
  Plus,
  Zap,
  Droplet
} from "lucide-react"

import { getRoomsByHouse, createRoom, deleteRoom } from "../../api/room.api"

const API_HOUSES = "http://localhost:5000/api/houses"
const PAGE_SIZE = 8

export default function Rooms(){

  const [houses,setHouses] = useState([])
  const [selectedHouseId,setSelectedHouseId] = useState(null)

  const [allRooms,setAllRooms] = useState([])
  const [visibleRooms,setVisibleRooms] = useState([])
  const [page,setPage] = useState(1)

  const [loading,setLoading] = useState(true)

  const navigate = useNavigate()
  const [searchParams,setSearchParams] = useSearchParams()

  const loaderRef = useRef(null)

  useEffect(()=>{

    const urlHouseId = searchParams.get("houseId")
    const savedHouseId = localStorage.getItem("selectedHouseId")

    if(urlHouseId){
      setSelectedHouseId(urlHouseId)
      localStorage.setItem("selectedHouseId",urlHouseId)
    }
    else if(savedHouseId){
      setSelectedHouseId(savedHouseId)
      setSearchParams({ houseId:savedHouseId })
    }

  },[])

  useEffect(()=>{

    async function fetchHouses(){

      const token = localStorage.getItem("token")

      const res = await fetch(API_HOUSES,{
        headers:{ Authorization:`Bearer ${token}` }
      })

      const data = await res.json()

      setHouses(data)

    }

    fetchHouses()

  },[])

  useEffect(()=>{

    if(!selectedHouseId) return

    async function fetchRooms(){

      setLoading(true)

      const data = await getRoomsByHouse(selectedHouseId)

      setAllRooms(data)
      setVisibleRooms(data.slice(0,PAGE_SIZE))
      setPage(1)

      setLoading(false)

    }

    fetchRooms()

  },[selectedHouseId])

  useEffect(()=>{

    if(!loaderRef.current) return

    const observer = new IntersectionObserver(
      entries=>{
        if(entries[0].isIntersecting){
          loadMore()
        }
      },
      { threshold:1 }
    )

    observer.observe(loaderRef.current)

    return ()=>observer.disconnect()

  },[visibleRooms,allRooms])

  function loadMore(){

    const nextPage = page + 1
    const nextRooms = allRooms.slice(0,nextPage * PAGE_SIZE)

    if(nextRooms.length !== visibleRooms.length){

      setVisibleRooms(nextRooms)
      setPage(nextPage)

    }

  }

  function handleChangeHouse(e){

    const id = e.target.value

    setSelectedHouseId(id)

    localStorage.setItem("selectedHouseId",id)

    setSearchParams({ houseId:id })

  }

  async function handleAddRoom(){

    if(!selectedHouseId) return alert("Vui lòng chọn nhà")

    const houseId = Number(selectedHouseId)

    try {

      await createRoom({
        house_id:houseId,
        room_name:`Phòng ${allRooms.length + 1}`,
        room_price:0,
        electric_price:0,
        water_price:0
      })

      const data = await getRoomsByHouse(houseId)

      setAllRooms(data)
      setVisibleRooms(data.slice(0,page * PAGE_SIZE))

      toast.success("Đã tạo phòng thành công")

    } catch (err) {

      toast.error(err.message || "Tạo phòng thất bại")

    }

  }

  async function handleDeleteRoom(id){

    if(!window.confirm("Xóa phòng này?")) return

    try {

      await deleteRoom(id)

      const data = await getRoomsByHouse(selectedHouseId)

      setAllRooms(data)
      setVisibleRooms(data.slice(0,page * PAGE_SIZE))

      toast.success("Đã xóa phòng thành công")

    } catch (err) {

      toast.error(err.message || "Xóa phòng thất bại")

    }

  }

  return(

    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-bold text-slate-800">
            Quản lý phòng
          </h1>

          <p className="text-sm text-slate-500">
            Chọn nhà để xem danh sách phòng
          </p>

        </div>

        <div className="flex gap-3">

          <select
            value={selectedHouseId || ""}
            onChange={handleChangeHouse}
            className="border rounded-lg px-4 py-2 text-sm bg-white"
          >

            <option value="" disabled>Chọn nhà</option>

            {houses.map(h=>(
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}

          </select>

          <button
            onClick={handleAddRoom}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >

            <Plus size={16}/>

            Thêm phòng

          </button>

        </div>

      </div>

      {/* ROOM LIST */}

      {!loading && (

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {visibleRooms.map(room=>(

            <div
              key={room.id}
              className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >

              {/* HEADER */}

              <div className="flex justify-between items-center mb-4">

                <div className="flex items-center gap-2 font-semibold">

                  <BedDouble size={18}/>

                  {room.room_name}

                </div>

                <span
                  className={`
                  text-xs px-3 py-1 rounded-full font-medium
                  ${
                    room.status === "OCCUPIED"
                    ? "bg-rose-100 text-rose-600"
                    : "bg-emerald-100 text-emerald-600"
                  }
                  `}
                >

                  {room.status === "OCCUPIED"
                    ? "Đã thuê"
                    : "Trống"}

                </span>

              </div>


              {/* PRICE GRID */}

              <div className="grid grid-cols-3 gap-3 mb-5 text-sm">

                <div className="bg-slate-50 rounded-lg p-3 text-center">

                  <Wallet className="mx-auto mb-1 text-indigo-600" size={16}/>

                  <p className="text-xs text-slate-500">Giá phòng</p>

                  <p className="font-semibold">
                    {room.room_price || 0} đ
                  </p>

                </div>

                <div className="bg-slate-50 rounded-lg p-3 text-center">

                  <Zap className="mx-auto mb-1 text-yellow-500" size={16}/>

                  <p className="text-xs text-slate-500">Điện</p>

                  <p className="font-semibold">
                    {room.electric_price || 0} đ
                  </p>

                </div>

                <div className="bg-slate-50 rounded-lg p-3 text-center">

                  <Droplet className="mx-auto mb-1 text-blue-500" size={16}/>

                  <p className="text-xs text-slate-500">Nước</p>

                  <p className="font-semibold">
                    {room.water_price || 0} đ
                  </p>

                </div>

              </div>


              {/* ACTIONS */}

              <div className="flex gap-2">

                <button
                  onClick={()=>navigate(`/rooms/${room.id}`)}
                  className="flex-1 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm"
                >

                  <Eye size={14}/>

                  Chi tiết

                </button>

                <button
                  onClick={()=>navigate("/room-bill",{ state:{ room } })}
                  className="flex-1 flex items-center justify-center gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 py-2 rounded-lg text-sm"
                >

                  Tính tiền

                </button>

                <button
                  onClick={()=>handleDeleteRoom(room.id)}
                  className="w-10 flex items-center justify-center bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-lg"
                >

                  <Trash2 size={16}/>

                </button>

              </div>

            </div>

          ))}

        </div>

      )}

      {visibleRooms.length < allRooms.length &&(

        <div ref={loaderRef} className="h-16 flex justify-center items-center">

          <span className="text-sm text-slate-400">
            Đang tải thêm...
          </span>

        </div>

      )}

    </div>

  )

}