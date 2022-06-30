require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/all_test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const app = express();
const port = 3000;

const userRouter = require('./routes/users');
const imageRouter = require('./routes/images');

app.use(express.json());
app.use(express.urlencoded());

app.use('/api', [userRouter]);
// app.use('/api/images', [imageRouter]);


app.get('/', (req, res) => {    
    res.send('hello world');
});

app.listen(port, () => {    
    console.log(port, '포트로 서버가 켜졌어요!');
});

