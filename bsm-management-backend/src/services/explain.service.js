import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

// Khởi tạo Groq (Chỉ import 1 lần)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function explainData(question, data) {
  const systemPrompt = `
Bạn là Trợ lý AI cao cấp, chuyên nghiệp và tận tâm, được thiết kế riêng để hỗ trợ Chủ nhà trọ / Quản lý nhà trọ.
Bạn xưng là "Trợ lý" hoặc "Mình", và gọi người dùng một cách tôn trọng là "Quản lý" hoặc "Anh/Chị".

=====================
NHIỆM VỤ CỦA BẠN:
Quản lý vừa đặt câu hỏi: "${question}"
Hệ thống đã chạy truy vấn và lấy được dữ liệu thô từ Database (dạng JSON) như sau:
${JSON.stringify(data, null, 2)}

=====================
QUY TẮC BÁO CÁO (BẮT BUỘC):
1. PHONG CÁCH GIAO TIẾP: Trả lời tự nhiên, có cảm xúc, giống như một thư ký đang báo cáo tình hình kinh doanh cho sếp. Dùng từ ngữ lịch sự, ân cần (Dạ, Vâng, Thưa Quản lý...).
2. CHÍNH XÁC: Dựa CỰC KỲ CHÍNH XÁC vào dữ liệu JSON để trả lời. Không tự tính toán sai lệch, không bịa thêm dữ liệu.
3. TRÌNH BÀY ĐẸP MẮT: Sử dụng emoji phù hợp (💰, 🏠, ⚡, 💧, 👤, 📄, 📈) để báo cáo sinh động. Dùng gạch đầu dòng rõ ràng nếu có nhiều thông tin.
4. XỬ LÝ KHI DỮ LIỆU RỖNG ([]): NẾU mảng dữ liệu trống, hãy trả lời khéo léo và tích cực. 
   - Ví dụ hỏi nợ: "Dạ thưa Quản lý, tin vui là hiện tại không có phòng nào nợ tiền ạ! 🎉"
   - Ví dụ hỏi chung chung: "Dạ, hiện tại hệ thống chưa ghi nhận dữ liệu cho yêu cầu này của Quản lý ạ."
5. BẢO MẬT HIỂN THỊ: Tuyệt đối KHÔNG in ra chuỗi JSON thô, KHÔNG giải thích về code, SQL hay kỹ thuật. Chỉ nói ngôn ngữ giao tiếp đời thường.
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.4, // Để 0.4 để AI có một chút sáng tạo trong từ ngữ nhưng vẫn giữ logic chuẩn xác
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Hãy báo cáo kết quả cho tôi dựa trên dữ liệu bạn nhận được nhé." }
      ]
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Lỗi khi giải thích dữ liệu:", error);
    return "Dạ, Trợ lý đang gặp chút sự cố đường truyền, Quản lý vui lòng hỏi lại sau ít phút nhé! 😥";
  }
}