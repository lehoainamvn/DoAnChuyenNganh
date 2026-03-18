import express from "express"
import { poolPromise } from "../config/db.js"

import { detectIntent } from "../services/intent.service.js"
import { generateSQL } from "../services/sqlGenerator.service.js"
import { explainData } from "../services/explain.service.js"

import { validateSQL } from "../utils/sqlValidator.js"
import { normalizeQuestion } from "../utils/questionParser.js"
import { formatResult } from "../utils/resultFormatter.js"
import { extractHouse } from "../utils/houseParser.js"

const router = express.Router()

router.post("/chat", async (req,res)=>{

  try{

    let { question,userId } = req.body

    question = normalizeQuestion(question)

    console.log("Question:",question)

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

    let intent = await detectIntent(question)

    intent = intent.toUpperCase()

    if(intent.includes("CHAT")) intent="CHAT"
    if(intent.includes("DATABASE")) intent="DATABASE"

    console.log("Intent:",intent)

    /* ============================ */
    /* CHAT NORMAL */
    /* ============================ */

    if(intent==="CHAT"){

      const answer = await explainData(question,[])

      /* SAVE AI MESSAGE */

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

    /* ============================ */
    /* GET LIST HOUSES */
    /* ============================ */

    const housesResult = await pool.request().query("SELECT name FROM houses")

    const houses = housesResult.recordset

    const houseName = extractHouse(question, houses)

    console.log("House:",houseName)

    /* ============================ */
    /* DOANH THU */
    /* ============================ */

    if(question.includes("doanh thu")){

      const isTotal =
        question.includes("tổng") ||
        question.includes("toàn") ||
        question.includes("tất cả") ||
        question.includes("hết")

      if(isTotal){

        const result = await pool.request().query(`
          SELECT SUM(total_amount) AS revenue FROM invoices
        `)

        const value = result.recordset[0].revenue || 0

        const answer = `💰 Tổng doanh thu của tất cả nhà trọ là ${value.toLocaleString()} đồng`

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

      if(houseName){

        const result = await pool.request()
          .input("house",houseName)
          .query(`
            SELECT SUM(i.total_amount) AS revenue
            FROM invoices i
            JOIN rooms r ON i.room_id=r.id
            JOIN houses h ON r.house_id=h.id
            WHERE h.name=@house
          `)

        const value = result.recordset[0].revenue || 0

        const answer = `💰 Doanh thu của nhà trọ ${houseName} là ${value.toLocaleString()} đồng`

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

    /* ============================ */
    /* GENERATE SQL */
    /* ============================ */

    let sqlQuery = await generateSQL(question)

    sqlQuery = sqlQuery
      .replace(/```sql/g,"")
      .replace(/```/g,"")
      .trim()

    console.log("SQL:",sqlQuery)

    sqlQuery = validateSQL(sqlQuery)

    const result = await pool.request().query(sqlQuery)

    const data = result.recordset

    if(!data || data.length===0){

      const answer = "Không có dữ liệu."

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

    /* ============================ */
    /* FORMAT RESULT */
    /* ============================ */

    const formatted = formatResult(question,sqlQuery,data)

    const explain = await explainData(question,data)

    const answer = formatted + "\n\n" + explain

    /* SAVE AI MESSAGE */

    await pool.request()
      .input("user",userId)
      .input("role","assistant")
      .input("msg",answer)
      .query(`
        INSERT INTO ChatMessages(user_id,role,message)
        VALUES(@user,@role,@msg)
      `)

    res.json({answer})

  }
  catch(err){

    console.error("AI ERROR:",err)

    res.status(500).json({
      answer:"AI server đang lỗi."
    })

  }

})

export default router