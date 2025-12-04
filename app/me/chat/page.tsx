"use client"

import { CSSProperties, useEffect, useState } from "react";

export default function Page() {

  type Messages = [
    message:{
      deleted_at: null
      edited_at: null
      id: number
      message: string
      sender_id: string
      sent_on: string
      server_id: string
      username: string
    }
  ]

  type ServList = [
    server: {
      id: string
      name: string
      image_url: null
      created_by: string
      created_at: string
    }
  ]

  type ServData = {
    id: string
    name: string
    image_url: null
    created_by: string
    created_at: string
  }

  const [chatList, setChatList] = useState([[{}]]) as unknown as Array<Messages>
  const [serverList, setServerList] = useState([[{}]]) as unknown as Array<ServList>
  const [serverData, setServerData] = useState([[{}]]) as unknown as Array<Array<ServData>>

  //const [serverID, setServerID] = useState("f291a9a9-10aa-4057-acdc-7e036d7111ac")
  const [serverID, setServerID] = useState("36d2abfa-2d13-48f9-b701-78e355c89f21")

  const [updateCounter, setUpdateCounter] = useState(0)

  useEffect(() => {
    fetch('http://localhost:3000/api/messages/' + serverID)
      .then(response => response.json())
      //@ts-expect-error because we can in fact call the function
      .then(response => setChatList(response.data)) 

    fetch('http://localhost:3000/api/servers')
      .then(response => response.json())
      //@ts-expect-error because we can in fact call the function
      .then(response => setServerList(response))

    fetch('http://localhost:3000/api/servers/' + serverID)
      .then(response => response.json())
      //@ts-expect-error because we can in fact call the function
      .then(response => setServerData(response))
  }, [serverID])

  useEffect(() => {
    setUpdateCounter(updateCounter + 1)
    console.warn(updateCounter)
    console.log(serverData, serverList, chatList)
  }, [serverData && chatList])
  

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
    width: "60vw",
  } as CSSProperties

  const sidedivR = {
    display: "flex",
    justifyContent: "space-around",
    flexDirection: "column",
    backgroundColor: "gray",
    width: "35vw",
  } as CSSProperties

  const scrolldivB = {
    display: "flex",
    justifyContent: "start",
    flexDirection: "column",
    backgroundColor: "gray",
    height: "70vh",
  } as CSSProperties

  const scrolldivS = {
    display: "flex",
    justifyContent: "space-around",
    flexDirection: "column",
    backgroundColor: "gray",
    height: "20vh",
  } as CSSProperties
  
  function handleServerSwitch() {
    setServerID((document.getElementById("serverSelect") as unknown as HTMLSelectElement)!.value)
  }

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
                  sent by {message.username} at {message.sent_on}
                  <div style={{backgroundColor: "darkgray", borderRadius: "8px", marginLeft: "3%", marginRight: "3%"}}><p style={{marginLeft: "3%", marginRight: "3%"}}>{message.message}</p></div>
                </div>
            ))}
          </div>
          <hr style={{borderWidth: "1vh", borderColor: "black"}}/>
          <div style={scrolldivS}>
            <div>server list</div>
            <select name="serverSelect" id="serverSelect" onChange={() => handleServerSwitch()} style={{marginLeft: "3%", marginRight: "3%"}} >
              <option value={serverData[0].id}>Server selection</option>
              {serverList.map((server, key)=>(
                <option key={key} value={server.id}>{server.name}</option>
              ))}
            </select>
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
