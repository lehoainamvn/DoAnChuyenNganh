import Groq from "groq-sdk"
import dotenv from "dotenv"

dotenv.config()

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function explainData(question, data) {

  const completion = await groq.chat.completions.create({

    model: "llama-3.3-70b-versatile",

    messages: [
      {
        role: "system",
        content: `
Bạn là AI trợ lý quản lý nhà trọ.

Nhiệm vụ:
- giải thích dữ liệu database
- trả lời dễ hiểu
- trả lời chi tiết nhưng ngắn gọn
`
      },
      {
        role: "user",
        content: `
Câu hỏi:
${question}

Dữ liệu:
${JSON.stringify(data)}

Hãy trả lời cho người quản lý nhà trọ.
`
      }
    ]
  })

  return completion.choices[0].message.content
}