/*'use strict';
var http = require('http');
var port = process.env.PORT || 1337;

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
}).listen(port);
*/

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const port = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MariaDB connection
const db = mysql.createConnection({
    host: "192.168.219.101",
    user: "root", // MariaDB 사용자 이름
    password: "Allusinc4u*", // MariaDB 비밀번호
    database: "linehistory", // MariaDB 데이터베이스 이름
    port: 3307,
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to MariaDB:", err);
        return;
    }
    console.log("Connected to MariaDB");
});

// Get all users
app.get("/users", (req, res) => {
    
    db.query("SELECT * FROM userdb", (err, results) => {
        if (err) {
            console.error("Error fetching users:", err);
            res.status(500).json({ error: "Database error" });
        } else {
            console.log("users query", results);
            res.json(results);
        }
    });    

});

// Add a new user
app.post("/users", (req, res) => {
    const { name, passwd, email } = req.body;
    db.query(
        "INSERT INTO userdb (name, passwd, email) VALUES (?, ?, ?)",
        [name, passwd, email],
        (err, results) => {
            if (err) {
                console.error("Error adding user:", err);
                res.status(500).json({ error: "Database error" });
            } else {
                //console.log("user added", results);
                res.json({ id: results.insertId, name, passwd, email });
            }
        }
    );
});

// Get all events
app.get("/events", (req, res) => {

    db.query("SELECT * FROM historyinfo where level=0", (err, results) => {
        if (err) {
            console.error("Error fetching events:", err);
            res.status(500).json({ error: "Database error" });
        } else {
            console.log("event query", results);
            res.json(results);
        }
    });
});

// Add a new event
// bc = (0 : AC, 1 : BC), 
// level = (0~10 0 is top important event. 10 is most detail misc event.user event)
app.post("/events", (req, res) => {
    const { createdt, title, description, level } = req.body.newEvent;
    db.query(
        "INSERT INTO historyinfo (createdt, title, description, level) VALUES (?, ?, ?, ?)",
        [createdt, title, description, level],
        (err, results) => {
            if (err) {
                console.error("Error adding event:", err);
                res.status(500).json({ error: "Database error" });
            } else {
                //console.log("add event", results);
                res.json({ id: results.insertId, createdt, title, description, level });
            }
        }
    );
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});