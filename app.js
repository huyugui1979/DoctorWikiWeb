/**
 * Created by yuguihu on 15/11/3.
 */
var express    = require("express");
//var morgan     = require("morgan");
var app        = express();

var port = process.env.PORT || 3100;

//app.use(morgan("dev"));
app.use(express.static("./www"));

//app.get("/", function(req, res) {
//    res.sendFile("/www/index.html");
//});

// Start Server
app.listen(port, function () {
    console.log( "Express server listening on port " + port);
});