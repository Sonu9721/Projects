const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const { default: mongoose } = require('mongoose');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://Aman300:ByXZ2qfTNQNWF7Uj@cluster0.o4rcy.mongodb.net/group30Database?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then(() => console.log("mongo dB is connected ................."))  
.catch(err => console.log(err))

app.use('/',route);


app.listen(process.env.Port || 3000 , function(){
    console.log('express app running on this port ' + (process.env.Port || 3000))
});
