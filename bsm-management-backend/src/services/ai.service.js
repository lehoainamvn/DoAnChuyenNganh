import axios from "axios";

const GEMINI_URL =
"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-001:generateContent";

export async function normalChat(message){

  try{

    const res = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_KEY}`,
      {
        contents:[
          {
            role:"user",
            parts:[
              {
                text:`Bạn là trợ lý AI của hệ thống quản lý nhà trọ.

Trả lời ngắn gọn bằng tiếng Việt.

User: ${message}`
              }
            ]
          }
        ]
      }
    );

    return res.data.candidates?.[0]?.content?.parts?.[0]?.text
      || "AI không trả lời";

  }
  catch(err){

    console.error("Gemini error:",err.response?.data || err.message);

    return "AI đang bận, thử lại sau.";

  }

}