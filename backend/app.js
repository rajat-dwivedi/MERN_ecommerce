const express = require('express')
const cookieParser = require('cookie-parser')

const app = express()
//error middleware
const errorMiddleware = require('./middleware/error')

//express.json() is a built in middleware function in Express starting from v4.16.0. It parses incoming JSON requests and puts the parsed data in req.body
app.use(express.json());
app.use(cookieParser())

//route import
const product = require("./routes/productRoute");
const user = require("./routes/userRoute")
app.use("/api/v1",product);
app.use("/api/v1",user);

app.use(errorMiddleware)

module.exports = app 