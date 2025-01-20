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
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MariaDB connection
const db = mysql.createConnection({
    host: "192.168.219.101",
    user: "root", // MariaDB 사용자 이름
    password: "Allusinc4u*", // MariaDB 비밀번호
    database: "linehistory", // MariaDB 데이터베이스 이름
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
                console.log("add user", results);
                res.json({ id: results.insertId, name, passwd, email });
            }
        }
    );
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});