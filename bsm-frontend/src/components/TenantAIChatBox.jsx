import { useState, useRef, useEffect } from "react"
import { Bot, User, Send } from "lucide-react"

export default function TenantAIChatBox(){

  const [open,setOpen] = useState(false)

  const [messages,setMessages] = useState([
    {
      role:"assistant",
      content:"Xin chào 👋 Tôi hỗ trợ thông tin phòng của bạn.",
      suggestions:[
        "Hóa đơn tháng này",
        "Tiền điện tháng này",
        "Thông tin cá nhân"
      ]
    }
  ])

  const [input,setInput] = useState("")
  const [loading,setLoading] = useState(false)

  const messagesEndRef = useRef(null)

  const user = JSON.parse(localStorage.getItem("user"))

  useEffect(()=>{
    messagesEndRef.current?.scrollIntoView({behavior:"smooth"})
  },[messages])

  const sendMessage = async (text)=>{

    const message = text || input
    if(!message) return

    const newMessages=[
      ...messages,
      { role:"user",content:message }
    ]

    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try{

      const res = await fetch("http://localhost:5000/api/ai-tenant/chat",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          question:message,
          userId:user.id
        })
      })

      const data = await res.json()

      setMessages([
        ...newMessages,
        {
          role:"assistant",
          content:data.answer,
          suggestions:data.suggestions || []
        }
      ])

    }catch{

      setMessages([
        ...newMessages,
        { role:"assistant",content:"⚠️ AI server lỗi." }
      ])

    }

    setLoading(false)

  }

  return(

    <>

      {/* OPEN BUTTON */}

      {!open && (

        <button
          onClick={()=>setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition"
        >
          <Bot size={24}/>
        </button>

      )}

      {/* CHAT BOX */}

      {open && (

        <div className="fixed bottom-6 right-6 w-96 h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

          {/* HEADER */}

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 flex justify-between items-center">

            <div className="flex items-center gap-2">

              <Bot size={18}/>

              <div>
                <p className="font-semibold text-sm">AI Hỗ Trợ</p>
                <p className="text-xs opacity-80">Thông tin phòng của bạn</p>
              </div>

            </div>

            <button onClick={()=>setOpen(false)}>✕</button>

          </div>

          {/* MESSAGES */}

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">

            {messages.map((m,i)=>(

              <div
                key={i}
                className={`flex ${
                  m.role==="user" ? "justify-end":"justify-start"
                }`}
              >

                <div className="flex gap-2 max-w-[75%]">

                  {m.role==="assistant" && (

                    <div className="bg-indigo-600 text-white w-8 h-8 flex items-center justify-center rounded-full">
                      <Bot size={14}/>
                    </div>

                  )}

                  <div
                    className={`px-4 py-2 text-sm rounded-xl shadow ${
                      m.role==="user"
                      ? "bg-indigo-600 text-white"
                      : "bg-white border"
                    }`}
                  >

                    {m.content}

                    {/* SUGGESTIONS */}

                    {m.suggestions && m.suggestions.length>0 && (

                      <div className="flex flex-wrap gap-2 mt-3">

                        {m.suggestions.map((s,index)=>(

                          <button
                            key={index}
                            onClick={()=>sendMessage(s)}
                            className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-full"
                          >
                            {s}
                          </button>

                        ))}

                      </div>

                    )}

                  </div>

                  {m.role==="user" && (

                    <div className="bg-gray-700 text-white w-8 h-8 flex items-center justify-center rounded-full">
                      <User size={14}/>
                    </div>

                  )}

                </div>

              </div>

            ))}

            {/* TYPING */}

            {loading && (

              <div className="flex gap-1">

                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>

              </div>

            )}

            <div ref={messagesEndRef}/>

          </div>

          {/* INPUT */}

          <div className="border-t p-3 flex gap-2">

            <input
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              placeholder="Hỏi AI..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none"
              onKeyDown={(e)=>{
                if(e.key==="Enter") sendMessage()
              }}
            />

            <button
              onClick={()=>sendMessage()}
              className="bg-indigo-600 text-white px-3 rounded-lg flex items-center justify-center"
            >
              <Send size={18}/>
            </button>

          </div>

        </div>

      )}

    </>

  )

}