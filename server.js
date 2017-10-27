/* 
* Joe Wong
* CS4830 Exploration3
* 10/25/2017
*/

// We are importing the libraries we need for our server
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoClient = require('mongodb').MongoClient;

// We declare what tools can be used with our app
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});


// We need to connect to Mongodb
var db;
mongoClient.connect('Mongodb://localhost/Schooldb', (err, database) => {
	if(err) return console.log(err);
	db = database;
	app.listen(3000, function () {
		console.log('Listening on 3000');
	});
});


// This is where we define our CRUD listeners

app.get('/', (req, res) => {
    db.collection('students').find().toArray((err, result) => {
        if(err) return console.log(err);
        res.send(result);
    });
});

app.post('/', (req, res) => {
	db.collection('students').save(req.body, (err, result) => {
		if(err) return console.log(err);
		console.log("Saved to database");
		res.send({message: req.body.fname + " was successfully added to the database"});
	});
});

app.put('/', (req, res) => {
    db.collection('students').findOneAndUpdate(
        {stuID: req.body.stuID},
        {$set: {
            fname: req.body.fname,
            lname: req.body.lname,
            phone: req.body.phone,
            addr: req.body.addr,
            major: req.body.major,
            gpa: req.body.gpa,
            level: req.body.level,
            status: req.body.status
        }},
        (err, result) => {
            if(err) return res.send(err);
            res.send(result);
        }
    );
});

app.delete('/*', (req, res) => {
    db.collection('students').findOneAndDelete(
        {stuID: req.query.stuID},
        (err, result) => {
            if(err) return res.send(err);
            res.send({message: result + " was deleted successfully"});
        }
    );
});
