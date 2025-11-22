"use client"

import { CSSProperties, useEffect, useState } from "react";

export default function Page() {

  type Message = {
    deleted_at: null
    edited_at: null
    id: number
    message: string
    sender_id: string
    sent_on: string
    server_id: string
    username: string
  }

  type ServData = {
    id: string
    name: string
    image_url: null
    created_by: string
    created_at: string
  }

  const [chatList, setChatList] = useState([[{}]]) as unknown as Array<Array<Message>>
  const [serverData, setServerData] = useState([[{}]]) as unknown as Array<Array<ServData>>

  useEffect(() => {
    fetch('http://localhost:3000/api/messages')
      .then(response => response.json())
      .then(response => setChatList(response.data))
  }, [])

  useEffect(() => {
    fetch('http://localhost:3000/api/servers/f291a9a9-10aa-4057-acdc-7e036d7111ac') //hardcoded lmfaogffs
      .then(response => response.json())
      .then(response => setServerData(response))
  }, [])

  useEffect(()=>{
    console.log(chatList)
    console.warn(serverData)
  },[chatList, serverData])
  

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
    justifyContent: "start",
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
            <div>server name {serverData[0].name}</div>
            <hr style={{borderWidth: "1vh", borderColor: "black"}}/>
            {chatList.map((message, key)=>(
                <div key={key}>
                  <hr />
                  sent by {message.username} at {message.sent_on}
                  <div style={{backgroundColor: "darkgray"}}>{message.message}</div>
                  <hr />
                </div>
            ))}
          </div>
          <hr style={{borderWidth: "1vh", borderColor: "black"}}/>
          <div style={scrolldivS}>
            there is only this server
          </div>
        </div>
        <div style={sidedivR}>
          <div style={scrolldivS}>
            you are the only user
          </div>
          <hr style={{borderWidth: "1vh", borderColor: "black"}}/>
          <div style={scrolldivB}>
            you have no friends
          </div>
        </div>
      </div>
    </>
  );
}
