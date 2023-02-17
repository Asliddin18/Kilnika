const jwt = require('jsonwebtoken')
require("dotenv").config()

function authenticateToken(req, res, next) {
 const authHeader = req.headers["authorization"]
 const token = authHeader && authHeader.split(' ')[1]
 if(token == null) {
  res.status(401).send("The Token is Empty")
 }
 jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
  if(err) {
   res.status(403).send("Error in Token")
  } else {
   req.user = user
   next()
  }
 })
} 


module.exports = authenticateToken