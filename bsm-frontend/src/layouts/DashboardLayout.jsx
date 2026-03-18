import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react"

import {
  LayoutDashboard,
  Home,
  DoorOpen,
  Users,
  Receipt,
  Zap,
  BarChart3,
  MessageSquare,
  Brain,
  Bell,
  Search,
  Menu,
  LogOut
} from "lucide-react"

import AIChatBox from "../components/AIChatBox"

export default function DashboardLayout(){

  const navigate = useNavigate()

  const userMenuRef = useRef(null)
  const notifyRef = useRef(null)

  const [sidebarOpen,setSidebarOpen] = useState(true)
  const [openUserMenu,setOpenUserMenu] = useState(false)
  const [openNotify,setOpenNotify] = useState(false)

  const [user,setUser] = useState({
    name:"Chủ trọ",
    email:"owner@thunam.local"
  })

  const notifications=[
    { id:1,text:"Phòng A101 yêu cầu sửa chữa"},
    { id:2,text:"Hóa đơn tháng này chưa thanh toán"},
    { id:3,text:"Khách B203 gửi tin nhắn"}
  ]

  useEffect(()=>{
    const savedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("profile"))

    if(savedUser){
      setUser({
        name:savedUser.name || "Chủ trọ",
        email:savedUser.email || ""
      })
    }
  },[])

  useEffect(()=>{
    function handleClickOutside(e){

      if(userMenuRef.current &&
         !userMenuRef.current.contains(e.target)){
        setOpenUserMenu(false)
      }

      if(notifyRef.current &&
         !notifyRef.current.contains(e.target)){
        setOpenNotify(false)
      }
    }

    document.addEventListener("mousedown",handleClickOutside)

    return ()=>{
      document.removeEventListener("mousedown",handleClickOutside)
    }

  },[])

  const handleLogout=()=>{
    localStorage.clear()
    navigate("/")
  }

  const menu=[
    {label:"Dashboard",path:"/home",icon:Home},
    {label:"Phòng trọ",path:"/rooms",icon:DoorOpen},
    {label:"Khách thuê",path:"/tenants",icon:Users},
    {label:"Hóa đơn",path:"/invoices",icon:Receipt},
    {label:"Điện nước",path:"/meters",icon:Zap},
    {label:"Thống kê",path:"/revenue",icon:BarChart3},
    {label:"Tin nhắn",path:"/messages",icon:MessageSquare},
    {label:"AI Prediction",path:"/prediction",icon:Brain}
  ]

  return(

    <div className="flex h-screen bg-slate-100">

      {/* SIDEBAR */}

      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r transition-all duration-300 flex flex-col`}
      >

        <div className="h-16 flex items-center justify-between px-5 border-b">

          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <LayoutDashboard size={20}/>
            {sidebarOpen && "BSM Manager"}
          </div>

          <button
            onClick={()=>setSidebarOpen(!sidebarOpen)}
            className="text-slate-500 hover:text-slate-800"
          >
            <Menu size={18}/>
          </button>

        </div>

        <nav className="flex-1 px-3 py-6 space-y-2">

          {menu.map((item)=>{

            const Icon=item.icon

            return(
              <NavLink
                key={item.path}
                to={item.path}
                className={({isActive})=>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600 font-medium"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >

                <Icon size={18}/>
                {sidebarOpen && item.label}

              </NavLink>
            )

          })}

        </nav>

        <div className="p-4 border-t">

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-xl text-sm font-medium"
          >
            <LogOut size={16}/>
            {sidebarOpen && "Đăng xuất"}
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <div className="flex-1 flex flex-col">

        {/* HEADER */}

        <header className="h-16 bg-white border-b flex items-center justify-between px-8">

          <div className="relative">

            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={18}
            />

            <input
              placeholder="Tìm kiếm..."
              className="pl-10 pr-4 py-2 w-72 bg-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />

          </div>

          <div className="flex items-center gap-4">

            {/* Notification */}

            <div className="relative" ref={notifyRef}>

              <button
                onClick={()=>setOpenNotify(!openNotify)}
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center relative"
              >

                <Bell size={18}/>

                {notifications.length>0 &&(
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                    {notifications.length}
                  </span>
                )}

              </button>

              {openNotify &&(

                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border">

                  <div className="px-4 py-3 font-semibold border-b">
                    Thông báo
                  </div>

                  {notifications.map(n=>(
                    <div
                      key={n.id}
                      className="px-4 py-3 hover:bg-slate-50 text-sm border-b"
                    >
                      {n.text}
                    </div>
                  ))}

                </div>

              )}

            </div>

            {/* USER */}

            <div className="relative" ref={userMenuRef}>

              <button
                onClick={()=>setOpenUserMenu(!openUserMenu)}
                className="flex items-center gap-3"
              >

                <div className="text-right text-sm hidden md:block">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-slate-400 text-xs">{user.email}</p>
                </div>

                <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>

              </button>

              {openUserMenu &&(

                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border">

                  <button
                    onClick={()=>navigate("/profile")}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm"
                  >
                    Chỉnh sửa thông tin
                  </button>

                  <button
                    onClick={()=>navigate("/change-password")}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm"
                  >
                    Đổi mật khẩu
                  </button>

                  <div className="border-t">

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 hover:bg-rose-50 text-rose-600 text-sm font-medium"
                    >
                      Đăng xuất
                    </button>

                  </div>

                </div>

              )}

            </div>

          </div>

        </header>

        {/* CONTENT */}

        <main className="flex-1 overflow-y-auto p-8">

          <div className="max-w-7xl mx-auto">
            <Outlet/>
          </div>

        </main>

      </div>

      <AIChatBox/>

    </div>
  )
}