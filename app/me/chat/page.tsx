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
  const [invChatList, setInvChatList] = useState([[{}]]) as unknown as Array<Messages>
  const [serverList, setServerList] = useState([[{}]]) as unknown as Array<ServList>
  const [serverData, setServerData] = useState([[{}]]) as unknown as Array<Array<ServData>>

  //const [serverID, setServerID] = useState("f291a9a9-10aa-4057-acdc-7e036d7111ac")
  const [serverID, setServerID] = useState("36d2abfa-2d13-48f9-b701-78e355c89f21")

  const [currentUser, setCurrentUser] = useState("11a27520-5222-4005-951d-61ffd7119cd4") // hardcoded user id LMFATHO

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
  }, [serverID, updateCounter])

  useEffect(() => {
    //@ts-expect-error because we can in fact call the function
    setInvChatList(chatList.toReversed())
    console.log(serverData, serverList, chatList)
  }, [serverData && chatList])

  
  function handleServerSwitch() {
    setServerID((document.getElementById("serverSelect") as unknown as HTMLSelectElement)!.value)
  }

  // sends the message
  function handleEnterPress() {
    console.warn("yo in fact something is pressed")
    const messageToSend = (document.getElementById("yourMSG") as unknown as HTMLInputElement)!.value
    console.log(messageToSend)
    if(messageToSend == null || messageToSend == "" || messageToSend == " ") {
      console.warn("do not send empty messages!")
    }
    else {
      fetch('http://localhost:3000/api/messages/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "sender_id": currentUser,
          "server_id": serverID,
          "message": messageToSend
        })
      })
        .then((response) => response.json())
        .then((responseJson) => {
          (document.getElementById("yourMSG") as unknown as HTMLInputElement).value = ""
          console.log(responseJson)
          setUpdateCounter(updateCounter + 1)
        })
    }
  }

  // ------------------------------------ < RENDERING SHENANIGANS > ------------------------------------

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
    width: "62.5vw",
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

  return (
    <>
      <div style={window}>
        <div style={sidedivL}>
          <div style={scrolldivB}>
            <div style={{fontSize: "28px"}}>{serverData[0].name}</div>
            <div>by {serverData[0].created_by}</div>
            <hr style={{borderWidth: "1vh", borderColor: "black"}}/>
            <div style={{overflow: "auto", scrollBehavior: "smooth", display: "flex", flexDirection: "column-reverse"}}>
              {invChatList.map((message, key)=>(
                <div key={key}>
                  <div style={{marginLeft: "3%"}}>
                    {message.username}
                  </div>
                  <div style={{backgroundColor: "darkgray", borderRadius: "8px", marginLeft: "2%", marginRight: "2%", marginBottom: "1.5%"}}>
                    <p style={{marginLeft: "2%", marginRight: "2%"}}>
                      {message.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <hr style={{borderWidth: "1vh", borderColor: "black"}}/>
          <div style={scrolldivS}>
            <div style={{display: "flex", justifyContent: "space-around"}}>
              <textarea id="yourMSG" rows={2} maxLength={512} autoFocus style={{
                marginLeft: "2%",
                marginRight: "0px",
                width: "86%",
                borderRadius: "8px",
                resize: "inherit",
              }} placeholder="Your message here . . ." defaultValue={""}/>
              <button style={{marginLeft: "10px", marginRight: "2%", backgroundColor: "rgb(60, 60, 60)", borderRadius: "8px", width: "12%"}} onClick={()=>handleEnterPress()}>
                ⏎
              </button>
            </div>
            <div style={{marginLeft: "3%"}}>server list:</div>
            {/* <select name="serverSelect" id="serverSelect" onChange={() => handleServerSwitch()} style={{marginLeft: "2%", marginRight: "2%"}} >
              <option value={serverData[0].id}>Server selection</option>
              {serverList.map((server, key)=>(
                <option key={key} value={server.id}>{server.name}</option>
              ))}
            </select> */}
            <hr />
            <div style={{display: "flex", flexDirection: "row", overflowX: "auto"}}>
              {serverList.map((server, key)=>(
                <div key={key} style={{marginLeft: "8px", marginRight: "8px", marginBottom: "2%"}}>
                  <button style={{backgroundColor: "rgb(60, 60, 60)"}} onClick={()=>setServerID(server.id)}>{server.name}</button>
                </div>
              ))}
            </div>
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
