const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({ extended: false }));

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
              // mongoose
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
              //  schema
const Schema = mongoose.Schema;
              // nueva instancia objeto schema
const userSchema = new Schema({
  username: { 
    type: String, 
    required: true },
  log :{
    description : String,
    duration : Number,
    date : String,
  },
  count:Number
});

const User = mongoose.model("User", userSchema);

count = "0";
app.post('/api/users', function(req, res) {
  const username = req.body.username;
  
  var user = new User({
    username:username
  });
  
  user.save(function(err, data) {
    if (err) {return console.error(err);}
        res.json(data);
  })  
});

app.get('/api/users', function (req, res) 
 {
    User.find({}).sort({name:1}).exec((err, data) =>  {
      if (err) return console.log(err);
      res.json(data);
    }) 
 });

app.post('/api/users/:_id/exercises', function (req, res) {
  
  const _id =  req.params._id; 
  const {description} = req.body;
  const duration = parseInt(req.body.duration);
  var date = req.body.date ? req.body.date : new Date();
  const update={
    description,
    duration,
    date:new Date(date).toDateString()
    };
  
  User.findByIdAndUpdate(_id, {$push:{log:update}}, {new: true}, (err, updatedDoc) => {   
    if(updatedDoc) {
      const updatedUser ={
      _id: updatedDoc._id,
      username: updatedDoc.username,
      ...update
      };
      const arrayDate =  updatedDoc.log.date;
      const count = Object.values(arrayDate).length;
      //console.log("count= " + count );
      updatedDoc.count =count;
      updatedDoc.save();
      res.json( updatedUser )
    }    
  }) 
})
//exercise-tracker.danielro999.repl.co/api/users/632c7c3b3a356700e2ef538d/logs?from=1990-01-01&to=2022-01-01&limit=5
app.get('/api/users/:_id/logs',(req, res)=>
{  
  const _id = req.params._id;
  const { from, to, limit } = req.query;
  logss = new Array;
  const dateFrom = new Date(from);
  const dateTo = new Date(to);
//console.log(`Id = ${_id}   Desde = ${from} hasta = ${to} limitado por = ${limit}`)
if (from || to || limit )
  User.findById(_id,(err, data) =>
  {
    if (err)return console.log(err);
    const arrayLogs =  Object.values(data.log)
    logss = new Array();
    cont = 0;
    contIf= 0;
    for ( log of arrayLogs[0]) {
      const description = log;
      const duration = arrayLogs[1][cont];
      const date = new Date(arrayLogs[2][cont]); 
      cont++; 
   
      if ((dateFrom <= date) & (date <= dateTo)) {
          logss.push({
            description: log,
            duration: duration,
            date: date.toDateString()
            })
          contIf++;
          if (contIf === parseInt(limit)) { break; }
        console.log(date)
        }
      if (!from) {
        logss.push({
            description: log,
            duration: duration,
            date: date.toDateString()
            })
          contIf++;
          if (contIf === parseInt(limit)) { break; }
      }      
    }

    const user = {
      _id : data._id,
      username : data.username,
     // from : dateFrom.toDateString(),
      // to : dateTo.toDateString(),
      count : data.count,
      log : logss
    }
    res.send(user)
  }); 
else
  User.findById(_id, (err, data) => {
    if (err)return console.log(err);
    res.json(data);       
  })
});
