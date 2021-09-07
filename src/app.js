const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('../routers/userRouter.js')
const taskRouter = require('../routers/taskRouter.js')

const app = express();
const port = process.env.PORT;

const dbName = 'user-task-manager';
mongoose.connect(process.env.MONGODB_URL + dbName);


app.use(express.json());
app.use(userRouter);
app.use(taskRouter);



app.listen(port, () => {
    console.log("Server is up on the port", port);
})