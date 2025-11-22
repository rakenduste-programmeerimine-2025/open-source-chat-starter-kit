"use client"

import { CSSProperties, useEffect, useState } from "react";

export default function Page() {


  const [chatList, setChatList] = useState([[{}]])
    
  useEffect(() => {
    fetch('http://localhost:3000/api/messages')
      .then(response => response.json())
      .then(response => setChatList(response.data))
  }, [])

  useEffect(()=>{
    console.log(chatList)
  },[chatList])
  

  const window = {
    display: "flex",
    justifyContent: "space-around",
    flexDirection: "row",
  } as CSSProperties

  const sidedivL = {
    display: "flex",
    justifyContent: "space-around",
    flexDirection: "column",
    backgroundColor: "gray",
    width: "60vw"
  } as CSSProperties

  const sidedivR = {
    display: "flex",
    justifyContent: "space-around",
    flexDirection: "column",
    backgroundColor: "gray",
    width: "35vw"
  } as CSSProperties

  const scrolldivB = {
    display: "flex",
    justifyContent: "space-around",
    flexDirection: "column",
    backgroundColor: "gray",
    height: "70vh"
  } as CSSProperties

  const scrolldivS = {
    display: "flex",
    justifyContent: "space-around",
    flexDirection: "column",
    backgroundColor: "gray",
    height: "20vh"
  } as CSSProperties
  

  return (
    <>
      <div style={window}>
        <div style={sidedivL}>
          <div style={scrolldivB}>
            this is a chat box
            {chatList.map((message, key)=>(
                <div key={key}>{message.message}</div>
            ))}
          </div>
          <hr style={{borderWidth: "1vh"}}/>
          <div style={scrolldivS}>
            this is your servers
          </div>
        </div>
        <div style={sidedivR}>
          <div style={scrolldivS}>
            this is your profile
          </div>
          <hr style={{borderWidth: "1vh"}}/>
          <div style={scrolldivB}>
            this is your friends
          </div>
        </div>
      </div>
    </>
  );
}
