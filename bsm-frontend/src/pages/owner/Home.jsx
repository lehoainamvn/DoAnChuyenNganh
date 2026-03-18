import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Pencil, Trash2, Home as HomeIcon } from "lucide-react"

import CreateHouseModal from "../../components/modals/CreateHouseModal"

const API_URL = "http://localhost:5000/api/houses"

export default function Home(){

  const [houses,setHouses] = useState([])
  const [loading,setLoading] = useState(true)

  const [showModal,setShowModal] = useState(false)
  const [editingHouse,setEditingHouse] = useState(null)

  const navigate = useNavigate()

  useEffect(()=>{
    fetchMyHouses()
  },[])

  async function fetchMyHouses(){

    try{

      const token = localStorage.getItem("token")

      const res = await fetch(API_URL,{
        headers:{ Authorization:`Bearer ${token}` }
      })

      const data = await res.json()

      setHouses(data)

    } catch (err) {
      console.error(err)
      toast.error("Không tải được danh sách nhà trọ")
    } finally {
      setLoading(false)
    }

  }

  function isDuplicateHouse(name, address, excludeId) {
    const normalized = (str) => (str || "").trim().toLowerCase();
    const nameNorm = normalized(name);
    const addressNorm = normalized(address);

    return houses.some((h) => {
      if (excludeId && h.id === excludeId) return false;
      if (nameNorm && normalized(h.name) === nameNorm) return true;
      if (addressNorm && normalized(h.address) === addressNorm) return true;
      return false;
    });
  }

  async function handleDeleteHouse(houseId){

    if(!window.confirm("Bạn có chắc muốn xóa nhà trọ này?")) return

    try{

      const token = localStorage.getItem("token")

      await fetch(`${API_URL}/${houseId}`,{
        method:"DELETE",
        headers:{ Authorization:`Bearer ${token}` }
      })

      toast.success("Xóa nhà trọ thành công")
      fetchMyHouses()

    } catch (err) {
      toast.error(err.message || "Xóa nhà thất bại")
    }

  }

  if(loading){

    return(

      <div className="flex justify-center items-center h-[60vh]">

        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600"/>

      </div>

    )

  }

  return(

    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-bold text-slate-800">
            Nhà trọ của bạn
          </h1>

          <p className="text-sm text-slate-500">
            Quản lý danh sách nhà trọ và phòng
          </p>

        </div>

        <button
          onClick={()=>{
            setEditingHouse(null)
            setShowModal(true)
          }}
          className="
          bg-indigo-600
          hover:bg-indigo-700
          text-white
          px-5
          py-2.5
          rounded-lg
          text-sm
          font-semibold
          shadow-sm
          "
        >
          + Thêm nhà trọ
        </button>

      </div>


      {/* EMPTY */}

      {houses.length === 0 &&(

        <div className="bg-white border rounded-2xl p-12 text-center shadow-sm">

          <HomeIcon className="mx-auto mb-4 text-slate-400" size={40}/>

          <h2 className="text-lg font-semibold mb-2">
            Chưa có nhà trọ
          </h2>

          <p className="text-slate-500 mb-6">
            Tạo nhà trọ đầu tiên để bắt đầu quản lý
          </p>

          <button
            onClick={()=>setShowModal(true)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold"
          >
            + Tạo nhà trọ
          </button>

        </div>

      )}


      {/* LIST */}

      {houses.length > 0 &&(

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {houses.map((house)=>{

            const percent =
              house.total_rooms > 0
                ? Math.round((house.created_rooms / house.total_rooms) * 100)
                : 0

            return(

              <div
                key={house.id}
                className="
                relative
                bg-white
                border
                rounded-2xl
                p-6
                shadow-sm
                hover:shadow-md
                transition
                "
              >

                {/* ACTIONS */}

                <div className="absolute right-4 top-4 flex gap-2">

                  <button
                    onClick={()=>{
                      setEditingHouse(house)
                      setShowModal(true)
                    }}
                    className="
                    w-8
                    h-8
                    flex
                    items-center
                    justify-center
                    rounded-md
                    bg-slate-100
                    hover:bg-slate-200
                    "
                  >

                    <Pencil size={14}/>

                  </button>

                  <button
                    onClick={()=>handleDeleteHouse(house.id)}
                    className="
                    w-8
                    h-8
                    flex
                    items-center
                    justify-center
                    rounded-md
                    bg-rose-100
                    text-rose-600
                    hover:bg-rose-200
                    "
                  >

                    <Trash2 size={14}/>

                  </button>

                </div>


                {/* TITLE */}

                <h3 className="font-semibold text-slate-800 mb-1">

                  {house.name}

                </h3>

                <p className="text-sm text-slate-500 mb-6">

                  {house.address}

                </p>


                {/* PROGRESS */}

                <div className="mb-5">

                  <div className="flex justify-between text-xs text-slate-500 mb-1">

                    <span>Phòng</span>

                    <span>

                      {house.created_rooms}/{house.total_rooms}

                    </span>

                  </div>

                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-indigo-600"
                      style={{ width:`${percent}%` }}
                    />

                  </div>

                </div>


                {/* FOOTER */}

                <div className="flex items-center justify-between">

                  <span
                    className={`
                    text-xs
                    px-3
                    py-1
                    rounded-full
                    font-medium
                    ${
                      percent === 100
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-indigo-100 text-indigo-600"
                    }
                    `}
                  >

                    {percent === 100 ? "Đủ phòng" : "Đang thêm"}

                  </span>

                  <button
                    onClick={()=>navigate(`/rooms?houseId=${house.id}`)}
                    className="
                    text-indigo-600
                    text-sm
                    font-semibold
                    hover:underline
                    "
                  >

                    Quản lý →

                  </button>

                </div>

              </div>

            )

          })}

        </div>

      )}


      {/* MODAL */}

      {showModal && (
        <CreateHouseModal
          house={editingHouse}
          existingHouses={houses}
          excludeId={editingHouse?.id}
          onClose={() => {
            setShowModal(false)
            setEditingHouse(null)
          }}
          onSuccess={() => {
            setShowModal(false)
            setEditingHouse(null)
            fetchMyHouses()
            toast.success(
              editingHouse ? "Cập nhật nhà trọ thành công" : "Tạo nhà trọ thành công"
            )
          }}
        />
      )}

    </div>

  )

}