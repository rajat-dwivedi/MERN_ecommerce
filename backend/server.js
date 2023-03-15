const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database')

//Handling uncaught exception
process.on("unhandledRejection",err=>{
    console.log(`Error: ${err.message}`);
    console.log("shutting the server");
    server.close(()=>{
        process.exit(1);
    })
})



dotenv.config({path:'./backend/config/config.env'});
connectDatabase()

const server = app.listen(process.env.PORT,()=>{
    console.log(`server is working on http://localhost:${process.env.PORT}`)
});

//Unhandled promise rejection - eg env file error
process.on("unhandledRejection",err=>{
    console.log(`Error: ${err.message}`);
    console.log("shutting the server");
    server.close(()=>{
        process.exit(1);
    })
})