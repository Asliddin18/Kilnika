const express = require("express")
const cors = require("cors")
const upload = require("express-fileupload")
const fs = require("fs")
const math = require("mathjs")
const uuid = require("uuid")
const jwt = require("jsonwebtoken")
const authenticateToken = require("./Auth")
const app = express()
require("dotenv").config()
// const Math =require('Math')

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

    if (post.name === "" || post.password === "" || post.email === "" || post.surname === "") {
        res.status(400).send("The Information Was Not Fully Entered")
    } else {
        const newOper = {
            id: uuid.v4(),
            name: post.name,
            password: post.password,
            email: post.email,
            surname: post.surname,
            telNumber: post.telNumber,
            category: "admin"
        }
        operatorJson.unshift(newOper)
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
            req.body.telNumber === "" ? item.telNumber = item.telNumber : item.telNumber = req.body.telNumber
            req.body.surname === "" ? item.surname = item.surname : item.surname = req.body.surname
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
    const name = req.body.name
    const pages = req.body.page

    if (name === "" || pages === "") {
        res.status(400).send("Name or pages is Empty")
    } else {
        var newHistory = {
            name: name,
            day: req.body.day,
            hour: req.body.hour,
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
        roomJson.unshift(newRoom)
        res.status(200).send("The Room Has Been Created")
        fs.writeFileSync("./data/Room.json", JSON.stringify(roomJson, null, 2))
    }
})
app.delete("/room/:id", (req, res) => {
    const roomJson = JSON.parse(fs.readFileSync("./data/Room.json"))
    const ReqId = req.params.id
    let checked = false

    for (let i = 0; i < roomJson.length; i++) {
        if (roomJson[i].id === ReqId) {
            checked = true
            var filterJson = roomJson.filter(a => a.id !== roomJson[i].id)
            fs.writeFileSync("./data/Room.json", JSON.stringify(filterJson, null, 2))
        }
    }

    if (checked == false) {
        res.status(400).send("Id Not Found")
    } else {
        res.status(200).send("The Room is Deleted")
    }
})
app.put("/room/:id", (req, res) => {
    const roomJson = JSON.parse(fs.readFileSync("./data/Room.json"))
    const ReqId = req.params.id
    const reqBody = req.body
    let checked = false

    for (let i = 0; i < roomJson.length; i++) {
        if (roomJson[i].id === ReqId) {
            checked = true
            reqBody === "" ? roomJson[i].number = roomJson[i].number : roomJson[i].number = reqBody.number
            reqBody === "" ? roomJson[i].limit = roomJson[i].limit : roomJson[i].limit = reqBody.limit
            fs.writeFileSync("./data/Room.json", JSON.stringify(roomJson, null, 2))
        }
    }
    if (checked == false) {
        res.status(400).send("Id Not Found")
    } else {
        res.status(200).send("Room Edited")
    }

})

/* users */
app.get("/users", (req, res) => {
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    res.status(200).send(UserData)
})
app.post("/users", (req, res) => {
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    const username = req.body.username
    const surname = req.body.surname
    const creator = req.body.creator
    const age = req.body.age
    const passportSer = req.body.passportSer
    const passportNum = req.body.passportNum
    const telNumber = req.body.telNumber
    const dedline = req.body.dedline
    const comment = req.body.comment
    const address = req.body.address
    const userId = uuid.v4()
    const startDay = req.body.startDay

    if (username === "" || surname === "" || age === "" || telNumber === "") {
        res.status(400).send("Data Was not Fully Entered")
    } else {
        if (startDay === "") {
            var newUser = {
                id: userId,
                username: username,
                surname: surname,
                age: age,
                creator: creator,
                passportSer: passportSer,
                passportNum: passportNum,
                telNumber: telNumber,
                address: address,
                comment: comment !== "" ? [
                    {
                        id: userId,
                        username: username,
                        surname: surname,
                        date: req.body.date,
                        poster: req.body.poster,
                        date: req.body.date,
                        hour: req.body.hour,
                        message: comment
                    }
                ] : [],
                dedline: dedline === "" ? "" : dedline,
                analiz: [],
                skidka: 0,
                startDay: [],
            }
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
                address: address,
                comment: comment !== "" ? [
                    {
                        id: userId,
                        username: username,
                        surname: surname,
                        date: req.body.date,
                        poster: req.body.poster,
                        date: req.body.date,
                        hour: req.body.hour,
                        message: comment
                    }
                ] : [],
                dedline: dedline === "" ? "" : dedline,
                analiz: [],
                skidka: 0,
                startDay: [],
            }
        }
        if (newUser !== undefined) {
            res.status(201).send("User Has Been Created")
            UserData.unshift(newUser)
            fs.writeFileSync("./data/User.json", JSON.stringify(UserData, null, 2))
        }
    }
})
app.delete("/users/:id", (req, res) => {
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    const ReqId = req.params.id
    let deleteCheck = false

    for (let i = 0; i < UserData.length; i++) {
        if (UserData[i].id === ReqId) {
            const filterJson = UserData.filter(c => c.id !== UserData[i].id)
            fs.writeFileSync("./data/User.json", JSON.stringify(filterJson, null, 2))
            deleteCheck = true
        }
    }
    if (deleteCheck == false) {
        res.status(400).send("Id Not Found")
    } else {
        res.status(200).send("The User is Deleted")
    }
})
/* app.put("/users/:id", (req, res) => {
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    const ReqId = req.params.id
    const ReqBody = req.body
    let filterId = false
    
    for (let i = 0; i < UserData.length; i++) {
        if(UserData[i].id === ReqId) {
            filterId = true
            
        }
    }
    if(filterId == false) {
        res.status(400).send("Id Not Found")
    } else {
        res.status(200).send("User Edited")
    }
})
 */

/* analiz */
app.post("/users/analiz/:id", (req, res) => {
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    const ReqId = req.params.id
    const analizName = req.body.analizName
    const analizFile = Date.now() + req.files.analizFile.name
    let postAnaliz = false

    for (let i = 0; i < UserData.length; i++) {
        if (UserData[i].id === ReqId) {
            postAnaliz = true

        }
    }

    if (postAnaliz === false) {
        res.status(400).send("Id Not Found")
    } else {
        if (analizFile === "" || analizName === "") {
            res.status(400).send("AnalizFile or AnalizName Not Entered")
        } else {
            var newObj = {
                id: uuid.v4(),
                analizName: analizName,
                analizFile: analizFile
            }
            req.files.analizFile.mv(`${__dirname}/public/${analizFile}`)

            UserData.map(item => {
                if (item.id === ReqId) {
                    item.analiz.unshift(newObj)
                    fs.writeFileSync("./data/User.json", JSON.stringify(UserData, null, 2))
                }
            })
            res.status(201).send("Analiz Created")
        }
    }
})
app.delete("/users/analiz/:id", (req, res) => {
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    const ReqId = req.params.id
    // let deleteAnaliz = false

    // for (let i = 0; i < UserData.length; i++) {
    //     UserData[i].analiz.map(item => {
    //         if(item.id === ReqId) {
    //             deleteAnaliz = true
    //             const filterJson = UserData[i].analiz.filter(c => c.id !== item.id)
    //             UserData[i].analiz.unshift(filterJson)
    //             fs.writeFileSync("./data/User.json", JSON.stringify(UserData, null, 2))
    //         }
    //     })

    // }

    for (var i = 0; i < UserData.length; i++) {
        for (let j = 0; j < UserData[i].analiz.length; j++) {
            if (UserData[i].analiz[j].id == ReqId) {
                fs.unlinkSync(`public/${UserData[i].analiz[j].analizFile}`)
                UserData[i].analiz.splice(j, 1)
                res.status(200).send("User Has Been Created")
                fs.writeFileSync("./data/User.json", JSON.stringify(UserData, null, 2))
            }
        }
    }

    // if(deleteAnaliz === true) {
    //     res.status(200).send("The Analiz is Deleted")
    // } else {
    //     res.status(400).send("Id Not Found")
    // }
})

/* comment */
app.get("/comment", (req, res) => {
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    var comments = []
    for (var i = 0; i < UserData.length; i++) {
        for (let j = 0; j < UserData[i].comment.length; j++) {
            comments.unshift(UserData[i].comment[j])
        }
    }

    res.send(comments)
})
app.post("/comment/:id", (req, res) => {
    var id = req.params.id
    var data = {
        id: id,
        username: username,
        surname: surname,
        id: uuid.v4(),
        poster: req.body.poster,
        date: req.body.date,
        hour: req.body.hour,
        message: req.body.comment
    }

    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    UserData.map((item, key) => {
        if (item.id == id) {
            item.comment.unshift(data)
        }
    })
    fs.writeFileSync("./data/User.json", JSON.stringify(UserData, null, 2))
    res.status(200).send("yuborildi")
})
app.delete('/comment/:id', (req, res) => {
    var id = req.params.id
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    for (var i = 0; i < UserData.length; i++) {
        for (let j = 0; j < UserData[i].comment.length; j++) {
            if (UserData[i].comment[j].id == id) {
                UserData[i].comment.splice(j, 1)

                res.status(201).send("User Has Been Created")
                fs.writeFileSync("./data/User.json", JSON.stringify(UserData, null, 2))

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
                comments.unshift(UserData[i].comment[j])
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
                comments.unshift(UserData[i].comment[j])
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
                comments.unshift(UserData[i].comment[j])
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
                comments.unshift(UserData[i].comment[j])
            }
        }
    }
    console.log();
    res.status(200).send(comments)
})

app.get("/room/set/:date", (req, res) => {
    var day = req.params.date;
    var oneDay = 1000 * 60 * 60 * 24;
    var now = new Date()
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    const roomJson = JSON.parse(fs.readFileSync("./data/Room.json"))

    var a = []
    for (let i = 0; i < UserData.length; i++) {
        for (let j = 0; j < UserData[i].startDay.length; j++) {
            var starting = math.floor((new Date(UserData[i].startDay[j].started) - new Date(now.getFullYear() - 1, 0, 0)) / oneDay)
            var myday = math.floor((new Date(day) - new Date(now.getFullYear() - 1, 0, 0)) / oneDay)
            var finishing = starting + UserData[i].startDay[j].stay
            if (starting <= myday && myday < finishing) {
                a.unshift(UserData[i].startDay[j])
            }
        }
    }
    for (let i = 0; i < roomJson.length; i++) {
        for (let j = 0; j < a.length; j++) {
            if (a[j].room == roomJson[i].number) {
                roomJson[i].persons.unshift(a[j])
            }
        }
        // fs.writeFileSync("./data/Room.json", JSON.stringify(roomJson, null, 2))
    }


    res.status(200).send(roomJson)
})

app.post("/room/set/:userId", (req, res) => {
    var day = req.body.date;
    var room = req.body.room;
    var userId = req.params.userId
    var oneDay = 1000 * 60 * 60 * 24;
    const price = JSON.parse(fs.readFileSync("./data/Sum.json", "utf-8"))
    var now = new Date()
    const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
    const roomJson = JSON.parse(fs.readFileSync("./data/Room.json"))
    for (let i = 0; i < roomJson.length; i++) {
        if (roomJson[i].number == room) {
            var limit = roomJson[i].limit
        }
    }
    var count = 0
    for (let i = 0; i < UserData.length; i++) {
        for (let j = 0; j < UserData[i].startDay.length; j++) {
            var starting = math.floor((new Date(UserData[i].startDay[j].started) - new Date(now.getFullYear() - 1, 0, 0)) / oneDay)
            var myday = math.floor((new Date(day) - new Date(now.getFullYear() - 1, 0, 0)) / oneDay)
            var finishing = starting + UserData[i].startDay[j].stay
            console.log(myday);
            console.log(starting, finishing)
            if (starting - req.body.stay <= myday && myday < finishing && room == UserData[i].startDay[j].room) {
                count++
            }
        }
    }
    if (count < limit) {
        for (let j = 0; j < UserData.length; j++) {
            if (UserData[j].id == userId) {
                var post = {
                    "id":uuid.v4(),
                    "userId": UserData[j].id,
                    "username": UserData[j].username,
                    "surname": UserData[j].surname,
                    "started": day,
                    "stay": req.body.stay * 1,
                    "room": room,
                    "daily": price[0].price,
                    "money": req.body.money
                }
                UserData[j].startDay.unshift(post)
                fs.writeFileSync("./data/User.json", JSON.stringify(UserData, null, 2))
                res.status(200).send("malumot joylandi")
            }
        }


    } else {
        res.status(500).send("Siz kiritgan hona ayni vaqtda band")
    }


})
app.delete('/room/set/:id',(req,res)=>{
id=req.params.id
const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
var n=false
for (let i = 0; i < UserData.length; i++) {
for (let j = 0; j < UserData[i].startDay.length; j++) {
if(UserData[i].startDay[j].id==id){
    UserData[i].startDay.splice(j,1)
n=true
}}}
if(n){
res.status(201).send('O`chirib tashlandi')
}else{
res.status(403).send("siz bergan id serverda aniqlanmadi")
}})
app.put('/room/set/:id',(req,res)=>{
var id=req.params.id 
})

app.listen(8080, () => {
    console.log("The Server is Running");
})