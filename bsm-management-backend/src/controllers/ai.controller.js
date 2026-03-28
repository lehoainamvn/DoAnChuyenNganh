import { poolPromise } from "../config/db.js";
import { generateSQL, generateHumanResponse } from "../services/ai.service.js";
import { saveMessage } from "../services/chat.service.js";

export async function chatWithAI(req, res) {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ reply: "Vui lòng nhập câu hỏi." });

    const msg = question.toLowerCase().trim();
    const userId = req.user.id; 
    const pool = await poolPromise;

    await saveMessage(userId, "user", question);

    // 1. Kiểm tra Rule-base cho những câu chào hỏi cơ bản (để tiết kiệm API gọi AI)
    if (["hi", "hello", "xin chào", "chào bạn"].includes(msg)) {
      const reply = "Xin chào 👋 Tôi là trợ lý AI thông minh của bạn. Tôi có thể giúp bạn phân tích doanh thu, tìm phòng trống hoặc kiểm tra ai đang nợ tiền phòng. Bạn cần xem thông tin gì?";
      await saveMessage(userId, "assistant", reply);
      return res.json({ reply });
    }

    // 2. NHƯỜNG PHẦN CÒN LẠI CHO AI XỬ LÝ (Text-to-SQL)
    // AI sẽ sinh ra câu SQL tương ứng với câu hỏi
    const generatedQuery = await generateSQL(question, userId);
    
    // Bảo mật sơ cấp: Đảm bảo AI chỉ dùng lệnh SELECT, không phá Database
    if (!generatedQuery.toUpperCase().startsWith("SELECT")) {
        console.error("Lỗi AI sinh SQL nguy hiểm:", generatedQuery);
        const reply = "Xin lỗi, tôi chưa hiểu rõ ý bạn hoặc yêu cầu này ngoài khả năng truy xuất của tôi.";
        return res.json({ reply });
    }

    console.log("AI Generated SQL:", generatedQuery); // Log ra để bạn debug xem AI viết SQL đúng không

    // 3. Thực thi câu SQL
    const result = await pool.request().query(generatedQuery);
    const dbData = result.recordset;

    // 4. Nếu không có dữ liệu
    if (!dbData || dbData.length === 0) {
      const reply = "Hệ thống không tìm thấy dữ liệu nào phù hợp với yêu cầu của bạn hiện tại.";
      await saveMessage(userId, "assistant", reply);
      return res.json({ reply });
    }

    // 5. Đưa dữ liệu thô (JSON) lại cho AI để nó soạn câu trả lời "đọc được"
    const aiAnswer = await generateHumanResponse(question, dbData);

    await saveMessage(userId, "assistant", aiAnswer);
    return res.json({ reply: aiAnswer });

  } catch (err) {
    console.error("Lỗi Controller Chat AI:", err);
    res.json({
      reply: "⚠️ Đã xảy ra lỗi trong quá trình phân tích dữ liệu. Vui lòng thử lại với cách diễn đạt khác!"
    });
  }
}