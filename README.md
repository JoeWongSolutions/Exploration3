# Exploration 3
CS4830 Exploration 3 Assignment: Mastering Nodejs and Expressjs

Explorer: Joe Wong

Course: CS4830

Date: 10/27/2017

# Sources
* [Restful API in 10 minutes](https://www.codementor.io/olatundegaruba/nodejs-restful-apis-in-10-minutes-q0sgsfhbd)
* [Dead Simple Guide for Nodejs, Express, and Mongo](https://closebrace.com/tutorials/2017-03-02/the-dead-simple-step-by-step-guide-for-front-end-developers-to-getting-up-and-running-with-nodejs-express-and-mongodb)
* [Build a Simple CRUD application with Express and Mongodb](https://zellwk.com/blog/crud-express-mongodb/)
* [Install Mongodb on Ubuntu 16.04](https://www.howtoforge.com/tutorial/install-mongodb-on-ubuntu-16.04/)
* [Mongo Manual](https://docs.mongodb.com/manual/introduction/)
* [Expressjs.com](http://expressjs.com/en/api.html#path-examples)
* [Foreverjs:Keep Node Servers running](https://github.com/foreverjs/forever)
* [Angular $http Manual](https://docs.angularjs.org/api/ng/service/$http)
* [W3Schools Angular $http](https://www.w3schools.com/angular/angular_http.asp)
* [Postman](https://www.getpostman.com/)

## Components Explored
* [Install Mongodb](#install-mongodb)
* [Initial Setup](#initial-setup)
* [Creating Server.js](#creating-server.js)
* [Connecting to Mongo](#connecting-to-Mongo)
* [Expressjs CRUD](#expressjs-crud)
* [Install Foreverjs](#install-foreverjs)
* [Testing the Server](#testing-the-server)

* [Troubleshooting Tidbits](#troubleshooting-tidbits)
* [Journal](#journal)

#### What this exploration covers:
We will be going deeper into nodejs servers and looking at how to use Expressjs, Mongodb, and Foreverjs to create a backend on a Ubuntu EC2 instance. This guide will not be going into installing Node, NPM, and Express and assumes you are capable of installing these on your own or refer to my Exploration 2. I will also be using Javascript 2015 (ES6) extensively in my code because my first exploration was on this topic.

#### Install Mongodb
This is pretty straight-forward, we need to correctly install Mongodb onto our EC2 so that we can use it. Follow the steps in this guide: [Install Mongodb on Ubuntu 16.04](https://www.howtoforge.com/tutorial/install-mongodb-on-ubuntu-16.04/)
Be sure to create the mongod.service file in "/lib/systemd/system/" or you will have a hard time running mongo. For the purposes of this exploration, it is not necessary to create a user for the database (although you will want to do this if you are building anything useful later). You may stop following the guide when you get to creating a user. The last thing you need to do in the guide is to check if Mongodb has started running using the following command:
```Shell
sudo netstat -plntu
```

#### Initial Setup
Create a directory somewhere in your public_html folder, I'll call mine Exploration3/.
```Shell
mkdir public_html/CS4830/Exploration3
```
Now we need to navigate to the folder and initialize NPM (Node Package Manager).
```Shell
cd public_html/CS4830/Exploration3
npm init
```
After entering all the credentials, you will now see that a package.json file as well as node_modules folder has been created. These will help us keep track of our files and libraries. We need to install the libraries so run:
```Shell
npm install express --save
npm install nodemon --save-dev
npm install body-parser --save
npm install mongodb --save
```
Let me explain "--save", this option allows us to tell NPM that we want it to add it as a dependency in package.json and "-dev" means that we only want it to depend on actions from a developer. Nodemon is useful when testing our server because it will automatically reload the server to incorporate any changes to files or dependencies in the app. Otherwise we would have to manually exit the server script and then manually restart it after every change. Body-parser is a middleware that allows us to read body data from http requests.

#### Creating Server.js
We need to create the script that our server runs on. We'll call it server.js.
```Shell
touch server.js
```
Inside this file we will add the following snippet:
```Javascript
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoClient = require('mongodb').MongoClient;
```
This is equivalent to importing all of our dependencies into the server.js script. Notice that we instantiated the Express object and called it "app" by convention. MongoClient is the interface we will use to perform our CRUD operations. Now we need to set our tools:
```Javascript
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});
```
We are setting the headers because we will be using port 3000 for this server. Changing the port is considered cross origin so we need to open up our server to the world.

#### Connecting to Mongo
Now that we have our tools ready, we can finally start to establish contact with mongodb. Add the following snippet to server.js:
```Javascript
var db;
mongoClient.connect('Mongodb://localhost/Schooldb', (err, database) => {
	if(err) return console.log(err);
	db = database;
	app.listen(3000, function () {
		console.log('Listening on 3000');
	});
});
```
Notice the funny syntax on the first parameter passed to mongoClient.connect(). This is the way to define the path for mongo and the "/Schooldb" is the name of the database. You may name it whatever you like. Notice that we added the app.listen method in this block. We only want the script to run if a connection to Mongodb is available so we check for the database before adding the listener.

#### Expressjs CRUD
Alrighty, if you made it this far into the guide then you are half-way done. From here, we will write the code to use our CRUD (Create, Read, Update, Delete) capabilities. Let's start with GET (the read part of CRUD):
```Javascript
app.get('/', (req, res) => {
    db.collection('students').find().toArray((err, result) => {
        if(err) return console.log(err);
        res.send(result);
    });
});
```
Express has shortcuts for CRUD so we are using "app.get()" to read from our database. The first parameter is the search query and the second parameter is a callback function that will deal with the request from the client. Since we don't need a query to pull everything from the database, we left it as '/'. "db.collection.find()" will return an object with an innate method ".toArray()". We can pass a callback function as a parameter for ".toArray()" to handle the result of the query. We simply send the result back to the client using "res.send()". Next is POST (the create part of CRUD):
```Javascript
app.post('/', (req, res) => {
	db.collection('students').save(req.body, (err, result) => {
		if(err) return console.log(err);
		console.log("Saved to database");
		res.send({message: req.body.fname + " was successfully added to the database"});
	});
});
```
This is pretty similar to GET except we are looking at the body of the request in order to see what needs to be added to the database. We are using "db.collection.save()" but you can also use "db.collection.insert()" which is the recommended method. I simply used save because the tutorial I was following had used save. Lets move on to PUT:
```Javascript
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
```
Just like POST, we can specify a body in the http request so we are parsing the body for the JSON object holding all the information for updating the database. Finally we have DELETE:
```Javascript
app.delete('/*', (req, res) => {
    if(req.query.stuID == "all"){
        db.collection('students').deleteMany(
            {},
            (err, result) => {
                if(err) return res.send(err);
                res.send({message: result + " was deleted successfully"});
            }
        );
    }
    else {
        db.collection('students').findOneAndDelete(
            {stuID: req.query.stuID},
            (err, result) => {
                if(err) return res.send(err);
                res.send({message: result + " was deleted successfully"});
            }    
        );
    }
});
```
Since we need a query in the http request, we added the "*" in the first parameter. There are better and safer ways to do this in regular expressions but that is beyond the scope of this exploration. Notice we do two different methods: deleteMany() and findOneAndDelete(). We have the option of clearing the entire collection or just removing a single document so we need to differentiate between the two. Also notice the use of "req.query" instead of "req.body". Delete does not allow an http body by default and I discourage forcing a body onto the request. And we're done!

#### Install Foreverjs
Earlier we used Nodemon to test and debug our code but we really need something more permanent. Enter Foreverjs. This service allows us to run our script in the background and handles all of the errors for us without breaking our server. To install it go to the terminal and type:
```Shell
sudo npm install forever -g
```
We install foreverjs globally as per the recommendation so we can use it anywhere in our server, not just in Exploration 3. Now run:
```Shell
forever server.js
```
If you did everything correctly up to now, you should see a message in the terminal that says "info: Forever processing file: server.js". Now we can test our server!

#### Testing the Server
There are many different ways to test the server, I won't go too much into detail here but essentially anything that can send http requests to the server will be able to test it. The most basic way to test the server would be to manually input something into Mongodb and then type:
```URL
http://yourdomainhere.com:3000
```
into a web browser and see if you can see it. I used my Challenge 4 code and linked it up with Angular.js $http service. You can find the app here: [Joe's Student Management App](http://joewong.me/CS4830/Exploration3)
Alternatively, you can use something called [Postman](https://www.getpostman.com/) to send http requests to the server and display the results in the app.

## Troubleshooting Tidbits
Mongodb took a pretty big chunk of my time to finally get installed and configured. If you type "mongo" and the terminal seems to hang, you can use CTRL+C to stop the process. Make sure the mongod.service is properly configured and if all else fails, uninstall and review the guide I posted. Some error about not being able to find data/ folder may occur. If this happens just create a data folder in the directory with your script and it should be ok.

If you are following along on some of the guides I've posted make sure to read the supplementary documentation. I finished 2 fullstack tutorials (only 1 worked fully) before finally creating this script. Some of the methods have been deprecated so you will need to find the appropriate replacement to fix the warnings given in the terminal.

If your browser hangs or gives an error when navigating to the server, you will need to check the security of your EC2 instance. Make sure port 3000 is available to the public.

## Journal
This exploration was quite long, I had gone through 2 tutorials before mixing components of each and tidbits from random sources to form the code in my server. I decided to further my knowledge of Node and Express because the ultimate goal is to be able to develop a MEAN stack. Mongodb was a pain to finally get running. I spent many hours reading guides on getting mongo to work and the guides did not talk about having a /data folder where I wanted to store my data. 
Express was very simple and straightforward to implement. I think I spent the least amount of time reading Express documentation. I had used nodemon extensively for debugging and when I finally got tired of having to keep my terminal running I looked up Foreverjs. This is a godsend! I almost wanted to stop developing in Node until I found this amazing api. 
Overall I believe I have a much better understanding of the NPM, Nodejs, Express development environment after this exploration and hopefully I can start to go back to the front-end to master Angularjs and find a CSS preprocessor like SASS to play around with.