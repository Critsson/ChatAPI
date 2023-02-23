const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors")

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173"]
    }
});

app.use(cors())

app.get("/test", (req, res) => {
    res.json({"Message": "Hello!"})
})

io.on("connection", (socket) => {
    socket.on("send-message", (input, id) => {
        console.log(input)
        socket.broadcast.emit("receive-message", input, id)
    })
});

httpServer.listen(3000, () => {
    console.log("Listening on port 3000...")
});