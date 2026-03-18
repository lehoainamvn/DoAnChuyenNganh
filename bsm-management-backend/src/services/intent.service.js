import Groq from "groq-sdk"
import dotenv from "dotenv"

dotenv.config()

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function detectIntent(question){

  const completion = await groq.chat.completions.create({

    model:"llama-3.3-70b-versatile",
    temperature:0,

    messages:[
      {
        role:"system",
        content:`
Phân loại câu hỏi.

Chỉ trả 1 trong 2:

CHAT
DATABASE

CHAT:
hello
xin chào
bạn là ai
tôi buồn

DATABASE:
doanh thu
phòng trống
hóa đơn
khách thuê
thanh toán
điện
nước
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