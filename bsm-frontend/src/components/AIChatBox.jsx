import { useState, useRef, useEffect } from "react";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Send, Bot, User } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AIChatBox(){

  const [open,setOpen] = useState(false);

  const [messages,setMessages] = useState([
    {
      role:"assistant",
      content:"Xin chào 👋 Tôi có thể giúp gì cho bạn?",
      suggestions:[
        "Doanh thu tháng này",
        "Phòng nào chưa thanh toán",
        "Tổng số phòng đang thuê"
      ]
    }
  ]);

  const [input,setInput] = useState("");
  const [loading,setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(()=>{
    messagesEndRef.current?.scrollIntoView({behavior:"smooth"});
  },[messages]);

  const sendMessage = async (text)=>{

    const question = text || input;

    if(!question.trim()) return;

    const newMessages = [
      ...messages,
      { role:"user",content:question }
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try{

      const res = await fetch("http://localhost:5000/api/ai/chat",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          question,
          userId:user?.id
        })
      });

      const data = await res.json();

      const aiMessage = {
        role:"assistant",
        content:data.answer,
        type:data.type,
        labels:data.labels,
        values:data.values,
        suggestions:data.suggestions || []
      };

      setMessages([
        ...newMessages,
        aiMessage
      ]);

    }catch(err){

      setMessages([
        ...newMessages,
        { role:"assistant",content:"⚠️ AI server lỗi." }
      ]);

    }

    setLoading(false);

  };

  return(

    <>

      {/* OPEN BUTTON */}

      {!open && (
        <button
          onClick={()=>setOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition"
        >
          <Bot size={24}/>
        </button>
      )}

      {/* CHAT BOX */}

      {open && (

        <div className="fixed bottom-6 right-6 w-96 h-[540px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border">

          {/* HEADER */}

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 flex justify-between items-center">

            <div className="flex items-center gap-2">

              <div className="bg-white text-indigo-600 rounded-full p-1">
                <Bot size={18}/>
              </div>

              <div>
                <p className="font-semibold text-sm">AI Trợ Lý</p>
                <p className="text-xs opacity-80">BSM Management</p>
              </div>

            </div>

            <button
              onClick={()=>setOpen(false)}
              className="text-white text-lg"
            >
              ✕
            </button>

          </div>

          {/* MESSAGES */}

          <div className="flex-1 overflow-y-auto p-4 bg-slate-100 space-y-4">

            {messages.map((m,i)=>(

              <div
                key={i}
                className={`flex gap-2 ${
                  m.role==="user" ? "justify-end":"justify-start"
                }`}
              >

                {m.role==="assistant" && (
                  <div className="bg-indigo-600 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center">
                    <Bot size={16}/>
                  </div>
                )}

                <div
                  className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow ${
                    m.role==="user"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-white border rounded-bl-sm"
                  }`}
                >

                  {m.content}

                  {/* CHART */}

                  {m.type==="chart" && (

                    <div className="mt-3 bg-white p-3 rounded-lg">

                      <Bar
                        data={{
                          labels:m.labels,
                          datasets:[
                            {
                              label:"Doanh thu",
                              data:m.values,
                              backgroundColor:"rgba(99,102,241,0.7)"
                            }
                          ]
                        }}
                        options={{
                          responsive:true,
                          plugins:{
                            legend:{display:false}
                          }
                        }}
                      />

                    </div>

                  )}

                  {/* SUGGESTIONS IN MESSAGE */}

                  {m.suggestions && m.suggestions.length>0 && (

                    <div className="flex flex-wrap gap-2 mt-3">

                      {m.suggestions.map((s,index)=>(

                        <button
                          key={index}
                          onClick={()=>sendMessage(s)}
                          className="text-xs bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-3 py-1 rounded-full"
                        >
                          {s}
                        </button>

                      ))}

                    </div>

                  )}

                </div>

                {m.role==="user" && (
                  <div className="bg-gray-700 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center">
                    <User size={16}/>
                  </div>
                )}

              </div>

            ))}

            {loading && (
              <div className="text-xs text-gray-400 animate-pulse">
                AI đang suy nghĩ...
              </div>
            )}

            <div ref={messagesEndRef}/>

          </div>

          {/* INPUT */}

          <div className="border-t p-3 flex gap-2 bg-white">

            <input
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              placeholder="Hỏi AI..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
              onKeyDown={(e)=>{
                if(e.key==="Enter") sendMessage();
              }}
            />

            <button
              onClick={()=>sendMessage()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 rounded-lg flex items-center justify-center"
            >
              <Send size={18}/>
            </button>

          </div>

        </div>

      )}

    </>
  );

}