import express from "express"
import { poolPromise } from "../config/db.js"
import { predictRevenue } from "../services/ml.service.js"
import { generateInsight } from "../services/aiInsight.service.js"

const router = express.Router()

router.get("/predict-revenue", async (req,res)=>{

  try{

    const months = Number(req.query.months) || 3

    const pool = await poolPromise

    const result = await pool.request().query(`
      SELECT
      FORMAT(created_at,'yyyy-MM') month,
      SUM(total_amount) revenue
      FROM invoices
      GROUP BY FORMAT(created_at,'yyyy-MM')
      ORDER BY month
    `)

    const history = result.recordset

    const pred = await predictRevenue(history,months)

    const lastDate = new Date(history[history.length-1].month+"-01")

    const prediction = pred.map((v,i)=>{

      const d = new Date(lastDate)

      d.setMonth(d.getMonth()+i+1)

      return{
        month:d.toISOString().slice(0,7),
        revenue:Math.round(v)
      }

    })

    const insights = generateInsight(history,prediction)

    res.json({
      history,
      prediction,
      insights
    })

  }catch(err){

    console.error(err)

    res.status(500).json({
      error:"predict error"
    })

  }

})

export default router