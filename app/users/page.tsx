"use client"
import { useEffect, useState } from "react"

function page() {
  const [users, setUsers] = useState([])

  async function getMessage() {
    const response = await fetch("/api/users", {
      method: "GET",
    })
    if (!response.ok) {
      throw new Error("Network response was not ok")
    }
    const data = await response.json()
    console.log(data.message) // "Hello World"
    return data
  }

  useEffect(() => {
    getMessage()
  }, [])

  return <></>
}

export default page
