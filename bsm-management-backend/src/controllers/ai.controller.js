import { poolPromise } from "../config/db.js";
import { normalChat } from "../services/ai.service.js";
import { saveMessage } from "../services/chat.service.js";

export async function chatWithAI(req,res){

  try{

    const {message} = req.body;
    const msg = message.toLowerCase().trim();

    const userId = 1; // demo

    const pool = await poolPromise;

    /* SAVE USER MESSAGE */
    await saveMessage(userId,"user",message);

    /* GREETING */

    if(["hi","hello","xin chào"].includes(msg)){

      const reply="Xin chào 👋 Tôi là AI hỗ trợ quản lý nhà trọ.";

      await saveMessage(userId,"assistant",reply);

      return res.json({reply});

    }

    /* ===== ROOM COUNT ===== */

    if(msg.includes("phòng") && msg.includes("bao nhiêu")){

      const r = await pool.request()
      .query("SELECT COUNT(*) total FROM rooms");

      const reply=`Có ${r.recordset[0].total} phòng`;

      await saveMessage(userId,"assistant",reply);

      return res.json({reply});

    }

    /* ===== TENANT COUNT ===== */

    if(msg.includes("khách thuê")){

      const r = await pool.request()
      .query("SELECT COUNT(*) total FROM users WHERE role='TENANT'");

      const reply=`Có ${r.recordset[0].total} khách thuê`;

      await saveMessage(userId,"assistant",reply);

      return res.json({reply});

    }

    /* ===== UNPAID ROOMS ===== */

    if(msg.includes("chưa thanh toán")){

      const r = await pool.request().query(`
        SELECT rooms.room_name
        FROM rooms
        JOIN invoices ON rooms.id = invoices.room_id
        WHERE invoices.status = 'UNPAID'
      `);

      const rooms = r.recordset.map(x=>x.room_name).join(", ");

      const reply = rooms
        ? `Các phòng chưa thanh toán: ${rooms}`
        : "Không có phòng nào chưa thanh toán";

      await saveMessage(userId,"assistant",reply);

      return res.json({reply});

    }

    /* ===== REVENUE THIS MONTH ===== */

    if(msg.includes("doanh thu")){

      const r = await pool.request().query(`
        SELECT SUM(total_amount) revenue
        FROM invoices
        WHERE month = FORMAT(GETDATE(),'yyyy-MM')
      `);

      const revenue = r.recordset[0].revenue || 0;

      const reply=`Doanh thu tháng này: ${revenue}`;

      await saveMessage(userId,"assistant",reply);

      return res.json({reply});

    }

    /* ===== EMPTY ROOMS ===== */

    if(msg.includes("phòng trống")){

      const r = await pool.request().query(`
        SELECT room_name
        FROM rooms
        WHERE status = 'EMPTY'
      `);

      const rooms = r.recordset.map(x=>x.room_name).join(", ");

      const reply = rooms
        ? `Các phòng trống: ${rooms}`
        : "Hiện không có phòng trống";

      await saveMessage(userId,"assistant",reply);

      return res.json({reply});

    }
    if(question.includes("doanh thu tháng")){

      const result = await pool.request().query(`
        SELECT 
          MONTH(created_at) AS month,
          SUM(total_amount) AS revenue
        FROM invoices
        GROUP BY MONTH(created_at)
        ORDER BY month
      `)

      const labels = result.recordset.map(r=>"T"+r.month)
      const values = result.recordset.map(r=>r.revenue)

      return res.json({
        type:"chart",
        answer:"📊 Doanh thu theo tháng",
        labels,
        values
      })
    }
    /* ===== INVOICE COUNT ===== */

    if(msg.includes("hóa đơn")){

      const r = await pool.request()
      .query("SELECT COUNT(*) total FROM invoices");

      const reply=`Có ${r.recordset[0].total} hóa đơn`;

      await saveMessage(userId,"assistant",reply);

      return res.json({reply});

    }

    /* ===== FALLBACK AI ===== */

    const reply = await normalChat(message);

    await saveMessage(userId,"assistant",reply);

    res.json({reply});

  }
  catch(err){

    console.error(err);

    res.json({
      reply:"AI server lỗi"
    });

  }

}