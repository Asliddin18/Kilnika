const express = require("express")
const cors = require("cors")
const upload = require("express-fileupload")
const fs = require("fs")
const uuid = require("uuid")
const jwt = require("jsonwebtoken")
const authenticateToken = require("./Auth")
const app = express()
require("dotenv").config()


app.use(cors())
app.use(upload())

/* start Operator */
 
app.get("/operator", (req, res) => {
    const operatorJson = JSON.parse(fs.readFileSync("./data/Operator.json", "utf-8"))
    res.status(200).send(operatorJson)
})
app.post("/operator", (req, res) => {
    const operatorJson = JSON.parse(fs.readFileSync("./data/Operator.json", "utf-8"))
    const post = req.body

    if (post.name === "" || post.password === "" || post.email === "") {
        res.status(400).send("The Information Was Not Fully Entered")
    } else {
        const newOper = {
            id: uuid.v4(),
            name: post.name,
            password: post.password,
            email: post.email,
            category: "admin"
        }
        operatorJson.push(newOper)
        fs.writeFileSync("./data/Operator.json", JSON.stringify(operatorJson, null, 2))
        res.status(201).send("Operator Created")
    }
})
app.put("/operator/:id", (req, res) => {
    const operatorJson = JSON.parse(fs.readFileSync("./data/Operator.json", "utf-8"))
    const ReqId = req.params.id
    var edit = false

    operatorJson.map(item => {
        if (item.id == ReqId) {
            edit = true
            req.body.name === "" ? item.name = item.name : item.name = req.body.name
            req.body.password === "" ? item.password = item.password : item.password = req.body.password
            req.body.email === "" ? item.email = item.email : item.email = req.body.email
        }
    })

    if (edit) {
        res.status(200).send("The Operator Has Been Edited")
        fs.writeFileSync("./data/Operator.json", JSON.stringify(operatorJson, null, 2))
    } else {
        res.status(400).send("Id Not Found")
    }

    /*   if (edit === true) {
          res.status(200).send("Edited")
      } else {
          res.status(400).send("Id Not Found")
      } */
})
app.delete("/operator/:id", (req, res) => {
    const operatorJson = JSON.parse(fs.readFileSync("./data/Operator.json", "utf-8"))
    const ReqId = req.params.id
    var FilterId = false

    operatorJson.map(item => {
        if (item.id === ReqId) {
            FilterId = true
            if (item.category === "superAdmin") {
                res.status(400).send("This Id is SuperAdmin")
            }
        }
    })

    if (FilterId === true) {
        res.status(200).send("Operator Deleted")
        const filterJson = operatorJson.filter(o => o.id !== ReqId)
        fs.writeFileSync("./data/Operator.json", JSON.stringify(filterJson, null, 2))
    } else {
        res.status(400).send("Id Not Found")
    }
})

/* Login */
app.post("/login", (req, res) => {
    const operatorJson = JSON.parse(fs.readFileSync("./data/Operator.json"))
    let postToken = false
    const username = req.body.username
    const password = req.body.password

    const accesToken = jwt.sign(username, process.env.ACCESS_TOKEN_SECRET)

    operatorJson.map(item => {
        if (item.name === req.body.username && item.password === req.body.password) {
            postToken = true
        }
    })
    if (postToken === true) {
        res.status(200).send(accesToken)
    } else {
        res.status(400).send("Password or Username is Error")
    }
})

/* history */
app.get("/history", (req, res) => {
    const historyJson = JSON.parse(fs.readFileSync("./data/History.json", "utf-8"))
    res.status(200).send(historyJson)
})
app.post("/history", (req, res) => {
    const historyJson = JSON.parse(fs.readFileSync("./data/History.json", "utf-8"))
    const date = new Date()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()
    const hour = `${date.getHours()}:${date.getMinutes()}`
    const fullDate = `${day < 10 ? "0" + day : day}/${month < 10 ? "0" + month : month}/${year}`
    const name = req.body.name
    const pages = req.body.page

    if (name === "" || pages === "") {
        res.status(400).send("Name or pages is Empty")
    } else {
        var newHistory = {
            name: name,
            date: fullDate,
            hour: hour,
            pages: pages
        }
        historyJson.unshift(newHistory)
        fs.writeFileSync("./data/History.json", JSON.stringify(historyJson, null, 2))
        res.status(201).send("History Created")
    }

})

/* price */
app.get("/price", (req, res) => {
    const price = JSON.parse(fs.readFileSync("./data/Sum.json", "utf-8"))
    res.status(200).send(price)
})
app.put("/price/:id", (req, res) => {
    const priceJson = JSON.parse(fs.readFileSync("./data/Sum.json", "utf-8"))
    const newPrice = req.body.price

    priceJson.map(item => {
        if (item.id === req.params.id) {
            if (newPrice === '') {
                item.price
            } else {
                item.price = newPrice
            }
            fs.writeFileSync("./data/Sum.json", JSON.stringify(priceJson, null, 2))
            res.status(200).send('Price Has Been Changed')
        } else {
            res.status(400).send("Id Not Found")
        }
    })

})

/* room */
app.get("/room", (req, res) => {
    const roomJson = JSON.parse(fs.readFileSync("./data/Room.json"))
    res.status(200).send(roomJson)
})
app.post("/room", (req, res) => {
    const roomJson = JSON.parse(fs.readFileSync("./data/Room.json"))
    const ReqBody = req.body

    if (ReqBody.number === "" || ReqBody.limit === "") {
        res.status(400).send("Number or Limit Was Not Entered")
    } else {
        const newRoom = {
            id: uuid.v4(),
            number: ReqBody.number,
            limit: ReqBody.limit,
            persons: []
        }
        roomJson.push(newRoom)
        res.status(200).send("yuborildi")
        fs.writeFileSync("./data/Room.json", JSON.stringify(roomJson, null, 2))
    }
})

/* users */
app.get("/users", (req, res) => {
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    res.status(200).send(UserData)
})
app.post("/users", (req, res) => {
    const priceData = JSON.parse(fs.readFileSync("./data/Sum.json", "utf-8"))
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    const username = req.body.username
    const surname = req.body.surname
    const creator = req.body.creator
    const age = req.body.age
    const passportSer = req.body.passwordSer
    const passportNum = req.body.passportNum
    const telNumber = req.body.telNumber
    const dedline = req.body.dedline
    const comment = req.body.comment
    const userId = uuid.v4()
    const date = new Date()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()
    const hour = `${date.getHours()}:${date.getMinutes()}`
    const startDay = req.body.startDay
    const stay = req.body.stay
    const room = req.body.room

    if (username === "" || surname === "" || age === "" || telNumber === "") {
        res.status(400).send("Data Was not Fully Entered")
    } else {
        if (startDay === "") {
            var newUser = {
                id: userId,
                username: username,
                surname: surname,
                age: age,
                passportSer: passportSer,
                passportNum: passportNum,
                telNumber: telNumber,
                comment: comment !== "" ? [
                    {
                        day: day,
                        month: month,
                        year: year,
                        hour: hour,
                        poster: req.body.poster,
                        message: comment
                    }
                ] : [],
                dedline: dedline === "" ? "" : dedline,
                analiz: [],
                skidka: 0,
                startDay: [
                    {
                        userId: userId,
                        username: username,
                        surname: surname,
                        started: "",
                        stay: "",
                        room: "",
                        daily: "",
                        money: ''
                    }
                ],
            }
        } else {
            if (stay === '' || room === '') {
                res.status(400).send("Stay or Room Was not Fully Entered")
            } else {
                var newUser = {
                    id: userId,
                    username: username,
                    surname: surname,
                    age: age,
                    creator: creator,
                    passportSer: passportSer,
                    passportNum: passportNum,
                    telNumber: telNumber,
                    comment: comment !== "" ? [
                        {
                            id: uuid.v4(),
                            day: day,
                            month: month,
                            year: year,
                            hour: hour,
                            poster: req.body.poster,
                            message: comment
                        }
                    ] : [],
                    dedline: dedline === "" ? "" : dedline,
                    analiz: [],
                    skidka: 0,
                    startDay: [
                        {
                            userId: userId,
                            username: username,
                            surname: surname,
                            started: startDay,
                            stay: stay,
                            room: room,
                            daily: priceData[0].price,
                            money: ''
                        }
                    ],
                }
            }
        }
        if (newUser !== undefined) {
            res.status(201).send(newUser)
            UserData.push(newUser)
            fs.writeFileSync("./data/User.json", JSON.stringify(UserData, null, 2))
        }
    }
})
app.get("/comment", (req, res) => {
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    var comments = []
    for (var i = 0; i < UserData.length; i++) {
        for (let j = 0; j < UserData[i].comment.length; j++) {
            comments.push(UserData[i].comment[j])
        }
    }

    res.send(comments)
})
app.post("/comment/:id", (req, res) => {
    var id = req.params.id
    const date = new Date()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()
    const hour = `${date.getHours()}:${date.getMinutes()}`

    var data = {
        id: uuid.v4(),
        day: day,
        poster: req.body.poster,
        month: month,
        year: year,
        hour: hour,
        message: req.body.comment
    }
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    UserData.map((item, key) => {
        if (item.id == id) {
            item.comment.push(data)
        }
    })
    fs.writeFileSync("./data/User.json", JSON.stringify(UserData, null, 2))
    res.status(200).send("yuborildi")
})
app.delete('/comment/:id', (req, res) => {
    var id = red.params.id
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    for (var i = 0; i < UserData.length; i++) {
        for (let j = 0; j < UserData[i].comment.length; j++) {
            if (UserData[i].comment[j].id == id) {
                UserData[i].comment.splice(j, 1)
            }
        }
    }

})
app.get('/comment/month/:month', (req, res) => {
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))

    var month = req.params.month
    var date = new Date

    var comments = []
    const year = date.getFullYear()
    for (var i = 0; i < UserData.length; i++) {
        for (let j = 0; j < UserData[i].comment.length; j++) {
            if (UserData[i].comment[j].year == year && UserData[i].comment[j].month == month) {
                comments.push(UserData[i].comment[j])
            }
        }
    }
    res.status(200).send(comments)
})
app.get('/comment/year/:year', (req, res) => {
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    var year = req.params.year
    var date = new date
    var comments = []
    for (var i = 0; i < UserData.length; i++) {
        for (let j = 0; j < UserData[i].comment.length; j++) {
            if (UserData[i].comment[j].year == year) {
                comments.push(UserData[i].comment[j])
            }
        }
    }
    res.status(200).send(comments)
})
app.get('/comment/poster/:poster/month/:month', (req, res) => {
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    var poster = req.params.poster
    var month = req.params.month
    var date = new Date
    var comments = []
    for (var i = 0; i < UserData.length; i++) {
        for (let j = 0; j < UserData[i].comment.length; j++) {
            if (UserData[i].comment[j].poster == poster && UserData[i].comment[j].month == month) {
                comments.push(UserData[i].comment[j])
            }
        }
    }
    res.status(200).send(comments)
})
app.get("/comment/day/:day", (req, res) => {
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    var day = req.params.day
    var date = new Date
    const month = date.getMonth() + 1
    var comments = []
    const year = date.getFullYear()
    for (var i = 0; i < UserData.length; i++) {
        for (let j = 0; j < UserData[i].comment.length; j++) {
            if (UserData[i].comment[j].year == year && UserData[i].comment[j].month == month && UserData[i].comment[j].day == day) {
                comments.push(UserData[i].comment[j])
            }
        }
    }
    console.log();
    res.status(200).send(comments)
})

app.get("/room/set?data",(req,res)=>{
    var day=req.query.body
    var date= new Date
    var bron=[]
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    const roomJson = JSON.parse(fs.readFileSync("./data/Room.json"))
for (let i = 0; i < UserData.length; i++) {
    for (let j = 0; j < startDay.length; j++) {
        if (date.getDate(UserData[i].startDay[j].started) <= date.getDate(day) && date.getDate(day) < date.getDate(UserData[i].startDay[j].started) + UserData[i].startDay[j].stay){
            bron.push(UserData[i].startDay[j])
        }
    }
}
res.status(200).send(req.query.day)
})







app.listen(8080, () => {
    console.log("The Server is Running");
})

