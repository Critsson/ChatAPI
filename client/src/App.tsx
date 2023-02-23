import { useState, useEffect } from 'react'
import './App.css'
import { io } from 'socket.io-client'
import Message from "../components/Message"

function App() {

  const [input, setInput] = useState<string>("")
  const [messages, setMessages] = useState<JSX.Element[]>([])
  const [socket, setSocket] = useState<any>(null)

  useEffect(() => {
    if(socket) {
      socket.on("receive-message", (input: string, id: string) => {
        setMessages((prevState) => {
  
          const placeholder = [...prevState]
          placeholder.push(<Message key={input} message={input} from={id} />)
  
          return placeholder
        })
      })
    }
    if (!socket) {
      setSocket(io("http://localhost:3000"))
    }
  }, [socket])

  const submitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const messageElement = <Message key={input} message={input} from={socket.id} />
    setMessages((prevState) => {

      const placeholder = [...prevState]
      placeholder.push(messageElement)

      return placeholder
    })
    socket.emit("send-message", input, socket.id)
    setInput("")
  }


  return (
    <div className="main-container">
      <div className="chat-window">
        {
          messages
        }
      </div>
      <form className="input-form" onSubmit={(e) => submitMessage(e)}>
        <input type="text" className="text-input" value={input} onChange={(e) => setInput(e.target.value)} />
        <input type="submit" className="submit-button" />
      </form>
    </div>
  )
}

export default App
