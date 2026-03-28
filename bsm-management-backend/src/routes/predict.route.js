import express from "express";
import { poolPromise } from "../config/db.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const houseId = req.query.house;
    const months = parseInt(req.query.months) || 3;
    const simOccupancy = req.query.simOccupancy || 90; // Lấy từ React gửi lên

    if (!houseId) {
      return res.status(400).json({ error: "Vui lòng cung cấp ID nhà trọ" });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input("houseId", houseId)
      .query(`
        SELECT 
          i.month,
          SUM(i.total_amount) as revenue
        FROM invoices i
        JOIN rooms r ON i.room_id = r.id
        WHERE r.house_id = @houseId
        GROUP BY i.month
        ORDER BY i.month ASC
      `);

    const dbData = result.recordset;

    // Gói dữ liệu đầy đủ gửi sang Python
    const payload = JSON.stringify({
      data: dbData,
      months: months,
      simOccupancy: simOccupancy 
    });

    const scriptPath = path.join(__dirname, "../ml/predict_revenue.py"); 
    
    // CHỈ GỌI SPAWN 1 LẦN DUY NHẤT
    const pythonProcess = spawn("py", [scriptPath]);

    let stdoutData = "";
    let stderrData = "";

    pythonProcess.stdout.on("data", (chunk) => {
      stdoutData += chunk.toString();
    });

    pythonProcess.stderr.on("data", (chunk) => {
      stderrData += chunk.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("Python Crash Error:", stderrData);
        return res.status(500).json({ error: "Lỗi chạy mô hình AI" });
      }
      try {
        const parsedData = JSON.parse(stdoutData);
        return res.json(parsedData); 
      } catch (err) {
        console.error("Lỗi parse JSON:", stdoutData);
        return res.status(500).json({ error: "Lỗi định dạng dữ liệu AI" });
      }
    });

    // Gửi dữ liệu vào Python và kết thúc luồng ghi
    pythonProcess.stdin.write(payload);
    pythonProcess.stdin.end();

  } catch (err) {
    console.error("Dự đoán doanh thu lỗi:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

export default router;