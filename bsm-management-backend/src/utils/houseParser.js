export function extractHouse(question, houses){

  const lower = question.toLowerCase()

  for(const house of houses){

    const name = house.name.toLowerCase()

    if(lower.includes(name)){
      return house.name
    }

  }

  return null
}