import express from "express";
import { poolPromise } from "../config/db.js";
import { detectIntent } from "../services/intent.service.js";
import { generateSQL } from "../services/sqlGenerator.service.js";
import { explainData } from "../services/explain.service.js";
import { validateSQL } from "../utils/sqlValidator.js";
import { normalizeQuestion } from "../utils/questionParser.js";
import { formatResult } from "../utils/resultFormatter.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Hàm tiện ích: Lưu tin nhắn vào DB để đỡ phải lặp lại code nhiều lần
async function saveChatMessage(pool, userId, role, msg) {
  await pool.request()
    .input("user", userId)
    .input("role", role)
    .input("msg", msg)
    .query(`
      INSERT INTO ChatMessages(user_id, role, message)
      VALUES(@user, @role, @msg)
    `);
}

router.post("/chat", verifyToken, async (req, res) => {
  try {
    let { question } = req.body;
    const userId = req.user.id; 
    question = normalizeQuestion(question);

    console.log("User Question:", question);

    const pool = await poolPromise;

    /* ===== 1. LƯU TIN NHẮN CỦA USER ===== */
    await saveChatMessage(pool, userId, "user", question);

    /* ===== 2. RULE-BASE: THÔNG TIN CÁ NHÂN ===== */
    // Chỉ bắt khi user hỏi chính xác những câu này, tránh dính chữ "tôi" ngẫu nhiên
    const personalQuestions = [
      "tôi tên gì", 
      "thông tin của tôi", 
      "thông tin cá nhân", 
      "số điện thoại của tôi", 
      "email của tôi",
      "tôi là ai"
    ];

    if (personalQuestions.includes(question.toLowerCase())) {
      const result = await pool.request()
        .input("id", userId)
        .query(`SELECT name, email, phone FROM users WHERE id = @id`);

      const user = result.recordset[0];
      const answer = `👤 Tên: ${user.name}\n📧 Email: ${user.email}\n📱 SĐT: ${user.phone}`;

      await saveChatMessage(pool, userId, "assistant", answer);
      return res.json({ answer });
    }

    /* ===== 3. PHÂN LOẠI Ý ĐỊNH (INTENT) ===== */
    let intent = await detectIntent(question);
    intent = intent.toUpperCase();
    if (intent.includes("CHAT")) intent = "CHAT";
    if (intent.includes("DATABASE")) intent = "DATABASE";

    console.log("Detected Intent:", intent);

    /* ===== 4. XỬ LÝ CHAT BÌNH THƯỜNG (KHÔNG CẦN TRUY VẤN DB) ===== */
    if (intent === "CHAT") {
      const answer = await explainData(question, []); 
      await saveChatMessage(pool, userId, "assistant", answer);
      return res.json({ answer });
    }

    /* ===== 5. XỬ LÝ NGHIỆP VỤ BẰNG AI (TEXT-TO-SQL) ===== */
    let sqlQuery = await generateSQL(question, userId);

    // Chuẩn hóa chuỗi SQL AI trả về
    sqlQuery = sqlQuery.replace(/```sql/g, "").replace(/```/g, "").trim();
    console.log("AI Generated SQL:", sqlQuery);

    // Kiểm tra tính an toàn của SQL
    sqlQuery = validateSQL(sqlQuery);

    // Thực thi câu lệnh Database
    const result = await pool.request().query(sqlQuery);
    const data = result.recordset;

    /* ===== 6. AI GIẢI THÍCH DỮ LIỆU ĐỌC ĐƯỢC ===== */
    // Cho AI xử lý 'data' luôn, kể cả khi mảng rỗng [] 
    const explain = await explainData(question, data); 
    
    const answer = explain; 

    /* LƯU AI MESSAGE VÀ TRẢ VỀ */
    await saveChatMessage(pool, userId, "assistant", answer);
    return res.json({ answer });

  } catch (err) {
    console.error("AI ROUTE ERROR:", err);
    res.status(500).json({ answer: "⚠️ Trợ lý AI đang gặp sự cố hoặc câu hỏi quá phức tạp. Vui lòng thử lại sau." });
  }
});

export default router;