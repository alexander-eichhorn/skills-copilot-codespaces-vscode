//Create web server
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var server = http.createServer(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'comment'
});
connection.connect();

var port = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

//Get all comments
app.get('/comments', function(req, res) {
    connection.query('SELECT * FROM comments', function(err, rows, fields) {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});

//Post a comment
app.post('/comments', function(req, res) {
    var comment = req.body;
    connection.query('INSERT INTO comments SET ?', comment, function(err, result) {
        if (err) {
            throw err;
        }
        io.emit('newComment', comment);
        res.json(comment);
    });
});

//Delete a comment
app.delete('/comments/:id', function(req, res) {
    var id = req.params.id;
    connection.query('DELETE FROM comments WHERE id = ?', id, function(err, result) {
        if (err) {
            throw err;
        }
        io.emit('deletedComment', id);
        res.json(id);
    });
});

//Update a comment
app.put('/comments/:id', function(req, res) {
    var id = req.params.id;
    var comment = req.body;
    connection.query('UPDATE comments SET ? WHERE id = ?', [comment, id], function(err, result) {
        if (err) {
            throw err;
        }
        io.emit('updatedComment', comment);
        res.json(comment);
    });
});

//Listen to port 3000
server.listen(port, function() {
    console.log('Server listening on port ' + port);
});