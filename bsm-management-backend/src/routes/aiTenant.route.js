import express from "express"
import { poolPromise } from "../config/db.js"
import { askGroq } from "../services/groq.service.js"

const router = express.Router()

router.post("/chat", async (req,res)=>{

  try{

    const { question,userId } = req.body
    const q = question.toLowerCase().trim()

    const pool = await poolPromise

    /* ===== SAVE USER MESSAGE ===== */

    await pool.request()
      .input("user",userId)
      .input("role","user")
      .input("msg",question)
      .query(`
        INSERT INTO ChatMessages(user_id,role,message)
        VALUES(@user,@role,@msg)
      `)

    const databaseKeywords = [
      "phòng",
      "hóa đơn",
      "nợ",
      "điện",
      "nước",
      "chủ trọ",
      "nhà trọ",
      "thông tin cá nhân"
    ]

    const isDatabase = databaseKeywords.some(k => q.includes(k))

    if(isDatabase){

      /* ===== PHÒNG ===== */

      if(q.includes("phòng")){

        const result = await pool.request()
        .input("tenantId",userId)
        .query(`
          SELECT r.room_name,h.name AS house,h.address
          FROM tenant_rooms tr
          JOIN rooms r ON tr.room_id=r.id
          JOIN houses h ON r.house_id=h.id
          WHERE tr.tenant_id=@tenantId
        `)

        const room = result.recordset[0]

        const answer = `🏠 Phòng của bạn

Phòng: ${room.room_name}
Nhà trọ: ${room.house}
Địa chỉ: ${room.address}`

        await pool.request()
          .input("user",userId)
          .input("role","assistant")
          .input("msg",answer)
          .query(`
            INSERT INTO ChatMessages(user_id,role,message)
            VALUES(@user,@role,@msg)
          `)

        return res.json({answer})
      }

      /* ===== HÓA ĐƠN ===== */

      if(q.includes("hóa đơn")){

        const result = await pool.request()
        .input("tenantId",userId)
        .query(`
          SELECT TOP 1 month,total_amount,status
          FROM invoices
          WHERE tenant_id=@tenantId
          ORDER BY month DESC
        `)

        const invoice = result.recordset[0]

        const answer = `📄 Hóa đơn tháng ${invoice.month}

💰 Tổng tiền: ${invoice.total_amount.toLocaleString()} đ
📌 Trạng thái: ${invoice.status}`

        await pool.request()
          .input("user",userId)
          .input("role","assistant")
          .input("msg",answer)
          .query(`
            INSERT INTO ChatMessages(user_id,role,message)
            VALUES(@user,@role,@msg)
          `)

        return res.json({answer})
      }

      /* ===== ĐIỆN NƯỚC ===== */

      if(q.includes("điện") || q.includes("nước")){

        const result = await pool.request()
        .input("tenantId",userId)
        .query(`
          SELECT TOP 1
          m.month,
          m.electric_old,
          m.electric_new,
          m.water_old,
          m.water_new
          FROM meter_readings m
          JOIN rooms r ON m.room_id=r.id
          JOIN tenant_rooms tr ON r.id=tr.room_id
          WHERE tr.tenant_id=@tenantId
          ORDER BY m.month DESC
        `)

        const meter = result.recordset[0]

        const electric = meter.electric_new - meter.electric_old
        const water = meter.water_new - meter.water_old

        const answer = `⚡ Điện nước tháng ${meter.month}

Điện: ${electric} kWh
Nước: ${water} m³`

        await pool.request()
          .input("user",userId)
          .input("role","assistant")
          .input("msg",answer)
          .query(`
            INSERT INTO ChatMessages(user_id,role,message)
            VALUES(@user,@role,@msg)
          `)

        return res.json({answer})
      }

      /* ===== THÔNG TIN CÁ NHÂN ===== */

      if(q.includes("thông tin cá nhân")){

        const result = await pool.request()
        .input("id",userId)
        .query(`
          SELECT name,email,phone
          FROM users
          WHERE id=@id
        `)

        const u = result.recordset[0]

        const answer = `👤 Thông tin của bạn

Tên: ${u.name}
Email: ${u.email}
SĐT: ${u.phone}`

        await pool.request()
          .input("user",userId)
          .input("role","assistant")
          .input("msg",answer)
          .query(`
            INSERT INTO ChatMessages(user_id,role,message)
            VALUES(@user,@role,@msg)
          `)

        return res.json({answer})
      }

    }

    /* ===== CHAT AI NORMAL ===== */

    const prompt = `
Bạn là trợ lý AI thân thiện cho người thuê nhà trọ.

Nếu câu hỏi không liên quan dữ liệu hệ thống,
hãy trò chuyện bình thường.

Câu hỏi:
${question}
`

    const answer = await askGroq(prompt)

    await pool.request()
      .input("user",userId)
      .input("role","assistant")
      .input("msg",answer)
      .query(`
        INSERT INTO ChatMessages(user_id,role,message)
        VALUES(@user,@role,@msg)
      `)

    return res.json({answer})

  }
  catch(err){

    console.error(err)

    res.status(500).json({
      answer:"AI server lỗi."
    })

  }

})

export default router