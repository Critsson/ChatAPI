import React from "react"

interface props {
    message: string,
    from: string
}

export default function Message(props: props) {
    return (
        <div style={{width: "100%", minHeight: "2vw", fontSize: "1.6vw", fontFamily: "sans-serif", overflowWrap: "break-word"}}>
            {props.message}
            {props.from}
        </div>
    )
}