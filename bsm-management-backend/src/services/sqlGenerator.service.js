import Groq from "groq-sdk"
import dotenv from "dotenv"

dotenv.config()

const groq = new Groq({
  apiKey:process.env.GROQ_API_KEY
})

export async function generateSQL(question){

  const completion = await groq.chat.completions.create({

    model:"llama-3.3-70b-versatile",
    temperature:0,

    messages:[
      {
        role:"system",
        content:`

Bạn là AI tạo SQL Server query cho hệ thống quản lý nhà trọ.

DATABASE:

houses(id,name)
rooms(id,house_id,room_name,status,people_count)
tenant_rooms(room_id,tenant_id)
users(id,name,role)
invoices(id,room_id,tenant_id,month,total_amount,status)
payments(id,invoice_id,amount)

QUAN HỆ

rooms.house_id = houses.id
tenant_rooms.room_id = rooms.id
invoices.room_id = rooms.id

STATUS rooms
EMPTY
OCCUPIED

STATUS invoices
UNPAID
PAID

month format
YYYY-MM

RULE

chỉ trả SQL
không markdown
không giải thích

EXAMPLE

phòng trống
SELECT COUNT(*) FROM rooms WHERE status='EMPTY'

phòng đông người nhất
SELECT TOP 1 room_name, people_count FROM rooms ORDER BY people_count DESC

doanh thu từng nhà
SELECT h.name,SUM(i.total_amount)
FROM invoices i
JOIN rooms r ON i.room_id=r.id
JOIN houses h ON r.house_id=h.id
GROUP BY h.name

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