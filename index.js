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


// :You can POST to /api/users with form data username to create a new user.
// :The returned response from POST /api/users with form data username will be an object with username and _id properties.
              //      {"username":"pedro","_id":"63292c10c8e97a09397759c6"}
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

// :You can make a GET request to /api/users to get a list of all users.
// :The GET request to /api/users returns an array.
// :Each element in the array returned from GET /api/users is an object literal containing a user's username and _id.
          //   [     {"_id":"632915b4c8e97a09397759a8","username":"lucas","__v":0},
                  // {"_id":"632916a8c8e97a09397759ae","username":"yuy","__v":0},
                  // {"_id":"63291e00c8e97a09397759b1","username":"danil","__v":0},
                  // {"_id":"63292373c8e97a09397759b8","username":"DANIEL","__v":0},
                  // {"_id":"63292384c8e97a09397759bd","username":"DANIEL","__v":0},
                  // {"_id":"63292b3ec8e97a09397759c0","username":"DANIEL","__v":0},
                  // {"_id":"63292c10c8e97a09397759c6","username":"pedro","__v":0},
                  // {"_id":"63292c4ec8e97a09397759c8","username":"pedro","__v":0} ]

app.get('/api/users', function (req, res) 
 {
    User.find({}).sort({name:1}).exec((err, data) =>  {
      if (err) return console.log(err);
     res.json(data);
    }) 
 });


// :You can POST to /api/users/:_id/exercises with form data description, duration, and optionally date. If no date is supplied, the current date will be used.        

// :The response returned from POST /api/users/:_id/exercises will be the user object with the exercise fields added.
      // {"_id":"63292384c8e97a09397759bd","username":"DANIEL","date":"Thu Dec 02 1999","duration":11,"description":"zaraza"}

app.post('/api/users/:_id/exercises', function (req, res) {
  
  const _id =  req.params._id; 
  const {description} = req.body;
  const duration = parseInt(req.body.duration);
  var date = req.body.date ? req.body.date : new Date();
  // console.log ("date: " + req.body.date);
  // console.log ("duration: " + req.body.duration);
  
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

// :The date property of any object in the log array that is returned from GET /api/users/:_id/logs should be a string. Use the dateString format of the Date API.
              //    {"_id":"63292384c8e97a09397759bd","username":"DANIEL","count":2,"log":[{"description":"pitos","duration":2,        "date":"Fri Dec 11 2020"      },{"description":"zaraza","duration":11,"date":"Thu Dec 02 1999"}]}

// :You can make a GET request to /api/users/:_id/logs to retrieve a full exercise log of any user.
                  //   https://exercise-tracker.freecodecamp.rocks/api/users/63292384c8e97a09397759bd/logs
                 
// :A request to a user's log GET /api/users/:_id/logs returns a user object with a count property representing the number of exercises that belong to that user.
               //   {"_id":"63292384c8e97a09397759bd","username":"DANIEL","count":1,"log":[{"description":"zaraza","duration":11,"date":"Thu Dec 02 1999"}]}

// :A GET request to /api/users/:_id/logs will return the user object with a log array of all the exercises added.
              //    {"_id":"63292384c8e97a09397759bd","username":"DANIEL","count":2,"log":[{"description":"pitos","duration":2,"date":"Fri Dec 11 2020"},{"description":"zaraza","duration":11,"date":"Thu Dec 02 1999"}]}
// :Each item in the log array that is returned from GET /api/users/:_id/logs is an object that should have a description, duration, and date properties.
              //    {"_id":"63292384c8e97a09397759bd","username":"DANIEL","count":2,"log":[{"description":"pitos","duration":2,"date":"Fri Dec 11 2020"},{"description":"zaraza","duration":11,"date":"Thu Dec 02 1999"}]}

// :The description property of any object in the log array that is returned from GET /api/users/:_id/logs should be a string.
              //    {"_id":"63292384c8e97a09397759bd","username":"DANIEL","count":2,"log":[{"description":      "pitos"     ,"duration":2,"date":"Fri Dec 11 2020"},{"description":         "zaraza"           ,"duration":11,"date":"Thu Dec 02 1999"}]}

// :The duration property of any object in the log array that is returned from GET /api/users/:_id/logs should be a number.
              //    {"_id":"63292384c8e97a09397759bd","username":"DANIEL","count":2,"log":[{"description":"pitos","duration":     2     ,"date":"Fri Dec 11 2020"},{"description":"zaraza","duration":     11     ,"date":"Thu Dec 02 1999"}]}

//exercise-tracker.danielro999.repl.co/api/users/632bc0a641358000f192bbe4/logs?from=1990-01-01&to=2022-09-09&limit=2
app.get('/api/users/:_id/logs',(req, res)=>
{  
   const id = req.params._id;
  const { from, to, limit } = req.query;

  const dateFrom = new Date(from);
  const dateTo = new Date(to);
  console.log(dateFrom, dateTo,parseInt(limit), id);

 User.findById(id)
      .select({ log: 1})
      .limit(parseInt(limit))
      .exec((err, data) => {
      if (err)return console.log(err);
        console.log(data.log);

        
       })
           

  // User.findById(id,(err, data) =>  
  // {
  //   if (err) return console.log(err);
  //   res.json(data);
  //   // console.log(req.params);
  //   // console.log(data)
  // }) 
});

// :You can add from, to and limit parameters to a GET /api/users/:_id/logs request to retrieve part of the log of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.
//                  https://exercise-tracker.freecodecamp.rocks/api/users/63292384c8e97a09397759bd/logs?from=1920-01-01&to2022-01-01&limit=2
//                   {"_id":"63292384c8e97a09397759bd","username":"DANIEL","from":"Thu Jan 01 1920","count":2,"log":[{"description":"pitos","duration":2,"date":"Fri Dec 11 2020"},{"description":"zaraza","duration":11,"date":"Thu Dec 02 1999"}]}

///api/users/:_id/logs?[from][&to][&limit]
// app.get('/api/users/:_id/logs/', function (req, res) {   
//   // const from= req.query.from;
//   // const to= req.query.to; 
//   // const limit= req.query.limit;
  

// //User.find
  
// })