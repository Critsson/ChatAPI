const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const bcrypt = require("bcrypt")
const cors = require("cors")
const { MongoClient, ServerApiVersion } = require("mongodb")
require("dotenv").config({ path: "./.env.local" })
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@chatcluster.2n7cumj.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const saltRounds = 12;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173"]
    }
});


app.use(cors({ credentials: true }))
app.use(cookieParser())
app.use(express.json())

//Middleware that verifies a JSON web token
const verifyJwt = async (req, res, next) => {
    const token = req.cookies.jwt

    if (!token) {
        return res.status(401).send({ message: "No token" })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Not authorized" })
        }
        req.user = decoded
    })

    next()

}

//Register user to database
app.post("/register", async (req, res) => {
    const { username, password } = req.body

    try {
        const generatedSalt = await bcrypt.genSalt(saltRounds)
        var hashedPass = await bcrypt.hash(password, generatedSalt)
    } catch (error) {
        console.error(error)
        res.status(500).send("Error hashing password")
    }

    try {
        await client.connect()
        const database = client.db("ChatApp")
        const users = database.collection("Users")

        const userDocument = {
            "username": username,
            "password": hashedPass,
            "chats": []
        }

        const p = await users.insertOne(userDocument)
        const token = jwt.sign({ id: p.insertedId, username }, process.env.JWT_SECRET, {
            expiresIn: "24h"
        })
        res.cookie("jwt", token, { maxAge: 86400000, httpOnly: true })
        return res.status(200).send("User successfully registered")
    } catch (error) {
        console.error(error)
        if (error.code === 11000) {
            res.status(500).send("Username already exists")
        } else {
            res.status(500).send("Failed to register to database")
        }
    } finally {
        await client.close()
    }
})


//Login user
app.post("/login", async (req, res) => {
    const { username, password } = req.body

    try {
        await client.connect()
        const database = client.db("ChatApp")
        const users = database.collection("Users")

        const user = await users.findOne({ username })
        if (user) {
            const isValidPass = await bcrypt.compare(password, user.password)
            if (isValidPass) {
                const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET, {
                    expiresIn: "24h"
                })
                res.cookie("jwt", token, { maxAge: 86400000, httpOnly: true })
                res.status(200).send("Authenticated")
            } else {
                res.status(500).send("Incorrect password")
            }
        } else {
            res.status(500).send("User does not exist")
        }
    } catch (error) {
        console.error(error)
        res.status(500).send("Failed to authenticate user")
    } finally {
        await client.close()
    }
})

//Get all users
app.get("/api/users", async (req, res) => {
    try {
        await client.connect()
        const database = client.db("ChatApp")
        const users = database.collection("Users")

        const allUsers = await users.find().toArray()
        res.status(200).send(allUsers)
    } catch (error) {
        console.error(error)
        res.status(500).send("Failed to get all users")
    } finally {
        await client.close()
    }
})

//Get one user
app.get("/api/users/:username", async (req, res) => {
    try {
        await client.connect()
        const { username } = req.params
        const database = client.db("ChatApp")
        const users = database.collection("Users")

        const user = await users.findOne({ username })

        if (user) {
            res.status(200).send(user)
        } else {
            res.status(500).send("User does not exist")
        }
    } catch (error) {
        console.error(error)
        res.status(500).send("Error")
    } finally {
        await client.close()
    }
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