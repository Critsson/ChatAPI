const express = require("express")
const app = express()
const cors = require("cors")
const {createServer} = require("http")

const httpServer = createServer(app)

app.use(cors())

//get a todo
app.get("/", async (req, res) => {
    try {
        res.json("This is a test")
    } catch (err) {
        console.error(err)
    }

})

httpServer.listen(5000, () => {
    console.log("Listening on port 5000...")
})