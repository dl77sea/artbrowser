//the things we "require" are coming from node modules folder (the string is the name of the module from the node modules folder, the code of which is returned by "require")
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
//module that looks for dot env file, maps to process.env
if (process.env.NODE_ENV !== 'production') {
  //config looks for .env, extracts key val pairs, adds them to process.env
  require('dotenv').config();
}
const app = express()

app.use(cookieParser());

app.use(bodyParser.json())

//routes for refreshing db data - why does this not work when below public and node modules ??
app.use('/api/refresh', require('./routes/refresh') )

//routes for retrieving db data for front end
app.use('/api/retrieve', require('./routes/retrieve') )

//this is where public app components (html/js) live
app.use(express.static(path.join(__dirname, 'public')))

//this is where the express/node stuff lives
app.use(express.static(path.join(__dirname, '/../', 'node_modules')))

app.use((req, res) => {
  console.log("something not found")
  // res.sendStatus(404);
  res.redirect('/')
});

//handle different errors
app.use(function (err, req, res, next)  {
  //send status code back to front end
  console.log("error from routes")
  res.sendStatus(res.statusCode)
})


var port = (process.env.PORT || 5000);
app.listen(port, function() {
  console.log("listening on port: ", port)
})

module.exports = app
