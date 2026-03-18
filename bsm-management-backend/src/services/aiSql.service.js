import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function generateSQL(question){

  const completion = await groq.chat.completions.create({

    model:"llama-3.3-70b-versatile",
    temperature:0,

    messages:[
      {
        role:"system",
        content:`

Bạn là AI chuyên tạo SQL Server query cho hệ thống quản lý phòng trọ.

DATABASE SCHEMA

users(id,name,role)
houses(id,name,address)
rooms(id,house_id,room_name,status,people_count)
tenant_rooms(id,room_id,tenant_id)
meter_readings(id,room_id,month,electric_old,electric_new,water_old,water_new)
invoices(id,room_id,tenant_id,month,total_amount,status)
payments(id,invoice_id,amount)

STATUS ROOMS
EMPTY = phòng trống
OCCUPIED = phòng có người

STATUS INVOICES
UNPAID = chưa thanh toán
PAID = đã thanh toán

MONTH FORMAT
YYYY-MM

QUY TẮC

- chỉ trả SQL
- không markdown
- không giải thích
- luôn dùng SELECT TOP 50

CÁC LOẠI CÂU HỎI

số lượng phòng trống
SELECT COUNT(*) AS empty_rooms FROM rooms WHERE status='EMPTY'

số lượng phòng có người
SELECT COUNT(*) FROM rooms WHERE status='OCCUPIED'

số lượng khách thuê
SELECT COUNT(*) FROM users WHERE role='TENANT'

tổng doanh thu
SELECT SUM(total_amount) FROM invoices

doanh thu tháng 2026-02
SELECT SUM(total_amount) FROM invoices WHERE month='2026-02'

tổng hóa đơn chưa thanh toán
SELECT SUM(total_amount) FROM invoices WHERE status='UNPAID'

số lượng hóa đơn chưa thanh toán
SELECT COUNT(*) FROM invoices WHERE status='UNPAID'

phòng nào có nhiều người
SELECT TOP 5 room_name,people_count FROM rooms ORDER BY people_count DESC

`
      },
      {
        role:"user",
        content:question
      }
    ]
  })

  return completion.choices[0].message.content.trim()

}