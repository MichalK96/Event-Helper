import React, {useEffect, useRef, useState} from 'react'
import {over} from 'stompjs';
import SockJS from 'sockjs-client';
import "../css/ChatRoom.css";
import authSerivce from "../auth.serivce";

let stompClient =null;
const ChatRoom = (props) => {
    const isLoggedIn = authSerivce.getCurrentUser();
    let userDetails = authSerivce.parseJwt(isLoggedIn.value);
    const eventId = props.eventId;
    const [privateChats, setPrivateChats] = useState(new Map());
    const [publicChats, setPublicChats] = useState([]);
    const [tab,setTab] =useState("CHATROOM");
    const [userData, setUserData] = useState({
        username: userDetails.sub,
        receivername: '',
        connected: false,
        message: ''
    });
    const messagesEndRef = useRef();
    useEffect(() => {
        console.log(userData);
    }, [userData]);

    useEffect(()=>{
        connect()
    },[]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior:"smooth"})
    }, [publicChats]);


    const connect =()=>{
        let Sock = new SockJS('http://localhost:8080/ws');
        stompClient = over(Sock);
        stompClient.connect({},onConnected, onError);
    }

    const onConnected = () => {
        let userDeatils = authSerivce.parseJwt(isLoggedIn.value);
        console.log('JESTEM TI')
        setUserData({...userData,"connected": true});
        stompClient.subscribe('/chatroom/public', onMessageReceived);
        stompClient.subscribe('/user/'+props.eventId+'/private', onPrivateMessage);
        console.log(privateChats);
        userJoin();
    }

    const userJoin=()=>{
        let chatMessage = {
            senderName: userData.username,
            status:"JOIN"
        };
        stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
    }

    const onMessageReceived = (payload)=>{
        let payloadData = JSON.parse(payload.body);
        console.log(payload);
        console.log("DUPKA")
        switch(payloadData.status){
            case "JOIN":
                if(!privateChats.get(eventId)){
                    privateChats.set(eventId,[]);
                    setPrivateChats(new Map(privateChats));
                }
                break;
            case "MESSAGE":
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
                break;
        }
    }

    const onPrivateMessage = (payload)=>{
        console.log("foweofjweofjweofjweofjowefjowefjwefj");
        console.log(payload);
        let payloadData = JSON.parse(payload.body);
        if(privateChats.get(payloadData.senderName)){
            privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(new Map(privateChats));
        }else{
            let list =[];
            list.push(payloadData);
            privateChats.set(payloadData.senderName,list);
            setPrivateChats(new Map(privateChats));
        }
    }

    const onError = (err) => {
        console.log(err);

    }

    const handleMessage =(event)=>{
        const {value}=event.target;
        setUserData({...userData,"message": value});
    }
    const sendValue=()=>{
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                message: userData.message,
                status:"MESSAGE"
            };
            console.log(chatMessage);
            stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
            setUserData({...userData,"message": ""});
        }
    }

    const sendPrivateValue=()=>{
        if (stompClient) {
            let chatMessage = {
                senderName: userData.username,
                receiverName:tab,
                message: userData.message,
                status:"MESSAGE"
            };

            if(userData.username !== tab){
                privateChats.get(tab).push(chatMessage);
                setPrivateChats(new Map(privateChats));
            }
            stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
            setUserData({...userData,"message": ""});
        }
    }

    // const handleUsername=(event)=>{
    //     const {value}=event.target;
    //     setUserData({...userData,"username": value});
    // }




    const registerUser=()=>{
        let userDetails;

        userDetails = authSerivce.parseJwt(isLoggedIn.value)
        console.log(userDetails.sub);
        setUserData({...userData,"username": userDetails.sub});
        console.log(userData.username);
        connect();
    }
    return (
        <div className="container">
            {isLoggedIn?
                <div className="chat-box">
                    <div className="chat-content">
                        <div className="member-list">
                            <ul>
                                <li onClick={()=>{setTab("CHATROOM")}} className={`member ${tab==="CHATROOM" && "active"}`}>Chatroom</li>
                                {[...privateChats.keys()].map((name,index)=>(
                                    <li onClick={()=>{setTab(name)}} className={`member ${tab===name && "active"}`} key={index}>{name}</li>
                                ))}
                            </ul>
                        </div>
                        <ul className="chat-messages" id="chat-messages">
                            {publicChats.map((chat,index)=>(
                                <li ref={messagesEndRef} className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                    <div className="message-data">{chat.message}</div>
                                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                </li>
                            ))}
                        </ul>

                        <div className="send-message">
                            <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} />
                            <button type="button" className="send-button" onClick={sendPrivateValue}>send</button>
                        </div>
                    </div>
                </div>
                :
                <div className="register">
                </div>}
        </div>
    )
}


export default ChatRoom