import { spawn } from "child_process"
import path from "path"

export function predictRevenue(data,months){

  return new Promise((resolve,reject)=>{

    const script = path.join(process.cwd(),"src","ml","predict_revenue.py")

    const py = spawn("py",[script])

    let output=""

    py.stdin.write(JSON.stringify({
      data,
      months
    }))

    py.stdin.end()

    py.stdout.on("data",(d)=>{
      output += d.toString()
    })

    py.stderr.on("data",(d)=>{
      console.warn(d.toString())
    })

    py.on("close",()=>{

      try{
        resolve(JSON.parse(output))
      }catch{
        reject("ML parse error")
      }

    })

  })

}