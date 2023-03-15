const express = require('express')

const app = express()
//error middleware
const errorMiddleware = require('./middleware/error')

//express.json() is a built in middleware function in Express starting from v4.16.0. It parses incoming JSON requests and puts the parsed data in req.body
app.use(express.json());

//route import
const product = require("./routes/productRoute");

app.use("/api/v1",product);

app.use(errorMiddleware)

module.exports = app 