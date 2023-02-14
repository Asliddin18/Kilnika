const express = require("express")
const cors = require("cors")
const upload = require("express-fileupload")
const fs = require("fs")
const uuid = require("uuid")
const app = express()

app.use(cors())
app.use(upload())

app.post("/users", (req, res) => {
 const priceData = JSON.parse(fs.readFileSync("./data/Sum.json", "utf-8"))
 const UserData = JSON.parse(fs.readFileSync("./data/User.json", "utf-8"))
 const username = req.body.username
 const surname = req.body.surname
 const age = req.body.age
 const passportSer = req.body.passwordSer
 const passportNum = req.body.passportNum
 const telNumber = req.body.telNumber
 const dedline = req.body.dedline
 const comment = req.body.comment
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
    id: uuid.v4(),
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
      message: comment
     }
    ] : [],
    dedline: dedline === "" ? "" : dedline,
    analiz: [],
    skidka: 0,
    startDay: '',
    stay: '',
    room: '',
    daily: priceData[0].price,
    money: ''
   }
  } else {
   if (stay === '' || room === '') {
    res.status(400).send("Stay or Room Was not Fully Entered")
   } else {
    var newUser = {
     id: uuid.v4(),
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
       message: comment
      }
     ] : [],
     dedline: dedline === "" ? "" : dedline,
     analiz: [],
     skidka: 0,
     startDay: startDay,
     stay: stay,
     room: room,
     daily: priceData[0].price,
     money: ''
    }
   }
  }
  res.status(201).send(newUser)
  UserData.push(newUser)
  fs.writeFileSync("./data/User.json", JSON.stringify(UserData, null, 2))
 }
})

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
  day: day,
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
app.listen(8080, () => {
 console.log("The Server is Running");
})

