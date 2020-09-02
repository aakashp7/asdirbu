const http 				= require('http');
const https 				= require('https');
const mysql 			= require('mysql');
const express 			= require('express');
const bodyParser 		= require('body-parser');
const path      		= require('path');
var app 				= express();
var apiRouter 			= require('./routes/api');
const fs 			= require('fs');
var cors = require('cors');
app.use(cors());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
/*app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,x-access-token");
  next();
});*/


app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
res.setHeader('Access-Control-Allow-Credentials', true);
next();
});



app.use('/media', express.static(path.join(__dirname, 'public/images')))
app.use('/api', apiRouter);
const port = 3014;
/*app.listen(port, () => console.log(`Listening on port ${port}..`));
app.get('/',(req, res) => { 
  res.send("Start Server");
});*/


https.createServer({
  key: fs.readFileSync(''),
  cert: fs.readFileSync('')
}, app).listen(port, () => {
  console.log('Listening...')
})
/*

const https = require('https');
const fs = require('fs');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const options = {};

https.createServer(options, function (req, res) {
  console.log("Demo");
  res.writeHead(200);
  res.end("hello world\n");
}).listen(3014);*/