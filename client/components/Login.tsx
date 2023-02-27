import React from 'react'
import "./Login.css"

const Login = () => {

    const [userPass, setUserPass] = React.useState<{username: string, password: string}>({username: "", password: ""})

    return (
        <div style ={{width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1vw"}}>
            <h1 style={{fontFamily:"sans-serif", color: "grey", opacity: "80%", fontSize: "3vw"}}>Login</h1>
            <form>
                <input onChange={(e) => setUserPass((prev) => {
                    return {username: e.target.value, password: prev.password}
                })} type="text" placeholder='Username' style={{height: "2.5vw", width: "100%", fontSize: "1.5vw", outline: "none"}} value={userPass.username}/>
                <input onChange={(e) => setUserPass((prev) => {
                    return {username: prev.username, password: e.target.value}
                })} type="password" placeholder="Password" style={{height: "2.5vw", width: "100%", fontSize: "1.5vw", outline: "none"}} value={userPass.password}/>
                <input type="submit" style={{height: "2.5vw", width: "50%", fontSize: "1.3vw", fontWeight: "500"}} value="Enter"/>
            </form>
        </div>
    )
}

export default Login