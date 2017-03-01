var http = require('http');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var Jinaga = require('jinaga');
var JinagaConnector = require('jinaga/connector');

function start(dirname) {
    var config = {};
    try {
        config = require(dirname + '/config/config');
    }
    catch (err) {}

    var app = express();
    var server = http.createServer(app);
    var j;
    app.server = server;

    var pipeline = {
        cookieParser: cookieParser(),
        bodyParserUrlEncoded: bodyParser.urlencoded({extended: true}),
        session: session({
            secret: process.env.SESSION_SECRET || config.sessionSecret || "randomCharacters",
            saveUninitialized: true,
            resave: true
        })
    };
    app.use(pipeline.cookieParser);
    app.use(pipeline.bodyParserUrlEncoded);
    app.use(pipeline.session);

    // Set up the public site
    app.use("/bower_components", express.static(dirname + "/bower_components"));
    app.use("/public", express.static(dirname + "/public"));
    app.get('/', function(req, res, next) {
        res.sendFile(dirname + "/public/index.html");
    });
    app.get('/favicon.ico', function(req, res, next) {
        res.sendFile(dirname + "/public/favicon.ico");
    });
    app.get("/config.js", function(req, res, next) {
        var secure =
            (typeof process.env.JINAGA_SECURE !== 'undefined') ?
                (process.env.JINAGA_SECURE === 'true') :
            config.hasOwnProperty("secure") ?
                config.secure :
            true;
        res.send(
            "var distributorUrl = \"" + (secure ? "wss" : "ws") + "://" + req.headers.host + "/\";\n" +
            "var loginUrl = \"" + (secure ? "https" : "http") + "://" + req.headers.host + "/public/login.html\";\n");
        res.end();
    });

    // Set up the private site
    function setStatus(message) {
        app.get("/status", function (req, res, next) {
            res.send("<html><body><p>" + message + "</p></body></html>")
        })
    }

    try {
        var authorization = require('./authorization')(app, config);
        var distributor = require('./distributor')(server, pipeline, authorization, config);
        j = new Jinaga();
        j.sync(new JinagaConnector(distributor));
        app.use("/private", authorization.require, express.static(dirname + "/private"));
        setStatus("All good!");
    }
    catch (err) {
        setStatus(err);
        console.log(err);
    }

    server.listen(process.env.PORT || config.port || 8080, function () {
        var host = server.address().address;
        var port = server.address().port;

        console.log('Jinaga app listening at http://%s:%s', host, port);
    });

    return { app: app, j: j };
}

exports.start = start;