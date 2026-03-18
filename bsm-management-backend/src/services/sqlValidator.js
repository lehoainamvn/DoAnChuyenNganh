export function validateSQL(sql){

  const allowedTables = [
    "users",
    "houses",
    "rooms",
    "tenant_rooms",
    "invoices",
    "payments"
  ]

  const lowerSQL = sql.toLowerCase()

  const hasValidTable = allowedTables.some(t => lowerSQL.includes(t))

  if(!hasValidTable){
    throw new Error("SQL table không hợp lệ")
  }

  if(lowerSQL.includes("drop") || lowerSQL.includes("delete")){
    throw new Error("SQL nguy hiểm")
  }

  return sql

}