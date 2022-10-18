//Basil API
// briing ouut yeerrr deaaaddd - that one megadeth song
// Modules //
var express = require('express');
var morgan = require('morgan')
var rfs = require('rotating-file-stream')
var fs = require('fs')
var path = require('path')
var log4js = require("log4js")
// Flags //
const PORT = 8443;
var SSL = 0; // change to one if you want a certificate
var app = express();
// Misc //
const directoryPath = path.join(__dirname, 'images'); // directory path
const pickRandomNumber = (max) => Math.floor(Math.random() * max); // random number
const allowedFileTypes = [".jpg", ".png"]; // our allowed file types
// Logging
const hasAllowedEnding = file => allowedFileTypes.some(ending => file.toLowerCase().endsWith(ending));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(morgan('combined')) // logger
morgan(':method :url :status :res[content-length] - :response-time ms')
var accessLogStream = rfs.createStream('access.log', { // logging code
    interval: '1d', // rotate daily
    path: path.join(__dirname)
  })
app.use(morgan('combined', { stream: accessLogStream })) // start
log4js.configure({
  appenders: {
    basilconsole: { type: "console" }, 
    basillog: { type: "file", filename: "basillog.log" }
  },
  categories: {
    default: { appenders: ["basillog", "basilconsole"], level: "all" }
   },
});

const basillog = log4js.getLogger("basillog");

app.listen( // start webserver.
    PORT,
    () => basillog.info(`BASILAPI RUNNING ON ${PORT}`)
)

// Main Server

app.get('/get/basil', (req, res) => {
    res.set('basil', 'is awesome')
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            return basillog.error(err),
            res.status(500).send({
                message: "There was an internal server error and the request could not be completed.", // something went wrong
            })
        }
        const images = files.filter(hasAllowedEnding);
        const pickedIndex = pickRandomNumber(images.length);
        const imageName = images[pickedIndex];
        res.sendFile(path.join(directoryPath, imageName));
        basillog.info(`GOT REQUEST, REPLIED WITH ${imageName}`) // okay send image
    });
});

app.get('/', (req, res) => {
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            return basillog.error(`GOT REQUEST, REPLIED WITH 500. CHECK LOG FOR ERRORS ${err}`), // something went wrong
            res.status(500).send({
                message: "The basils are not flowing, there was an internal server error.", // error message
            })
        }
        res.status(200).send({
            message: "The basils are flowing.", // 200 message
        })
        basillog.info(`GOT REQUEST, REPLIED WITH 200`) // okay send 200
    });
});


process.on('uncaughtException', function (err) {
    basillog.error(err.stack);
});
