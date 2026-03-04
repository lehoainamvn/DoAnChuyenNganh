import { useEffect, useState, useRef } from "react";
import { socket } from "../../socket";

const API_URL = "http://localhost:5000/api";

export default function TenantContact() {

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const roomId = 1;
  const ownerId = 1;

  const bottomRef = useRef(null);

  useEffect(() => {
    socket.emit("join_room", roomId);
    loadMessages();
  }, []);

  async function loadMessages() {

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/messages/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    setMessages(data);
  }

  useEffect(() => {

    function handleReceive(msg) {
      if (msg.room_id === roomId) {
        setMessages((prev) => [...prev, msg]);
      }
    }

    socket.on("receive_message", handleReceive);

    return () => socket.off("receive_message", handleReceive);

  }, []);

  // auto scroll xuống tin nhắn mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {

    if (!content.trim()) return;

    const token = localStorage.getItem("token");

    const payload = {
      room_id: roomId,
      receiver_id: ownerId,
      content
    };

    await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    socket.emit("send_message", {
      ...payload,
      sender_id: user.id,
      created_at: new Date()
    });

    setContent("");
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow border">

      <div className="flex-1 overflow-y-auto p-6 space-y-3">

        {messages.map(msg => (
          <div
            key={msg.id || Math.random()}
            className={`p-3 rounded-xl max-w-[70%]
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

        <div ref={bottomRef}></div>

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

    </div>
  );
}