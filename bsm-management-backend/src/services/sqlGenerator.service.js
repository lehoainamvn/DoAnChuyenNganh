import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

// Khởi tạo Groq (Đảm bảo chỉ import và khởi tạo 1 lần)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateSQL(question, userId) {
  // Lấy tháng hiện tại (VD: 2026-03) để AI tự biết lọc dữ liệu
  const currentMonth = new Date().toISOString().slice(0, 7); 

  const systemPrompt = `
Bạn là chuyên gia Microsoft SQL Server (T-SQL) cho hệ thống quản lý nhà trọ. 
Nhiệm vụ: Dịch câu hỏi của người dùng thành MỘT CÂU LỆNH T-SQL DUY NHẤT.

=====================
THÔNG TIN NGỮ CẢNH:
- ID của chủ trọ đang hỏi: ${userId}
- Tháng hiện tại: '${currentMonth}' (Định dạng YYYY-MM)

=====================
CẤU TRÚC DATABASE (BSM_Management):
1. users (id, name, email, phone, role) -> role có thể là 'OWNER' hoặc 'TENANT'
2. houses (id, owner_id, name, address, total_rooms)
3. rooms (id, house_id, owner_id, room_name, room_price, electric_price, status) 
   -> status: 'EMPTY' (Trống), 'OCCUPIED' (Đang thuê)
4. meter_readings (id, room_id, month, electric_old, electric_new, water_old, water_new)
5. invoices (id, room_id, tenant_id, month, room_price, electric_used, water_used, total_amount, status) 
   -> status: 'UNPAID' (chưa đóng), 'PAID' (đã đóng)
6. tenant_rooms (id, room_id, tenant_id, start_date, end_date)

MỐI QUAN HỆ CÁC BẢNG QUAN TRỌNG:
- rooms.house_id = houses.id
- meter_readings.room_id = rooms.id
- invoices.room_id = rooms.id
- invoices.tenant_id = users.id
- ĐỂ TÌM KHÁCH THUÊ: JOIN bảng users (đóng vai trò khách thuê) với tenant_rooms qua tenant_id, và JOIN tiếp với rooms qua room_id. (Ví dụ: u.id = tr.tenant_id AND tr.room_id = r.id). Khách đang ở hiện tại thì tenant_rooms.end_date IS NULL.

=====================
QUY TẮC BẮT BUỘC (NẾU VI PHẠM SẼ BỊ PHẠT):
1. LUÔN SỬ DỤNG T-SQL (SQL Server). KHÔNG BAO GIỜ dùng "LIMIT", để giới hạn kết quả phải dùng "SELECT TOP N ...".
2. BẢO MẬT: LUÔN bắt buộc có điều kiện "owner_id = ${userId}" ở các bảng có trường này (rooms, houses). Nếu query khách thuê (users) hoặc hóa đơn, meter_readings, LUÔN JOIN với rooms để đảm bảo r.owner_id = ${userId}.
3. Nếu người dùng hỏi về "tháng này" hoặc "hiện tại", hãy dùng WHERE month = '${currentMonth}'.
4. CHỈ xuất ra lệnh T-SQL thô, không giải thích, không dùng markdown (\`\`\`sql).
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0, // 0 để đảm bảo logic SQL luôn chính xác tuyệt đối
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question }
    ]
  });

  return completion.choices[0].message.content.trim();
}