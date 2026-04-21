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
    const simOccupancy = req.query.simOccupancy || 90;

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

    const payload = JSON.stringify({
      data: dbData,
      months,
      simOccupancy
    });

    const scriptPath = path.join(__dirname, "../ml/predict_revenue.py");

    // ✅ FIX QUAN TRỌNG: Linux dùng python3
    const pythonCmd = process.platform === "win32" ? "py" : "python3";

    const pythonProcess = spawn(pythonCmd, [scriptPath], {
      stdio: ["pipe", "pipe", "pipe"] // QUAN TRỌNG để tránh lỗi hidden
    });

    let stdoutData = "";
    let stderrData = "";

    pythonProcess.stdout.on("data", (chunk) => {
      stdoutData += chunk.toString();
    });

    pythonProcess.stderr.on("data", (chunk) => {
      stderrData += chunk.toString();
    });

    // ✅ tránh crash backend
    pythonProcess.on("error", (err) => {
      console.error("Spawn error:", err);
      return res.status(500).json({
        error: "Không chạy được Python",
        detail: err.message
      });
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("Python error:", stderrData);
        return res.status(500).json({
          error: "Lỗi chạy mô hình AI",
          detail: stderrData
        });
      }

      try {
        const parsed = JSON.parse(stdoutData);
        return res.json(parsed);
      } catch (err) {
        console.error("Parse JSON error:", stdoutData);
        return res.status(500).json({
          error: "Python trả về dữ liệu không hợp lệ"
        });
      }
    });

    // gửi data sang Python
    pythonProcess.stdin.write(payload);
    pythonProcess.stdin.end();

  } catch (err) {
    console.error("Dự đoán doanh thu lỗi:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

export default router;