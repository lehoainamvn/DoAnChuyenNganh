import { useEffect, useState, useRef } from "react";
import { socket } from "../../socket";

const API_URL = "http://localhost:5000/api";

export default function Messages() {

  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);

  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  /* AUTO SCROLL */

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [messages]);

  /* LOAD ROOMS */

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/messages/rooms`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    setRooms(data);
  }

  /* JOIN ROOM */

  useEffect(() => {

    if (!selectedRoom) return;

    socket.emit("join_room", selectedRoom.id);

    loadMessages();

  }, [selectedRoom]);

  /* LOAD HISTORY */

  async function loadMessages() {

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/messages/${selectedRoom.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    setMessages(data);
  }

  /* RECEIVE MESSAGE */

  useEffect(() => {

    function handleReceive(msg) {

      if (msg.room_id === selectedRoom?.id) {

        setMessages((prev) => [...prev, msg]);

      }

    }

    socket.on("receive_message", handleReceive);

    return () => socket.off("receive_message", handleReceive);

  }, [selectedRoom]);

  /* SEND MESSAGE */

  async function sendMessage() {

    if (!content.trim() || !selectedRoom) return;

    const token = localStorage.getItem("token");

    const payload = {
      room_id: selectedRoom.id,
      receiver_id: selectedRoom.tenant_id,
      content
    };

    /* lưu DB */

    await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    /* realtime */

    socket.emit("send_message", {
      ...payload,
      sender_id: user.id,
      created_at: new Date()
    });

    setContent("");

  }

  return (
    <div className="flex h-[650px] bg-white rounded-2xl shadow border overflow-hidden">

      {/* SIDEBAR */}

      <div className="w-80 border-r bg-slate-50">

        <div className="p-4 border-b font-semibold">
          Tin nhắn
        </div>

        {rooms.map(room => (

          <div
            key={room.id}
            onClick={() => setSelectedRoom(room)}
            className="p-4 border-b cursor-pointer hover:bg-slate-100"
          >

            <p className="font-medium">{room.tenant_name}</p>

            <p className="text-xs text-slate-500">
              Phòng {room.room_name}
            </p>

          </div>

        ))}

      </div>

      {/* CHAT */}

      <div className="flex-1 flex flex-col">

        {!selectedRoom && (
          <div className="flex items-center justify-center h-full text-slate-400">
            Chọn người để bắt đầu chat
          </div>
        )}

        {selectedRoom && (
          <>

            <div className="p-4 border-b font-semibold">
              {selectedRoom.tenant_name}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">

              {messages.map((msg, index) => (

                <div
                  key={index}
                  className={`max-w-[70%] p-3 rounded-xl
                    ${msg.sender_id === user.id
                      ? "ml-auto bg-indigo-600 text-white"
                      : "bg-slate-100"}
                  `}
                >

                  <p>{msg.content}</p>

                  <span className="text-xs opacity-70">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </span>

                </div>

              ))}

              <div ref={messagesEndRef} />

            </div>

            <div className="border-t p-4 flex gap-3">

              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 border rounded-xl px-4 py-2"
                placeholder="Nhập tin nhắn..."
              />

              <button
                onClick={sendMessage}
                className="bg-indigo-600 text-white px-6 rounded-xl"
              >
                Gửi
              </button>

            </div>

          </>
        )}

      </div>

    </div>
  );
}